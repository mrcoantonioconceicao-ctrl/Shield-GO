import React, { useState, useEffect } from 'react';
import { Code2, Copy, Check, Search, FileCode, Layers, ShieldCheck } from 'lucide-react';

interface GoFile {
  id: string;
  name: string;
  path: string;
  category: string;
  content: string;
}

export const GoCodeExplorer: React.FC = () => {
  const [files, setFiles] = useState<GoFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string>('usecase-audit');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/go-sources')
      .then((res) => res.json())
      .then((data) => {
        if (data.files) {
          setFiles(data.files);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch Go source files', err);
        setLoading(false);
      });
  }, []);

  const activeFile = files.find((f) => f.id === selectedFileId) || files[0];

  const handleCopy = () => {
    if (activeFile?.content) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredFiles = files.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* File Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-[#080808] border border-white/10 p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-[#F27D26] text-black">
                <Layers className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                MÓDULOS GO & DDD
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#F27D26]">
              GO 1.22
            </span>
          </div>

          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-white/40" />
            <input
              type="text"
              placeholder="BUSCAR PACOTE GO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-white/20 pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <div className="space-y-1.5">
            {loading ? (
              <div className="p-4 text-center text-xs font-mono text-white/40 animate-pulse uppercase">
                // CARREGANDO CÓDIGO GO...
              </div>
            ) : (
              filteredFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={`w-full text-left px-3 py-2 text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
                    selectedFileId === file.id
                      ? 'bg-[#F27D26] text-black font-bold'
                      : 'text-white/70 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileCode className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 border ${
                    selectedFileId === file.id ? 'border-black text-black' : 'border-white/20 text-white/50'
                  }`}>
                    {file.category}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Architecture Note Card */}
        <div className="bg-[#080808] border border-white/10 p-5 space-y-2">
          <div className="flex items-center space-x-2 text-white font-black text-xs uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-[#F27D26]" />
            <span>CLEAN ARCHITECTURE</span>
          </div>
          <p className="leading-relaxed text-[11px] font-mono text-white/60">
            Estruturação em camadas Domain-Driven Design (DDD). Subprocessos executados via <code className="text-[#F27D26]">execve</code> (sem shell injection) e orquestração BPMN automatizada.
          </p>
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="lg:col-span-3 bg-[#080808] border border-white/10 flex flex-col overflow-hidden shadow-2xl min-h-[580px]">
        {/* Code Header Bar */}
        <div className="bg-black px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Code2 className="h-4 w-4 text-[#F27D26]" />
            <span className="text-xs font-mono text-white font-bold tracking-wider">
              {activeFile?.path || 'go-src/pkg/...'}
            </span>
            {activeFile && (
              <span className="text-[10px] font-mono text-black bg-[#F27D26] px-2 py-0.5 font-bold uppercase">
                {activeFile.category}
              </span>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 bg-white/10 hover:bg-[#F27D26] hover:text-black text-white px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-black" />
                <span>COPIADO!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>COPIAR CÓDIGO</span>
              </>
            )}
          </button>
        </div>

        {/* Code View Body */}
        <div className="p-5 bg-black flex-1 overflow-x-auto font-mono text-xs leading-relaxed text-white/90">
          <pre className="selection:bg-[#F27D26] selection:text-black">
            <code>{activeFile?.content || '// Selecione um arquivo Go no menu lateral'}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

