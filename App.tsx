
import React, { useState, useEffect, useMemo, useRef } from 'react';
import WorldMap from './components/WorldMap';
import CountryPanel from './components/CountryPanel';
import ChatInterface from './components/ChatInterface';
import HardhatTerminal from './components/HardhatTerminal';
import Manifesto from './components/Manifesto';
import SpatialScanner from './components/SpatialScanner';
import { TrackingState } from './types';

type ProtocolPhase = 'IDLE' | 'ATTESTING' | 'ROUTING' | 'BROADCASTING' | 'VERIFIED';

const protocolStages: Array<{ key: ProtocolPhase; label: string; detail: string }> = [
  { key: 'ATTESTING', label: 'Attest', detail: 'Capture a local claim and narrate it safely.' },
  { key: 'ROUTING', label: 'Route', detail: 'Move the demo into a live mission lane.' },
  { key: 'BROADCASTING', label: 'Broadcast', detail: 'Show the protocol handoff and proof trail.' },
  { key: 'VERIFIED', label: 'Verified', detail: 'Close the loop with a visible final state.' },
];

const protocolTracks = [
  { label: 'Health lane', country: 'Kenya', log: 'PROTOCOL_ROUTE: HEALTH -> Kenya' },
  { label: 'Rights lane', country: 'Brazil', log: 'PROTOCOL_ROUTE: HUMAN_RIGHTS -> Brazil' },
  { label: 'Climate lane', country: 'South Africa', log: 'PROTOCOL_ROUTE: CLIMATE -> South Africa' },
];

type EvidenceEntry = {
  title: string;
  detail: string;
};

const demoDurationMs = 6.5 * 60 * 1000;

const App: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<{ id: string; name: string } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [trackingState, setTrackingState] = useState<TrackingState>(TrackingState.NOT_INITIALIZED);
  const [geoData, setGeoData] = useState<{ lat: number; lng: number } | null>(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isManifestoOpen, setIsManifestoOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const [protocolPhase, setProtocolPhase] = useState<ProtocolPhase>('IDLE');
  const [demoElapsedMs, setDemoElapsedMs] = useState(0);
  const [demoRunning, setDemoRunning] = useState(false);
  const [evidenceTrail, setEvidenceTrail] = useState<EvidenceEntry[]>([]);
  const protocolTimersRef = useRef<number[]>([]);
  const demoTickRef = useRef<number | null>(null);
  const demoStartRef = useRef<number | null>(null);
  const impactPillars = [
    {
      label: 'Global Health',
      value: 'Privacy-preserving disease surveillance',
      accent: 'text-emerald-400',
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-500/5'
    },
    {
      label: 'Human Rights',
      value: 'Secure reporting from hostile environments',
      accent: 'text-rose-400',
      border: 'border-rose-500/20',
      bg: 'bg-rose-500/5'
    },
    {
      label: 'Climate Resilience',
      value: 'Community sensor data stays local',
      accent: 'text-blue-400',
      border: 'border-blue-500/20',
      bg: 'bg-blue-500/5'
    }
  ];

  useEffect(() => {
    return () => {
      protocolTimersRef.current.forEach(timer => window.clearTimeout(timer));
      protocolTimersRef.current = [];
      if (demoTickRef.current) {
        window.clearInterval(demoTickRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const syncStages = [
      { msg: 'DEMO_INIT: SOUVERIGN_MAP_FOR_GOOD', delay: 0 },
      { msg: 'USE_CASE: HEALTH_PRIVACY_PILOT_ARMED', delay: 400 },
      { msg: 'USE_CASE: HUMAN_RIGHTS_SIGNAL_ROUTED', delay: 1000 },
      { msg: 'USE_CASE: CLIMATE_SENSOR_PIPELINE_READY', delay: 1500 }
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
          setLogs(prev => [...prev.slice(-5), `GEOSPATIAL: LOCAL_CONTEXT @ ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`]);
        },
        () => setLogs(prev => [...prev.slice(-5), 'GEOSPATIAL: USING_GENERIC_IMPACT_PROFILE'])
      );
    }
  }, []);

  const clearProtocolTimers = () => {
    protocolTimersRef.current.forEach(timer => window.clearTimeout(timer));
    protocolTimersRef.current = [];
    if (demoTickRef.current) {
      window.clearInterval(demoTickRef.current);
      demoTickRef.current = null;
    }
  };

  const addProtocolLog = (message: string) => {
    setLogs(prev => [...prev.slice(-5), message]);
  };

  const addEvidence = (title: string, detail: string) => {
    setEvidenceTrail(prev => [{ title, detail }, ...prev].slice(0, 6));
  };

  const activateTrack = (trackIndex: number) => {
    const track = protocolTracks[trackIndex];
    setProtocolPhase('ROUTING');
    setSelectedCountry({ id: track.country, name: track.country });
    addProtocolLog(track.log);
    addEvidence('Lane selected', track.log);
  };

  const setDemoProgress = (elapsed: number) => {
    setDemoElapsedMs(elapsed);
    setBootProgress(Math.min(100, (elapsed / demoDurationMs) * 100));
  };

  const runGuidedProtocol = () => {
    clearProtocolTimers();
    setProtocolPhase('ATTESTING');
    setDemoRunning(true);
    setDemoProgress(0);
    demoStartRef.current = Date.now();
    addEvidence('Demo start', 'Guided protocol walkthrough launched');
    setIsManifestoOpen(true);
    setIsTerminalOpen(false);
    setIsScannerOpen(false);
    setIsChatOpen(false);
    setTrackingState(TrackingState.NOT_INITIALIZED);
    addProtocolLog('PROTOCOL: guided run initiated');
    setSelectedCountry({ id: 'Kenya', name: 'Kenya' });

    const schedule = (delay: number, action: () => void) => {
      protocolTimersRef.current.push(window.setTimeout(action, delay));
    };

    demoTickRef.current = window.setInterval(() => {
      if (!demoStartRef.current) return;
      setDemoProgress(Date.now() - demoStartRef.current);
    }, 1000);

    schedule(45000, () => {
      setProtocolPhase('ROUTING');
      setSelectedCountry({ id: 'Kenya', name: 'Kenya' });
      addProtocolLog('PROTOCOL: local claim routed to the Health lane');
      addEvidence('Health lane', 'Kenya selected as the first deployment story');
    });

    schedule(115000, () => {
      setIsChatOpen(true);
      addProtocolLog('PROTOCOL: analyst chat opened for live objections');
      addEvidence('Analyst chat', 'Funding questions can be answered live');
    });

    schedule(165000, () => {
      setSelectedCountry({ id: 'Brazil', name: 'Brazil' });
      addProtocolLog('PROTOCOL: human-rights lane routed to Brazil');
      addEvidence('Rights lane', 'Brazil case used to show reporting and trust');
    });

    schedule(225000, () => {
      setProtocolPhase('BROADCASTING');
      setIsTerminalOpen(true);
      addProtocolLog('PROTOCOL: broadcast evidence stream opened');
      addEvidence('Broadcast', 'Terminal overlay exposes the proof stream');
    });

    schedule(285000, () => {
      setSelectedCountry({ id: 'South Africa', name: 'South Africa' });
      addProtocolLog('PROTOCOL: climate lane highlighted for South Africa');
      addEvidence('Climate lane', 'Third mission lens keeps the story moving');
    });

    schedule(345000, () => {
      setIsChatOpen(true);
      addProtocolLog('PROTOCOL: recap prompt opened for audience questions');
      addEvidence('Audience recap', 'Questions can be answered before close');
    });

    schedule(390000, () => {
      setProtocolPhase('VERIFIED');
      setTrackingState(TrackingState.OK);
      setBootProgress(100);
      addProtocolLog('PROTOCOL: contribution verified and sealed');
      addEvidence('Verified', 'Protocol ends with a visible proof state');
      setDemoRunning(false);
      demoStartRef.current = null;
      if (demoTickRef.current) {
        window.clearInterval(demoTickRef.current);
        demoTickRef.current = null;
      }
      setDemoProgress(demoDurationMs);
    });
  };

  const resetProtocol = () => {
    clearProtocolTimers();
    setProtocolPhase('IDLE');
    setDemoRunning(false);
    setDemoElapsedMs(0);
    setBootProgress(0);
    setSelectedCountry(null);
    setIsTerminalOpen(false);
    setIsManifestoOpen(false);
    setIsScannerOpen(false);
    setIsChatOpen(false);
    setEvidenceTrail([]);
    demoStartRef.current = null;
    addProtocolLog('PROTOCOL: demo reset for next walkthrough');
  };

  const demoClockLabel = `${Math.floor(demoElapsedMs / 60000).toString().padStart(2, '0')}:${Math.floor((demoElapsedMs % 60000) / 1000).toString().padStart(2, '0')} / 06:30`;

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

      <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-slate-950/98 backdrop-blur-2xl z-30 shrink-0 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-600/60 to-transparent"></div>
        
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsManifestoOpen(true)}
            aria-label="Open Manifesto"
            className="relative group cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 outline-none rounded-xl"
          >
            <div className="absolute inset-0 bg-blue-600 blur-xl opacity-20 group-hover:opacity-60 transition-all duration-500"></div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-700 to-indigo-950 rounded-xl flex items-center justify-center font-black text-2xl border border-blue-500/50 shadow-2xl text-white transform group-hover:rotate-12 transition-transform">Σ</div>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-black tracking-tighter text-2xl uppercase leading-none text-white">Sovereign <span className="text-blue-600">Map for Good</span></h1>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded text-[9px] mono text-emerald-400 font-black tracking-widest">DEMO_MODE</span>
            </div>
            <div className="flex gap-4 text-[10px] text-slate-500 mono uppercase tracking-[0.3em] font-bold mt-1.5">
              <span className="text-blue-500">IMPACT_DEMO_v2.0</span>
              <span className="opacity-30">|</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> LOCAL_FIRST_PRIVACY</span>
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
              <span className="text-[8px] text-slate-600 uppercase tracking-widest font-black">Impact_Engine_Primary</span>
            </div>
          </div>

          <div className="h-10 w-px bg-white/10"></div>
          
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="group relative px-8 py-3.5 bg-blue-700 hover:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center gap-4 border border-blue-400/30 overflow-hidden active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_12px_white]"></div>
            Check_My_Privacy
          </button>
        </nav>
      </header>

      {/* Production Workspace */}
      <main className="flex-1 relative flex overflow-hidden">
        <div className="flex-1 relative">
          <WorldMap 
            onCountrySelect={setSelectedCountry} 
            selectedId={selectedCountry?.id}
            focusCountryName={selectedCountry?.name ?? undefined}
            demoPulse={protocolPhase !== 'IDLE' || demoRunning}
          />
          
          <div className="absolute top-10 left-10 pointer-events-none flex flex-col gap-8 w-80">
            <div className="bg-slate-950/90 backdrop-blur-3xl p-6 rounded-3xl border border-blue-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto group hover:border-blue-400/40 transition-colors">
              <div className="flex items-center justify-between gap-3 mb-4 border-b border-white/5 pb-3">
                <h4 className="text-[11px] text-blue-500 mono font-black uppercase tracking-[0.4em]">Protocol_Flow</h4>
                <span className={`text-[9px] mono font-black uppercase tracking-widest ${protocolPhase === 'VERIFIED' ? 'text-emerald-400' : protocolPhase === 'IDLE' ? 'text-slate-600' : 'text-blue-400'}`}>
                  {protocolPhase}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {protocolStages.map((stage) => {
                  const isActive = stage.key === protocolPhase;
                  const isComplete = protocolStages.findIndex(item => item.key === stage.key) < protocolStages.findIndex(item => item.key === protocolPhase);
                  return (
                    <button
                      key={stage.key}
                      onClick={() => setProtocolPhase(stage.key)}
                      aria-pressed={isActive}
                      className={`text-left rounded-2xl border p-3 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${
                        isActive
                          ? 'border-blue-400 bg-blue-500/10 shadow-[0_0_18px_rgba(59,130,246,0.18)]'
                          : isComplete
                            ? 'border-emerald-500/20 bg-emerald-500/5'
                            : 'border-white/10 bg-slate-900/40 hover:border-white/20'
                      }`}
                    >
                      <div className={`text-[10px] mono font-black uppercase tracking-[0.35em] flex items-center justify-between gap-2 ${isActive ? 'text-blue-400' : isComplete ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <span>{stage.label}</span>
                        {isActive && (
                          <span className={`text-[8px] font-black tracking-widest flex items-center gap-1.5 shrink-0 animate-pulse ${stage.key === 'VERIFIED' ? 'text-emerald-400' : 'text-blue-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full animate-ping ${stage.key === 'VERIFIED' ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
                            {stage.key === 'VERIFIED' ? '[VERIFIED]' : '[PROCESSING]'}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-[10px] text-slate-300 leading-snug">{stage.detail}</div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {protocolTracks.map((track, index) => {
                  const isTrackActive = selectedCountry?.name === track.country;
                  return (
                    <button
                      key={track.label}
                      onClick={() => activateTrack(index)}
                      aria-pressed={isTrackActive}
                      className={`px-3 py-2 rounded-full border text-[9px] mono uppercase tracking-[0.25em] transition-all focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${
                        isTrackActive
                          ? 'border-blue-500 bg-blue-500/15 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                          : 'border-white/10 bg-slate-900/70 text-slate-300 hover:border-blue-400/40 hover:text-white'
                      }`}
                    >
                      {track.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={runGuidedProtocol}
                  className={`flex-1 px-4 py-3 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${
                    demoRunning
                      ? 'bg-blue-600/80 border border-blue-400/30 animate-pulse shadow-[0_0_20px_rgba(37,99,235,0.25)]'
                      : 'bg-blue-700 hover:bg-blue-600 shadow-[0_0_24px_rgba(37,99,235,0.35)]'
                  }`}
                >
                  {demoRunning ? 'Demo_Running...' : 'Run_6_Min_Demo'}
                </button>
                <button
                  onClick={resetProtocol}
                  className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] border border-white/10 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                >
                  Reset
                </button>
              </div>

              <div className="mt-4 text-[10px] mono text-slate-500 uppercase tracking-[0.3em]">
                <div className="flex items-center justify-between gap-3">
                  <span>Tap a stage or lane to steer the narrative.</span>
                  <span className="text-blue-400">{demoClockLabel}</span>
                </div>
              </div>

              <div className="mt-4 border-t border-white/5 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] mono text-slate-500 uppercase tracking-[0.35em] font-black">Evidence_Trail</span>
                  <span className="text-[9px] mono text-slate-700 uppercase tracking-widest">{evidenceTrail.length} events</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {evidenceTrail.length === 0 ? (
                    <div className="text-[10px] text-slate-600 mono uppercase tracking-[0.25em]">No evidence yet</div>
                  ) : (
                    evidenceTrail.map((entry, index) => (
                      <div key={`${entry.title}-${index}`} className="rounded-2xl border border-white/5 bg-slate-900/40 p-3">
                        <div className="text-[10px] mono font-black uppercase tracking-[0.3em] text-blue-400">{entry.title}</div>
                        <div className="text-[10px] text-slate-300 mt-1 leading-snug">{entry.detail}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-950/90 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto group hover:border-blue-500/30 transition-colors">
              <h4 className="text-[11px] text-blue-500 mono font-black uppercase mb-5 tracking-[0.4em] flex justify-between items-center border-b border-white/5 pb-3">
                <span>Impact_Stream</span>
                <span className="text-[9px] text-slate-700">READY</span>
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

            <div className="bg-slate-950/90 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
              <h4 className="text-[11px] text-slate-500 mono uppercase mb-4 tracking-[0.4em] font-black border-b border-white/5 pb-3">Demo_Use_Cases</h4>
              <div className="space-y-3">
                {impactPillars.map((pillar) => (
                  <div key={pillar.label} className={`p-3 rounded-2xl border ${pillar.border} ${pillar.bg}`}>
                    <div className={`text-[10px] mono font-black uppercase tracking-[0.35em] ${pillar.accent}`}>{pillar.label}</div>
                    <div className="text-[11px] text-slate-300 leading-snug mt-2">{pillar.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {geoData && (
              <div className="bg-slate-950/90 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
                <h4 className="text-[11px] text-slate-500 mono uppercase mb-4 tracking-[0.4em] font-black border-b border-white/5 pb-3">Local_Context</h4>
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
                    <span className="text-slate-600 text-[9px]">PRIVACY_POSTURE:</span>
                    <span className="text-blue-500 text-[10px] font-black tracking-tighter">ON_DEVICE [REF]</span>
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
        
        <ChatInterface isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
      </main>

      {/* Production Overlays */}
      <HardhatTerminal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
      <Manifesto isOpen={isManifestoOpen} onClose={() => setIsManifestoOpen(false)} />
      <SpatialScanner 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={(claim) => setLogs(prev => [...prev.slice(-5), `LOCAL_CONTRIBUTION: VERIFIED [0x${claim.id.toString(16).toUpperCase()}]`])}
      />

      <footer className="h-12 bg-slate-950/95 border-t border-white/10 flex items-center justify-between px-10 text-[10px] text-slate-600 mono uppercase tracking-[0.3em] shrink-0 z-30 backdrop-blur-xl">
        <div className="flex gap-10 items-center">
          <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-sm transition-all duration-500 ${trackingState === TrackingState.OK ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-slate-800'}`}></span>
            <span className="font-black text-slate-400">DEMO_READY: 100.00%</span>
          </div>
          <div className="w-px h-4 bg-white/10"></div>
          <div className="flex items-center gap-3 text-slate-500">
             <span className="text-emerald-500 font-black animate-pulse">●</span>
             <span>LOCAL_DATA: STAYS_ON_DEVICE</span>
          </div>
        </div>
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4">
             <span className="text-slate-600 font-bold">EDGE_SAVINGS:</span>
             <span className="text-blue-500 font-black tracking-widest">68% LESS CLOUD ENERGY</span>
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
