import React, { useState, useEffect } from 'react';
import { Network, Sparkles, CheckCircle2, ShieldAlert, Zap, ArrowRight, Code2, RefreshCw, Copy, Check } from 'lucide-react';
import { analyzeAST, refactorAST, ASTAnalysisResult } from '../lib/astEngine';

export const ASTExplorerStudio: React.FC = () => {
  const [sourceCode, setSourceCode] = useState(`import express from 'express';
import { exec } from 'child_process';

const app = express();
const PORT = 3000;

// Endpoint sensível de LLM sem autenticação JWT
app.post('/api/v1/llm/generate', (req, res) => {
  const prompt = req.body.prompt;
  
  // Vulnerabilidade: Chamada exec com concatenação sem execve
  exec('echo ' + prompt, (err, stdout) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ output: stdout });
  });
});

// Binding em todas as interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port', PORT);
});`);

  const [analysis, setAnalysis] = useState<ASTAnalysisResult | null>(null);
  const [refactoredCode, setRefactoredCode] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  const runASTAnalysis = () => {
    setIsAnalyzing(true);
    try {
      const result = analyzeAST(sourceCode, 'service.ts');
      setAnalysis(result);
    } catch (err) {
      console.error('AST Analysis Error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRefactorAST = () => {
    try {
      const result = refactorAST(sourceCode, 'service.ts');
      setRefactoredCode(result.refactoredCode);
    } catch (err) {
      console.error('AST Refactor Error:', err);
    }
  };

  useEffect(() => {
    runASTAnalysis();
  }, [sourceCode]);

  const handleCopyRefactored = () => {
    if (refactoredCode) {
      navigator.clipboard.writeText(refactoredCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#080808] border border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[#F27D26] text-xs font-mono font-black uppercase tracking-[0.2em]">
            <Network className="h-4 w-4" />
            <span>Abstract Syntax Tree (AST) Security Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            ANÁLISE ESTÁTICA & REFATORAÇÃO VIA ÁRVORE SINTÁTICA (ZERO REGEX)
          </h2>
          <p className="text-xs font-mono text-white/60 max-w-3xl">
            Inspeção estrutural profunda de nós AST usando a API oficial do compilador TypeScript. Elimina falsos positivos de expressões regulares através de navegação tipada nos nós sintáticos do código.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleRefactorAST}
            className="flex items-center space-x-2 bg-[#F27D26] hover:bg-[#ff8c35] text-black px-4 py-2.5 text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(242,125,38,0.3)]"
          >
            <Sparkles className="h-4 w-4" />
            <span>Refatorar via AST</span>
          </button>
        </div>
      </div>

      {/* Metric Cards from AST Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-black border border-white/10 p-4 space-y-1">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Total de Nós AST</span>
          <div className="text-3xl font-black font-mono text-white">
            {analysis?.totalNodes || 0}
          </div>
          <span className="text-[10px] font-mono text-white/50 block">ts.Node SyntaxKind</span>
        </div>

        <div className="bg-black border border-white/10 p-4 space-y-1">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Complexidade Ciclomática</span>
          <div className={`text-3xl font-black font-mono ${
            (analysis?.cyclomaticComplexity || 1) <= 4 ? 'text-emerald-400' : 'text-[#F27D26]'
          }`}>
            V(G) = {analysis?.cyclomaticComplexity || 1}
          </div>
          <span className="text-[10px] font-mono text-white/50 block">Pontos de decisão na AST</span>
        </div>

        <div className="bg-black border border-white/10 p-4 space-y-1">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Vulnerabilidades AST</span>
          <div className={`text-3xl font-black font-mono ${
            (analysis?.vulnerabilities.length || 0) > 0 ? 'text-red-400' : 'text-emerald-400'
          }`}>
            {analysis?.vulnerabilities.length || 0}
          </div>
          <span className="text-[10px] font-mono text-white/50 block">Falhas críticas estruturais</span>
        </div>

        <div className="bg-black border border-white/10 p-4 space-y-1">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Método de Parsing</span>
          <div className="text-lg font-black font-mono text-[#F27D26] pt-1">
            AST RECURSIVE
          </div>
          <span className="text-[10px] font-mono text-emerald-400 block">✓ 0% REGEX (Strict AST)</span>
        </div>
      </div>

      {/* Main Studio View: Code Editor vs AST Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editor */}
        <div className="lg:col-span-6 bg-[#080808] border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2 text-white font-mono text-xs font-bold uppercase tracking-wider">
              <Code2 className="h-4 w-4 text-[#F27D26]" />
              <span>Código Fonte sob Auditoria AST</span>
            </div>
            <span className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 border border-white/10">
              service.ts
            </span>
          </div>

          <textarea
            rows={16}
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            className="w-full bg-black border border-white/20 p-3.5 font-mono text-xs text-white/90 focus:outline-none focus:border-[#F27D26] leading-relaxed selection:bg-[#F27D26] selection:text-black"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-[10px] font-mono text-white/40 uppercase">
              // Modifique o código em tempo real para reavaliar a AST
            </span>
            <button
              onClick={runASTAnalysis}
              disabled={isAnalyzing}
              className="flex items-center space-x-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#F27D26] hover:text-white transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>Reanalisar AST</span>
            </button>
          </div>
        </div>

        {/* Right Column: AST Vulnerabilities & Decision Nodes */}
        <div className="lg:col-span-6 space-y-6">
          {/* AST Vulnerabilities Box */}
          <div className="bg-[#080808] border border-white/10 p-5 space-y-4">
            <div className="flex items-center space-x-2 text-white font-mono text-xs font-bold uppercase tracking-wider pb-3 border-b border-white/10">
              <ShieldAlert className="h-4 w-4 text-red-400" />
              <span>Diagnósticos Estruturais de Segurança (AST Nodes)</span>
            </div>

            {analysis?.vulnerabilities.length === 0 ? (
              <div className="p-8 text-center bg-black border border-white/10 font-mono text-xs text-emerald-400 space-y-2">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-400" />
                <p className="font-bold uppercase">Nenhuma vulnerabilidade detectada na árvore AST</p>
                <p className="text-white/40 text-[10px]">Todas as chamadas analisadas seguem as diretrizes seguras.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analysis?.vulnerabilities.map((vuln, idx) => (
                  <div key={idx} className="bg-black border border-red-500/40 p-4 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-red-400 font-black uppercase text-[11px] flex items-center space-x-1.5">
                        <Zap className="h-3.5 w-3.5" />
                        <span>[{vuln.severity}] {vuln.type}</span>
                      </span>
                      <span className="text-[10px] text-white/40">
                        Linha {vuln.line}, Col {vuln.column} ({vuln.kind})
                      </span>
                    </div>
                    <p className="text-white/80 text-[11px] leading-relaxed">
                      {vuln.description}
                    </p>
                    <div className="p-2 bg-[#050505] border border-white/10 text-[#F27D26] text-[10px]">
                      <strong>Remediação AST:</strong> {vuln.remediation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Decision Points Breakdown */}
          <div className="bg-[#080808] border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Pontos de Decisão Ciclomáticos na AST (V(G))
              </span>
              <span className="text-[10px] font-mono text-[#F27D26]">
                Base: 1 + {analysis?.complexityBreakdown.decisionPoints.length || 0}
              </span>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 font-mono text-[11px]">
              {analysis?.complexityBreakdown.decisionPoints.length === 0 ? (
                <span className="text-white/30 text-[10px] uppercase">
                  // Fluxo sequencial linear (V(G) = 1)
                </span>
              ) : (
                analysis?.complexityBreakdown.decisionPoints.map((dp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 bg-black border border-white/5 text-white/70">
                    <span className="text-[#F27D26] font-bold">[{dp.kind}] Linha {dp.line}</span>
                    <span className="text-white/40 truncate max-w-xs">{dp.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Refactored AST Code View (If triggered) */}
      {refactoredCode && (
        <div className="bg-[#080808] border border-[#F27D26] p-6 space-y-4 shadow-[0_0_30px_rgba(242,125,38,0.2)]">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2 text-white font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-[#F27D26]" />
              <span>Código Refatorado via Transformador AST (Hardened TS/JS)</span>
            </div>

            <button
              onClick={handleCopyRefactored}
              className="flex items-center space-x-1.5 text-xs bg-[#F27D26] text-black hover:bg-[#ff8c35] px-3.5 py-1.5 font-mono font-black uppercase tracking-wider cursor-pointer transition-all"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'COPIADO!' : 'COPIAR CÓDIGO'}</span>
            </button>
          </div>

          <pre className="font-mono text-xs text-[#F27D26] bg-black p-4 border border-white/10 overflow-x-auto leading-relaxed">
            <code>{refactoredCode}</code>
          </pre>

          <div className="text-[10px] font-mono text-white/50 flex items-center space-x-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Código gerado através de substituição de nós sintáticos (ts.createPrinter). 100% livre de falhas de regex.</span>
          </div>
        </div>
      )}
    </div>
  );
};
