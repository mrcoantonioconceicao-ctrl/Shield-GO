import React from 'react';
import { CheckCircle2, ShieldCheck, Terminal, Cpu, Zap, Lock } from 'lucide-react';

export const CodeReviewPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Banner matching Red Team Protocol / High Impact Card */}
      <div className="bg-[#F27D26] text-black p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="text-[12px] font-black uppercase tracking-[0.3em] opacity-80">
            RED TEAM PROTOCOL AUDIT
          </div>
          <h2 className="text-3xl sm:text-4xl font-black leading-[0.9] uppercase tracking-tighter">
            SEGURANÇA & QUALIDADE<br />RUSTSHIELD-GO STANDARD
          </h2>
          <p className="text-xs font-bold leading-relaxed max-w-2xl pt-2 border-t border-black/20">
            Análise rigorosa do módulo de automação de Git e Pull Request em Go, cobrindo complexidade ciclomática V(G) ≤ 4, sanitização total de OS Command Injection, tratamento de concorrência e padrões DDD.
          </p>
        </div>

        <div className="border border-black p-4 bg-black/10 flex flex-col justify-between items-center text-center shrink-0">
          <ShieldCheck className="h-10 w-10 mb-2" />
          <span className="text-[10px] font-black tracking-widest uppercase">AUDIT VERIFIED</span>
          <span className="text-xs font-mono font-bold mt-1">100% COVERAGE</span>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1 */}
        <div className="bg-[#080808] border border-white/10 p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-white/10 text-[#F27D26]">
            <Zap className="h-4 w-4" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
              1. COMPLEXIDADE CICLOMÁTICA V(G) ≤ 4
            </h3>
          </div>
          <ul className="space-y-3 text-xs text-white/80 font-mono leading-relaxed">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 text-[#F27D26] flex-shrink-0 mt-0.5" />
              <span><strong>GUARD CLAUSES:</strong> Todas as funções das camadas <code className="text-[#F27D26]">usecase</code> e <code className="text-[#F27D26]">infra</code> utilizam retornos precoces eliminando encadeamento condicional profundo.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 text-[#F27D26] flex-shrink-0 mt-0.5" />
              <span><strong>RESPONSABILIDADE ÚNICA (SRP):</strong> Separação estrita de contratos entre domínio, cliente REST HTTP e executor Git CLI.</span>
            </li>
          </ul>
        </div>

        {/* Pillar 2 */}
        <div className="bg-[#080808] border border-white/10 p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-white/10 text-[#F27D26]">
            <Lock className="h-4 w-4" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
              2. ZERO OS COMMAND INJECTION
            </h3>
          </div>
          <ul className="space-y-3 text-xs text-white/80 font-mono leading-relaxed">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 text-[#F27D26] flex-shrink-0 mt-0.5" />
              <span><strong>SYSCALL EXECVE DIRETO:</strong> O pacote <code className="text-[#F27D26]">infra.ExecGitService</code> executa <code className="text-[#F27D26]">exec.CommandContext(ctx, "git", args...)</code> enviando os argumentos sem interpretadores shell.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 text-[#F27D26] flex-shrink-0 mt-0.5" />
              <span><strong>ZERO INTERPOLAÇÃO SHELL:</strong> Caracteres como <code className="text-[#F27D26]">;</code>, <code className="text-[#F27D26]">&amp;&amp;</code> ou <code className="text-[#F27D26]">|</code> são lidos como literais neutros.</span>
            </li>
          </ul>
        </div>

        {/* Pillar 3 */}
        <div className="bg-[#080808] border border-white/10 p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-white/10 text-[#F27D26]">
            <Cpu className="h-4 w-4" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
              3. CONCORRÊNCIA & TIMEOUTS SEGUROS
            </h3>
          </div>
          <ul className="space-y-3 text-xs text-white/80 font-mono leading-relaxed">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 text-[#F27D26] flex-shrink-0 mt-0.5" />
              <span><strong>CONTEXT PROPAGATION:</strong> Operações assíncronas aceitam <code className="text-[#F27D26]">context.Context</code> com suporte a cancelamento sob demanda.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 text-[#F27D26] flex-shrink-0 mt-0.5" />
              <span><strong>HTTP CLIENT ISOLATION:</strong> Timeout configurado explicitamente em 15s no cliente nativo <code className="text-[#F27D26]">net/http.Client</code>.</span>
            </li>
          </ul>
        </div>

        {/* Pillar 4 */}
        <div className="bg-[#080808] border border-white/10 p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-white/10 text-[#F27D26]">
            <Terminal className="h-4 w-4" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
              4. TRATAMENTO EXPLÍCITO DE ERROS GO
            </h3>
          </div>
          <ul className="space-y-3 text-xs text-white/80 font-mono leading-relaxed">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 text-[#F27D26] flex-shrink-0 mt-0.5" />
              <span><strong>ZERO IDENTIFICADORES DESCARTADOS (_):</strong> Nenhuma exceção ou erro de execução de subprocesso é ignorado.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 text-[#F27D26] flex-shrink-0 mt-0.5" />
              <span><strong>ERROR WRAPPING CONTEXTUAL:</strong> Utilização do verbo <code className="text-[#F27D26]">%w</code> para manter rastreabilidade tratável via <code className="text-[#F27D26]">errors.Is()</code>.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

