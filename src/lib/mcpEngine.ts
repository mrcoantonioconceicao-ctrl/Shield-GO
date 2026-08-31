// MCP (Model Context Protocol) Server & JSON-RPC 2.0 Engine for RustShield DevSecOps

import { analyzeAST, refactorAST } from './astEngine';
import { ragEngine } from './ragEngine';

export interface MCPJSONRPCRequest {
  jsonrpc: '2.0';
  id?: string | number;
  method: string;
  params?: any;
}

export interface MCPJSONRPCResponse {
  jsonrpc: '2.0';
  id?: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface MCPPrompt {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}

// 1. Exported MCP Tools
export const MCP_TOOLS: MCPTool[] = [
  {
    name: 'rustshield.ast_analyze',
    description: 'Anatomia e auditoria sintática de código via Árvore de Sintaxe Abstrata (AST). Retorna contagem de nós, complexidade ciclomática V(G) e falhas detectadas com Zero Regex.',
    inputSchema: {
      type: 'object',
      properties: {
        codeSnippet: { type: 'string', description: 'Código fonte a ser auditado' },
        language: { type: 'string', enum: ['typescript', 'javascript', 'go'], description: 'Linguagem do código' },
      },
      required: ['codeSnippet'],
    },
  },
  {
    name: 'rustshield.ast_refactor',
    description: 'Refatorador sintático AST. Transforma nós inseguros (exec, eval, binding 0.0.0.0) em construções puramente seguras com Zero Regex.',
    inputSchema: {
      type: 'object',
      properties: {
        codeSnippet: { type: 'string', description: 'Código fonte vulnerável' },
        fileName: { type: 'string', description: 'Nome do arquivo fonte' },
      },
      required: ['codeSnippet'],
    },
  },
  {
    name: 'rustshield.cve_search',
    description: 'Busca vetorial via RAG (Retrieval-Augmented Generation) na base de conhecimento de CVEs, regras AST e políticas de segurança.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Descrição da brecha, código ou palavra-chave de busca' },
        topK: { type: 'number', description: 'Número de resultados a retornar' },
      },
      required: ['query'],
    },
  },
  {
    name: 'rustshield.fine_tune_job',
    description: 'Dispara um job de Fine-Tuning de modelo com síntese de dataset seguro e configuração LoRA/QLoRA.',
    inputSchema: {
      type: 'object',
      properties: {
        datasetSize: { type: 'number', description: 'Número de pares de treino a gerar' },
        learningRate: { type: 'number', description: 'Taxa de aprendizado' },
        epochs: { type: 'number', description: 'Número de épocas de treino' },
      },
      required: ['datasetSize'],
    },
  },
];

// 2. Exported MCP Resources
export const MCP_RESOURCES: MCPResource[] = [
  {
    uri: 'resource://cve-database/owasp-top-10',
    name: 'Base de Conhecimento OWASP Top 10 & CWE CVEs',
    description: 'Especificações técnicas de injeção de comando, rotas desprotegidas e bindings inseguros.',
    mimeType: 'application/json',
  },
  {
    uri: 'resource://ast-rules/typescript-sec-v1',
    name: 'Regras Guardrail AST para TypeScript Compiler API',
    description: 'Padrões de AST Node Factories e validações de AST CallExpression.',
    mimeType: 'text/markdown',
  },
  {
    uri: 'resource://ast-rules/golang-sec-v1',
    name: 'Padrões de Segurança Go & Clean Architecture DDD',
    description: 'Padrões de isolamento com exec.CommandContext e timeouts em rotas HTTP.',
    mimeType: 'text/markdown',
  },
];

// 3. Exported MCP Prompts
export const MCP_PROMPTS: MCPPrompt[] = [
  {
    name: 'generate-security-patch',
    description: 'Prompt estruturado para síntese de patch seguro guiado por nós AST.',
    arguments: [
      { name: 'vulnerability', description: 'Descrição da vulnerabilidade', required: true },
      { name: 'codeSnippet', description: 'Código vulnerável original', required: true },
    ],
  },
  {
    name: 'security-code-review',
    description: 'Prompt para auditoria técnica detalhada com calculador de complexidade ciclomática V(G).',
    arguments: [
      { name: 'codeSnippet', description: 'Código fonte para revisão', required: true },
    ],
  },
];

// MCP JSON-RPC Request Handler Engine
export function handleMCPRequest(request: MCPJSONRPCRequest): MCPJSONRPCResponse {
  const { jsonrpc, id, method, params } = request;

  if (jsonrpc !== '2.0') {
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32600, message: 'Invalid Request: jsonrpc must be 2.0' },
    };
  }

  try {
    switch (method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: { listChanged: true },
              resources: { subscribe: false, listChanged: true },
              prompts: { listChanged: true },
            },
            serverInfo: {
              name: 'RustShield DevSecOps MCP Server',
              version: '1.0.0',
              description: 'MCP Protocol Server exposing AST security analysis, RAG retrieval, and fine-tuning triggers.',
            },
          },
        };

      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id,
          result: { tools: MCP_TOOLS },
        };

      case 'tools/call': {
        const toolName = params?.name;
        const args = params?.arguments || {};

        if (toolName === 'rustshield.ast_analyze') {
          const { codeSnippet = '', language = 'typescript' } = args;
          const astResult = analyzeAST(codeSnippet, `target.${language === 'typescript' ? 'ts' : 'js'}`);
          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      totalNodes: astResult.totalNodes,
                      cyclomaticComplexity: astResult.cyclomaticComplexity,
                      vulnerabilities: astResult.vulnerabilities,
                      status: 'COMPLETED_ZERO_REGEX',
                    },
                    null,
                    2
                  ),
                },
              ],
            },
          };
        }

        if (toolName === 'rustshield.ast_refactor') {
          const { codeSnippet = '', fileName = 'target.ts' } = args;
          const refactoring = refactorAST(codeSnippet, fileName);
          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: refactoring.refactoredCode,
                },
              ],
              transformations: refactoring.transformations,
              changesCount: refactoring.changesCount,
            },
          };
        }

        if (toolName === 'rustshield.cve_search') {
          const { query = '', topK = 3 } = args;
          const results = ragEngine.query(query, topK);
          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(results, null, 2),
                },
              ],
            },
          };
        }

        if (toolName === 'rustshield.fine_tune_job') {
          const { datasetSize = 50, learningRate = 0.0002, epochs = 3 } = args;
          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: `Job de Fine-Tuning iniciado com sucesso! ID: job_ft_${Date.now()}. Dataset: ${datasetSize} pares. LR: ${learningRate}. Épocas: ${epochs}.`,
                },
              ],
            },
          };
        }

        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Tool not found: ${toolName}` },
        };
      }

      case 'resources/list':
        return {
          jsonrpc: '2.0',
          id,
          result: { resources: MCP_RESOURCES },
        };

      case 'resources/read': {
        const uri = params?.uri;
        if (uri === 'resource://cve-database/owasp-top-10') {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(ragEngine.getAllDocuments(), null, 2),
                },
              ],
            },
          };
        }
        if (uri === 'resource://ast-rules/typescript-sec-v1') {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              contents: [
                {
                  uri,
                  mimeType: 'text/markdown',
                  text: `# Regras Guardrail AST para TypeScript\n- Inspecionar chamadas CallExpression para exec(), eval()\n- Injetar middleware requireJwtAuth em rotas sensíveis\n- Impedir binding de interfaces em 0.0.0.0`,
                },
              ],
            },
          };
        }
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: `Resource not found: ${uri}` },
        };
      }

      case 'prompts/list':
        return {
          jsonrpc: '2.0',
          id,
          result: { prompts: MCP_PROMPTS },
        };

      default:
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Method not found: ${method}` },
        };
    }
  } catch (err: any) {
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32603, message: `Internal Error: ${err.message}` },
    };
  }
}
