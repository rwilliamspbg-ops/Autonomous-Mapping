
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
  const [copied, setCopied] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [streamStatusMsg, setStreamStatusMsg] = useState<string | null>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const isPausedRef = useRef(isPaused);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    if (isOpen) {
      lastActiveElementRef.current = document.activeElement as HTMLElement;
      setIsScrolledUp(false);
      setIsPaused(false);
      setStreamStatusMsg(null);
      setOutput(["> Establishing secure shell connection...", "> Node v1.0.4-PROD online."]);
      let i = 0;
      const interval = setInterval(() => {
        if (isPausedRef.current) return;
        if (i < liveLogs.length) {
          setOutput(prev => [...prev, liveLogs[i]]);
          i++;
        } else {
          // Loop logs to simulate continuous activity
          setOutput(prev => [...prev.slice(-100), `[BLOCK] #${18241095 + i} Finalized`]);
          i++;
        }
      }, 300);
      return () => clearInterval(interval);
    } else {
      if (lastActiveElementRef.current) {
        lastActiveElementRef.current.focus();
        lastActiveElementRef.current = null;
      }
    }
  }, [isOpen]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const hasOverflow = scrollHeight > clientHeight + 10;
    const isAtBottom = !hasOverflow || (scrollHeight - scrollTop - clientHeight < 60);
    setIsScrolledUp(!isAtBottom);
  };

  useEffect(() => {
    if (scrollRef.current && !isScrolledUp) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, isScrolledUp]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl h-[700px] bg-[#0d1117] border border-blue-500/30 rounded-[2.5rem] shadow-[0_0_120px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 cursor-default relative"
      >
        <div className="bg-[#161b22] px-10 py-6 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <span className="ml-5 text-[11px] text-slate-400 mono font-black uppercase tracking-[0.5em]">Live_Node_Console // production_access</span>
          </div>
          <div className="flex items-center gap-4">
            <div role="status" aria-live="polite" className="sr-only">
              {copied ? "Terminal logs copied to clipboard." : cleared ? "Terminal logs cleared." : streamStatusMsg || ""}
            </div>
            <button
              onClick={() => {
                const newPaused = !isPaused;
                setIsPaused(newPaused);
                setStreamStatusMsg(newPaused ? "Terminal log streaming paused." : "Terminal log streaming resumed.");
              }}
              aria-label={isPaused ? "Resume live log streaming" : "Pause live log streaming"}
              title={isPaused ? "Resume Stream" : "Pause Stream"}
              className={`px-3 py-1.5 font-bold mono text-[10px] uppercase tracking-wider rounded-lg border shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 outline-none transition-all active:scale-95 shrink-0 flex items-center gap-1.5 ${
                isPaused
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-white/10'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`}></span>
              <span>{isPaused ? 'Resume Stream' : 'Pause Stream'}</span>
            </button>
            {output.length > 0 && (
              <button
                onClick={() => {
                  setOutput([]);
                  setCleared(true);
                  setTimeout(() => setCleared(false), 2000);
                }}
                aria-label="Clear terminal logs"
                title="Clear Logs"
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold mono text-[10px] uppercase tracking-wider rounded-lg border border-rose-500/20 shadow-md focus-visible:ring-2 focus-visible:ring-rose-500 outline-none transition-all active:scale-95 shrink-0"
              >
                Clear Logs
              </button>
            )}
            <button
              onClick={() => {
                navigator.clipboard.writeText(output.join('\n'));
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              aria-label="Copy terminal logs to clipboard"
              title="Copy Logs"
              className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold mono text-[10px] uppercase tracking-wider rounded-lg border border-blue-500/20 shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 outline-none transition-all active:scale-95 shrink-0"
            >
              {copied ? 'Copied! ✓' : 'Copy Logs'}
            </button>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close Live Node Console (Escape)"
              title="Close (Escape)"
              className="text-slate-500 hover:text-white transition-all active:scale-90 p-2 hover:bg-white/5 rounded-full focus-visible:ring-2 focus-visible:ring-blue-500 outline-none relative group"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              <kbd aria-hidden="true" className="absolute -bottom-1 -right-1 px-1 py-0.5 bg-slate-900 border border-blue-500/30 rounded text-[7px] text-blue-400 font-mono tracking-tighter uppercase select-none">Esc</kbd>
            </button>
          </div>
        </div>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          tabIndex={0}
          aria-label="Live Node Console logs"
          className="flex-1 overflow-y-auto p-12 mono text-[13px] leading-relaxed whitespace-pre font-medium text-slate-400 scroll-smooth bg-[#010409] focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
        >
          {output.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 my-auto py-12">
              <div className="text-slate-500 text-sm font-mono uppercase tracking-[0.3em] font-black">
                Console output cleared
              </div>
              <p className="text-slate-600 text-xs font-mono max-w-sm leading-relaxed">
                Live block stream is active. New telemetry events will stream shortly, or click below to restore initial connection logs.
              </p>
              <button
                onClick={() => setOutput(["> Establishing secure shell connection...", "> Node v1.0.4-PROD online."])}
                aria-label="Restore initial terminal logs"
                className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold mono text-xs uppercase tracking-wider rounded-xl border border-blue-500/20 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none transition-all active:scale-95 shadow-md"
              >
                Restore Logs
              </button>
            </div>
          ) : (
            output.map((line, idx) => {
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
            })
          )}
        </div>
        {isScrolledUp && (
          <button
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                setIsScrolledUp(false);
              }
            }}
            aria-label="Resume auto-scroll to bottom of terminal logs"
            title="Resume auto-scroll"
            className="absolute bottom-6 right-12 px-3 py-1.5 bg-blue-600/90 hover:bg-blue-500 text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl border border-blue-400/40 shadow-lg backdrop-blur-md transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <span>Resume Auto-scroll</span>
            <span className="text-xs" aria-hidden="true">↓</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default NodeConsole;
