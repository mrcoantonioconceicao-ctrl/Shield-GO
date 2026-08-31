import React, { useState } from 'react';
import { Database, Search, ShieldCheck, Tag, Code2, Plus, Sparkles, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import { ragEngine, RetrievalResult, VectorDocument } from '../lib/ragEngine';

export const RAGStudio: React.FC = () => {
  const [query, setQuery] = useState<string>('command injection exec process isolation');
  const [topK, setTopK] = useState<number>(3);
  const [results, setResults] = useState<RetrievalResult[]>(() => ragEngine.query('command injection exec process isolation', 3));
  const [documents, setDocuments] = useState<VectorDocument[]>(() => ragEngine.getAllDocuments());
  const [activeTab, setActiveTab] = useState<'search' | 'index' | 'add'>('search');

  // New Document Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<VectorDocument['category']>('SECURITY_POLICY');
  const [newCwe, setNewCwe] = useState('');
  const [newSeverity, setNewSeverity] = useState<VectorDocument['severity']>('HIGH');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [addedMsg, setAddedMsg] = useState(false);

  const handleSearch = (textToQuery?: string) => {
    const q = textToQuery ?? query;
    const retrieved = ragEngine.query(q, topK);
    setResults(retrieved);
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const doc = ragEngine.addDocument({
      title: newTitle,
      category: newCategory,
      cwe: newCwe || undefined,
      severity: newSeverity,
      content: newContent,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
    });

    setDocuments(ragEngine.getAllDocuments());
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 3000);

    // Reset form
    setNewTitle('');
    setNewContent('');
    setNewCwe('');
    setNewTags('');
    setActiveTab('index');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#080808] border border-white/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#F27D26] text-black">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">
              RAG ENGINE (RETRIEVAL-AUGMENTED GENERATION)
            </h2>
            <p className="text-[11px] font-mono text-white/50">
              Busca vetorial semântica sobre base de conhecimento de CVEs, Regras AST e Políticas de Segurança.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 bg-black p-1 border border-white/20">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase font-bold tracking-wider transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'bg-[#F27D26] text-black shadow-[0_0_10px_rgba(242,125,38,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Busca Vetorial & RAG
          </button>
          <button
            onClick={() => setActiveTab('index')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase font-bold tracking-wider transition-all cursor-pointer ${
              activeTab === 'index'
                ? 'bg-[#F27D26] text-black shadow-[0_0_10px_rgba(242,125,38,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Índice de Conhecimento ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase font-bold tracking-wider transition-all cursor-pointer ${
              activeTab === 'add'
                ? 'bg-[#F27D26] text-black shadow-[0_0_10px_rgba(242,125,38,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            + Ingerir Documento
          </button>
        </div>
      </div>

      {activeTab === 'search' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Query Bar Column */}
          <div className="bg-[#080808] border border-white/10 p-6 space-y-5">
            <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
              <Search className="h-4 w-4 text-[#F27D26]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                CONSULTA DE VETOR RAG
              </h3>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-white/50 mb-1">
                Query / Descrição da Vulnerabilidade ou Código
              </label>
              <textarea
                rows={4}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-black border border-white/20 p-3 font-mono text-xs text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-white/50 mb-1">
                Top-K Resultados ({topK})
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="w-full accent-[#F27D26]"
              />
            </div>

            <button
              onClick={() => handleSearch()}
              className="w-full bg-[#F27D26] hover:bg-[#ff8c35] text-black font-black py-3 text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(242,125,38,0.3)]"
            >
              <Sparkles className="h-4 w-4 fill-black" />
              <span>RECUPERAR CONTEXTOS (RAG)</span>
            </button>

            {/* Quick Query Presets */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block">
                Presets de Consulta Rápidos:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'command injection exec child_process',
                  'express jwt authentication middleware',
                  'binding 0.0.0.0 network security',
                  'golang exec.CommandContext timeout',
                  'ast zero regex guardrails',
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(preset);
                      handleSearch(preset);
                    }}
                    className="text-[10px] font-mono bg-black hover:bg-white/10 border border-white/20 text-white/80 px-2 py-1 text-left"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Retrieval Results Output */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Documentos Recuperados por Similaridade de Cosseno ({results.length})
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/40 uppercase">
                Zero Mock • Vetores de Embedding em Tempo Real
              </span>
            </div>

            {results.map(({ document: doc, similarityScore, matchedKeywords }, index) => (
              <div
                key={doc.id}
                className="bg-[#080808] border border-white/10 p-5 space-y-3 relative overflow-hidden group hover:border-[#F27D26] transition-all"
              >
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-black text-[#F27D26]">#{index + 1}</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider border ${
                        doc.severity === 'CRITICAL'
                          ? 'bg-rose-950/60 text-rose-400 border-rose-500/40'
                          : doc.severity === 'HIGH'
                          ? 'bg-amber-950/60 text-amber-400 border-amber-500/40'
                          : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                      }`}
                    >
                      {doc.category} {doc.cwe ? `• ${doc.cwe}` : ''}
                    </span>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">{doc.title}</h4>
                  </div>

                  {/* Similarity Badge */}
                  <div className="flex items-center space-x-1 bg-black px-2.5 py-1 border border-emerald-500/40 font-mono text-emerald-400 text-xs">
                    <span>Score:</span>
                    <strong className="font-black">{(similarityScore * 100).toFixed(1)}%</strong>
                  </div>
                </div>

                <p className="text-xs font-mono text-white/80 leading-relaxed">{doc.content}</p>

                {doc.codeExample && (
                  <div className="bg-black p-3 border border-white/10 text-[11px] font-mono text-[#F27D26]">
                    <pre className="whitespace-pre-wrap">{doc.codeExample}</pre>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] font-mono text-white/40 pt-1">
                  <div className="flex items-center space-x-1">
                    <Tag className="h-3 w-3 text-white/30" />
                    <span>Tags: {doc.tags.join(', ')}</span>
                  </div>
                  {matchedKeywords.length > 0 && (
                    <span className="text-emerald-400">
                      Matches: {matchedKeywords.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'index' && (
        <div className="bg-[#080808] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              BASE DE CONHECIMENTO COMPLETA DO ÍNDICE RAG
            </h3>
            <span className="text-[10px] font-mono text-[#F27D26]">
              {documents.length} Documentos Vetorizados
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-black border border-white/10 p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[10px] font-mono uppercase text-[#F27D26] font-bold">
                    {doc.category} {doc.cwe ? `(${doc.cwe})` : ''}
                  </span>
                  <span className="text-[9px] font-mono uppercase text-white/40">{doc.severity}</span>
                </div>
                <h4 className="text-xs font-bold text-white uppercase">{doc.title}</h4>
                <p className="text-[11px] font-mono text-white/60 line-clamp-3">{doc.content}</p>
                <div className="text-[10px] font-mono text-white/40 truncate">
                  Vetor Embedding: [{doc.embedding.slice(0, 5).map((n) => n.toFixed(3)).join(', ')}...]
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'add' && (
        <form onSubmit={handleAddDocument} className="bg-[#080808] border border-white/10 p-6 space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
            <Plus className="h-4 w-4 text-[#F27D26]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              INGERIR NOVO DOCUMENTO NO ÍNDICE DE VETORES
            </h3>
          </div>

          {addedMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Documento vetorizado e armazenado com sucesso no RAG Store!</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase font-mono tracking-widest text-white/50 mb-1">
              Título do Documento / Regra
            </label>
            <input
              type="text"
              required
              placeholder="ex: Política de Segurança JWT para Microserviços"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-white/50 mb-1">
                Categoria
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-black border border-white/20 px-2.5 py-2 text-xs font-mono text-[#F27D26]"
              >
                <option value="SECURITY_POLICY">SECURITY_POLICY</option>
                <option value="AST_RULE">AST_RULE</option>
                <option value="CVE">CVE</option>
                <option value="REMEDIATION_PATTERN">REMEDIATION_PATTERN</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-white/50 mb-1">
                CWE (Opcional)
              </label>
              <input
                type="text"
                placeholder="ex: CWE-78"
                value={newCwe}
                onChange={(e) => setNewCwe(e.target.value)}
                className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-white/50 mb-1">
                Severidade
              </label>
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as any)}
                className="w-full bg-black border border-white/20 px-2.5 py-2 text-xs font-mono text-[#F27D26]"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono tracking-widest text-white/50 mb-1">
              Conteúdo Técnico / Descrição da Regra
            </label>
            <textarea
              rows={5}
              required
              placeholder="Insira as diretrizes de remediação ou regra técnica..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full bg-black border border-white/20 p-3 font-mono text-xs text-white focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono tracking-widest text-white/50 mb-1">
              Tags (Separadas por Vírgula)
            </label>
            <input
              type="text"
              placeholder="jwt, express, zero-regex, ast"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#F27D26] hover:bg-[#ff8c35] text-black font-black py-3 text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(242,125,38,0.3)]"
          >
            <ArrowRight className="h-4 w-4" />
            <span>VETORIZAR & SALVAR NO ÍNDICE RAG</span>
          </button>
        </form>
      )}
    </div>
  );
};
