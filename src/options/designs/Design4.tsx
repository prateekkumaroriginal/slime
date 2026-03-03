import { Search, Orbit, Feather, Droplets } from 'lucide-react';

export default function Design4() {
  return (
    <div className="design4-theme min-h-screen bg-[#0a0a0c] text-[#e0ddcf] font-serif pb-0 overflow-hidden selection:bg-[#c93f3f] selection:text-[#f2ead8] relative">
      
      {/* Background Ambience (Mystic Horizon) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#1a1112] via-[#0a0a0c] to-[#0d161a] pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#c93f3f] rounded-full blur-[200px] opacity-[0.08] mix-blend-color-dodge pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] left-[-20%] w-[70%] h-[70%] bg-[#d97c2e] rounded-full blur-[250px] opacity-[0.06] mix-blend-color-dodge pointer-events-none" />
      
      {/* Marble noise texture */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.015%22 numOctaves=%225%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

      <div className="relative z-10 w-full h-screen flex border-x border-[#ffffff10] max-w-[1600px] mx-auto bg-black/20 backdrop-blur-[2px]">
        
        {/* Abstract Sidebar */}
        <aside className="w-80 border-r border-white/5 flex flex-col pt-12 pb-8 px-8 relative overflow-hidden group">
          {/* Subtle cascade glow on hover */}
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#d97c2e] to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-1000" />
          
          <div className="mb-20">
            <div className="relative inline-flex justify-center items-center w-16 h-16 ml-2">
              <div className="absolute inset-0 border border-white/20 rotate-45 transition-transform duration-700 group-hover:rotate-[225deg]" />
              <div className="absolute inset-2 bg-gradient-to-br from-[#c93f3f] to-[#d97c2e] opacity-80 backdrop-blur-md" />
              <Droplets className="w-6 h-6 text-white relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            </div>
            <h1 className="text-4xl mt-6 tracking-widest font-light ml-2 uppercase opacity-90"><span className="font-bold">SLI</span>ME</h1>
            <p className="text-[#a09c8d] text-xs tracking-[0.3em] uppercase mt-2 ml-2 italic">Horizon Echoes</p>
          </div>

          <div className="flex flex-col gap-6 flex-1">
            {['All Rules_Orbit', 'Default_Velocity', 'Work_Cascade', 'Personal_Meadow'].map((item, i) => {
              const [name, themeWord] = item.split('_');
              return (
                <button key={item} className={`relative flex items-center justify-between group/btn text-left p-4 overflow-hidden border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500 ease-out ${i === 0 ? 'bg-gradient-to-r from-white/10 to-transparent border-l-2 border-l-[#d97c2e] text-white shadow-[0_0_30px_rgba(217,124,46,0.1)]' : 'text-[#a09c8d]'}`}>
                  {/* Hover ripple fill */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#c93f3f]/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-700 ease-in-out pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col">
                    <span className="text-sm font-bold tracking-[0.1em] uppercase">{name}</span>
                    <span className="text-[10px] tracking-[0.2em] opacity-40 italic mt-1 font-sans">{themeWord}</span>
                  </div>
                  <Feather className={`w-4 h-4 relative z-10 transition-transform duration-500 group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1 ${i === 0 ? 'text-[#d97c2e]' : 'opacity-20'}`} />
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-8 flex items-center gap-4 text-[#a09c8d] cursor-pointer hover:text-[#d97c2e] transition-colors ml-2">
            <Orbit className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
            <span className="text-xs tracking-[0.2em] uppercase">Configure Shadow</span>
          </div>
        </aside>

        {/* Ethereal Main Content */}
        <main className="flex-1 flex flex-col relative">
          
          <header className="px-12 pt-16 pb-8 flex justify-between items-end border-b border-white/5">
            <div className="relative">
              <h2 className="text-[3.5rem] font-medium leading-none tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-[#f2ead8] to-[#a09c8d]">Celestial Rules</h2>
              <div className="w-24 h-px bg-gradient-to-r from-[#c93f3f] to-transparent mt-6 mb-2" />
              <p className="font-sans text-sm text-[#807d72] tracking-wider uppercase font-medium">Gathering scattered fragments of velocity</p>
            </div>
            
            <div className="flex gap-6 items-center">
              <button className="text-xs uppercase tracking-[0.2em] font-sans text-[#a09c8d] hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-px after:bg-white hover:after:w-full after:transition-all after:duration-500">
                Harvest Data
              </button>
              <button className="group relative px-8 py-4 bg-transparent border border-[#d97c2e]/50 overflow-hidden rounded-sm transition-all hover:border-[#d97c2e] hover:shadow-[0_0_20px_rgba(217,124,46,0.2)]">
                <div className="absolute inset-0 bg-[#d97c2e]/10 -translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
                <span className="relative z-10 text-xs font-sans uppercase tracking-[0.2em] text-[#d97c2e] font-bold group-hover:text-white transition-colors delay-100 flex gap-2 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d97c2e] group-hover:bg-white group-hover:shadow-[0_0_10px_white]" />
                  Forge Entity
                </span>
              </button>
            </div>
          </header>

          <div className="px-12 py-8 flex items-center justify-between border-b border-white/5 relative bg-white/[0.01]">
            <input 
              type="text" 
              placeholder="Whisper a query..." 
              className="w-1/2 bg-transparent border-none text-xl placeholder:text-[#a09c8d]/30 text-white focus:outline-none font-light tracking-wide italic"
            />
            <Search className="w-5 h-5 text-[#a09c8d]/50" />
            {/* Ambient scanning line */}
            <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#c93f3f]/40 to-transparent -translate-x-full animate-[shimmer_3s_linear_infinite]" />
          </div>

          <div className="flex-1 overflow-y-auto px-12 py-12 custom-scrollbar-d4">
            
            {/* Masonry-like Puzzle Grid */}
            <div className="flex flex-col gap-12">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`relative group w-full ${i % 2 === 0 ? 'ml-auto md:w-3/4 lg:w-2/3' : 'mr-auto md:w-3/4 lg:w-2/3'} backdrop-blur-md bg-white/[0.02] border border-white/[0.05] p-10 transition-all duration-700 hover:bg-white/[0.04] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}>
                  {/* Decorative Amber lantern glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#d97c2e] blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-1000 pointer-events-none" />
                  
                  {/* Crimson compass line */}
                  <div className="absolute top-1/2 -left-6 w-12 h-px bg-[#c93f3f] opacity-30 transform -translate-y-1/2 group-hover:w-24 transition-all duration-1000 ease-out" />

                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="px-2 py-0.5 border border-white/10 text-[9px] font-sans uppercase tracking-[0.3em] text-[#a09c8d]">Ivory Velvet</span>
                        <div className="h-px bg-white/10 flex-1" />
                      </div>
                      <h3 className="text-3xl font-light tracking-wide text-white mb-2 group-hover:text-[#f2ead8] transition-colors">Echo Alignment {i}</h3>
                      <p className="font-sans text-xs text-[#a09c8d] tracking-widest opacity-60">nexus.fractal.domain/path/*</p>
                    </div>

                    <div className="flex flex-col items-end gap-6 shrink-0 md:w-48">
                      <div className="flex justify-end gap-8 w-full">
                        <div className="text-right">
                          <div className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#a09c8d]/50 mb-1">Nodes</div>
                          <div className="text-2xl text-white font-light">14</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#a09c8d]/50 mb-1">Pulse</div>
                          <div className="text-sm font-sans text-white uppercase tracking-wider mt-2.5">Active</div>
                        </div>
                      </div>
                      
                      {/* Ripple action button */}
                      <button className="w-full py-3 bg-transparent border border-white/10 text-xs font-sans uppercase tracking-[0.2em] hover:bg-white hover:text-black hover:shadow-[0_0_15px_white] transition-all duration-500 mt-2 relative overflow-hidden text-[#d97c2e]">
                        A C T I V A T E
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .design4-theme ::-webkit-scrollbar {
          width: 4px;
        }
        .design4-theme ::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
        }
        .design4-theme ::-webkit-scrollbar-thumb {
          background: rgba(217,124,46,0.3);
        }
        .design4-theme ::-webkit-scrollbar-thumb:hover {
          background: rgba(217,124,46,0.8);
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
