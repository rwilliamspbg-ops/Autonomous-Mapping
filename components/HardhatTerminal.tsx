
import React, { useState, useEffect, useRef } from 'react';

interface NodeConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

const liveLogs = [
  "[SYSTEM] Sovereign Map Node v1.0.4 Online.",
  "[NETWORK] Connecting to AggLayer Peer 0x4a...91",
  "[NETWORK] Handshake Successful. State-Root Sync Initiated.",
  "[SGP-001] Heritage Sanctuary SGP-001 Verified @ MIT_GREAT_DOME",
  "[ZK] SNARK_PROVER: Initialized with NPU Acceleration.",
  "[QSB] Streaming Voxel Packets [Region: US-EAST-1]",
  "[BLOCK] #18,241,092 Finalized (Polygon Mainnet)",
  "[BLOCK] #18,241,093 Finalized (Polygon Mainnet)",
  "[BLOCK] #18,241,094 Finalized (Polygon Mainnet)",
  "[SECURITY] Firewall: 0 unauthorized overlay attempts blocked.",
  "[RECOVERY] Loop-Closure stability: 99.982%",
  "[SYSTEM] Global Spatial Commons Index updated (1.2k entries).",
  "[ANALYST] Lead_Analyst_v2 initialized with Google Grounding.",
  "[IO] GPS_LOCK: Sub-millimeter precision confirmed.",
  "[IO] IMU_DRIVE: 1000Hz poll rate stabilized.",
  "[ZK] Witness generated for local perspective claim.",
  "[ZK] Proof submitted to AggLayer Relay 0x01.",
  "[BLOCK] #18,241,095 Finalized (Polygon Mainnet)",
];

const NodeConsole: React.FC<NodeConsoleProps> = ({ isOpen, onClose }) => {
  const [output, setOutput] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setOutput(["> Establishing secure shell connection...", "> Node v1.0.4-PROD online."]);
      let i = 0;
      const interval = setInterval(() => {
        if (i < liveLogs.length) {
          setOutput(prev => [...prev, liveLogs[i]]);
          i++;
        } else {
          // Loop logs to simulate continuous activity
          setOutput(prev => [...prev.slice(-20), `[BLOCK] #${18241095 + i} Finalized`]);
          i++;
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl">
      <div className="w-full max-w-5xl h-[700px] bg-[#0d1117] border border-blue-500/30 rounded-[2.5rem] shadow-[0_0_120px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="bg-[#161b22] px-10 py-6 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <span className="ml-5 text-[11px] text-slate-400 mono font-black uppercase tracking-[0.5em]">Live_Node_Console // production_access</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-all p-2 hover:bg-white/5 rounded-full">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 mono text-[13px] leading-relaxed whitespace-pre font-medium text-slate-400 scroll-smooth bg-[#010409]">
          {output.map((line, idx) => {
            let colorClass = "text-slate-500";
            if (line.includes("[BLOCK]")) colorClass = "text-emerald-500 font-black";
            if (line.includes("[NETWORK]")) colorClass = "text-blue-500 font-black";
            if (line.includes("[ZK]")) colorClass = "text-violet-500 font-black";
            if (line.startsWith(">")) colorClass = "text-white font-black italic";
            if (line.includes("Verified")) colorClass = "text-emerald-400 italic";
            
            return (
              <div key={idx} className={`${colorClass} mb-2 animate-in fade-in slide-in-from-left-4 duration-500`}>
                {line}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NodeConsole;
