import { Plus, Upload, Zap, FileText, Settings, Search, MoreVertical } from 'lucide-react';

export default function Design2() {
  return (
    <div className="design2-theme min-h-screen bg-[#e8e6e1] text-[#2c2a26] font-sans pb-20 selection:bg-[#5a8055] selection:text-white">
      {/* Subtle paper noise texture */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")', mixBlendMode: 'multiply' }}></div>

      <div className="relative z-10 max-w-[1400px] mx-auto p-4 md:p-8 flex gap-8 h-screen">
        
        {/* Leather-bound Sidebar (Skeuomorphic) */}
        <aside className="w-72 flex flex-col rounded-xl overflow-hidden shadow-[4px_4px_15px_rgba(0,0,0,0.1),-2px_-2px_10px_rgba(255,255,255,0.7)] bg-[#f3f1ec] border border-[#d6d3c9] relative">
          {/* Stitched border effect */}
          <div className="absolute inset-2 border-[1.5px] border-dashed border-[#b8b4a6] rounded-lg pointer-events-none opacity-60"></div>
          
          <div className="p-6 relative z-10 bg-gradient-to-b from-[#faf9f6] to-[#f3f1ec] border-b border-[#e1ded5] shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full shadow-[inset_1px_2px_4px_rgba(0,0,0,0.1),0_2px_4px_rgba(255,255,255,0.8)] bg-gradient-to-br from-[#f8f7f4] to-[#e4e1d8] flex justify-center items-center border border-[#d2cec3]">
                <Zap className="w-5 h-5 text-[#5a8055]" style={{ filter: 'drop-shadow(0px 1px 1px rgba(255,255,255,0.8))' }} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#3a3832]" style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.8)' }}>Slime</h1>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 relative z-10 custom-scrollbar-d2">
            <div className="px-3 py-2 text-xs font-bold text-[#8a867c] uppercase tracking-widest shadow-[0_1px_0_rgba(255,255,255,0.8)]">Library</div>
            
            {['All Rules', 'Default', 'Work', 'Personal'].map((item, i) => (
              <button key={item} className={`group flex items-center justify-between w-full py-2.5 px-4 rounded-md transition-all ${
                i === 0 
                  ? 'bg-gradient-to-b from-[#e3e0ce] to-[#d6d3be] shadow-[inset_0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)] border border-[#c4c0ac] text-[#3a3832] font-medium' 
                  : 'text-[#6a665d] hover:bg-[#eae8df] border border-transparent hover:border-[#dfddce] hover:shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.5)]'
              }`}>
                <span className="flex items-center gap-3">
                  <FileText className={`w-4 h-4 ${i === 0 ? 'text-[#5a8055]' : 'text-[#a4a095]'}`} style={{ filter: 'drop-shadow(0px 1px 0px rgba(255,255,255,0.5))' }} />
                  <span style={{ textShadow: '0px 1px 0px rgba(255,255,255,0.4)' }}>{item}</span>
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  i === 0 
                    ? 'bg-[#c6c2ae] text-[#4a4842] shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]' 
                    : 'bg-[#e4e1d8] text-[#8a867c] shadow-[inset_0_1px_1px_rgba(0,0,0,0.05)]'
                }`}>
                  {Math.floor(Math.random() * 20)}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 bg-gradient-to-t from-[#e4e1d8] to-[#f3f1ec] border-t border-[#d8d5c9] relative z-10">
            <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md text-[#5a6b55] font-medium active:scale-95 transition-transform bg-gradient-to-b from-[#f9f8f4] to-[#ebe8df] shadow-[0_2px_4px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)] border border-[#c8c5b9] hover:from-[#ffffff] hover:to-[#f0ede6]">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-[#fcfbf9] rounded-xl shadow-[4px_4px_20px_rgba(0,0,0,0.06),inset_0_0_0_1px_rgba(255,255,255,1)] border border-[#e4e1d8] overflow-hidden">
          
          {/* Header */}
          <header className="px-8 py-6 bg-gradient-to-b from-[#ffffff] to-[#fcfbf9] border-b border-[#ecead9] flex justify-between items-end shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] z-10 relative">
            <div>
              <h2 className="text-3xl font-serif text-[#2a2824]" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>All Rules</h2>
              <p className="text-[#8a867c] mt-1 text-sm font-medium">Manage and organize your filling presets</p>
            </div>
            
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-[#f5f3ec] to-[#e8e5da] border border-[#d2cec3] rounded-md shadow-[0_2px_3px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] text-[#5a574d] hover:brightness-105 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-[1px] transition-all font-medium text-sm">
                <Upload className="w-4 h-4" /> Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-[#6b9565] to-[#4e704a] border border-[#3c5739] rounded-md shadow-[0_3px_6px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] text-white hover:brightness-110 active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.2)] active:translate-y-[1px] transition-all font-medium text-sm" style={{ textShadow: '0 -1px 1px rgba(0,0,0,0.3)' }}>
                <Plus className="w-4 h-4" /> New Rule
              </button>
            </div>
          </header>

          {/* Search/Filter Bar */}
          <div className="px-8 py-4 bg-[#f2f0e9] border-b border-[#e4e1d8] flex gap-4 shadow-[inset_0_2px_5px_rgba(0,0,0,0.02)] z-0">
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-white rounded-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] pointer-events-none"></div>
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#a4a095] z-10" />
              <input 
                type="text" 
                placeholder="Search rules..." 
                className="w-full bg-transparent border border-[#d8d5c9] rounded-md text-[#3a3832] px-10 py-2.5 focus:outline-none focus:border-[#7a9d75] focus:ring-2 focus:ring-[#7a9d75]/20 transition-all placeholder:text-[#b4b0a5] relative z-10"
              />
            </div>
          </div>

          {/* Cards Grid (index card style) */}
          <div className="flex-1 p-8 overflow-y-auto bg-[#e8e6e1] custom-scrollbar-d2 shadow-[inset_0_4px_10px_rgba(0,0,0,0.02)]">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="relative group bg-[#faf9f6] rounded-lg p-6 transition-transform hover:-translate-y-0.5 border border-[#dfddce] shadow-[0_4px_6px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)]">
                  {/* Embossed header line */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#d85c4c] to-[#e47668] rounded-t-lg opacity-80 shadow-[0_1px_1px_rgba(0,0,0,0.1)]"></div>
                  
                  {/* Index card lines */}
                  <div className="absolute inset-0 top-16 bottom-4 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(210,206,195,0.4) 1px, transparent 1px)', backgroundSize: '100% 28px' }}></div>

                  <div className="flex justify-between items-start mb-6 relative z-10 mt-2">
                    <div>
                      <h3 className="text-xl font-serif text-[#2a2824] font-medium" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.8)' }}>Corporate Account Setup</h3>
                      <p className="text-[#7a766c] text-sm mt-1 bg-white/50 inline-block px-1 rounded truncate max-w-[200px] border border-transparent group-hover:border-[#e4e1d8]">https://app.acme.corp/*</p>
                    </div>
                    {/* Physical toggle switch mockup */}
                    <div className="w-10 h-5 bg-[#c8c5b9] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] p-0.5 relative cursor-pointer group-hover:bg-[#a6c4a1] transition-colors">
                      <div className="w-4 h-4 bg-gradient-to-b from-[#ffffff] to-[#e4e1d8] rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,1)] absolute right-0.5 top-0.5 transition-all"></div>
                    </div>
                  </div>
                  
                  <div className="relative z-10 pt-2 pb-1 flex justify-between items-end mt-8">
                    <div className="flex gap-4">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-bold text-[#a4a095] uppercase tracking-wider">Fields</span>
                         <span className="text-[#3a3832] font-semibold text-lg" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.8)' }}>12</span>
                      </div>
                      <div className="w-px bg-gradient-to-b from-transparent via-[#d2cec3] to-transparent"></div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-bold text-[#a4a095] uppercase tracking-wider">Executed</span>
                         <span className="text-[#3a3832] font-semibold text-sm mt-1" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.8)' }}>Oct 12, 10:45 AM</span>
                      </div>
                    </div>
                    
                    <button className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-b from-[#f5f3ec] to-[#e8e5da] border border-[#d2cec3] shadow-[0_2px_3px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] text-[#6a665d] hover:text-[#2a2824] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-[1px] transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .design2-theme ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .design2-theme ::-webkit-scrollbar-track {
          background: #e4e1d8;
          border-radius: 10px;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #d2cec3;
        }
        .design2-theme ::-webkit-scrollbar-thumb {
          background: linear-gradient(to right, #cfcbc0, #c4c0b4);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.4);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.6);
        }
        .design2-theme ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to right, #b4b0a5, #a8a499);
        }
      `}</style>
    </div>
  );
}
