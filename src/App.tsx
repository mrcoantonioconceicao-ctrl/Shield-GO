import React, { useState } from 'react';
import { Header } from './components/Header';
import { GitAutomationRunner } from './components/GitAutomationRunner';
import { GoCodeExplorer } from './components/GoCodeExplorer';
import { AIPatchStudio } from './components/AIPatchStudio';
import { CodeReviewPanel } from './components/CodeReviewPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('runner');
  const [githubToken, setGithubToken] = useState<string>('');

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased flex flex-col selection:bg-[#F27D26] selection:text-black">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        githubToken={githubToken}
        setGithubToken={setGithubToken}
      />

      {/* High-Impact Bold Typography Hero Bar */}
      <section className="border-b border-white/10 bg-black/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="md:col-span-1 border-r border-white/10 pr-6">
              <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 block mb-1">Architecture Standard</span>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
                RUSTSHIELD<br />
                <span className="text-[#F27D26]">GO_SYSTEM</span>
              </h2>
            </div>

            <div className="md:col-span-3 grid grid-cols-3 gap-6">
              <div className="border-t border-white/20 pt-3">
                <div className="text-4xl sm:text-5xl font-black leading-none mb-1 text-white">142</div>
                <div className="text-[10px] uppercase tracking-widest text-white/50">Ports & Routes Scanned</div>
              </div>

              <div className="border-t border-white/20 pt-3">
                <div className="text-4xl sm:text-5xl font-black leading-none mb-1 text-[#F27D26]">08</div>
                <div className="text-[10px] uppercase tracking-widest text-[#F27D26]">Automatic Patches</div>
              </div>

              <div className="border-t border-white/20 pt-3">
                <div className="text-4xl sm:text-5xl font-black leading-none mb-1 text-white">24</div>
                <div className="text-[10px] uppercase tracking-widest text-white/50">PRs Initiated (REST API)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'runner' && <GitAutomationRunner githubToken={githubToken} />}
        {activeTab === 'code' && <GoCodeExplorer />}
        {activeTab === 'patch' && <AIPatchStudio />}
        {activeTab === 'review' && <CodeReviewPanel />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050505] py-5 text-xs text-white/40 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="uppercase tracking-widest">RustShield-Go Security Suite • BPMN Autonomous Pipeline</span>
          <span className="text-[#F27D26] uppercase">V(G) ≤ 4 • Zero OS Shell Injection</span>
        </div>
      </footer>
    </div>
  );
}

