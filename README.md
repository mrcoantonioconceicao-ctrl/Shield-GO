# 🛡️ RustShield DevSecOps Suite: AST, RAG, MCP & Fine-Tuning Autonomous AI Studio

[![Go Version](https://img.shields.io/badge/Go-1.22+-00ADD8?style=flat-square&logo=go)](https://golang.org)
[![Architecture](https://img.shields.io/badge/Architecture-DDD%20%7C%20Clean%20Code%20%7C%20SOA-orange?style=flat-square)](#-arquitetura-e-camadas-ddd-em-go)
[![BPMN Flow](https://img.shields.io/badge/BPMN-7%20Steps%20Automated-brightgreen?style=flat-square)](#-fluxo-orquestrado-bpmn-7-etapas)
[![MCP Protocol](https://img.shields.io/badge/MCP-JSON--RPC%20v2.0-sky?style=flat-square)](#-model-context-protocol-mcp-server-v2024-11-05)
[![RAG Engine](https://img.shields.io/badge/RAG-Vector%20Cosine%20Embedding-purple?style=flat-square)](#-motor-rag-retrieval-augmented-generation)
[![Fine Tuning](https://img.shields.io/badge/Fine--Tuning-4--Bit%20QLoRA-amber?style=flat-square)](#-studio-de-fine-tuning--datasets-sintéticos-4-bit-qlora)
[![Security Audit](https://img.shields.io/badge/Security-OS%20Injection%20Proof-red?style=flat-square)](#-auditoria-de-segurança--zero-os-injection)

**RustShield** é uma plataforma autônoma de DevSecOps, análise AST (Abstract Syntax Tree) e orquestração de remedições de segurança orientada a Inteligência Artificial. O sistema combina varreduras proativas de vulnerabilidades em código Go e Web, recuperação de contexto semântico vetorial (**RAG**), exposição padronizada de ferramentas do sistema via **MCP (Model Context Protocol)** e sintonia fina de LLMs especializados (**Fine-Tuning QLoRA 4-bit**) para gerar patches autônomos com mensagens em **Conventional Commits** e abrir Pull Requests no GitHub através de um fluxo **BPMN de 7 etapas**.

---

## 📌 Índice

- [Visão Geral e Pilares](#-visão-geral-e-pilares)
- [Arquitetura e Camadas DDD em Go](#-arquitetura-e-camadas-ddd-em-go)
- [Motor RAG (Retrieval-Augmented Generation)](#-motor-rag-retrieval-augmented-generation)
- [Model Context Protocol (MCP Server v2024-11-05)](#-model-context-protocol-mcp-server-v2024-11-05)
- [Studio de Fine-Tuning & Datasets Sintéticos (4-bit QLoRA)](#-studio-de-fine-tuning--datasets-sintéticos-4-bit-qlora)
- [Fluxo Orquestrado BPMN (7 Etapas)](#-fluxo-orquestrado-bpmn-7-etapas)
- [Auditoria de Segurança & Zero OS Injection](#-auditoria-de-segurança--zero-os-injection)
- [Estrutura Completa do Repositório](#-estrutura-completa-do-repositório)
- [Como Executar o Projeto](#-como-executar-o-projeto)
  - [1. Web Studio (React + Express Server)](#1-web-studio-react--express-server)
  - [2. CLI Go Autônoma](#2-cli-go-autônoma)
- [Testes Unitários em Go](#-testes-unitários-em-go)
- [Licença](#-licença)

---

## 🚀 Visão Geral e Pilares

O RustShield foi projetado para eliminar falsos positivos de regex e mitigar vulnerabilidades em código de forma 100% confiável e reproduzível:

1. **AST Native Analysis (Zero Regex)**: Varredura de sintaxe e validação de estruturas de código utilizando o parser nativo da linguagem Go (`go/parser`, `go/ast`) e TypeScript Compiler API.
2. **Retrieval-Augmented Generation (RAG)**: Base vetorial com cálculo de similaridade de cosseno para contextualizar correções de IA com advisories de CVEs (NVD/GitHub) e convenções internas do repositório.
3. **Model Context Protocol (MCP)**: Servidor e ferramentas alinhados à especificação oficial do MCP (JSON-RPC 2.0) para expor validações de linter, parsing AST e automação Git/GitHub para agentes IA.
4. **4-Bit QLoRA Fine-Tuning**: Gerador de datasets sintéticos instrucionais (*Vulnerable Code* $\rightarrow$ *AST Breakdown* $\rightarrow$ *Secure Remediated Output*) e simulador de hiperparâmetros de treinamento para modelos LLM focados em DevSecOps.
5. **Automação Git Sem Shell (Zero OS Injection)**: Execução direta de comandos Git via `exec.CommandContext` com argumentos parametrizados sem invoking de subshells (`sh`/`bash`).

---

## 🏗️ Arquitetura e Camadas DDD em Go

A camada Go do sistema segue rigorosamente o **Domain-Driven Design (DDD)** e **Clean Code** com complexidade ciclomática $V(G) \le 4$:

```
go-src/
├── pkg/
│   ├── domain/                  # [DOMÍNIO] Interfaces, Value Objects, Erros e Entidades
│   │   └── security.go
│   ├── infra/                   # [INFRAESTRUTURA] MCP Tools Executor, Git, GitHub HTTP Client & RAG AI Provider
│   │   ├── mcp_tools.go
│   │   ├── git_github.go
│   │   └── scanner.go
│   └── usecase/                 # [APLICAÇÃO] Orquestrador do Fluxo BPMN de 7 Etapas
│       ├── autonomous_audit.go
│       └── autonomous_audit_test.go
└── cmd/
    └── rustshield/              # [CLI ENTRYPOINT] Executável da suíte em Go
        └── main.go
```

### Principais Contratos do Domínio (`pkg/domain/security.go`)
- `SecurityAIProvider`: Interface para recuperação de contexto RAG e geração de patches com modelo Fine-Tuned.
- `MCPToolExecutor`: Interface para execução segura de ferramentas MCP (`RunLinter`, `ValidatePatchAST`, `GitCreateBranchAndCommit`, `GitHubCreatePR`).
- `SecurityAuditor`: Interface para varredura de portas, rotas LLM e auditoria de dependências.

---

## 📚 Motor RAG (Retrieval-Augmented Generation)

O subsistema RAG injeta contexto determinístico no prompt do modelo antes da síntese do patch:

- **Embeddings & Similaridade Vetorial**: Indexação de documentos de segurança com cálculo de similaridade de cosseno em tempo real.
- **Conhecimento Vetorial Pré-carregado**:
  - `CWE-78`: Injeção de Comando em `os/exec` e mitigação com arrays parametrizados.
  - `CWE-284`: Rotas de LLM desprotegidas e implementação de middleware JWT.
  - `CWE-1327`: Exposição de portas de rede em `0.0.0.0` e isolamento em loopback `127.0.0.1`.
- **APIs Backend HTTP**:
  - `POST /api/rag/search`: Realiza busca semântica vetorial dado um query string.
  - `GET /api/rag/documents`: Retorna os documentos da base de conhecimento RAG.
  - `POST /api/rag/ingest`: Adiciona novas diretrizes ou CVEs à base de dados.

---

## 🔌 Model Context Protocol (MCP Server v2024-11-05)

O RustShield expõe suas capacidades operacionais através do padrão **Model Context Protocol (MCP)** sobre JSON-RPC 2.0:

### Ferramentas Expostas (Tools)
1. `rustshield.ast_analyze`: Analisa o código-fonte via AST e retorna relatórios de nós e métricas de complexidade.
2. `rustshield.ast_refactor`: Aplica refatoração AST estrutural no código fornecido.
3. `rustshield.cve_search`: Consulta vulnerabilidades na base RAG.
4. `rustshield.fine_tune_job`: Inicia um job de treinamento/ajuste fino no estúdio.
5. `run_linter`: Executa `go vet` e análise AST nativa via `GoMCPExecutor`.
6. `git_create_branch_and_commit`: Cria branch local e realiza commit sem interpolação de shell.
7. `github_create_pr`: Dispara a criação de Pull Request via GitHub REST API v3.

### Endpoint MCP
- `POST /api/mcp/rpc`: Recebe requisições JSON-RPC 2.0 padrão (`initialize`, `tools/list`, `tools/call`, `resources/list`, `prompts/list`).

---

## 🎯 Studio de Fine-Tuning & Datasets Sintéticos (4-bit QLoRA)

Estúdio interativo para preparação e refinamento de LLMs especializados em correção de código Go:

- **Configuração de Hiperparâmetros LoRA/QLoRA**:
  - Rank LoRA ($r$): 8 a 64
  - LoRA Alpha ($\alpha$): 16 a 128
  - Quantização: 4-Bit NormalFloat4 (NF4) com Double Quantization.
  - Target Modules: `q_proj`, `v_proj`, `k_proj`, `o_proj`, `gate_proj`.
  - Otimizador: `paged_adamw_8bit`.
- **Métricas de Treino em Tempo Real**: Visualização em gráfico de curva de Loss por época, BLEU Score e *AST Exact-Match Accuracy*.
- **Exportação**: Download do adaptador `.json` configurado para deploy em ambientes de inferência.

---

## 🔄 Fluxo Orquestrado BPMN (7 Etapas)

A automação autônoma de mitigação segue 7 etapas estritas com rastreabilidade completa em logs de telemetria:

```
[1. Início do Processo]
        │
        ▼
[2. Varredura e Identificação da Brecha (Scan Auditor)]
        │
        ▼
[3. Análise RAG + Geração de Patch via Model Fine-Tuned]
        │
        ▼
[3.1 Validação do Patch via MCP Tools (Go Linter + AST Parse)]
        │
        ▼
[4. Criação de Branch Local de Segurança (MCP Tool)]
        │
        ▼
[5. Commit Automatizado no Padrão Conventional Commits (MCP Tool)]
        │
        ▼
[6. Push Remoto para o Repositório Git (Git Service)]
        │
        ▼
[7. Abertura de Pull Request via API do GitHub (MCP Tool)] ──► [Fim do Processo]
```

---

## 🛡️ Auditoria de Segurança & Zero OS Injection

Toda a infraestrutura em Go e o backend Express foram construídos sob regras rigorosas de segurança:

| Pilar de Qualidade | Especificação Técnica | Status |
| :--- | :--- | :---: |
| **Complexidade Ciclomática** | Funções estruturadas com $V(G) \le 4$ através de *guard clauses*. | `APROVADO` |
| **OS Command Injection** | Uso exclusivo de `exec.CommandContext(ctx, "git", args...)` sem `sh -c` / `bash -c`. | `IMUNE` |
| **Directory Traversal** | Sanitização de caminhos com `filepath.Clean` e bloqueio de sequências `..`. | `APROVADO` |
| **Zero Code Descartado** | Nenhum identificador `_` utilizado para ocultar erros de I/O ou chamadas REST. | `APROVADO` |
| **Encapsulamento de Erros** | Todos os erros preservam a pilha utilizando `fmt.Errorf("%w", err)`. | `APROVADO` |

---

## 📁 Estrutura Completa do Repositório

```
.
├── server.ts                             # Servidor Express com APIs de RAG, MCP RPC e Fine-Tuning
├── package.json                          # Gerenciador de dependências Web & Scripts de build
├── metadata.json                         # Metadados da aplicação AI Studio
├── go-src/                               # Código-Fonte Principal em Go (Golang)
│   ├── go.mod
│   ├── cmd/rustshield/main.go           # Ponto de entrada CLI Go
│   ├── pkg/
│   │   ├── domain/security.go           # Interfaces de Domínio, Data Structures & Erros
│   │   ├── infra/
│   │   │   ├── mcp_tools.go             # Execução de Ferramentas MCP (Linter, AST, Git, RAG Provider)
│   │   │   ├── git_github.go            # Integração com Git CLI & GitHub REST API
│   │   │   └── scanner.go               # Scanners de Segurança (Porta, LLM Leak, Dependências)
│   │   └── usecase/
│   │       ├── autonomous_audit.go      # Orquestrador do Fluxo BPMN de 7 Etapas
│   │       └── autonomous_audit_test.go # Suíte de Testes Unitários dos Casos de Uso
│   └── code_review/
│       └── SECURITY_QUALITY_REVIEW.md   # Relatório de Qualidade e Segurança do Código Go
└── src/                                  # Frontend React + Tailwind Studio
    ├── App.tsx                           # Layout principal e navegação por abas
    ├── components/
    │   ├── ASTVisualizer.tsx             # Explorador do AST em TypeScript
    │   ├── GoCodeExplorer.tsx            # Navegador do Código-Fonte Go
    │   ├── AIPatchStudio.tsx             # Estúdio de Geração de Patches Autônomos
    │   ├── CodeReviewPanel.tsx           # Painel de Code Review e Auditoria de Segurança
    │   ├── RAGStudio.tsx                 # Estúdio de Busca Semântica Vetorial (RAG)
    │   ├── MCPExplorerStudio.tsx         # Consola de Testes JSON-RPC 2.0 (MCP Server)
    │   └── FineTuningStudio.tsx          # Estúdio de Treinamento 4-Bit QLoRA & Datasets
    └── lib/
        ├── ragEngine.ts                  # Motor de Busca Vetorial com Cosine Similarity
        ├── mcpEngine.ts                  # Servidor MCP JSON-RPC 2.0 em TypeScript
        └── fineTuningEngine.ts           # Gerador de Datasets Sintéticos & Hiperparâmetros
```

---

## 💻 Como Executar o Projeto

### 1. Web Studio (React + Express Server)

Para rodar a interface visual completa do RustShield com os painéis RAG, MCP, Fine-Tuning e navegadores Go:

```bash
# Instalar dependências da aplicação
npm install

# Iniciar servidor de desenvolvimento (Express + Vite na porta 3000)
npm run dev
```

Acesse o Studio no seu navegador em `http://localhost:3000`.

---

### 2. CLI Go Autônoma

Certifique-se de ter o **Go 1.22+** instalado no seu ambiente.

```bash
# Navegar para o diretório de código Go
cd go-src

# Compilar o executável binário
go build -o rustshield-cli ./cmd/rustshield/main.go

# Executar ajuda da CLI
./rustshield-cli --help

# Disparar auditoria e criação de PR autônoma
export GITHUB_TOKEN="ghp_seu_token_aqui"

./rustshield-cli \
  --owner="sua-org" \
  --repo="seu-repo" \
  --scan="PORT_EXPOSURE" \
  --host="127.0.0.1" \
  --port=8080 \
  --target-file="main.go" \
  --branch-base="main"
```

---

## 🧪 Testes Unitários em Go

Os casos de uso e os executores MCP possuem suíte de testes unitários abrangente utilizando mocks de serviços.

Para rodar os testes em Go:

```bash
cd go-src
go test -v ./pkg/usecase/...
```

---

## 📄 Licença

Este projeto é disponibilizado sob a licença [MIT](LICENSE). Desenvolvido como referência técnica de arquiteto DevSecOps, abordando **DDD em Go**, **RAG semântico**, **Model Context Protocol (MCP)** e **Sintonia Fina (QLoRA)**.
