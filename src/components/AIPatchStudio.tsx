import React, { useState } from 'react';
import { Cpu, Sparkles, Code2, ShieldAlert, Check, Copy, RefreshCw } from 'lucide-react';

export const AIPatchStudio: React.FC = () => {
  const [vulnerability, setVulnerability] = useState(
    'Porta 6379 (Redis) exposta em 0.0.0.0 sem senha e sem TLS, ou Rota LLM sem validação de token JWT'
  );
  const [codeSnippet, setCodeSnippet] = useState(`package main

import (
    "net/http"
)

// Vulnerable LLM handler without authentication
func handleLLMQuery(w http.ResponseWriter, r *http.Request) {
    prompt := r.URL.Query().Get("prompt")
    // Directly passing prompt to LLM engine without rate limits or auth
    w.Write([]byte("Output for: " + prompt))
}`);

  const [language, setLanguage] = useState('go');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPatch, setGeneratedPatch] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedPatch(null);

    try {
      const response = await fetch('/api/patch/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vulnerability,
          codeSnippet,
          language,
        }),
      });

      const data = await response.json();
      setGeneratedPatch(data.patch || '// Patch de segurança não gerado');
    } catch (error) {
      console.error('Error generating patch:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedPatch) {
      navigator.clipboard.writeText(generatedPatch);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Input Box */}
      <div className="bg-[#080808] border border-white/10 p-6 shadow-2xl space-y-5">
        <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
          <div className="p-1 bg-[#F27D26] text-black">
            <Cpu className="h-4 w-4" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
            COMPILADOR AI DE REMEDIAÇÃO DE VULNERABILIDADES
          </h3>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-mono tracking-widest text-white/50 mb-1">
            Descrição da Brecha / Vulnerabilidade
          </label>
          <input
            type="text"
            value={vulnerability}
            onChange={(e) => setVulnerability(e.target.value)}
            className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#F27D26]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] uppercase font-mono tracking-widest text-white/50">
              Código Vulnerável Original
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-black border border-white/20 px-2.5 py-1 text-[10px] font-mono text-[#F27D26] uppercase focus:outline-none"
            >
              <option value="go">Go (Golang)</option>
              <option value="typescript">TypeScript</option>
              <option value="yaml">YAML / Config</option>
            </select>
          </div>
          <textarea
            rows={8}
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            className="w-full bg-black border border-white/20 p-3 font-mono text-xs text-white focus:outline-none focus:border-[#F27D26]"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-[#F27D26] hover:bg-[#ff8c35] text-black font-black py-3 text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(242,125,38,0.3)]"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>SINTETIZANDO PATCH COM GEMINI...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 fill-black" />
              <span>GERAR PATCH SEGURO COM IA</span>
            </>
          )}
        </button>
      </div>

      {/* Right Output Box */}
      <div className="bg-[#080808] border border-white/10 p-6 shadow-2xl flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <Code2 className="h-4 w-4 text-[#F27D26]" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                RESULTADO DO PATCH GERADO
              </h3>
            </div>
            {generatedPatch && (
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 text-xs bg-[#F27D26] text-black hover:bg-[#ff8c35] px-3 py-1 font-black uppercase tracking-wider cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'COPIADO!' : 'COPIAR'}</span>
              </button>
            )}
          </div>

          <div className="bg-black border border-white/10 p-4 min-h-[280px] font-mono text-xs text-white/90 overflow-x-auto">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-white/40 space-y-3">
                <RefreshCw className="h-6 w-6 animate-spin text-[#F27D26]" />
                <span className="uppercase text-[10px] tracking-widest">// ANALISANDO AST E GERANDO SANITIZAÇÃO...</span>
              </div>
            ) : generatedPatch ? (
              <pre className="whitespace-pre-wrap leading-relaxed text-[#F27D26]">{generatedPatch}</pre>
            ) : (
              <div className="text-white/30 text-center py-20 italic font-mono uppercase tracking-widest text-[10px]">
                // CLIQUE EM "GERAR PATCH SEGURO COM IA" PARA SINTETIZAR O CÓDIGO FIX
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-white/10 text-[10px] font-mono text-white/50 flex items-center space-x-2">
          <ShieldAlert className="h-4 w-4 text-[#F27D26] flex-shrink-0" />
          <span>GARANTIA RUSTSHIELD: TRATAMENTO EXPLÍCITO DE ERROS E ZERO INJEÇÃO OS CLI.</span>
        </div>
      </div>
    </div>
  );
};

