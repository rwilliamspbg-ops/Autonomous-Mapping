
import React from 'react';

interface ManifestoProps {
  isOpen: boolean;
  onClose: () => void;
}

const Manifesto: React.FC<ManifestoProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-blue-500/30 rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.1)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-start bg-slate-950/50">
          <div>
            <div className="mono text-[10px] text-blue-500 font-black uppercase tracking-[0.4em] mb-2">Portfolio_Submission // v.2035.1</div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Lead Spatial Architect <span className="text-blue-500">Manifesto</span></h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-12 space-y-10 scroll-smooth">
          <section className="space-y-4">
            <h3 className="mono text-blue-400 text-xs font-bold uppercase tracking-widest border-l-2 border-blue-500 pl-4">The Narrative</h3>
            <p className="text-xl text-slate-200 leading-relaxed font-medium">
              As augmented reality moves from a luxury to a utility, the data layer of our world is being privatized. 
              <span className="text-blue-400"> Sovereign Map</span> is my response to this centralization. 
              Reimagining Simultaneous Localization and Mapping (SLAM) not as a proprietary tool, but as a <span className="italic">Global Spatial Commons</span>.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-12 pt-4">
            <section className="space-y-4">
              <h3 className="mono text-emerald-400 text-xs font-bold uppercase tracking-widest border-l-2 border-emerald-500 pl-4">Perception & Privacy</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Utilizing on-device NPUs for real-time feature tracking via <strong>ORB-SLAM3</strong>, achieving sub-millimeter drift correction. 
                Our 3D Biometric Handshake uses <strong>ZK-SNARKs</strong>, proving physical perspective ownership without sacrificing location privacy.
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="mono text-violet-400 text-xs font-bold uppercase tracking-widest border-l-2 border-violet-500 pl-4">AggLayer & QSB</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Developed <strong>Quantized Spatial Bundles (QSB)</strong> to compress Gaussian Splatting data by 99%, enabling 6G-ready streaming. 
                Spatial state-roots are anchored to the <strong>Polygon AggLayer</strong> for cross-chain finality.
              </p>
            </section>
          </div>

          <section className="bg-blue-500/5 p-8 rounded-2xl border border-blue-500/20">
            <h3 className="mono text-blue-500 text-xs font-bold uppercase tracking-widest mb-4">SGP-001: The Great Dome</h3>
            <p className="text-sm text-slate-300 italic">
              "The first Spatial Governance Proposal successfully codified the MIT Great Dome as a Digital Heritage Sanctuary, 
              protecting its virtual coordinates from unauthorized commercial overlays."
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-950 border-t border-white/5 flex justify-between items-center shrink-0">
          <div className="flex gap-4">
            <span className="px-3 py-1 bg-slate-900 border border-white/10 rounded text-[9px] mono text-slate-500 uppercase">DePIN</span>
            <span className="px-3 py-1 bg-slate-900 border border-white/10 rounded text-[9px] mono text-slate-500 uppercase">Computer Vision</span>
            <span className="px-3 py-1 bg-slate-900 border border-white/10 rounded text-[9px] mono text-slate-500 uppercase">Polygon AggLayer</span>
          </div>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
          >
            Acknowledge & Access Registry
          </button>
        </div>
      </div>
    </div>
  );
};

export default Manifesto;
