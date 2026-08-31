import React, { useState } from 'react';
import { Cpu, Terminal, Play, Server, Layers, Code2, Check, Copy, RefreshCw, FileCode2 } from 'lucide-react';
import { handleMCPRequest, MCP_TOOLS, MCP_RESOURCES, MCP_PROMPTS, MCPJSONRPCRequest, MCPJSONRPCResponse } from '../lib/mcpEngine';

export const MCPExplorerStudio: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string>('rustshield.ast_analyze');
  const [toolArgs, setToolArgs] = useState<string>(
    JSON.stringify(
      {
        codeSnippet: `import { exec } from 'child_process';\napp.post('/api/v1/llm/generate', (req, res) => {\n  exec('echo ' + req.body.prompt);\n});`,
        language: 'typescript',
      },
      null,
      2
    )
  );

  const [jsonRpcLog, setJsonRpcLog] = useState<{ req: MCPJSONRPCRequest; res: MCPJSONRPCResponse } | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'schema' | 'resources'>('console');

  const handleRunTool = () => {
    let parsedArgs = {};
    try {
      parsedArgs = JSON.parse(toolArgs);
    } catch {
      // ignore
    }

    const req: MCPJSONRPCRequest = {
      jsonrpc: '2.0',
      id: `rpc_id_${Date.now()}`,
      method: 'tools/call',
      params: {
        name: selectedTool,
        arguments: parsedArgs,
      },
    };

    const res = handleMCPRequest(req);
    setJsonRpcLog({ req, res });
  };

  const handleToolChange = (toolName: string) => {
    setSelectedTool(toolName);
    if (toolName === 'rustshield.ast_analyze') {
      setToolArgs(
        JSON.stringify(
          {
            codeSnippet: `import { exec } from 'child_process';\napp.post('/api/v1/llm/generate', (req, res) => {\n  exec('echo ' + req.body.prompt);\n});`,
            language: 'typescript',
          },
          null,
          2
        )
      );
    } else if (toolName === 'rustshield.ast_refactor') {
      setToolArgs(
        JSON.stringify(
          {
            codeSnippet: `import { exec } from 'child_process';\napp.listen(3000, '0.0.0.0');`,
            fileName: 'server.ts',
          },
          null,
          2
        )
      );
    } else if (toolName === 'rustshield.cve_search') {
      setToolArgs(
        JSON.stringify(
          {
            query: 'command injection child_process exec',
            topK: 2,
          },
          null,
          2
        )
      );
    } else if (toolName === 'rustshield.fine_tune_job') {
      setToolArgs(
        JSON.stringify(
          {
            datasetSize: 50,
            learningRate: 0.0002,
            epochs: 3,
          },
          null,
          2
        )
      );
    }
  };

  const handleCopyLog = () => {
    if (jsonRpcLog) {
      navigator.clipboard.writeText(JSON.stringify(jsonRpcLog, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#080808] border border-white/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#F27D26] text-black">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">
              MCP (MODEL CONTEXT PROTOCOL) SERVER & INSPECTOR
            </h2>
            <p className="text-[11px] font-mono text-white/50">
              Servidor JSON-RPC 2.0 padrão MCP expondo ferramentas sintáticas AST, RAG e sintonia fina de modelos.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 bg-black p-1 border border-white/20">
          <button
            onClick={() => setActiveTab('console')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase font-bold tracking-wider transition-all cursor-pointer ${
              activeTab === 'console'
                ? 'bg-[#F27D26] text-black shadow-[0_0_10px_rgba(242,125,38,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Console JSON-RPC 2.0
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase font-bold tracking-wider transition-all cursor-pointer ${
              activeTab === 'schema'
                ? 'bg-[#F27D26] text-black shadow-[0_0_10px_rgba(242,125,38,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Esquemas de Ferramentas ({MCP_TOOLS.length})
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase font-bold tracking-wider transition-all cursor-pointer ${
              activeTab === 'resources'
                ? 'bg-[#F27D26] text-black shadow-[0_0_10px_rgba(242,125,38,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Recursos & Prompts
          </button>
        </div>
      </div>

      {activeTab === 'console' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input Payload & Tool Selection */}
          <div className="bg-[#080808] border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Terminal className="h-4 w-4 text-[#F27D26]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  DISPARADOR DE FERRAMENTAS MCP
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">JSON-RPC v2.0</span>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-white/50 mb-1">
                Selecionar Ferramenta MCP (Tool)
              </label>
              <select
                value={selectedTool}
                onChange={(e) => handleToolChange(e.target.value)}
                className="w-full bg-black border border-white/20 p-2.5 text-xs font-mono text-[#F27D26] uppercase focus:outline-none"
              >
                {MCP_TOOLS.map((tool) => (
                  <option key={tool.name} value={tool.name}>
                    {tool.name} - {tool.description.slice(0, 50)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-white/50 mb-1">
                Parâmetros da Chamada (JSON Payload)
              </label>
              <textarea
                rows={10}
                value={toolArgs}
                onChange={(e) => setToolArgs(e.target.value)}
                className="w-full bg-black border border-white/20 p-3 font-mono text-xs text-white focus:outline-none focus:border-[#F27D26] leading-relaxed"
              />
            </div>

            <button
              onClick={handleRunTool}
              className="w-full bg-[#F27D26] hover:bg-[#ff8c35] text-black font-black py-3 text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(242,125,38,0.3)]"
            >
              <Play className="h-4 w-4 fill-black" />
              <span>EXECUTAR CHAMADA MCP JSON-RPC</span>
            </button>
          </div>

          {/* Right: Response Inspector */}
          <div className="bg-[#080808] border border-white/10 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <Code2 className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    RESPOSTA DO SERVIDOR MCP
                  </h3>
                </div>

                {jsonRpcLog && (
                  <button
                    onClick={handleCopyLog}
                    className="flex items-center space-x-1 text-xs bg-[#F27D26] text-black hover:bg-[#ff8c35] px-2.5 py-1 font-bold uppercase cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'COPIADO!' : 'COPIAR LOG'}</span>
                  </button>
                )}
              </div>

              <div className="bg-black border border-white/10 p-4 min-h-[340px] font-mono text-xs text-emerald-400 overflow-x-auto">
                {jsonRpcLog ? (
                  <pre className="whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(jsonRpcLog.res, null, 2)}
                  </pre>
                ) : (
                  <div className="text-white/30 text-center py-24 italic uppercase tracking-widest text-[10px]">
                    // SELECIONE UMA FERRAMENTA E CLIQUE EM "EXECUTAR CHAMADA MCP JSON-RPC"
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 text-[10px] font-mono text-white/40 flex items-center justify-between">
              <span>ESPECIFICAÇÃO MODEL CONTEXT PROTOCOL v2024-11-05</span>
              <span className="text-[#F27D26]">STDIN / STDOUT / HTTP JSON-RPC</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'schema' && (
        <div className="bg-[#080808] border border-white/10 p-6 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-white border-b border-white/10 pb-3">
            FERRAMENTAS EXPOSTAS NO PROTOCOLO MCP (TOOLS SCHEMA)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MCP_TOOLS.map((tool) => (
              <div key={tool.name} className="bg-black border border-white/10 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-mono font-bold text-[#F27D26]">{tool.name}</span>
                  <span className="text-[9px] font-mono bg-white/10 px-2 py-0.5 text-white/70">
                    JSON SCHEMA
                  </span>
                </div>
                <p className="text-xs font-mono text-white/70">{tool.description}</p>
                <div className="bg-white/5 p-3 text-[11px] font-mono text-emerald-400 border border-white/10 overflow-x-auto">
                  <pre>{JSON.stringify(tool.inputSchema, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resources */}
          <div className="bg-[#080808] border border-white/10 p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-white border-b border-white/10 pb-3 flex items-center space-x-2">
              <FileCode2 className="h-4 w-4 text-[#F27D26]" />
              <span>RECURSOS EXPOSTOS (RESOURCES)</span>
            </h3>

            <div className="space-y-3">
              {MCP_RESOURCES.map((res) => (
                <div key={res.uri} className="bg-black border border-white/10 p-3 space-y-1">
                  <div className="text-xs font-mono font-bold text-white">{res.name}</div>
                  <div className="text-[10px] font-mono text-[#F27D26]">{res.uri}</div>
                  <p className="text-[11px] font-mono text-white/60">{res.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Prompts */}
          <div className="bg-[#080808] border border-white/10 p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-white border-b border-white/10 pb-3 flex items-center space-x-2">
              <Layers className="h-4 w-4 text-[#F27D26]" />
              <span>PROMPTS ESTRUTURADOS (PROMPTS)</span>
            </h3>

            <div className="space-y-3">
              {MCP_PROMPTS.map((prompt) => (
                <div key={prompt.name} className="bg-black border border-white/10 p-3 space-y-2">
                  <div className="text-xs font-mono font-bold text-emerald-400">prompt://{prompt.name}</div>
                  <p className="text-[11px] font-mono text-white/60">{prompt.description}</p>
                  <div className="text-[10px] font-mono text-white/40">
                    Argumentos: {prompt.arguments?.map((a) => `${a.name}${a.required ? '*' : ''}`).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
