
import React from 'react';

interface ManifestoProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDemo?: () => void;
  onSelectTrack?: (trackIndex: number) => void;
}

const MANIFESTO_SECTIONS = [
  {
    id: 'narrative',
    title: 'The Narrative',
    titleColor: 'text-blue-400',
    borderColor: 'border-blue-500',
    content: 'Non-profit funders need more than a technical proof-of-concept. They need a story about how privacy-preserving AI helps people, protects local data, and reduces wasted infrastructure. Sovereign Map turns that story into a live demo.',
    highlight: ' Sovereign Map',
    highlightSuffix: ' turns that story into a live demo.'
  },
  {
    id: 'privacy',
    title: 'Privacy & Trust',
    titleColor: 'text-emerald-400',
    borderColor: 'border-emerald-500',
    content: 'The core promise is simple: data stays local, updates are verified, and only safe summaries move outward. That is the practical value of federated learning, ZK proofs, and TPM-backed attestation.'
  },
  {
    id: 'carbon',
    title: 'Carbon & Scale',
    titleColor: 'text-violet-400',
    borderColor: 'border-violet-500',
    content: 'Edge training reduces unnecessary cloud transfer, lowers energy use, and gives local institutions a stronger privacy posture. The demo keeps those tradeoffs visible instead of hiding them behind abstraction.'
  },
  {
    id: 'lanes',
    title: 'Pilot Lanes',
    titleColor: 'text-blue-500',
    borderColor: 'border-blue-500',
    content: 'Global Health, Human Rights, and Climate Resilience are the three demo lanes. Each shows the same runtime through a mission lens that funders can understand immediately.'
  }
];

const Manifesto: React.FC<ManifestoProps> = ({ isOpen, onClose, onStartDemo, onSelectTrack }) => {
  const [copied, setCopied] = React.useState(false);
  const [filter, setFilter] = React.useState('');
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const filterInputRef = React.useRef<HTMLInputElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const lastActiveElementRef = React.useRef<HTMLElement | null>(null);

  const handleCopyManifesto = () => {
    const manifestoText = [
      "SOVEREIGN MAP FOR GOOD - MANIFESTO",
      "====================================",
      "THE NARRATIVE:",
      "Non-profit funders need more than a technical proof-of-concept. They need a story about how privacy-preserving AI helps people, protects local data, and reduces wasted infrastructure. Sovereign Map turns that story into a live demo.",
      "",
      "PRIVACY & TRUST:",
      "The core promise is simple: data stays local, updates are verified, and only safe summaries move outward. That is the practical value of federated learning, ZK proofs, and TPM-backed attestation.",
      "",
      "CARBON & SCALE:",
      "Edge training reduces unnecessary cloud transfer, lowers energy use, and gives local institutions a stronger privacy posture. The demo keeps those tradeoffs visible instead of hiding them behind abstraction.",
      "",
      "PILOT LANES:",
      "Global Health, Human Rights, and Climate Resilience are the three demo lanes. Each shows the same runtime through a mission lens that funders can understand immediately."
    ].join('\n');

    navigator.clipboard.writeText(manifestoText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    if (!isOpen) {
      if (lastActiveElementRef.current) {
        lastActiveElementRef.current.focus();
        lastActiveElementRef.current = null;
      }
      return;
    }
    lastActiveElementRef.current = document.activeElement as HTMLElement;
    setFilter('');
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  const filteredSections = MANIFESTO_SECTIONS.filter(s => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    return s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q);
  });

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md cursor-pointer"
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Sovereign Map Manifesto"
        className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-blue-500/30 rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.1)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 cursor-default"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-start bg-slate-950/50">
          <div>
            <div className="mono text-[10px] text-blue-500 font-black uppercase tracking-[0.4em] mb-2">Impact_Demo // v2.0</div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Sovereign Map <span className="text-blue-500">for Good</span></h2>
          </div>
          <div className="flex items-center gap-3">
            <div role="status" aria-live="polite" className="sr-only">
              {copied ? "Manifesto text copied to clipboard." : ""}
            </div>

            {/* Filter Input */}
            <div className="relative flex items-center">
              <input
                ref={filterInputRef}
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter manifesto..."
                aria-label="Filter manifesto content by keyword"
                title="Filter manifesto sections"
                className="bg-slate-900/90 border border-slate-700/80 rounded-lg py-1 px-3 pr-7 text-xs mono text-white placeholder-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 w-36 md:w-48 transition-all"
              />
              {filter && (
                <button
                  type="button"
                  onClick={() => {
                    setFilter('');
                    filterInputRef.current?.focus();
                  }}
                  aria-label="Clear manifesto search filter"
                  title="Clear filter"
                  className="absolute right-2 text-slate-400 hover:text-white text-xs font-mono rounded focus-visible:ring-2 focus-visible:ring-blue-500 outline-none cursor-pointer p-0.5"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Match Count Badge */}
            <span
              title={`${filteredSections.length} of ${MANIFESTO_SECTIONS.length} manifesto sections match filter`}
              className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[9px] mono font-bold uppercase text-slate-400 shrink-0"
            >
              {filteredSections.length}/{MANIFESTO_SECTIONS.length} SECTIONS
            </span>

            <button
              onClick={handleCopyManifesto}
              aria-label="Copy Sovereign Map Manifesto to clipboard"
              title="Copy Manifesto"
              className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold mono text-[10px] uppercase tracking-wider rounded-lg border border-blue-500/20 shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 outline-none transition-all active:scale-95 shrink-0"
            >
              {copied ? 'Copied! ✓' : 'Copy Manifesto'}
            </button>
            <button
              ref={closeButtonRef}
              onClick={onClose}
            aria-label="Close Sovereign Map Manifesto (Escape)"
            title="Close (Escape)"
            className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90 text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none relative group"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
            <kbd aria-hidden="true" className="absolute -bottom-1 -right-1 px-1 py-0.5 bg-slate-900 border border-blue-500/30 rounded text-[7px] text-blue-400 font-mono tracking-tighter uppercase select-none">Esc</kbd>
          </button>
          </div>
        </div>

        {/* Content */}
        <div
          tabIndex={0}
          aria-label="Sovereign Map Manifesto content"
          className="flex-1 overflow-y-auto p-12 space-y-10 scroll-smooth focus-visible:ring-2 focus-visible:ring-blue-500 outline-none rounded-b-xl"
        >
          {filteredSections.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="text-slate-500 text-xs font-mono uppercase tracking-[0.2em] font-black">
                No manifesto sections match filter
              </div>
              <p className="text-slate-600 text-[10px] font-mono max-w-xs leading-relaxed">
                No sections found matching "{filter}". Try a different keyword or clear the search.
              </p>
              <button
                onClick={() => {
                  setFilter('');
                  filterInputRef.current?.focus();
                }}
                aria-label="Clear manifesto search filter query"
                title="Clear filter"
                className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold mono text-[10px] uppercase tracking-wider rounded-xl border border-blue-500/20 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none transition-all active:scale-95 shadow-md"
              >
                Clear Filter
              </button>
            </div>
          ) : (
            <>
              {filteredSections.some(s => s.id === 'narrative') && (
                <section className="space-y-4">
                  <h3 className="mono text-blue-400 text-xs font-bold uppercase tracking-widest border-l-2 border-blue-500 pl-4">The Narrative</h3>
                  <p className="text-xl text-slate-200 leading-relaxed font-medium">
                    Non-profit funders need more than a technical proof-of-concept. They need a story about how privacy-preserving AI helps people, protects local data, and reduces wasted infrastructure.
                    <span className="text-blue-400"> Sovereign Map</span> turns that story into a live demo.
                  </p>
                </section>
              )}

              {(filteredSections.some(s => s.id === 'privacy') || filteredSections.some(s => s.id === 'carbon')) && (
                <div className="grid md:grid-cols-2 gap-12 pt-4">
                  {filteredSections.some(s => s.id === 'privacy') && (
                    <section className="space-y-4">
                      <h3 className="mono text-emerald-400 text-xs font-bold uppercase tracking-widest border-l-2 border-emerald-500 pl-4">Privacy & Trust</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        The core promise is simple: data stays local, updates are verified, and only safe summaries move outward. That is the practical value of federated learning, ZK proofs, and TPM-backed attestation.
                      </p>
                    </section>
                  )}
                  {filteredSections.some(s => s.id === 'carbon') && (
                    <section className="space-y-4">
                      <h3 className="mono text-violet-400 text-xs font-bold uppercase tracking-widest border-l-2 border-violet-500 pl-4">Carbon & Scale</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        Edge training reduces unnecessary cloud transfer, lowers energy use, and gives local institutions a stronger privacy posture. The demo keeps those tradeoffs visible instead of hiding them behind abstraction.
                      </p>
                    </section>
                  )}
                </div>
              )}

              {filteredSections.some(s => s.id === 'lanes') && (
                <section className="bg-blue-500/5 p-8 rounded-2xl border border-blue-500/20">
                  <h3 className="mono text-blue-500 text-xs font-bold uppercase tracking-widest mb-3">Pilot Lanes</h3>
                  <p className="text-sm text-slate-300 italic mb-4">
                    "Global Health, Human Rights, and Climate Resilience are the three demo lanes. Each shows the same runtime through a mission lens that funders can understand immediately."
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      onClick={() => {
                        onSelectTrack?.(0);
                        onClose();
                      }}
                      aria-label="Launch Global Health pilot lane in Kenya"
                      title="Launch Global Health pilot lane (Kenya)"
                      className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold mono text-xs uppercase tracking-wider rounded-xl border border-emerald-500/30 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none cursor-pointer flex items-center gap-2"
                    >
                      <span>Global Health</span>
                      <span className="text-[10px] text-emerald-500/80 font-normal">(Kenya)</span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectTrack?.(1);
                        onClose();
                      }}
                      aria-label="Launch Human Rights pilot lane in Brazil"
                      title="Launch Human Rights pilot lane (Brazil)"
                      className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold mono text-xs uppercase tracking-wider rounded-xl border border-rose-500/30 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-rose-500 outline-none cursor-pointer flex items-center gap-2"
                    >
                      <span>Human Rights</span>
                      <span className="text-[10px] text-rose-500/80 font-normal">(Brazil)</span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectTrack?.(2);
                        onClose();
                      }}
                      aria-label="Launch Climate Resilience pilot lane in South Africa"
                      title="Launch Climate Resilience pilot lane (South Africa)"
                      className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold mono text-xs uppercase tracking-wider rounded-xl border border-blue-500/30 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none cursor-pointer flex items-center gap-2"
                    >
                      <span>Climate Resilience</span>
                      <span className="text-[10px] text-blue-500/80 font-normal">(South Africa)</span>
                    </button>
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-950 border-t border-white/5 flex justify-between items-center shrink-0">
          <div className="flex gap-4">
            <span className="px-3 py-1 bg-slate-900 border border-white/10 rounded text-[9px] mono text-slate-500 uppercase">AI for Good</span>
            <span className="px-3 py-1 bg-slate-900 border border-white/10 rounded text-[9px] mono text-slate-500 uppercase">Privacy Preserving</span>
            <span className="px-3 py-1 bg-slate-900 border border-white/10 rounded text-[9px] mono text-slate-500 uppercase">Edge Federated Learning</span>
          </div>
          <button 
            onClick={() => {
              onStartDemo?.();
              onClose();
            }}
            aria-label="Use this demo and start guided walkthrough"
            title="Use This Demo"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-600/20 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
          >
            Use This Demo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Manifesto;
