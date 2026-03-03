import { Plus, Upload, Menu, Zap, Settings, Search } from 'lucide-react';

export default function Design1() {
  return (
    <div className="design1-theme min-h-screen bg-[#050510] text-[#00ff9d] font-mono selection:bg-[#ff003c] selection:text-white pb-20 relative overflow-hidden">
      {/* Cyber grid background */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,255,157,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,157,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 z-50 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] opacity-20 mix-blend-overlay" />

      {/* Dynamic light sources */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#ff003c] rounded-[100%] blur-[150px] opacity-10 mix-blend-screen animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#00ff9d] rounded-[100%] blur-[150px] opacity-10 mix-blend-screen" />

      <div className="relative z-10 flex h-screen max-w-7xl mx-auto border-x border-[#00ff9d]/20 bg-[#050510]/80 backdrop-blur-md shadow-[0_0_50px_rgba(0,255,157,0.05)]">
        
        {/* Sidebar */}
        <aside className="w-72 border-r border-[#00ff9d]/20 p-6 flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-[#00ff9d] flex justify-center items-center relative group overflow-hidden">
              <div className="absolute inset-0 bg-[#00ff9d] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Zap className="w-5 h-5 text-[#00ff9d] group-hover:text-[#050510] relative z-10 transition-colors" />
            </div>
            <h1 className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] uppercase uppercase shadow-[#00ff9d]">SLIME.SYS</h1>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-[#ff003c] text-xs font-bold tracking-[0.2em] uppercase mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#ff003c] inline-block animate-pulse" />
              Collections_
            </h2>
            {['All Rules', 'Default', 'Work', 'Personal'].map((item, i) => (
              <button key={item} className={`group flex items-center justify-between text-left w-full py-2 px-3 border border-transparent hover:border-[#00ff9d]/50 hover:bg-[#00ff9d]/10 transition-all ${i === 0 ? 'border-[#00ff9d] bg-[#00ff9d]/10 text-[#00ff9d] shadow-[0_0_10px_rgba(0,255,157,0.2)_inset]' : 'text-zinc-500 hover:text-[#00ff9d]'}`}>
                <span className="flex items-center gap-2">
                  <span className="text-xs opacity-50 group-hover:opacity-100">{'>>'}</span>
                  {item}
                </span>
                <span className="text-xs border border-current px-1.5 opacity-50">{Math.floor(Math.random() * 20)}</span>
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-[#00ff9d]/20">
            <button className="flex items-center gap-3 text-zinc-500 hover:text-[#00ff9d] transition-colors w-full text-left py-2">
              <Settings className="w-4 h-4" />
              <span className="text-sm tracking-wider uppercase">System Config</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="p-8 pb-4 border-b border-[#00ff9d]/20 flex justify-between items-end backdrop-blur-sm bg-black/20">
            <div>
              <div className="text-xs text-zinc-500 mb-2 font-mono flex items-center gap-2">
                <span>ROOT</span><span className="text-[#00ff9d]">/</span><span>ALL_RULES</span>
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tight text-[#fff] drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Database_Active</h2>
            </div>
            
            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-400 hover:border-[#00b8ff] hover:text-[#00b8ff] hover:shadow-[0_0_15px_rgba(0,184,255,0.3)] transition-all uppercase text-xs tracking-widest bg-black/50 backdrop-blur-sm">
                <Upload className="w-4 h-4" /> Export_Data
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#00ff9d] text-black hover:bg-white hover:shadow-[0_0_20px_rgba(0,255,157,0.6)] font-bold transition-all uppercase text-xs tracking-widest relative overflow-hidden group">
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <Plus className="w-4 h-4 relative z-10" /> Initialize_Rule
              </button>
            </div>
          </header>

          {/* Search/Filter Bar */}
          <div className="px-8 py-4 flex gap-4 border-b border-[#00ff9d]/10 bg-[#050510]/60">
            <div className="flex-1 relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#00ff9d] transition-colors" />
              <input 
                type="text" 
                placeholder="Query database..." 
                className="w-full bg-black/50 border border-zinc-800 text-[#00ff9d] px-10 py-2 focus:outline-none focus:border-[#00ff9d] focus:shadow-[0_0_10px_rgba(0,255,157,0.2)] transition-all placeholder:text-zinc-700 font-mono text-sm"
              />
            </div>
            <button className="px-4 py-2 border border-zinc-800 text-zinc-500 hover:border-[#ff003c] hover:text-[#ff003c] text-xs uppercase tracking-widest transition-colors flex items-center gap-2">
              <Menu className="w-4 h-4" /> Filter_Ops
            </button>
          </div>

          {/* Data Grid */}
          <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="group relative bg-[#0a0a16] border border-zinc-800 hover:border-[#00ff9d] transition-all p-5 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(0,255,157,0.2)]">
                  {/* Decorative corners */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00ff9d] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00ff9d] opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#00ff9d] transition-colors">Form_Injection_Target_{i}</h3>
                      <p className="text-zinc-500 text-xs mt-1">URL: https://target-{Math.random().toString(36).substring(7)}.com/*</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 border border-[#00b8ff]/30 text-[#00b8ff] text-[10px] uppercase tracking-wider bg-[#00b8ff]/10">Active</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-6">
                    <div className="flex justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-1">
                      <span>Fields Mapped</span>
                      <span className="text-white">{Math.floor(Math.random() * 10) + 1}</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-1">
                      <span>Last Executed</span>
                      <span className="text-white">0x{Math.floor(Math.random() * 1000000).toString(16).toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between items-center opacity-50 group-hover:opacity-100 transition-opacity">
                    <button className="text-xs flex items-center gap-1 text-[#ff003c] hover:underline underline-offset-4 decoration-[#ff003c]">
                      Delete_Seq
                    </button>
                    <button className="text-xs flex items-center gap-1 text-[#00ff9d] hover:bg-[#00ff9d] hover:text-black px-3 py-1 border border-[#00ff9d] transition-colors">
                      Edit_Node
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .design1-theme ::-webkit-scrollbar {
          width: 8px;
        }
        .design1-theme ::-webkit-scrollbar-track {
          background: #050510;
          border-left: 1px solid #1a1a2e;
        }
        .design1-theme ::-webkit-scrollbar-thumb {
          background: #333;
          border: 1px solid #1a1a2e;
        }
        .design1-theme ::-webkit-scrollbar-thumb:hover {
          background: #00ff9d;
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
