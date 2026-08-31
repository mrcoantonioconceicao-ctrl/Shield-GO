import React, { useState } from 'react';
import { Cpu, Sliders, Play, Layers, Download, Check, Sparkles, TrendingDown, ShieldCheck, Activity, RefreshCw } from 'lucide-react';
import { fineTuningEngine, generateSyntheticDataset, FineTuningJob, DatasetPair, LoRAConfig } from '../lib/fineTuningEngine';

export const FineTuningStudio: React.FC = () => {
  const [jobs, setJobs] = useState<FineTuningJob[]>(() => fineTuningEngine.getJobs());
  const [selectedJob, setSelectedJob] = useState<FineTuningJob>(jobs[0]);
  const [activeTab, setActiveTab] = useState<'jobs' | 'dataset' | 'config'>('jobs');

  // New Training Job Form
  const [modelName, setModelName] = useState('rustshield-codellama-7b-ast-v2');
  const [baseModel, setBaseModel] = useState('CodeLlama-7b-Instruct-hf');
  const [datasetCount, setDatasetCount] = useState<number>(40);
  const [loraConfig, setLoraConfig] = useState<LoRAConfig>(() => fineTuningEngine.getDefaultConfig());
  const [isTraining, setIsTraining] = useState(false);

  // Synthetic Dataset Inspector
  const [syntheticPairs, setSyntheticPairs] = useState<DatasetPair[]>(() => generateSyntheticDataset(6));
  const [copiedDataset, setCopiedDataset] = useState(false);

  const handleStartTraining = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTraining(true);

    setTimeout(() => {
      const job = fineTuningEngine.createJob(modelName, baseModel, datasetCount, loraConfig);
      setJobs(fineTuningEngine.getJobs());
      setSelectedJob(job);
      setIsTraining(false);
      setActiveTab('jobs');
    }, 1200);
  };

  const handleRegenerateDataset = () => {
    setSyntheticPairs(generateSyntheticDataset(6));
  };

  const handleExportAdapter = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedJob, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${selectedJob.modelName}-adapter-config.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyDatasetJson = () => {
    navigator.clipboard.writeText(JSON.stringify(syntheticPairs, null, 2));
    setCopiedDataset(true);
    setTimeout(() => setCopiedDataset(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#080808] border border-white/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#F27D26] text-black">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">
              FINE-TUNING & SYNTHETIC SECURITY DATASET STUDIO
            </h2>
            <p className="text-[11px] font-mono text-white/50">
              Sintetizador de pares de treino instrucionais com LoRA / QLoRA 4-bit para modelos LLM de segurança.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-1 bg-black p-1 border border-white/20">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase font-bold tracking-wider transition-all cursor-pointer ${
              activeTab === 'jobs'
                ? 'bg-[#F27D26] text-black shadow-[0_0_10px_rgba(242,125,38,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Dashboard de Treino ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase font-bold tracking-wider transition-all cursor-pointer ${
              activeTab === 'config'
                ? 'bg-[#F27D26] text-black shadow-[0_0_10px_rgba(242,125,38,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            + Novo Job & LoRA Config
          </button>
          <button
            onClick={() => setActiveTab('dataset')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase font-bold tracking-wider transition-all cursor-pointer ${
              activeTab === 'dataset'
                ? 'bg-[#F27D26] text-black shadow-[0_0_10px_rgba(242,125,38,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Dataset Sintético AST
          </button>
        </div>
      </div>

      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job List Column */}
          <div className="bg-[#080808] border border-white/10 p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-white border-b border-white/10 pb-3">
              HISTÓRICO DE JOBS DE FINE-TUNING
            </h3>

            <div className="space-y-2">
              {jobs.map((j) => (
                <button
                  key={j.id}
                  onClick={() => setSelectedJob(j)}
                  className={`w-full text-left p-3 border transition-all cursor-pointer ${
                    selectedJob.id === j.id
                      ? 'bg-white/10 border-[#F27D26] text-white'
                      : 'bg-black border-white/10 text-white/70 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#F27D26] truncate">{j.modelName}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold">
                      {j.status}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-white/40 mt-1">
                    Base: {j.baseModel} • {j.datasetCount} pares
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Job Training Visualizer & Metrics */}
          <div className="lg:col-span-2 bg-[#080808] border border-white/10 p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#F27D26] tracking-widest block">
                  JOB ID: {selectedJob.id}
                </span>
                <h3 className="text-base font-black uppercase tracking-tight text-white mt-0.5">
                  {selectedJob.modelName}
                </h3>
                <span className="text-xs font-mono text-white/50">
                  Modelo Base: <strong className="text-white">{selectedJob.baseModel}</strong>
                </span>
              </div>

              <button
                onClick={handleExportAdapter}
                className="flex items-center space-x-1.5 bg-[#F27D26] hover:bg-[#ff8c35] text-black font-black px-3 py-2 text-xs uppercase tracking-wider cursor-pointer transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>EXPORTAR LORA ADAPTER (.JSON)</span>
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-black p-3 border border-white/10">
                <span className="text-[9px] font-mono text-white/40 uppercase block">Curva Loss Final</span>
                <div className="text-xl font-black text-emerald-400 font-mono flex items-center space-x-1 mt-1">
                  <TrendingDown className="h-4 w-4" />
                  <span>{selectedJob.logs[selectedJob.logs.length - 1]?.trainLoss || 0.18}</span>
                </div>
              </div>

              <div className="bg-black p-3 border border-white/10">
                <span className="text-[9px] font-mono text-white/40 uppercase block">Score Match AST</span>
                <div className="text-xl font-black text-[#F27D26] font-mono flex items-center space-x-1 mt-1">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{selectedJob.finalAstMatchScore}%</span>
                </div>
              </div>

              <div className="bg-black p-3 border border-white/10">
                <span className="text-[9px] font-mono text-white/40 uppercase block">Score BLEU</span>
                <div className="text-xl font-black text-white font-mono flex items-center space-x-1 mt-1">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  <span>{selectedJob.finalBleuScore}%</span>
                </div>
              </div>

              <div className="bg-black p-3 border border-white/10">
                <span className="text-[9px] font-mono text-white/40 uppercase block">Quantização</span>
                <div className="text-xs font-black text-[#F27D26] font-mono mt-2 uppercase">
                  {selectedJob.config.quantization}
                </div>
              </div>
            </div>

            {/* Epoch Logs Table */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white mb-3 flex items-center space-x-2">
                <Layers className="h-3.5 w-3.5 text-[#F27D26]" />
                <span>PROGRESSO POR ÉPOCA (TRAINING LOGS)</span>
              </h4>

              <div className="bg-black border border-white/10 overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-white/5 border-b border-white/10 text-[10px] text-white/50 uppercase">
                    <tr>
                      <th className="p-2.5">Época</th>
                      <th className="p-2.5">Step</th>
                      <th className="p-2.5">Train Loss</th>
                      <th className="p-2.5">Val Loss</th>
                      <th className="p-2.5">AST Match (%)</th>
                      <th className="p-2.5">Learning Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {selectedJob.logs.map((log) => (
                      <tr key={log.epoch} className="hover:bg-white/5">
                        <td className="p-2.5 font-bold text-[#F27D26]"># {log.epoch}</td>
                        <td className="p-2.5">{log.step}</td>
                        <td className="p-2.5 text-emerald-400">{log.trainLoss}</td>
                        <td className="p-2.5 text-emerald-300">{log.valLoss}</td>
                        <td className="p-2.5 font-bold text-white">{log.astMatchScore}%</td>
                        <td className="p-2.5 text-white/40">{log.learningRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <form onSubmit={handleStartTraining} className="bg-[#080808] border border-white/10 p-6 space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
            <Sliders className="h-4 w-4 text-[#F27D26]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              CONFIGURAR NOVO JOB DE FINE-TUNING LORA / QLORA
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-white/50 mb-1">
                Nome do Modelo Resultante
              </label>
              <input
                type="text"
                required
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-white/50 mb-1">
                Modelo Base (HuggingFace / Gemini)
              </label>
              <input
                type="text"
                required
                value={baseModel}
                onChange={(e) => setBaseModel(e.target.value)}
                className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>
          </div>

          {/* LoRA Hyperparameters */}
          <div className="bg-black p-4 border border-white/10 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#F27D26] flex items-center space-x-1.5">
              <Cpu className="h-3.5 w-3.5" />
              <span>HIPERPARÂMETROS LORA (LOW-RANK ADAPTATION)</span>
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-mono text-white/50 mb-1">
                  LoRA Rank (r)
                </label>
                <input
                  type="number"
                  value={loraConfig.r}
                  onChange={(e) => setLoraConfig({ ...loraConfig, r: Number(e.target.value) })}
                  className="w-full bg-[#080808] border border-white/20 px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-white/50 mb-1">
                  LoRA Alpha (α)
                </label>
                <input
                  type="number"
                  value={loraConfig.loraAlpha}
                  onChange={(e) => setLoraConfig({ ...loraConfig, loraAlpha: Number(e.target.value) })}
                  className="w-full bg-[#080808] border border-white/20 px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-white/50 mb-1">
                  Learning Rate
                </label>
                <input
                  type="number"
                  step="0.00005"
                  value={loraConfig.learningRate}
                  onChange={(e) => setLoraConfig({ ...loraConfig, learningRate: Number(e.target.value) })}
                  className="w-full bg-[#080808] border border-white/20 px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-mono text-white/50 mb-1">
                  Batch Size
                </label>
                <input
                  type="number"
                  value={loraConfig.batchSize}
                  onChange={(e) => setLoraConfig({ ...loraConfig, batchSize: Number(e.target.value) })}
                  className="w-full bg-[#080808] border border-white/20 px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-white/50 mb-1">
                  Épocas de Treino
                </label>
                <input
                  type="number"
                  value={loraConfig.epochs}
                  onChange={(e) => setLoraConfig({ ...loraConfig, epochs: Number(e.target.value) })}
                  className="w-full bg-[#080808] border border-white/20 px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-white/50 mb-1">
                  Quantização
                </label>
                <select
                  value={loraConfig.quantization}
                  onChange={(e) => setLoraConfig({ ...loraConfig, quantization: e.target.value as any })}
                  className="w-full bg-[#080808] border border-white/20 px-2 py-1.5 text-xs font-mono text-[#F27D26]"
                >
                  <option value="4bit_qlora">4bit QLoRA (Recomendado)</option>
                  <option value="8bit_lora">8bit LoRA</option>
                  <option value="fp16_full">FP16 Full Precision</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isTraining}
            className="w-full bg-[#F27D26] hover:bg-[#ff8c35] text-black font-black py-3.5 text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(242,125,38,0.3)]"
          >
            {isTraining ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>INICIANDO TREINO QLORA E COMPILANDO WEIGHTS...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-black" />
                <span>DISPARAR JOB DE FINE-TUNING AGORA</span>
              </>
            )}
          </button>
        </form>
      )}

      {activeTab === 'dataset' && (
        <div className="bg-[#080808] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                DATASET SINTÉTICO DE INSTRUÇÃO E SEGUNDA ETAPA AST
              </h3>
              <p className="text-[10px] font-mono text-white/50">
                Pares instrucionais gerados para alinhamento e sintonização de segurança de LLMs.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleRegenerateDataset}
                className="flex items-center space-x-1 bg-black border border-white/20 hover:border-white/40 px-3 py-1.5 text-xs font-mono text-white uppercase cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 text-[#F27D26]" />
                <span>Regenerar Pares</span>
              </button>

              <button
                onClick={handleCopyDatasetJson}
                className="flex items-center space-x-1 bg-[#F27D26] text-black font-bold px-3 py-1.5 text-xs uppercase cursor-pointer"
              >
                {copiedDataset ? <Check className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5 fill-black" />}
                <span>{copiedDataset ? 'COPIADO!' : 'EXPORTAR JSONL'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {syntheticPairs.map((pair) => (
              <div key={pair.id} className="bg-black border border-white/10 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[10px] font-mono font-bold text-[#F27D26]">{pair.category}</span>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 border border-emerald-500/30">
                    AST Match Score: {pair.astValidationScore}%
                  </span>
                </div>

                <div className="text-xs font-bold text-white font-mono">{pair.instruction}</div>

                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-rose-400 uppercase">// Input Vulnerável:</div>
                  <pre className="bg-[#080808] p-2 text-[10px] font-mono text-white/70 overflow-x-auto border border-white/10">
                    {pair.inputCode}
                  </pre>

                  <div className="text-[10px] font-mono text-emerald-400 uppercase">// Output Seguro Remediado:</div>
                  <pre className="bg-[#080808] p-2 text-[10px] font-mono text-emerald-300 overflow-x-auto border border-white/10">
                    {pair.targetPatch}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
