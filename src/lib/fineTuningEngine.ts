// Fine-Tuning Engine for RustShield DevSecOps
// Synthetic Security Dataset Generator, LoRA/QLoRA Hyperparameter Config & Training Progress Simulator

export interface DatasetPair {
  id: string;
  category: string;
  instruction: string;
  inputCode: string;
  targetPatch: string;
  astValidationScore: number;
}

export interface LoRAConfig {
  r: number;
  loraAlpha: number;
  loraDropout: number;
  targetModules: string[];
  learningRate: number;
  batchSize: number;
  epochs: number;
  maxSeqLen: number;
  optimizer: 'adamw_8bit' | 'paged_adamw_32bit' | 'lion_8bit';
  quantization: '4bit_qlora' | '8bit_lora' | 'fp16_full';
}

export interface TrainingEpochLog {
  epoch: number;
  step: number;
  trainLoss: number;
  valLoss: number;
  astMatchScore: number; // % exact AST structure match
  learningRate: number;
}

export interface FineTuningJob {
  id: string;
  status: 'PENDING' | 'TRAINING' | 'COMPLETED' | 'FAILED';
  modelName: string;
  baseModel: string;
  createdAt: string;
  config: LoRAConfig;
  datasetCount: number;
  logs: TrainingEpochLog[];
  finalBleuScore?: number;
  finalAstMatchScore?: number;
}

const DEFAULT_LORA_CONFIG: LoRAConfig = {
  r: 16,
  loraAlpha: 32,
  loraDropout: 0.05,
  targetModules: ['q_proj', 'v_proj', 'k_proj', 'o_proj', 'gate_proj', 'up_proj', 'down_proj'],
  learningRate: 0.0002,
  batchSize: 4,
  epochs: 5,
  maxSeqLen: 2048,
  optimizer: 'adamw_8bit',
  quantization: '4bit_qlora',
};

// Generator of synthetic high-quality security training pairs
export function generateSyntheticDataset(count: number = 20): DatasetPair[] {
  const templates = [
    {
      category: 'Command Injection (CWE-78)',
      instruction: 'Substitua o nó exec() vulnerável no código TypeScript por execFile() com argumentos parametrizados sem subshell.',
      vuln: `import { exec } from 'child_process';\napp.post('/api/run', (req, res) => {\n  exec('ping -c 1 ' + req.body.host, (err, out) => res.json({ out }));\n});`,
      patch: `import { execFile } from 'child_process';\napp.post('/api/run', (req, res) => {\n  execFile('/bin/ping', ['-c', '1', req.body.host], (err, out) => res.json({ out }));\n});`,
    },
    {
      category: 'Missing Route Auth (CWE-284)',
      instruction: 'Injete middleware requireJwtAuth em endpoints sensíveis de IA / LLM.',
      vuln: `app.post('/api/v1/llm/generate', (req, res) => {\n  const prompt = req.body.prompt;\n  res.json({ result: processPrompt(prompt) });\n});`,
      patch: `import { requireJwtAuth } from './middleware/auth';\napp.post('/api/v1/llm/generate', requireJwtAuth, (req, res) => {\n  const prompt = req.body.prompt;\n  res.json({ result: processPrompt(prompt) });\n});`,
    },
    {
      category: 'Unrestricted Interface Binding (CWE-1327)',
      instruction: 'Restringir a escuta do servidor HTTP para a interface de loopback local (127.0.0.1).',
      vuln: `app.listen(3000, '0.0.0.0', () => console.log('Listening on 0.0.0.0:3000'));`,
      patch: `app.listen(3000, '127.0.0.1', () => console.log('Listening securely on 127.0.0.1:3000'));`,
    },
    {
      category: 'Go CommandContext Isolation',
      instruction: 'Refatorar exec.Command para exec.CommandContext com timeout em servidor Golang.',
      vuln: `func handler(w http.ResponseWriter, r *http.Request) {\n  cmd := exec.Command("sh", "-c", "echo " + r.URL.Query().Get("p"))\n  out, _ := cmd.Output()\n  w.Write(out)\n}`,
      patch: `func handler(w http.ResponseWriter, r *http.Request) {\n  ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)\n  defer cancel()\n  cmd := exec.CommandContext(ctx, "/bin/echo", r.URL.Query().Get("p"))\n  out, _ := cmd.Output()\n  w.Write(out)\n}`,
    },
  ];

  const dataset: DatasetPair[] = [];
  for (let i = 0; i < count; i++) {
    const tmpl = templates[i % templates.length];
    dataset.push({
      id: `pair_ds_${i + 1}`,
      category: tmpl.category,
      instruction: `${tmpl.instruction} [Variante #${i + 1}]`,
      inputCode: tmpl.vuln,
      targetPatch: tmpl.patch,
      astValidationScore: 100,
    });
  }
  return dataset;
}

class FineTuningEngineStore {
  private jobs: FineTuningJob[] = [];
  private currentJob: FineTuningJob | null = null;

  constructor() {
    // Initial sample finished job
    this.jobs.push({
      id: 'job_ft_rustshield_v1',
      status: 'COMPLETED',
      modelName: 'rustshield-codellama-7b-ast-sec',
      baseModel: 'CodeLlama-7b-Instruct-hf',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      config: DEFAULT_LORA_CONFIG,
      datasetCount: 120,
      finalBleuScore: 92.4,
      finalAstMatchScore: 98.7,
      logs: [
        { epoch: 1, step: 25, trainLoss: 1.84, valLoss: 1.62, astMatchScore: 78.2, learningRate: 0.0002 },
        { epoch: 2, step: 50, trainLoss: 1.12, valLoss: 0.98, astMatchScore: 86.5, learningRate: 0.00018 },
        { epoch: 3, step: 75, trainLoss: 0.65, valLoss: 0.52, astMatchScore: 92.1, learningRate: 0.00012 },
        { epoch: 4, step: 100, trainLoss: 0.38, valLoss: 0.31, astMatchScore: 96.4, learningRate: 0.00006 },
        { epoch: 5, step: 125, trainLoss: 0.21, valLoss: 0.18, astMatchScore: 98.7, learningRate: 0.00001 },
      ],
    });
  }

  public getJobs(): FineTuningJob[] {
    return this.jobs;
  }

  public getDefaultConfig(): LoRAConfig {
    return { ...DEFAULT_LORA_CONFIG };
  }

  public createJob(
    modelName: string,
    baseModel: string,
    datasetCount: number,
    config: Partial<LoRAConfig>
  ): FineTuningJob {
    const fullConfig: LoRAConfig = { ...DEFAULT_LORA_CONFIG, ...config };
    const jobId = `job_ft_${Date.now()}`;

    const newJob: FineTuningJob = {
      id: jobId,
      status: 'TRAINING',
      modelName: modelName || 'rustshield-sec-adapter',
      baseModel: baseModel || 'CodeLlama-7b-Instruct',
      createdAt: new Date().toISOString(),
      config: fullConfig,
      datasetCount,
      logs: [],
    };

    // Simulate training progress over epochs
    let currentTrainLoss = 2.45;
    let currentValLoss = 2.10;
    let astMatch = 65.0;

    for (let ep = 1; ep <= fullConfig.epochs; ep++) {
      currentTrainLoss *= 0.62;
      currentValLoss *= 0.65;
      astMatch = Math.min(99.2, astMatch + (100 - astMatch) * 0.45);
      const step = ep * Math.floor(datasetCount / fullConfig.batchSize);
      const lr = fullConfig.learningRate * Math.cos((ep / fullConfig.epochs) * (Math.PI / 2));

      newJob.logs.push({
        epoch: ep,
        step,
        trainLoss: Number(currentTrainLoss.toFixed(3)),
        valLoss: Number(currentValLoss.toFixed(3)),
        astMatchScore: Number(astMatch.toFixed(1)),
        learningRate: Number(lr.toFixed(6)),
      });
    }

    newJob.status = 'COMPLETED';
    newJob.finalBleuScore = Number((88 + Math.random() * 8).toFixed(1));
    newJob.finalAstMatchScore = newJob.logs[newJob.logs.length - 1].astMatchScore;

    this.jobs.unshift(newJob);
    this.currentJob = newJob;
    return newJob;
  }
}

export const fineTuningEngine = new FineTuningEngineStore();
