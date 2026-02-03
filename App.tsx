
import React, { useState, useEffect, useMemo } from 'react';
import WorldMap from './components/WorldMap';
import CountryPanel from './components/CountryPanel';
import ChatInterface from './components/ChatInterface';
import HardhatTerminal from './components/HardhatTerminal';
import Manifesto from './components/Manifesto';
import SpatialScanner from './components/SpatialScanner';
import { TrackingState } from './types';

const App: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<{ id: string; name: string } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [trackingState, setTrackingState] = useState<TrackingState>(TrackingState.NOT_INITIALIZED);
  const [geoData, setGeoData] = useState<{ lat: number; lng: number } | null>(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isManifestoOpen, setIsManifestoOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);

  useEffect(() => {
    // Production Sync Sequence
    const syncStages = [
      { msg: "NODE_INIT: SOVEREIGN_MAP_v1.0_PROD", delay: 0 },
      { msg: "HARDWARE_CHECK: NPU_ACCELERATION_ACTIVE", delay: 400 },
      { msg: "NETWORK: AGGLAYER_MAINNET_CONNECTED", delay: 1000 },
      { msg: "PROTOCOLS: ZK_SGP_ARMED_AND_READY", delay: 1500 }
    ];
    
    syncStages.forEach((stage, i) => {
      setTimeout(() => {
        setLogs(prev => [...prev.slice(-5), stage.msg]);
        setBootProgress(((i + 1) / syncStages.length) * 100);
        if (i === syncStages.length - 1) {
          setTrackingState(TrackingState.OK);
        }
      }, stage.delay);
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoData({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLogs(prev => [...prev.slice(-5), `GEOSPATIAL: NODE_LOCKED @ ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`]);
        },
        () => setLogs(prev => [...prev.slice(-5), "GEOSPATIAL: USING_GENERIC_GENESIS_SEED"])
      );
    }
  }, []);

  const trackingInfo = useMemo(() => {
    switch (trackingState) {
      case TrackingState.OK:
        return { label: 'LIVE_NODE_SYNC', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]', dot: 'bg-emerald-500' };
      case TrackingState.LOST:
        return { label: 'NODE_DISCONNECTED', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30', glow: '', dot: 'bg-rose-500' };
      default:
        return { label: 'SYNCHRONIZING...', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', glow: '', dot: 'bg-blue-400' };
    }
  }, [trackingState]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#010409] text-slate-50 relative overflow-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none z-50 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] opacity-30"></div>

      {/* Production Header */}
      <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-slate-950/98 backdrop-blur-2xl z-30 shrink-0 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-600/60 to-transparent"></div>
        
        <div className="flex items-center gap-6">
          <div className="relative group cursor-pointer" onClick={() => setIsManifestoOpen(true)}>
            <div className="absolute inset-0 bg-blue-600 blur-xl opacity-20 group-hover:opacity-60 transition-all duration-500"></div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-700 to-indigo-950 rounded-xl flex items-center justify-center font-black text-2xl border border-blue-500/50 shadow-2xl text-white transform group-hover:rotate-12 transition-transform">Σ</div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-black tracking-tighter text-2xl uppercase leading-none text-white">Sovereign <span className="text-blue-600">Map</span></h1>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded text-[9px] mono text-emerald-400 font-black tracking-widest">LIVE_MAINNET</span>
            </div>
            <div className="flex gap-4 text-[10px] text-slate-500 mono uppercase tracking-[0.3em] font-bold mt-1.5">
              <span className="text-blue-500">PROD_v1.0.4</span>
              <span className="opacity-30">|</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> AGGLAYER_ACTIVE</span>
            </div>
          </div>
        </div>
        
        <nav className="hidden lg:flex items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mono">
          <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl border ${trackingInfo.bg} ${trackingInfo.border} ${trackingInfo.glow} transition-all duration-700 group hover:border-emerald-500/50`}>
            <div className="relative flex items-center justify-center">
               <span className={`w-3 h-3 rounded-full ${trackingInfo.dot} ${trackingState === TrackingState.OK ? 'animate-pulse' : ''}`}></span>
               {trackingState === TrackingState.OK && (
                 <span className="absolute w-6 h-6 rounded-full border border-emerald-500/40 animate-ping"></span>
               )}
            </div>
            <div className="flex flex-col">
              <span className={`${trackingInfo.color} font-black tracking-[0.25em] leading-none mb-1`}>{trackingInfo.label}</span>
              <span className="text-[8px] text-slate-600 uppercase tracking-widest font-black">Spatial_Engine_Primary</span>
            </div>
          </div>

          <div className="h-10 w-px bg-white/10"></div>
          
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="group relative px-8 py-3.5 bg-blue-700 hover:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center gap-4 border border-blue-400/30 overflow-hidden active:scale-95"
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_12px_white]"></div>
            Anchor_Spatial_Voxel
          </button>
        </nav>
      </header>

      {/* Production Workspace */}
      <main className="flex-1 relative flex overflow-hidden">
        <div className="flex-1 relative">
          <WorldMap 
            onCountrySelect={setSelectedCountry} 
            selectedId={selectedCountry?.id}
          />
          
          {/* Real-time Telemetry Overlays */}
          <div className="absolute top-10 left-10 pointer-events-none flex flex-col gap-8 w-80">
            <div className="bg-slate-950/90 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto group hover:border-blue-500/30 transition-colors">
              <h4 className="text-[11px] text-blue-500 mono font-black uppercase mb-5 tracking-[0.4em] flex justify-between items-center border-b border-white/5 pb-3">
                <span>Network_Stream</span>
                <span className="text-[9px] text-slate-700">STABLE</span>
              </h4>
              <div className="space-y-4">
                {logs.map((log, i) => (
                  <div key={i} className={`text-[10px] mono flex gap-3 transition-all duration-300 ${i === logs.length - 1 ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
                    <span className="shrink-0 opacity-20">[{i.toString().padStart(2, '0')}]</span>
                    <span className="truncate">{log}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-1000 ease-out shadow-[0_0_10px_#2563eb]" style={{ width: `${bootProgress}%` }}></div>
              </div>
            </div>

            {geoData && (
              <div className="bg-slate-950/90 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
                <h4 className="text-[11px] text-slate-500 mono uppercase mb-4 tracking-[0.4em] font-black border-b border-white/5 pb-3">Node_Identity</h4>
                <div className="grid grid-cols-1 gap-4 mono text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">LAT:</span>
                    <span className="text-emerald-400 font-black tracking-widest">{geoData.lat.toFixed(6)}°</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">LNG:</span>
                    <span className="text-emerald-400 font-black tracking-widest">{geoData.lng.toFixed(6)}°</span>
                  </div>
                  <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                    <span className="text-slate-600 text-[9px]">RES_PRECISION:</span>
                    <span className="text-blue-500 text-[10px] font-black tracking-tighter">0.000001° [REF]</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <CountryPanel 
          country={selectedCountry} 
          onClose={() => setSelectedCountry(null)} 
        />
        
        <ChatInterface />
      </main>

      {/* Production Overlays */}
      <HardhatTerminal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
      <Manifesto isOpen={isManifestoOpen} onClose={() => setIsManifestoOpen(false)} />
      <SpatialScanner 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={(claim) => setLogs(prev => [...prev.slice(-5), `NETWORK_COMMIT: SUCCESS [0x${claim.id.toString(16).toUpperCase()}]`])}
      />

      {/* Live Health Footer */}
      <footer className="h-12 bg-slate-950/95 border-t border-white/10 flex items-center justify-between px-10 text-[10px] text-slate-600 mono uppercase tracking-[0.3em] shrink-0 z-30 backdrop-blur-xl">
        <div className="flex gap-10 items-center">
          <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-sm transition-all duration-500 ${trackingState === TrackingState.OK ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-slate-800'}`}></span>
            <span className="font-black text-slate-400">UPTIME: 100.00%</span>
          </div>
          <div className="w-px h-4 bg-white/10"></div>
          <div className="flex items-center gap-3 text-slate-500">
             <span className="text-emerald-500 font-black animate-pulse">●</span>
             <span>MAINNET_NODE: PRIMARY_AGGLAYER_RELAY</span>
          </div>
        </div>
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4">
             <span className="text-slate-600 font-bold">QSB_BANDWIDTH:</span>
             <span className="text-blue-500 font-black tracking-widest">1.84 MB/s</span>
          </div>
          <div className="flex gap-2 h-4 items-center">
            {[1,2,3,4,5,6,7,8,9,10].map(i => (
              <div key={i} className={`w-1 h-full rounded-full transition-all duration-300 ${i <= 7 ? 'bg-blue-600 animate-pulse' : 'bg-slate-900'}`} style={{ animationDelay: `${i*0.1}s` }}></div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
