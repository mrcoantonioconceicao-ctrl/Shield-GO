package infra

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/rustshield/goshield/pkg/domain"
)

// ExecGitService implements domain.GitService using standard library os/exec.
// Safe command execution prevents shell injection vulnerabilities.
type ExecGitService struct {
	repoPath string
}

// NewExecGitService constructs a new ExecGitService.
func NewExecGitService(repoPath string) *ExecGitService {
	if repoPath == "" {
		repoPath = "."
	}
	return &ExecGitService{repoPath: repoPath}
}

// runCmd executes a git CLI command safely without passing through a shell interpreter.
func (g *ExecGitService) runCmd(ctx context.Context, args ...string) (string, error) {
	cmd := exec.CommandContext(ctx, "git", args...)
	cmd.Dir = g.repoPath
	
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()
	if err != nil {
		return "", fmt.Errorf("git command 'git %s' failed: %w (stderr: %s)", strings.Join(args, " "), err, strings.TrimSpace(stderr.String()))
	}

	return strings.TrimSpace(stdout.String()), nil
}

// GetCurrentBranch returns the current active branch in the workspace.
func (g *ExecGitService) GetCurrentBranch(ctx context.Context) (string, error) {
	return g.runCmd(ctx, "rev-parse", "--abbrev-ref", "HEAD")
}

// CreateBranchAndCommit writes the updated file safely, creates a branch, and commits the changes.
func (g *ExecGitService) CreateBranchAndCommit(ctx context.Context, opts domain.GitCommitOptions) error {
	if err := opts.Validate(); err != nil {
		return fmt.Errorf("validation error in commit options: %w", err)
	}

	// 1. Sanitize file path to prevent directory traversal
	cleanPath := filepath.Clean(opts.TargetFile)
	if strings.HasPrefix(cleanPath, "..") || filepath.IsAbs(cleanPath) {
		return domain.ErrUnsafeFilePath
	}
	fullPath := filepath.Join(g.repoPath, cleanPath)

	// Ensure parent directory exists
	if err := os.MkdirAll(filepath.Dir(fullPath), 0755); err != nil {
		return fmt.Errorf("failed to create directory tree for %s: %w", fullPath, err)
	}

	// 2. Write patch securely to target file
	if err := os.WriteFile(fullPath, []byte(opts.FileContent), 0644); err != nil {
		return fmt.Errorf("failed to write patched content to %s: %w", cleanPath, err)
	}

	// 3. Create or checkout the target fix branch
	branch := domain.SanitizeBranchName(opts.BranchName)
	_, err := g.runCmd(ctx, "checkout", "-b", branch)
	if err != nil {
		// If branch already exists, switch to it
		_, checkoutErr := g.runCmd(ctx, "checkout", branch)
		if checkoutErr != nil {
			return fmt.Errorf("failed to create or switch to branch %s: %w", branch, err)
		}
	}

	// 4. Stage the modified file
	if _, err := g.runCmd(ctx, "add", cleanPath); err != nil {
		return fmt.Errorf("failed to stage file %s: %w", cleanPath, err)
	}

	// 5. Configure local git author identity if provided
	if opts.AuthorName != "" && opts.AuthorEmail != "" {
		_, _ = g.runCmd(ctx, "config", "user.name", opts.AuthorName)
		_, _ = g.runCmd(ctx, "config", "user.email", opts.AuthorEmail)
	}

	// 6. Execute commit
	commitMsg := fmt.Sprintf("%s\n\n[Automated Security Patch by RustShield-Go]", opts.CommitMessage)
	if _, err := g.runCmd(ctx, "commit", "-m", commitMsg); err != nil {
		return fmt.Errorf("failed to create git commit: %w", err)
	}

	return nil
}

// PushBranch pushes the local branch to remote repository securely.
func (g *ExecGitService) PushBranch(ctx context.Context, remote string, branchName string) error {
	if remote == "" {
		remote = "origin"
	}
	branch := domain.SanitizeBranchName(branchName)

	_, err := g.runCmd(ctx, "push", "-u", remote, branch)
	if err != nil {
		return fmt.Errorf("failed to push branch %s to remote %s: %w", branch, remote, err)
	}
	return nil
}

// HTTPGitHubService implements domain.GitHubService using Go's net/http client.
type HTTPGitHubService struct {
	client  *http.Client
	baseURL string
}

// NewHTTPGitHubService creates a new GitHub API client with reasonable HTTP timeouts.
func NewHTTPGitHubService(baseURL string) *HTTPGitHubService {
	if baseURL == "" {
		baseURL = "https://api.github.com"
	}
	return &HTTPGitHubService{
		client: &http.Client{
			Timeout: 15 * time.Second,
		},
		baseURL: strings.TrimSuffix(baseURL, "/"),
	}
}

// CreatePullRequest executes a REST API call to GitHub to open a Pull Request.
func (h *HTTPGitHubService) CreatePullRequest(ctx context.Context, token string, prReq domain.PullRequestRequest) (*domain.PullRequestResponse, error) {
	if err := prReq.Validate(); err != nil {
		return nil, fmt.Errorf("invalid pull request parameters: %w", err)
	}
	if strings.TrimSpace(token) == "" {
		return nil, domain.ErrGitHubAuthFailed
	}

	url := fmt.Sprintf("%s/repos/%s/%s/pulls", h.baseURL, prReq.Owner, prReq.Repo)

	payload := map[string]interface{}{
		"title": prReq.Title,
		"body":  prReq.Body,
		"head":  prReq.HeadBranch,
		"base":  prReq.BaseBranch,
		"draft": prReq.Draft,
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal pull request payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(jsonBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create http request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/vnd.github.v3+json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Set("User-Agent", "RustShield-Go-DevSecOps/1.0")

	resp, err := h.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed executing GitHub API call: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("github API returned error HTTP %d: %s", resp.StatusCode, string(bodyBytes))
	}

	var prResp domain.PullRequestResponse
	if err := json.Unmarshal(bodyBytes, &prResp); err != nil {
		return nil, fmt.Errorf("failed to decode GitHub PR response JSON: %w", err)
	}

	return &prResp, nil
}
