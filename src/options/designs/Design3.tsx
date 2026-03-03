import { Plus, Upload, Zap, FileText, Settings, Search, CheckCircle2 } from 'lucide-react';

export default function Design3() {
  return (
    <div className="design3-theme min-h-screen bg-[#f0f4f8] text-[#5c6e8c] font-sans p-8 selection:bg-[#ff94c9] selection:text-white">
      <div className="max-w-[1400px] mx-auto flex gap-10 h-[calc(100vh-64px)]">
        
        {/* Sidebar - Claymorphism */}
        <aside className="w-80 flex flex-col rounded-[2.5rem] bg-[#f0f4f8] p-8 shadow-[15px_15px_30px_#ccced1,-15px_-15px_30px_#ffffff,inset_3px_3px_5px_rgba(255,255,255,0.7),inset_-3px_-3px_5px_rgba(0,0,0,0.05)] border-4 border-white/50 relative overflow-hidden">
          {/* Decorative floating blobs */}
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-[#ffb4d6] to-[#ff94c9] opacity-20 blur-2xl pointer-events-none" />
          <div className="absolute bottom-10 -left-10 w-40 h-40 rounded-full bg-gradient-to-br from-[#a3e4d7] to-[#76d7c4] opacity-20 blur-2xl pointer-events-none" />

          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-[#ff94c9] flex justify-center items-center shadow-[inset_4px_4px_8px_rgba(255,255,255,0.5),inset_-4px_-4px_8px_rgba(255,100,165,0.5),6px_6px_15px_rgba(255,148,201,0.4)] transform rotate-3 hover:rotate-6 transition-transform hover:scale-105">
              <Zap className="w-7 h-7 text-white fill-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#ff94c9] drop-shadow-[2px_2px_0_rgba(255,255,255,1)]">Slime</h1>
          </div>

          <div className="px-4 py-2 text-sm font-bold text-[#9fb1c5] uppercase tracking-wider mb-2">My Library</div>
          
          <div className="flex-1 flex flex-col gap-4 relative z-10 custom-scrollbar-d3 overflow-y-auto pr-2">
            {['All Rules', 'Default', 'Work', 'Personal'].map((item, i) => (
              <button key={item} className={`group flex items-center justify-between w-full py-4 px-6 rounded-2xl transition-all duration-300 ${
                i === 0 
                  ? 'bg-gradient-to-br from-[#85c1e9] to-[#5dade2] text-white shadow-[inset_3px_3px_8px_rgba(255,255,255,0.4),inset_-3px_-3px_8px_rgba(0,0,0,0.1),8px_8px_16px_rgba(93,173,226,0.3)] transform scale-[1.02]' 
                  : 'bg-[#f0f4f8] text-[#7a8fa6] hover:text-[#5dade2] shadow-[8px_8px_16px_#d9dbe0,-8px_-8px_16px_#ffffff] hover:shadow-[inset_4px_4px_8px_#d9dbe0,inset_-4px_-4px_8px_#ffffff]'
              }`}>
                <span className="flex items-center gap-3 font-semibold text-lg">
                  <FileText className={`w-5 h-5 ${i === 0 ? 'text-white' : 'text-[#aebecd] group-hover:text-[#5dade2]'}`} />
                  {item}
                </span>
                <span className={`text-sm font-bold px-3 py-1 rounded-xl ${
                  i === 0 
                    ? 'bg-white/20 text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]' 
                    : 'bg-[#e4ebf2] text-[#9fb1c5] shadow-[inset_2px_2px_5px_#d9dbe0,inset_-2px_-2px_5px_#ffffff]'
                }`}>
                  {Math.floor(Math.random() * 20)}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 relative z-10">
            <button className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl text-[#8ba3bd] font-bold text-lg bg-[#f0f4f8] shadow-[8px_8px_16px_#d9dbe0,-8px_-8px_16px_#ffffff] hover:shadow-[inset_6px_6px_12px_#d9dbe0,inset_-6px_-6px_12px_#ffffff] hover:text-[#ff94c9] transition-all active:scale-95">
              <Settings className="w-6 h-6" />
              <span>Settings</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col rounded-[3rem] bg-[#f0f4f8] shadow-[inset_15px_15px_30px_#ccced1,inset_-15px_-15px_30px_#ffffff] p-2 overflow-hidden border-8 border-white/40">
          
          <div className="h-full flex flex-col bg-white/20 rounded-[2.5rem] p-8 overflow-hidden backdrop-blur-sm">
            {/* Header */}
            <header className="flex justify-between items-end mb-10 pb-6 border-b-4 border-white/40 border-dotted">
              <div>
                <h2 className="text-4xl font-black text-[#5dade2] drop-shadow-[2px_3px_0_rgba(255,255,255,1)] tracking-tight">Active Ruleset</h2>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mt-3 rounded-xl bg-white/60 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05)] text-[#8da1b9] font-semibold text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f4d03f] shadow-[0_0_8px_#f4d03f]" />
                  12 items loaded
                </div>
              </div>
              
              <div className="flex gap-4">
                <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#f0f4f8] shadow-[8px_8px_16px_#ccced1,-8px_-8px_16px_#ffffff] hover:shadow-[inset_4px_4px_8px_#ccced1,inset_-4px_-4px_8px_#ffffff] text-[#7a8fa6] hover:text-[#5dade2] font-bold transition-all active:scale-95">
                  <Upload className="w-5 h-5" /> Export
                </button>
                <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-br from-[#77dd77] to-[#5cdb5c] text-white shadow-[inset_4px_4px_8px_rgba(255,255,255,0.5),inset_-4px_-4px_8px_rgba(0,0,0,0.1),10px_10px_20px_rgba(119,221,119,0.3)] hover:scale-105 active:scale-95 transition-all font-bold text-lg border-2 border-[#aef2ae]">
                  <Plus className="w-6 h-6 shadow-[0_2px_4px_rgba(0,0,0,0.2)]" /> New Rule
                </button>
              </div>
            </header>

            {/* Search */}
            <div className="mb-10 relative group">
              <div className="absolute inset-0 bg-[#f0f4f8] rounded-3xl shadow-[inset_6px_6px_12px_#ccced1,inset_-6px_-6px_12px_#ffffff] pointer-events-none" />
              <Search className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-[#aebecd] group-focus-within:text-[#ff94c9] transition-colors z-10" />
              <input 
                type="text" 
                placeholder="Find a rule..." 
                className="w-full bg-transparent border-none text-[#5c6e8c] px-16 py-6 font-bold text-lg focus:outline-none placeholder:text-[#aebecd] relative z-10"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-white shadow-[2px_2px_5px_rgba(0,0,0,0.05)] text-[#aebecd] font-bold text-xs z-10">⌘K</div>
            </div>

            {/* Cards Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar-d3 pr-4">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-10">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="group flex flex-col justify-between h-56 rounded-3xl p-6 bg-[#f0f4f8] shadow-[12px_12px_24px_#ccced1,-12px_-12px_24px_#ffffff] hover:scale-[1.02] hover:-translate-y-2 transition-all duration-300 border-4 border-white">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#a3e4d7] to-[#76d7c4] flex justify-center items-center shadow-[inset_3px_3px_6px_rgba(255,255,255,0.6),inset_-3px_-3px_6px_rgba(0,0,0,0.1),5px_5px_10px_rgba(118,215,196,0.3)]">
                          <CheckCircle2 className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-[#5c6e8c] tracking-tight">Checkout Auto-fill {i}</h3>
                          <p className="text-[#9fb1c5] text-sm font-semibold mt-1 px-3 py-1 rounded-lg bg-white/50 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.05)] inline-block">stripe.com/pay/*</p>
                        </div>
                      </div>
                      
                      {/* Clay Toggle */}
                      <div className="w-16 h-8 rounded-full bg-[#77dd77] p-1 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1),inset_-3px_-3px_6px_rgba(255,255,255,0.5),3px_3px_6px_rgba(119,221,119,0.3)] cursor-pointer relative overflow-hidden flex items-center justify-end">
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
                        <div className="w-6 h-6 rounded-full bg-white shadow-[2px_2px_4px_rgba(0,0,0,0.2),inset_-1px_-1px_2px_rgba(0,0,0,0.1)] relative z-10" />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end mt-4 pt-4 border-t-4 border-white/50 border-dotted">
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-[#f0f4f8] shadow-[inset_3px_3px_6px_#ccced1,inset_-3px_-3px_6px_#ffffff] flex justify-center items-center text-[#ff94c9] font-black text-lg">
                            8
                          </div>
                          <span className="text-[#8da1b9] font-bold text-sm">Fields</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-60">
                          <div className="w-10 h-10 rounded-xl bg-[#f0f4f8] shadow-[inset_3px_3px_6px_#ccced1,inset_-3px_-3px_6px_#ffffff] flex justify-center items-center text-[#5dade2] font-black text-xs px-2 text-center leading-tight">
                            2h
                          </div>
                          <span className="text-[#8da1b9] font-bold text-sm">Ago</span>
                        </div>
                      </div>
                      <button className="px-5 py-2.5 rounded-xl bg-[#f0f4f8] shadow-[5px_5px_10px_#ccced1,-5px_-5px_10px_#ffffff] hover:shadow-[inset_3px_3px_6px_#ccced1,inset_-3px_-3px_6px_#ffffff] text-[#ff94c9] font-bold transition-all active:scale-95">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .design3-theme ::-webkit-scrollbar {
          width: 20px;
        }
        .design3-theme ::-webkit-scrollbar-track {
          background: #f0f4f8;
          border-radius: 20px;
          box-shadow: inset 4px 4px 8px #ccced1, inset -4px -4px 8px #ffffff;
          border: 4px solid #f0f4f8;
        }
        .design3-theme ::-webkit-scrollbar-thumb {
          background: #5dade2;
          border-radius: 20px;
          border: 4px solid #f0f4f8;
          box-shadow: inset 2px 2px 4px rgba(255,255,255,0.4), inset -2px -2px 4px rgba(0,0,0,0.1);
        }
        .design3-theme ::-webkit-scrollbar-thumb:hover {
          background: #3498db;
        }
      `}</style>
    </div>
  );
}
