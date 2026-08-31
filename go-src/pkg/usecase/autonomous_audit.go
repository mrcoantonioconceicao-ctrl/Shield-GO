package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/rustshield/goshield/pkg/domain"
	"github.com/rustshield/goshield/pkg/infra"
)

// AuditWorkflowParams defines input configurations required for running full BPMN audit workflow.
type AuditWorkflowParams struct {
	RepoOwner     string                  `json:"repo_owner"`
	RepoName      string                  `json:"repo_name"`
	LocalRepoPath string                  `json:"local_repo_path"`
	GitHubToken   string                  `json:"github_token"`
	BaseBranch    string                  `json:"base_branch"` // e.g. "main"
	Remote        string                  `json:"remote"`      // e.g. "origin"
	TargetFile    string                  `json:"target_file"`
	ScanType      domain.VulnerabilityType `json:"scan_type"`
	Host          string                  `json:"host,omitempty"`
	Port          int                     `json:"port,omitempty"`
	LLMEndpoint   string                  `json:"llm_endpoint,omitempty"`
	AuthorName    string                  `json:"author_name"`
	AuthorEmail   string                  `json:"author_email"`
}

// AuditWorkflowResult returns full execution step telemetry matching BPMN 7-step process.
type AuditWorkflowResult struct {
	Finding       *domain.Finding             `json:"finding"`
	RAGContext    *domain.AIRagContext        `json:"rag_context"`
	AIPatch       *domain.AIPatchResult       `json:"ai_patch"`
	BranchName    string                      `json:"branch_name"`
	PatchCode     string                      `json:"patch_code"`
	CommitMsg     string                      `json:"commit_message"`
	ValidationLog string                      `json:"validation_log"`
	Pushed        bool                        `json:"pushed"`
	PullRequest   *domain.PullRequestResponse `json:"pull_request"`
	BPMNSteps     []BPMNStepLog               `json:"bpmn_steps"`
	Success       bool                        `json:"success"`
	CompletedAt   time.Time                   `json:"completed_at"`
}

// BPMNStepLog tracks each stage of the mental BPMN flow required by spec:
// 1. [Start] -> 2. Scan & Identify -> 3. RAG + Fine-Tuning Patch -> 3.1. MCP Validation -> 4. Local Branch -> 5. Auto Commit -> 6. Push Remote -> 7. Open PR -> [End]
type BPMNStepLog struct {
	StepNumber int       `json:"step_number"`
	StepName   string    `json:"step_name"`
	Status     string    `json:"status"` // COMPLETED, IN_PROGRESS, FAILED
	Details    string    `json:"details"`
	Timestamp  time.Time `json:"timestamp"`
}

// AutonomousAuditUseCase coordinates domain scanning, RAG retrieval, fine-tuned AI patch generation, MCP tool validation, and PR creation.
type AutonomousAuditUseCase struct {
	gitService    domain.GitService
	githubService domain.GitHubService
	auditor       domain.SecurityAuditor
	aiProvider    domain.SecurityAIProvider
	mcpExecutor   domain.MCPToolExecutor
}

// NewAutonomousAuditUseCase constructs the orchestrator with dependency injection and sensible defaults.
func NewAutonomousAuditUseCase(
	gitService domain.GitService,
	githubService domain.GitHubService,
	auditor domain.SecurityAuditor,
	aiProvider domain.SecurityAIProvider,
	mcpExecutor domain.MCPToolExecutor,
) *AutonomousAuditUseCase {
	if aiProvider == nil {
		aiProvider = infra.NewRAGAndFineTunedAIProvider()
	}
	if mcpExecutor == nil {
		mcpExecutor = infra.NewGoMCPExecutor(gitService, githubService, ".")
	}

	return &AutonomousAuditUseCase{
		gitService:    gitService,
		githubService: githubService,
		auditor:       auditor,
		aiProvider:    aiProvider,
		mcpExecutor:   mcpExecutor,
	}
}

// ExecuteWorkflow executes the full 7-step BPMN security mitigation workflow.
func (a *AutonomousAuditUseCase) ExecuteWorkflow(ctx context.Context, params AuditWorkflowParams) (*AuditWorkflowResult, error) {
	result := &AuditWorkflowResult{
		BPMNSteps:   make([]BPMNStepLog, 0),
		CompletedAt: time.Now(),
	}

	addStep := func(num int, name, status, details string) {
		result.BPMNSteps = append(result.BPMNSteps, BPMNStepLog{
			StepNumber: num,
			StepName:   name,
			Status:     status,
			Details:    details,
			Timestamp:  time.Now(),
		})
	}

	// Step 1: [Início] BPMN Initiation
	addStep(1, "Início do Processo RustShield", "COMPLETED", "Workflow inicializado com sucesso.")

	// Step 2: Varredura e Identificação da Brecha
	addStep(2, "Varredura e Identificação da Brecha", "IN_PROGRESS", fmt.Sprintf("Iniciando varredura para tipo: %s", params.ScanType))
	finding, err := a.performScanStep(ctx, params)
	if err != nil {
		addStep(2, "Varredura e Identificação da Brecha", "FAILED", err.Error())
		return result, fmt.Errorf("step 2 failed: %w", err)
	}

	if finding == nil {
		addStep(2, "Varredura e Identificação da Brecha", "COMPLETED", "Nenhuma vulnerabilidade crítica encontrada.")
		result.Success = true
		return result, nil
	}

	if finding.Language == "" {
		finding.Language = domain.DetectLanguageFromPath(finding.TargetFile)
	}

	result.Finding = finding
	addStep(2, "Varredura e Identificação da Brecha", "COMPLETED", fmt.Sprintf("Brecha identificada: %s (%s) em [%s]", finding.Title, finding.Severity, finding.Language))

	// Step 3: Consulta RAG + Modelo Fine-Tuned (Geração de Patch)
	addStep(3, "Consulta RAG & Fine-Tuning AI Patch", "IN_PROGRESS", "Recuperando contexto RAG e invocando modelo Fine-Tuned Multi-Language")
	ragData, patch, err := a.performAIPatchStep(ctx, *finding, params)
	if err != nil {
		addStep(3, "Consulta RAG & Fine-Tuning AI Patch", "FAILED", err.Error())
		return result, fmt.Errorf("step 3 failed: %w", err)
	}
	result.RAGContext = ragData
	result.AIPatch = patch
	result.PatchCode = patch.PatchedCode
	result.CommitMsg = patch.ConventionalCommitMsg
	addStep(3, "Consulta RAG & Fine-Tuning AI Patch", "COMPLETED", fmt.Sprintf("Patch %s gerado via Fine-Tuned LLM (Match AST: %.1f%%)", patch.Language, patch.ASTMatchScore))

	// Step 3.1: MCP Tool Validation (Linter & AST)
	addStep(31, "Validação de Patch via MCP Tools", "IN_PROGRESS", fmt.Sprintf("Executando Universal AST parse e Linter %s via MCP Executor", finding.Language))
	valLog, err := a.performMCPValidationStep(ctx, finding.TargetFile, patch.PatchedCode, finding.Language)
	if err != nil {
		addStep(31, "Validação de Patch via MCP Tools", "FAILED", err.Error())
		return result, fmt.Errorf("step 3.1 validation failed: %w", err)
	}
	result.ValidationLog = valLog
	addStep(31, "Validação de Patch via MCP Tools", "COMPLETED", valLog)

	// Step 4 & 5: Autonomous Branch & Commit via MCP Tools
	branchName := domain.SanitizeBranchName(fmt.Sprintf("rustshield/fix-%s", finding.ID))
	result.BranchName = branchName
	addStep(4, "Criação de Branch Local (MCP)", "COMPLETED", fmt.Sprintf("Branch %s configurada", branchName))

	addStep(5, "Commit Automatizado (MCP)", "IN_PROGRESS", "Executando commit seguro via MCP Executor")
	if err := a.performCommitStep(ctx, branchName, patch, finding.TargetFile, params); err != nil {
		addStep(5, "Commit Automatizado (MCP)", "FAILED", err.Error())
		return result, fmt.Errorf("step 5 failed: %w", err)
	}
	addStep(5, "Commit Automatizado (MCP)", "COMPLETED", fmt.Sprintf("Commit registrado: %s", patch.ConventionalCommitMsg))

	// Step 6: Push Remoto
	addStep(6, "Push Remoto", "IN_PROGRESS", fmt.Sprintf("Pushing branch %s to remote %s", branchName, params.Remote))
	if err := a.gitService.PushBranch(ctx, params.Remote, branchName); err != nil {
		addStep(6, "Push Remoto", "FAILED", fmt.Sprintf("Aviso de push: %v", err))
		result.Pushed = false
	} else {
		addStep(6, "Push Remoto", "COMPLETED", "Branch remota sincronizada com sucesso.")
		result.Pushed = true
	}

	// Step 7: Abertura via API de Pull Request -> [Fim]
	addStep(7, "Abertura de Pull Request (MCP)", "IN_PROGRESS", "Chamando MCP GitHub Tool para criar PR")
	prResp, err := a.performPRStep(ctx, finding, patch, branchName, params)
	if err != nil {
		addStep(7, "Abertura de Pull Request (MCP)", "FAILED", err.Error())
		return result, fmt.Errorf("step 7 failed: %w", err)
	}

	result.PullRequest = prResp
	addStep(7, "Abertura de Pull Request (MCP)", "COMPLETED", fmt.Sprintf("PR #%d aberto: %s", prResp.Number, prResp.HTMLURL))

	result.Success = true
	result.CompletedAt = time.Now()
	return result, nil
}

// Helper: Step 2 Scan Identification
func (a *AutonomousAuditUseCase) performScanStep(ctx context.Context, params AuditWorkflowParams) (*domain.Finding, error) {
	switch params.ScanType {
	case domain.VulnerabilityPortExposure:
		return a.auditor.ScanPort(ctx, params.Host, params.Port)
	case domain.VulnerabilityLLMRouteLeak:
		return a.auditor.ScanLLMRoute(ctx, params.LLMEndpoint)
	default:
		findings, err := a.auditor.ScanDependencies(ctx, params.LocalRepoPath)
		if err != nil {
			return nil, fmt.Errorf("failed dependency scan: %w", err)
		}
		if len(findings) > 0 {
			return &findings[0], nil
		}
		return &domain.Finding{
			ID:          "SEC-GEN-001",
			Type:        params.ScanType,
			Title:       "Insecure Configuration Exposure",
			Description: "Detected unauthenticated endpoint or default binding settings.",
			Severity:    "HIGH",
			TargetFile:  params.TargetFile,
			DetectedAt:  time.Now(),
		}, nil
	}
}

// Helper: Step 3 RAG & Fine-Tuning AI Patch Synthesis
func (a *AutonomousAuditUseCase) performAIPatchStep(ctx context.Context, finding domain.Finding, params AuditWorkflowParams) (*domain.AIRagContext, *domain.AIPatchResult, error) {
	ragData, err := a.aiProvider.RetrieveRAGContext(ctx, finding, params.LocalRepoPath)
	if err != nil {
		return nil, nil, fmt.Errorf("RAG context retrieval failed: %w", err)
	}

	patch, err := a.aiProvider.GeneratePatch(ctx, finding, *ragData)
	if err != nil {
		return nil, nil, fmt.Errorf("AI patch generation failed: %w", err)
	}

	return ragData, patch, nil
}

// Helper: Step 3.1 MCP Linter & AST Validation
func (a *AutonomousAuditUseCase) performMCPValidationStep(ctx context.Context, targetFile string, codeContent string, lang domain.Language) (string, error) {
	astOk, astLog, err := a.mcpExecutor.ValidatePatchAST(ctx, targetFile, codeContent, lang)
	if err != nil {
		return "", fmt.Errorf("MCP AST validation execution error: %w", err)
	}
	if !astOk {
		return "", fmt.Errorf("%w: %s", domain.ErrLinterValidationFailed, astLog)
	}

	lintOk, lintLog, err := a.mcpExecutor.RunLinter(ctx, targetFile, lang)
	if err != nil {
		return "", fmt.Errorf("MCP Linter execution error: %w", err)
	}
	if !lintOk {
		return "", fmt.Errorf("%w: %s", domain.ErrLinterValidationFailed, lintLog)
	}

	return fmt.Sprintf("Universal AST Check (%s): %s | Linter: %s", lang, astLog, lintLog), nil
}

// Helper: Step 5 Automated Commit via MCP
func (a *AutonomousAuditUseCase) performCommitStep(ctx context.Context, branchName string, patch *domain.AIPatchResult, targetFile string, params AuditWorkflowParams) error {
	opts := domain.GitCommitOptions{
		BranchName:    branchName,
		CommitMessage: patch.ConventionalCommitMsg,
		TargetFile:    targetFile,
		FileContent:   patch.PatchedCode,
		AuthorName:    params.AuthorName,
		AuthorEmail:   params.AuthorEmail,
	}

	return a.mcpExecutor.GitCreateBranchAndCommit(ctx, opts)
}

// Helper: Step 7 Create Pull Request via MCP
func (a *AutonomousAuditUseCase) performPRStep(ctx context.Context, finding *domain.Finding, patch *domain.AIPatchResult, branchName string, params AuditWorkflowParams) (*domain.PullRequestResponse, error) {
	prBody := fmt.Sprintf(`## 🛡️ RustShield DevSecOps Autonomous Patch

### ⚠️ Security Vulnerability
- **ID:** %s
- **Severity:** %s
- **Type:** %s
- **Target File:** %s

### 💡 RAG & AI Patch Explanation
%s

### 🧪 Code Fix (Conventional Commit: %s)
%s

---
*Generated automatically by RustShield RAG + MCP Autonomous DevSecOps Agent.*`,
		finding.ID, finding.Severity, finding.Type, finding.TargetFile,
		patch.Explanation, patch.ConventionalCommitMsg, patch.PatchedCode)

	prReq := domain.PullRequestRequest{
		Owner:      params.RepoOwner,
		Repo:       params.RepoName,
		Title:      fmt.Sprintf("🛡️ [RustShield] Automated Fix: %s", finding.Title),
		Body:       prBody,
		HeadBranch: branchName,
		BaseBranch: params.BaseBranch,
		Draft:      false,
	}

	return a.mcpExecutor.GitHubCreatePR(ctx, params.GitHubToken, prReq)
}
