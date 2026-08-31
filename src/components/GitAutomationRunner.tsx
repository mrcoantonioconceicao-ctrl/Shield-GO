import React, { useState } from 'react';
import { GitPullRequest, Play, CheckCircle2, ShieldAlert, Terminal, AlertCircle, RefreshCw, ExternalLink, GitBranch, GitCommit, Network, KeyRound } from 'lucide-react';
import { WorkflowVisualizer } from './WorkflowVisualizer';

interface GitAutomationRunnerProps {
  githubToken: string;
}

export const GitAutomationRunner: React.FC<GitAutomationRunnerProps> = ({ githubToken }) => {
  const [repoOwner, setRepoOwner] = useState('mrcoantonioconceicao-ctrl');
  const [repoName, setRepoName] = useState('NEXAVOR-QUANTUM-AUDIT');
  const [scanType, setScanType] = useState('PORT_EXPOSURE');
  const [targetFile, setTargetFile] = useState('server.ts');
  const [host, setHost] = useState('127.0.0.1');
  const [port, setPort] = useState(6379);
  const [llmRoute, setLlmRoute] = useState('/api/v1/llm/generate');
  
  const [isRunning, setIsRunning] = useState(false);
  const [workflowResult, setWorkflowResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRunWorkflow = async () => {
    setIsRunning(true);
    setErrorMessage('');
    setWorkflowResult(null);

    const initialLogs: string[] = [
      `[${new Date().toLocaleTimeString()}] 🛡️ [Etapa 1] Inicializando RustShield Autonomous DevSecOps Engine...`,
      `[${new Date().toLocaleTimeString()}] 🔗 Conectando à API REST do GitHub (repositório: ${repoOwner}/${repoName})...`,
    ];
    setLogs(initialLogs);

    try {
      if (!githubToken || !githubToken.trim().startsWith('ghp_')) {
        throw new Error('Autenticação Real Obrigatória: Por favor, insira um GitHub Token válido no topo da página (ex: ghp_...) com permissão "repo" para criar PRs reais.');
      }

      const response = await fetch('/api/audit/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoOwner: repoOwner.trim(),
          repoName: repoName.trim(),
          githubToken: githubToken.trim(),
          scanType,
          targetFile: targetFile.trim(),
          host: host.trim(),
          port,
          llmRoute: llmRoute.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao executar o workflow de automação.');
      }

      setWorkflowResult(data);

      const successLogs = [
        `[${new Date().toLocaleTimeString()}] 🌳 [Etapa 2] Varredura e Auditoria AST concluída: ${data.ast_analysis?.total_nodes || 0} nós analisados, V(G) = ${data.ast_analysis?.cyclomatic_complexity || 1}.`,
        `[${new Date().toLocaleTimeString()}] 🧬 [Etapa 3] Patch de segurança gerado via AST sem expressões regulares.`,
        `[${new Date().toLocaleTimeString()}] 🌿 [Etapa 4] Branch remota criada no GitHub: refs/heads/${data.branch_name}`,
        `[${new Date().toLocaleTimeString()}] 📦 [Etapa 5] Commit registrado com SHA: ${data.commit_sha?.slice(0, 7)}`,
        `[${new Date().toLocaleTimeString()}] 🚀 [Etapa 6] Push remoto sincronizado com sucesso.`,
        `[${new Date().toLocaleTimeString()}] 🎉 [Etapa 7] Pull Request #${data.pull_request?.number} aberto no GitHub: ${data.pull_request?.html_url}`,
      ];

      setLogs((prev) => [...prev, ...successLogs]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro desconhecido durante execução');
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ❌ ERRO DE EXECUÇÃO: ${err.message || 'Falha na comunicação com a API do GitHub.'}`,
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Diagram Tracker */}
      <WorkflowVisualizer steps={workflowResult?.bpmn_steps || []} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Configuration */}
        <div className="lg:col-span-5 bg-[#080808] border border-white/10 p-6 shadow-2xl space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
            <div className="p-1 bg-[#F27D26] text-black">
              <GitPullRequest className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
              PARÂMETROS DO ORQUESTRADOR 100% REAL
            </h3>
          </div>

          {!githubToken && (
            <div className="bg-[#150a00] border border-[#F27D26]/60 p-3.5 flex items-start space-x-3">
              <KeyRound className="h-4 w-4 text-[#F27D26] shrink-0 mt-0.5" />
              <div className="text-[11px] font-mono text-white/90 leading-tight">
                <span className="text-[#F27D26] font-bold block mb-1">MODO 100% REAL REQUER TOKEN:</span>
                Insira seu <strong>GitHub Personal Access Token (ghp_...)</strong> no campo superior para criar commits, branches e PRs reais no GitHub.
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-white/50 mb-1">
                Owner (Organização / Usuário)
              </label>
              <input
                type="text"
                value={repoOwner}
                onChange={(e) => setRepoOwner(e.target.value)}
                className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-white/50 mb-1">
                Repo (Repositório Alvo)
              </label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono tracking-widest text-white/50 mb-1">
              Tipo de Varredura AST (Scan Scope)
            </label>
            <select
              value={scanType}
              onChange={(e) => {
                setScanType(e.target.value);
                if (e.target.value === 'PORT_EXPOSURE') setTargetFile('server.ts');
                else if (e.target.value === 'LLM_ROUTE_LEAK') setTargetFile('server.ts');
                else setTargetFile('package.json');
              }}
              className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#F27D26]"
            >
              <option value="PORT_EXPOSURE">Reconhecimento de Porta Exposta (PORT_EXPOSURE)</option>
              <option value="LLM_ROUTE_LEAK">Auditoria de Rota LLM via AST (LLM_ROUTE_LEAK)</option>
              <option value="DEPENDENCY_CVE">Vulnerabilidade em Dependência Crítica (DEPENDENCY_CVE)</option>
            </select>
          </div>

          {scanType === 'PORT_EXPOSURE' && (
            <div className="grid grid-cols-2 gap-3 bg-black p-3 border border-white/10">
              <div>
                <label className="block text-[10px] font-mono text-[#F27D26] mb-1 uppercase">Host Alvo</label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="w-full bg-[#080808] border border-white/20 px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-[#F27D26] mb-1 uppercase">Porta Alvo</label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(Number(e.target.value))}
                  className="w-full bg-[#080808] border border-white/20 px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
            </div>
          )}

          {scanType === 'LLM_ROUTE_LEAK' && (
            <div className="bg-black p-3 border border-white/10">
              <label className="block text-[10px] font-mono text-[#F27D26] mb-1 uppercase">Endpoint Rota LLM</label>
              <input
                type="text"
                value={llmRoute}
                onChange={(e) => setLlmRoute(e.target.value)}
                className="w-full bg-[#080808] border border-white/20 px-2.5 py-1.5 text-xs font-mono text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase font-mono tracking-widest text-white/50 mb-1">
              Arquivo Alvo para Patch (Target File)
            </label>
            <input
              type="text"
              value={targetFile}
              onChange={(e) => setTargetFile(e.target.value)}
              className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleRunWorkflow}
              disabled={isRunning}
              className="w-full bg-[#F27D26] hover:bg-[#ff8c35] disabled:opacity-50 text-black font-black py-3 text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(242,125,38,0.3)]"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>EXECUTANDO PIPELINE REAL NO GITHUB...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-black" />
                  <span>DISPARAR AUDITORIA & PR REAL NO GITHUB</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output: Execution Log & PR Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Terminal Console */}
          <div className="bg-black border border-white/10 p-5 flex flex-col h-72">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Terminal className="h-4 w-4 text-[#F27D26]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  CLI Execution Log (RustShield-Go Runtime)
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 border border-emerald-500/30">
                100% REAL • ZERO REGEX
              </span>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-1.5 text-white/90 pr-2">
              {logs.length === 0 ? (
                <div className="text-white/30 italic py-12 text-center uppercase tracking-widest text-[10px]">
                  // Aguardando disparo do orquestrador real...
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="leading-relaxed border-l-2 border-[#F27D26] pl-2">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Results Box */}
          {workflowResult && (
            <div className="bg-[#080808] border border-[#F27D26] p-6 space-y-4 shadow-[0_0_25px_rgba(242,125,38,0.15)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-[#F27D26] text-black">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-white">
                      PULL REQUEST REAL CRIADO NO GITHUB!
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-400">
                      PR #{workflowResult.pull_request?.number} • Status: {workflowResult.pull_request?.state || 'open'}
                    </span>
                  </div>
                </div>
                <a
                  href={workflowResult.pull_request?.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-2 text-xs bg-[#F27D26] text-black hover:bg-[#ff8c35] px-4 py-2 font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  <span>VER PR NO GITHUB</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-black p-4 border border-white/10 space-y-1">
                  <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest block">Branch Gerada</span>
                  <div className="flex items-center space-x-2 font-mono text-[#F27D26] font-bold truncate">
                    <GitBranch className="h-4 w-4 text-[#F27D26] shrink-0" />
                    <span className="truncate">{workflowResult.branch_name}</span>
                  </div>
                </div>

                <div className="bg-black p-4 border border-white/10 space-y-1">
                  <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest block">Commit SHA</span>
                  <div className="flex items-center space-x-2 font-mono text-white truncate">
                    <GitCommit className="h-4 w-4 text-white/40 flex-shrink-0" />
                    <span className="truncate">{workflowResult.commit_sha}</span>
                  </div>
                </div>

                <div className="bg-black p-4 border border-white/10 space-y-1">
                  <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest block">AST Scanned</span>
                  <div className="flex items-center space-x-2 font-mono text-emerald-400 font-bold">
                    <Network className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{workflowResult.ast_analysis?.total_nodes} Nós (V(G) = {workflowResult.ast_analysis?.cyclomatic_complexity})</span>
                  </div>
                </div>
              </div>

              <div className="bg-black p-4 border border-white/10 space-y-2">
                <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest block">
                  Patch Aplicado no Repositório ({workflowResult.finding?.target_file})
                </span>
                <pre className="font-mono text-[11px] text-[#F27D26] bg-[#050505] p-3 border border-white/10 overflow-x-auto max-h-40">
                  <code>{workflowResult.patch_code}</code>
                </pre>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-950/80 border border-red-500 p-4 text-xs font-mono text-white flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
