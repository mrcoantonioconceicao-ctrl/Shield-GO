// RAG (Retrieval-Augmented Generation) Engine for RustShield DevSecOps
// Handles vector indexing, semantic embedding calculation, and context retrieval.

export interface VectorDocument {
  id: string;
  title: string;
  category: 'CVE' | 'AST_RULE' | 'SECURITY_POLICY' | 'REMEDIATION_PATTERN';
  cwe?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  content: string;
  codeExample?: string;
  tags: string[];
  embedding: number[];
}

export interface RetrievalResult {
  document: VectorDocument;
  similarityScore: number;
  matchedKeywords: string[];
}

// Security Knowledge Base for RAG Index
const INITIAL_KNOWLEDGE_BASE: Omit<VectorDocument, 'embedding'>[] = [
  {
    id: 'cve-2024-001',
    title: 'CWE-78: OS Command Injection em Runtime',
    category: 'CVE',
    cwe: 'CWE-78',
    severity: 'CRITICAL',
    tags: ['command-injection', 'exec', 'subshell', 'ast-refactor'],
    content: `A injeção de comandos de sistema operacional ocorre quando entradas não sanitizadas do usuário são concatenadas diretamente em funções de execução do shell (como exec(), system(), popen()). A remediação AST exige a substituição por execve() ou execFile() com isolamento estrito de argumentos em array sem invocação de /bin/sh.`,
    codeExample: `// Vulnerável: exec('echo ' + input)
// Seguro: execFile('/bin/echo', [input], callback)`,
  },
  {
    id: 'cve-2024-002',
    title: 'CWE-284: Acesso Não Autorizado em Rotas LLM / Audit',
    category: 'CVE',
    cwe: 'CWE-284',
    severity: 'HIGH',
    tags: ['jwt', 'authentication', 'rbac', 'llm-route', 'express'],
    content: `Endpoints sensíveis como /api/v1/llm/generate e /api/v1/audit/execute devem exigir autenticação JWT e validação de escopos RBAC. Sem o middleware de autorização, invasores podem consumir cotas de IA ou injetar cargas maliciosas sem auditoria.`,
    codeExample: `// Vulnerável: app.post('/api/v1/llm/generate', handler)
// Seguro: app.post('/api/v1/llm/generate', requireJwtAuth, handler)`,
  },
  {
    id: 'cve-2024-003',
    title: 'CWE-1327: Binding Inseguro de Interface de Rede (0.0.0.0)',
    category: 'CVE',
    cwe: 'CWE-1327',
    severity: 'MEDIUM',
    tags: ['network-binding', 'localhost', 'redis', 'express', '0.0.0.0'],
    content: `Vincular portas de serviços (como 3000 ou 6379) a 0.0.0.0 expõe a aplicação para toda a sub-rede pública sem isolamento de firewall. A política da RustShield exige que servidores em desenvolvimento utilizem 127.0.0.1 ou proxies mTLS dedicados.`,
    codeExample: `// Vulnerável: app.listen(3000, '0.0.0.0')
// Seguro: app.listen(3000, '127.0.0.1')`,
  },
  {
    id: 'rule-ast-01',
    title: 'Regra AST-01: Proibição Estrita de Expressões Regulares em Análise de Segurança',
    category: 'AST_RULE',
    severity: 'HIGH',
    tags: ['ast', 'zero-regex', 'typescript-compiler', 'parser'],
    content: `Análises de segurança baseadas em regex sofrem de falsos negativos por evasão sintática e vulnerabilidades ReDoS. Todas as verificações da RustShield devem utilizar navegadores de nós AST (ts.forEachChild, ts.isCallExpression) para inspecionar a árvore sintática real.`,
    codeExample: `// Proibido: /exec\s*\(/.test(code)
// Correto: ts.isCallExpression(node) && node.expression.text === 'exec'`,
  },
  {
    id: 'policy-sec-01',
    title: 'Política DevSecOps: Guardrails de IA e Sintetização de Patches',
    category: 'SECURITY_POLICY',
    severity: 'MEDIUM',
    tags: ['ai-guardrails', 'llm-security', 'ast-validation', 'copilot'],
    content: `Todo código gerado por modelos de linguagem (LLM) para remediação de código deve ser submetido a uma passagem de validação sintática AST e cálculo de complexidade ciclomática V(G) <= 4 antes de ser submetido como Pull Request no GitHub.`,
    codeExample: `// Pipeline: LLM Patch -> AST Parser -> Cyclomatic Check -> Git PR Engine`,
  },
  {
    id: 'pattern-rem-01',
    title: 'Padrão Go DDD: CommandContext para Execução Segura em Golang',
    category: 'REMEDIATION_PATTERN',
    severity: 'HIGH',
    tags: ['golang', 'command-context', 'timeout', 'execve'],
    content: `Em aplicações Go, substitua exec.Command("sh", "-c", ...) por exec.CommandContext(ctx, binary, args...) especificando um timeout de contexto e executável absoluto sem invocação de shell subjacente.`,
    codeExample: `ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
defer cancel()
cmd := exec.CommandContext(ctx, "/bin/echo", prompt)`,
  },
];

// Helper to compute pseudo-embeddings based on feature hashing / term frequency for fast vector similarity
function computeEmbedding(text: string): number[] {
  const EMBEDDING_DIM = 64;
  const vector = new Array(EMBEDDING_DIM).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9_-]/g, ' ').split(/\s+/).filter(Boolean);

  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % EMBEDDING_DIM;
    vector[idx] += 1;
  }

  // L2 Normalize vector
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (norm === 0) return vector;
  return vector.map((val) => val / norm);
}

// Cosine similarity between two vector embeddings
function cosineSimilarity(v1: number[], v2: number[]): number {
  let dotProduct = 0;
  for (let i = 0; i < v1.length; i++) {
    dotProduct += (v1[i] || 0) * (v2[i] || 0);
  }
  return dotProduct;
}

class RAGEngineStore {
  private documents: VectorDocument[] = [];

  constructor() {
    this.initializeStore();
  }

  private initializeStore() {
    this.documents = INITIAL_KNOWLEDGE_BASE.map((doc) => ({
      ...doc,
      embedding: computeEmbedding(`${doc.title} ${doc.content} ${doc.tags.join(' ')} ${doc.cwe || ''}`),
    }));
  }

  public getAllDocuments(): VectorDocument[] {
    return this.documents;
  }

  public addDocument(doc: Omit<VectorDocument, 'id' | 'embedding'>): VectorDocument {
    const id = `custom-doc-${Date.now()}`;
    const fullText = `${doc.title} ${doc.content} ${doc.tags.join(' ')} ${doc.cwe || ''}`;
    const embedding = computeEmbedding(fullText);

    const newDoc: VectorDocument = {
      ...doc,
      id,
      embedding,
    };

    this.documents.unshift(newDoc);
    return newDoc;
  }

  public query(queryText: string, topK: number = 3): RetrievalResult[] {
    const queryVector = computeEmbedding(queryText);
    const queryWords = new Set(
      queryText.toLowerCase().replace(/[^a-z0-9_-]/g, ' ').split(/\s+/).filter(Boolean)
    );

    const results = this.documents.map((doc) => {
      const sim = cosineSimilarity(queryVector, doc.embedding);

      // Find matched keywords for explainability
      const matchedKeywords: string[] = [];
      doc.tags.forEach((tag) => {
        if (queryWords.has(tag.toLowerCase())) {
          matchedKeywords.push(tag);
        }
      });

      return {
        document: doc,
        similarityScore: Math.min(1.0, Math.max(0, sim * 1.5 + (matchedKeywords.length * 0.15))),
        matchedKeywords,
      };
    });

    // Sort by similarity score descending
    results.sort((a, b) => b.similarityScore - a.similarityScore);

    return results.slice(0, topK);
  }
}

export const ragEngine = new RAGEngineStore();
