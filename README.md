# 🛡️ RustShield-Go: Autonomous DevSecOps Git & Pull Request Pipeline

[![Go Version](https://img.shields.io/badge/Go-1.22+-00ADD8?style=flat-square&logo=go)](https://golang.org)
[![Architecture](https://img.shields.io/badge/Architecture-DDD%20%7C%20SOA-orange?style=flat-square)](#-arquitetura-e-camadas-ddd)
[![BPMN Flow](https://img.shields.io/badge/BPMN-7%20Steps%20Automated-brightgreen?style=flat-square)](#-fluxo-orquestrado-bpmn-7-etapas)
[![Security Audit](https://img.shields.io/badge/Security-OS%20Injection%20Proof-red?style=flat-square)](#-auditoria-de-segurança--code-review)

**RustShield-Go** é uma suíte autônoma de segurança cibernética e DevSecOps escrita em **Go (Golang)**. O sistema realiza varreduras proativas de vulnerabilidades (reconhecimento de portas de rede expostas, detecção de vazamentos em rotas de LLM e auditoria de CVEs em dependências), gera patches de correção automática e orquestra a criação de branches, commits e a submissão de Pull Requests no GitHub de forma 100% autônoma através de uma pipeline modelada no padrão **BPMN de 7 etapas**.

---

## 📌 Índice

- [Visão Geral e Diferenciais](#-visão-geral-e-diferenciais)
- [Arquitetura e Camadas DDD](#-arquitetura-e-camadas-ddd)
- [Fluxo Orquestrado BPMN (7 Etapas)](#-fluxo-orquestrado-bpmn-7-etapas)
- [Auditoria de Segurança & Code Review](#-auditoria-de-segurança--code-review)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Como Executar o Projeto](#-como-executar-o-projeto)
  - [1. Executando a Aplicação Web Studio](#1-executando-a-aplicação-web-studio)
  - [2. Compilando e Executando a CLI Go](#2-compilando-e-executando-a-cli-go)
- [Exemplo de Uso da CLI](#-exemplo-de-uso-da-cli)
- [Licença](#-licença)

---

## 🚀 Visão Geral e Diferenciais

- **Arquitetura Desacoplada e Orientada a Serviços (SOA)**: Código desacoplado em pacotes independentes de acordo com o **Domain-Driven Design (DDD)**.
- **Prevenção Total contra OS Command Injection**: O executor de subcomandos Git utiliza o pacote padrão `os/exec` diretamente via `syscall execve()`, anulando qualquer risco de interpolação por interpretadores de shell (`sh` / `bash`).
- **Complexidade Ciclomática Baixa ($V(G) \le 4$)**: Funções desenhadas com retornos precoces (*guard clauses*), eliminando indentação profunda e estruturas condicionais complexas.
- **Tratamento Explícito de Erros (Go Clean Code)**: Ausência de identificadores descartados (`_`). Todo erro retornado por operações de I/O ou API REST é verificado e encapsulado com o verbo `%w`.
- **Interface Web Studio Interativa**: Painel responsivo e moderno construído em React + Tailwind CSS com suporte a simulação em tempo real do pipeline, navegação nos módulos Go e geração de patches alimentada por IA.

---

## 🏗️ Arquitetura e Camadas DDD

```
go-src/
├── pkg/
│   ├── domain/               # [CAMADA DE DOMÍNIO] Entidades, Value Objects e Contratos/Interfaces
│   │   └── security.go
│   ├── infra/                # [CAMADA DE INFRAESTRUTURA] Execução Git CLI, Cliente REST HTTP GitHub & Scanners
│   │   ├── git_github.go
│   │   └── scanner.go
│   └── usecase/              # [CAMADA DE APLICAÇÃO] Orquestrador do Fluxo BPMN de 7 Etapas
│       └── autonomous_audit.go
└── cmd/
    └── rustshield/           # [PONTO DE ENTRADA CLI] Executável do sistema em Go
        └── main.go
```

1. **Domínio (`pkg/domain`)**:
   Contém as structs e valores fundamentais do sistema, como `Finding` (vulnerabilidade), `GitCommitOptions` (dados do commit) e `PullRequestRequest` (payload da API do GitHub), além de declarar as interfaces do repositório (`GitService`, `GitHubService`, `SecurityAuditor`).

2. **Infraestrutura (`pkg/infra`)**:
   Implementa as operações concretas de baixo nível. O `ExecGitService` lida diretamente com o binário local do `git` sem depender de shells intermediários. O `HTTPGitHubService` faz chamadas diretas para a REST API v3 do GitHub com timeout explícito de 15 segundos no `net/http.Client`.

3. **Casos de Uso (`pkg/usecase`)**:
   O `AutonomousAuditUseCase` orquestra e registra cada transição de estado da pipeline de segurança, disparando a varredura, a geração do patch e as chamadas de automação Git/GitHub.

---

## 🔄 Fluxo Orquestrado BPMN (7 Etapas)

O fluxo autônomo do RustShield segue rigorosamente a especificação de processos de negócio em 7 nós sequenciais:

```
[1. Início do Processo]
        │
        ▼
[2. Varredura e Identificação da Brecha]
        │
        ▼
[3. Análise e Geração de Patch de Correção]
        │
        ▼
[4. Criação de Branch Local de Segurança]
        │
        ▼
[5. Commit Automatizado das Alterações]
        │
        ▼
[6. Push Remoto para o Repositório Git]
        │
        ▼
[7. Abertura de Pull Request na API do GitHub] ──► [Fim do Processo]
```

---

## 🛡️ Auditoria de Segurança & Code Review

O módulo em Go foi auditado e aprovado no padrão **RustShield-Go Security Standard**:

| Pilar de Qualidade | Especificação Técnica | Status |
| :--- | :--- | :---: |
| **Complexidade Ciclomática** | Estruturação de funções com $V(G) \le 4$ utilizando *guard clauses*. | `APROVADO` |
| **OS Command Injection** | Uso exclusivo de `exec.CommandContext(ctx, "git", args...)` sem `sh -c` / `bash -c`. | `IMUNE` |
| **Directory Traversal** | Sanitização de caminhos com `filepath.Clean` e bloqueio de sequências `..`. | `APROVADO` |
| **Gestão de Concorrência** | Propagação de `context.Context` e timeout no cliente HTTP nativo. | `APROVADO` |
| **Qualidade do Código** | Tratamento explícito de exceções e preservação de cadeia com `fmt.Errorf("%w")`. | `APROVADO` |

---

## 💻 Como Executar o Projeto

### 1. Executando a Aplicação Web Studio

A aplicação inclui um Studio interativo desenvolvido com React, Vite e Tailwind CSS para simular a execução da CLI e visualizar os logs em tempo real.

```bash
# Instalar dependências da aplicação web
npm install

# Iniciar o servidor de desenvolvimento na porta 3000
npm run dev
```

Acesse a aplicação no navegador em `http://localhost:3000`.

---

### 2. Compilando e Executando a CLI Go

Certifique-se de ter o **Go 1.22+** instalado na sua máquina.

```bash
# Navegar até o diretório do código Go (ou compilar a partir da raiz)
cd go-src

# Compilar o executável binário
go build -o rustshield-cli ./cmd/rustshield/main.go

# Executar a ajuda da CLI
./rustshield-cli --help
```

---

## 🧪 Exemplo de Uso da CLI

Você pode executar a auditoria e automação de PRs diretamente pelo terminal passando as flags desejadas ou variáveis de ambiente:

```bash
export GITHUB_TOKEN="ghp_seuTokenAqui..."

# Disparar auditoria de porta e abertura de PR autônoma
./rustshield-cli \
  --owner="sua-organizacao" \
  --repo="seu-repositorio" \
  --scan="PORT_EXPOSURE" \
  --host="127.0.0.1" \
  --port=8080 \
  --target-file="server.ts" \
  --branch-base="main"
```

### Exemplo de Output do Terminal:

```text
[RUSTSHIELD-GO] Iniciando Orquestrador BPMN autônomo...
[BPMN-01] Processo inicializado com sucesso.
[BPMN-02] Varredura executada. Vulnerabilidade identificada: Porta 8080 Exposta (HIGH).
[BPMN-03] Patch de sanitização gerado em memória.
[BPMN-04] Branch 'security-fix/rustshield-fix-PORT-8080' criada localmente.
[BPMN-05] Commit local realizado: 'fix(security): sanitize PORT_EXPOSURE vulnerability [PORT-8080]'
[BPMN-06] Git Push executado para origin/security-fix/rustshield-fix-PORT-8080.
[BPMN-07] Pull Request #42 criado com sucesso: https://github.com/sua-organizacao/seu-repositorio/pull/42
[RUSTSHIELD-GO] Pipeline finalizada com 100% de êxito.
```

---

## 📄 Licença

Este projeto é disponibilizado sob a licença [MIT](LICENSE). Desenvolvido no padrão de arquitetura DevSecOps e Clean Code da suíte **RustShield-Go**.
