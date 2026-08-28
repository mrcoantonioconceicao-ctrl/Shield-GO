package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"os"

	"github.com/rustshield/goshield/pkg/domain"
	"github.com/rustshield/goshield/pkg/infra"
	"github.com/rustshield/goshield/pkg/usecase"
)

func main() {
	owner := flag.String("owner", "org", "GitHub repository owner")
	repo := flag.String("repo", "my-app", "GitHub repository name")
	token := flag.String("token", "", "GitHub Personal Access Token")
	scanType := flag.String("scan", "PORT_EXPOSURE", "Scan type: PORT_EXPOSURE, LLM_ROUTE_LEAK, DEPENDENCY_CVE")
	targetFile := flag.String("file", "config/security.env", "Target file to patch")
	host := flag.String("host", "127.0.0.1", "Host to scan for port exposure")
	port := flag.Int("port", 6379, "Port to scan")
	llmRoute := flag.String("llm-route", "/api/v1/llm/generate", "LLM endpoint route")
	jsonOutput := flag.Bool("json", true, "Output result in JSON format")

	flag.Parse()

	ctx := context.Background()

	// Initialize Infrastructure Services (SOA Architecture)
	gitService := infra.NewExecGitService(".")
	githubService := infra.NewHTTPGitHubService("https://api.github.com")
	scanner := infra.NewDefaultSecurityScanner()

	// Initialize Application Layer (DDD Usecase)
	auditUseCase := usecase.NewAutonomousAuditUseCase(gitService, githubService, scanner)

	params := usecase.AuditWorkflowParams{
		RepoOwner:     *owner,
		RepoName:      *repo,
		LocalRepoPath: ".",
		GitHubToken:   *token,
		BaseBranch:    "main",
		Remote:        "origin",
		TargetFile:    *targetFile,
		ScanType:      domain.VulnerabilityType(*scanType),
		Host:          *host,
		Port:          *port,
		LLMEndpoint:   *llmRoute,
		AuthorName:    "RustShield Bot",
		AuthorEmail:   "security-bot@rustshield.io",
	}

	result, err := auditUseCase.ExecuteWorkflow(ctx, params)

	if *jsonOutput {
		enc := json.NewEncoder(os.Stdout)
		enc.SetIndent("", "  ")
		_ = enc.Encode(map[string]interface{}{
			"workflow_result": result,
			"error":           errString(err),
		})
	} else {
		fmt.Printf("🛡️ RustShield Autonomous Audit Completed!\n")
		if err != nil {
			fmt.Printf("⚠️ Executed with status: %v\n", err)
		}
		for _, step := range result.BPMNSteps {
			fmt.Printf("[%d] %s: %s (%s)\n", step.StepNumber, step.StepName, step.Status, step.Details)
		}
	}
}

func errString(err error) string {
	if err != nil {
		return err.Error()
	}
	return ""
}
