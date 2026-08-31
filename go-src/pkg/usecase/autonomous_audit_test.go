package usecase_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/rustshield/goshield/pkg/domain"
	"github.com/rustshield/goshield/pkg/usecase"
)

// MockGitService implements domain.GitService for unit tests.
type MockGitService struct {
	CreateCommitErr error
	PushErr         error
}

func (m *MockGitService) CreateBranchAndCommit(ctx context.Context, opts domain.GitCommitOptions) error {
	return m.CreateCommitErr
}

func (m *MockGitService) PushBranch(ctx context.Context, remote string, branchName string) error {
	return m.PushErr
}

func (m *MockGitService) GetCurrentBranch(ctx context.Context) (string, error) {
	return "main", nil
}

// MockGitHubService implements domain.GitHubService for unit tests.
type MockGitHubService struct {
	CreatePRErr error
}

func (m *MockGitHubService) CreatePullRequest(ctx context.Context, token string, prReq domain.PullRequestRequest) (*domain.PullRequestResponse, error) {
	if m.CreatePRErr != nil {
		return nil, m.CreatePRErr
	}
	return &domain.PullRequestResponse{
		Number:  42,
		HTMLURL: "https://github.com/rustshield/goshield/pull/42",
		State:   "open",
		ID:      1001,
	}, nil
}

// MockSecurityAuditor implements domain.SecurityAuditor for unit tests.
type MockSecurityAuditor struct {
	Finding *domain.Finding
	ScanErr error
}

func (m *MockSecurityAuditor) ScanPort(ctx context.Context, host string, port int) (*domain.Finding, error) {
	if m.ScanErr != nil {
		return nil, m.ScanErr
	}
	return m.Finding, nil
}

func (m *MockSecurityAuditor) ScanLLMRoute(ctx context.Context, endpoint string) (*domain.Finding, error) {
	if m.ScanErr != nil {
		return nil, m.ScanErr
	}
	return m.Finding, nil
}

func (m *MockSecurityAuditor) ScanDependencies(ctx context.Context, projectPath string) ([]domain.Finding, error) {
	if m.ScanErr != nil {
		return nil, m.ScanErr
	}
	if m.Finding != nil {
		return []domain.Finding{*m.Finding}, nil
	}
	return []domain.Finding{}, nil
}

func (m *MockSecurityAuditor) GeneratePatch(ctx context.Context, finding domain.Finding) (string, error) {
	return "// Patched code", nil
}

// MockSecurityAIProvider implements domain.SecurityAIProvider for unit tests.
type MockSecurityAIProvider struct {
	RAGErr   error
	PatchErr error
}

func (m *MockSecurityAIProvider) RetrieveRAGContext(ctx context.Context, finding domain.Finding, localRepoPath string) (*domain.AIRagContext, error) {
	if m.RAGErr != nil {
		return nil, m.RAGErr
	}
	return &domain.AIRagContext{
		RepoContext:   "Go repository",
		CVEAdvisories: []string{"CVE-2024-001"},
	}, nil
}

func (m *MockSecurityAIProvider) GeneratePatch(ctx context.Context, finding domain.Finding, ragData domain.AIRagContext) (*domain.AIPatchResult, error) {
	if m.PatchErr != nil {
		return nil, m.PatchErr
	}
	return &domain.AIPatchResult{
		PatchedCode:           "package main\n\nfunc main() {}",
		Explanation:           "Applied loopback isolation",
		ConventionalCommitMsg: "fix(security): sanitize port binding",
		ASTMatchScore:         100.0,
		ValidationPassed:      true,
	}, nil
}

// MockMCPToolExecutor implements domain.MCPToolExecutor for unit tests.
type MockMCPToolExecutor struct {
	LinterOk  bool
	LinterErr error
	ASTOk     bool
	ASTErr    error
}

func (m *MockMCPToolExecutor) RunLinter(ctx context.Context, targetPath string, lang domain.Language) (bool, string, error) {
	if m.LinterErr != nil {
		return false, "", m.LinterErr
	}
	return m.LinterOk, "Linter status OK", nil
}

func (m *MockMCPToolExecutor) ValidatePatchAST(ctx context.Context, targetFile string, codeContent string, lang domain.Language) (bool, string, error) {
	if m.ASTErr != nil {
		return false, "", m.ASTErr
	}
	return m.ASTOk, "AST parse status OK", nil
}

func (m *MockMCPToolExecutor) GitCreateBranchAndCommit(ctx context.Context, opts domain.GitCommitOptions) error {
	return nil
}

func (m *MockMCPToolExecutor) GitHubCreatePR(ctx context.Context, token string, req domain.PullRequestRequest) (*domain.PullRequestResponse, error) {
	return &domain.PullRequestResponse{
		Number:  42,
		HTMLURL: "https://github.com/rustshield/goshield/pull/42",
		State:   "open",
	}, nil
}

func TestAutonomousAuditUseCase_SuccessFlow(t *testing.T) {
	ctx := context.Background()

	finding := &domain.Finding{
		ID:          "SEC-PORT-001",
		Type:        domain.VulnerabilityPortExposure,
		Language:    domain.LangGo,
		Title:       "Unrestricted TCP Port Exposure",
		Description: "Binding on 0.0.0.0",
		Severity:    "CRITICAL",
		TargetFile:  "main.go",
		DetectedAt:  time.Now(),
	}

	gitSvc := &MockGitService{}
	githubSvc := &MockGitHubService{}
	auditor := &MockSecurityAuditor{Finding: finding}
	aiProvider := &MockSecurityAIProvider{}
	mcpExec := &MockMCPToolExecutor{LinterOk: true, ASTOk: true}

	uc := usecase.NewAutonomousAuditUseCase(gitSvc, githubSvc, auditor, aiProvider, mcpExec)

	params := usecase.AuditWorkflowParams{
		RepoOwner:     "rustshield",
		RepoName:      "goshield",
		LocalRepoPath: ".",
		GitHubToken:   "ghp_test_token_12345",
		BaseBranch:    "main",
		Remote:        "origin",
		ScanType:      domain.VulnerabilityPortExposure,
		Host:          "127.0.0.1",
		Port:          6379,
		AuthorName:    "RustShield Bot",
		AuthorEmail:   "bot@rustshield.dev",
	}

	result, err := uc.ExecuteWorkflow(ctx, params)
	if err != nil {
		t.Fatalf("expected workflow to succeed, got error: %v", err)
	}

	if !result.Success {
		t.Errorf("expected result.Success to be true")
	}

	if result.PullRequest == nil || result.PullRequest.Number != 42 {
		t.Errorf("expected PR #42 created, got: %v", result.PullRequest)
	}

	if len(result.BPMNSteps) < 7 {
		t.Errorf("expected at least 7 BPMN telemetry steps, got %d", len(result.BPMNSteps))
	}
}

func TestAutonomousAuditUseCase_MultiLanguageFlow(t *testing.T) {
	ctx := context.Background()

	finding := &domain.Finding{
		ID:          "SEC-PY-001",
		Type:        domain.VulnerabilityCommandInjection,
		Language:    domain.LangPython,
		Title:       "Python Subprocess Shell Injection",
		Description: "subprocess.run with shell=True",
		Severity:    "CRITICAL",
		TargetFile:  "app.py",
		DetectedAt:  time.Now(),
	}

	gitSvc := &MockGitService{}
	githubSvc := &MockGitHubService{}
	auditor := &MockSecurityAuditor{Finding: finding}
	aiProvider := &MockSecurityAIProvider{}
	mcpExec := &MockMCPToolExecutor{LinterOk: true, ASTOk: true}

	uc := usecase.NewAutonomousAuditUseCase(gitSvc, githubSvc, auditor, aiProvider, mcpExec)

	params := usecase.AuditWorkflowParams{
		RepoOwner:     "rustshield",
		RepoName:      "python-app",
		LocalRepoPath: ".",
		TargetFile:    "app.py",
		GitHubToken:   "ghp_test_token_12345",
		BaseBranch:    "main",
		Remote:        "origin",
		ScanType:      domain.VulnerabilityCommandInjection,
		AuthorName:    "RustShield Bot",
		AuthorEmail:   "bot@rustshield.dev",
	}

	result, err := uc.ExecuteWorkflow(ctx, params)
	if err != nil {
		t.Fatalf("expected python multi-language workflow to succeed, got error: %v", err)
	}

	if result.Finding.Language != domain.LangPython {
		t.Errorf("expected language python, got: %s", result.Finding.Language)
	}

	if !result.Success {
		t.Errorf("expected result.Success to be true")
	}
}

func TestAutonomousAuditUseCase_LinterValidationFailure(t *testing.T) {
	ctx := context.Background()

	finding := &domain.Finding{
		ID:         "SEC-CMD-001",
		Type:       domain.VulnerabilityCommandInjection,
		Title:      "Command Injection Vulnerability",
		Severity:   "CRITICAL",
		TargetFile: "handler.go",
	}

	gitSvc := &MockGitService{}
	githubSvc := &MockGitHubService{}
	auditor := &MockSecurityAuditor{Finding: finding}
	aiProvider := &MockSecurityAIProvider{}
	// AST check succeeds, but Linter fails
	mcpExec := &MockMCPToolExecutor{LinterOk: false, ASTOk: true}

	uc := usecase.NewAutonomousAuditUseCase(gitSvc, githubSvc, auditor, aiProvider, mcpExec)

	params := usecase.AuditWorkflowParams{
		RepoOwner:   "rustshield",
		RepoName:    "goshield",
		GitHubToken: "ghp_test_token",
		BaseBranch:  "main",
		ScanType:    domain.VulnerabilityCommandInjection,
	}

	result, err := uc.ExecuteWorkflow(ctx, params)
	if err == nil {
		t.Fatalf("expected workflow error due to linter failure, got nil")
	}

	if result.Success {
		t.Errorf("expected result.Success to be false")
	}

	if !errors.Is(err, domain.ErrLinterValidationFailed) {
		t.Errorf("expected error to wrap ErrLinterValidationFailed, got: %v", err)
	}
}

func TestAutonomousAuditUseCase_NoVulnerabilitiesFound(t *testing.T) {
	ctx := context.Background()

	gitSvc := &MockGitService{}
	githubSvc := &MockGitHubService{}
	auditor := &MockSecurityAuditor{Finding: nil}
	aiProvider := &MockSecurityAIProvider{}
	mcpExec := &MockMCPToolExecutor{LinterOk: true, ASTOk: true}

	uc := usecase.NewAutonomousAuditUseCase(gitSvc, githubSvc, auditor, aiProvider, mcpExec)

	params := usecase.AuditWorkflowParams{
		ScanType: domain.VulnerabilityPortExposure,
	}

	result, err := uc.ExecuteWorkflow(ctx, params)
	if err != nil {
		t.Fatalf("expected workflow success for clean repo, got: %v", err)
	}

	if !result.Success {
		t.Errorf("expected success to be true")
	}

	if result.Finding != nil {
		t.Errorf("expected no finding, got: %v", result.Finding)
	}
}

func TestSanitizeBranchName(t *testing.T) {
	raw := "fix/SEC-1001-insecure path!"
	sanitized := domain.SanitizeBranchName(raw)
	expected := "security-fix/fix-SEC-1001-insecure-path-"

	if sanitized != expected {
		t.Errorf("expected branch name '%s', got '%s'", expected, sanitized)
	}
}
