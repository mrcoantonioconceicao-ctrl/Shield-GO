import React from 'react';
import { ArrowRight, CheckCircle, Clock, AlertTriangle, GitBranch } from 'lucide-react';

interface BPMNStep {
  step_number: number;
  step_name: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'PENDING';
  details: string;
  timestamp: string;
}

interface WorkflowVisualizerProps {
  steps: BPMNStep[];
  currentStepIndex?: number;
}

export const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({ steps }) => {
  const defaultSteps: BPMNStep[] = [
    { step_number: 1, step_name: 'Início', status: 'COMPLETED', details: 'Trigged via CLI / Orchestrator', timestamp: '' },
    { step_number: 2, step_name: 'Varredura de Brecha', status: 'PENDING', details: 'Scan de Porta, LLM, CVE', timestamp: '' },
    { step_number: 3, step_name: 'Geração de Patch', status: 'PENDING', details: 'Análise e compilação do fix', timestamp: '' },
    { step_number: 4, step_name: 'Branch Local', status: 'PENDING', details: 'git checkout -b fix/...', timestamp: '' },
    { step_number: 5, step_name: 'Commit Seguro', status: 'PENDING', details: 'git commit (os/exec seguro)', timestamp: '' },
    { step_number: 6, step_name: 'Push Remoto', status: 'PENDING', details: 'git push origin fix/...', timestamp: '' },
    { step_number: 7, step_name: 'Abertura de PR', status: 'PENDING', details: 'GitHub REST API /pulls', timestamp: '' },
  ];

  const displaySteps = steps.length > 0 ? steps : defaultSteps;

  return (
    <div className="border border-white/10 bg-[#080808] p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="p-1 bg-[#F27D26] text-black">
            <GitBranch className="h-4 w-4" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
            DOMAIN-DRIVEN BPMN PROCESS FLOW
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#F27D26] uppercase tracking-widest border border-[#F27D26]/40 px-2.5 py-1">
          RustShield SOA Standard
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {displaySteps.map((step, idx) => {
          const isCompleted = step.status === 'COMPLETED';
          const isInProgress = step.status === 'IN_PROGRESS';
          const isFailed = step.status === 'FAILED';

          return (
            <div key={step.step_number} className="relative group">
              <div
                className={`p-4 border flex flex-col justify-between h-full transition-all ${
                  isCompleted
                    ? 'bg-black border-white/20 text-white'
                    : isInProgress
                    ? 'bg-[#F27D26] text-black border-[#F27D26]'
                    : isFailed
                    ? 'bg-red-950/40 border-red-500 text-red-200'
                    : 'bg-black/40 border-white/10 text-white/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-mono font-bold ${isInProgress ? 'text-black font-black' : isCompleted ? 'text-[#F27D26]' : 'text-white/30'}`}>
                      0{step.step_number}
                    </span>
                    
                    {isCompleted ? (
                      <span className="text-[9px] font-bold border border-[#F27D26] text-[#F27D26] px-1.5 py-0.5 uppercase tracking-tighter">
                        [PASS]
                      </span>
                    ) : isInProgress ? (
                      <span className="bg-white text-black text-[9px] font-black px-1.5 py-0.5 uppercase tracking-tighter">
                        [RUNNING]
                      </span>
                    ) : isFailed ? (
                      <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 uppercase">
                        [FAIL]
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono opacity-30">
                        [WAIT]
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-xs font-black uppercase tracking-tighter leading-tight ${isInProgress ? 'text-black' : 'text-white'}`}>
                    {step.step_name}
                  </p>
                </div>

                <div className={`mt-3 text-[10px] font-mono line-clamp-2 leading-tight ${isInProgress ? 'text-black/80' : 'text-white/40'}`}>
                  {step.details || 'Aguardando fluxo'}
                </div>
              </div>

              {idx < displaySteps.length - 1 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-white/20">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

