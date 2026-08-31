import React from 'react';
import { GitPullRequest, Code2, Cpu, CheckCircle2, Terminal, Network, Database, Server, Sliders } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  githubToken: string;
  setGithubToken: (token: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  githubToken,
  setGithubToken,
}) => {
  return (
    <header className="border-b border-white/10 bg-[#050505] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-start space-x-3">
          <div className="h-10 w-10 bg-[#F27D26] flex items-center justify-center font-black text-black text-xl">
            ⚡
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] tracking-[0.4em] uppercase text-emerald-400 font-mono font-bold block">
                ● AST • RAG • MCP • FINE-TUNING
              </span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
              RUSTSHIELD<span className="text-[#F27D26]">_SUITE</span>
            </h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap items-center gap-1 bg-black/60 p-1 border border-white/10">
          <button
            onClick={() => setActiveTab('runner')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'runner'
                ? 'bg-[#F27D26] text-black font-black shadow-[0_0_15px_rgba(242,125,38,0.4)]'
                : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <GitPullRequest className="h-3.5 w-3.5" />
            <span>BPMN Exec</span>
          </button>

          <button
            onClick={() => setActiveTab('ast')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'ast'
                ? 'bg-[#F27D26] text-black font-black shadow-[0_0_15px_rgba(242,125,38,0.4)]'
                : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Network className="h-3.5 w-3.5" />
            <span>Análise AST</span>
          </button>

          <button
            onClick={() => setActiveTab('patch')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'patch'
                ? 'bg-[#F27D26] text-black font-black shadow-[0_0_15px_rgba(242,125,38,0.4)]'
                : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Patch Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('rag')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'rag'
                ? 'bg-[#F27D26] text-black font-black shadow-[0_0_15px_rgba(242,125,38,0.4)]'
                : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Database className="h-3.5 w-3.5 text-emerald-400" />
            <span>RAG Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('mcp')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'mcp'
                ? 'bg-[#F27D26] text-black font-black shadow-[0_0_15px_rgba(242,125,38,0.4)]'
                : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Server className="h-3.5 w-3.5 text-sky-400" />
            <span>MCP Server</span>
          </button>

          <button
            onClick={() => setActiveTab('finetune')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'finetune'
                ? 'bg-[#F27D26] text-black font-black shadow-[0_0_15px_rgba(242,125,38,0.4)]'
                : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Sliders className="h-3.5 w-3.5 text-amber-400" />
            <span>Fine-Tuning</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'bg-[#F27D26] text-black font-black shadow-[0_0_15px_rgba(242,125,38,0.4)]'
                : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Go DDD</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'review'
                ? 'bg-[#F27D26] text-black font-black shadow-[0_0_15px_rgba(242,125,38,0.4)]'
                : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Review</span>
          </button>
        </nav>

        {/* GitHub Token Quick Input */}
        <div className="flex items-center space-x-2">
          <input
            type="password"
            placeholder="GitHub Token (ghp_...)"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            className="w-44 bg-black border border-white/20 text-xs text-white placeholder-white/40 px-3 py-1.5 font-mono focus:outline-none focus:border-[#F27D26]"
          />
          <div className="flex items-center text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/40 px-2.5 py-1.5 border border-emerald-500/30">
            <Terminal className="h-3 w-3 mr-1" />
            <span>AST Live</span>
          </div>
        </div>
      </div>
    </header>
  );
};
