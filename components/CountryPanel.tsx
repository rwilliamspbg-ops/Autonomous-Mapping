
import React, { useEffect, useState } from 'react';
import { getSovereignInsight, EnhancedSovereignInsight } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CountryPanelProps {
  country: { id: string; name: string } | null;
  onClose: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#ec4899'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-white/10 p-2 rounded shadow-xl mono text-[10px]">
        <p className="text-white font-bold">{payload[0].name}</p>
        <p className="text-blue-400">Severity: {payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

type ZkStatus = 'IDLE' | 'GENERATING' | 'VERIFYING' | 'COMMITTED';

const CountryPanel: React.FC<CountryPanelProps> = ({ country, onClose }) => {
  const [insight, setInsight] = useState<EnhancedSovereignInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [zkStatus, setZkStatus] = useState<ZkStatus>('IDLE');
  const [verifyStep, setVerifyStep] = useState(0);

  useEffect(() => {
    if (country) {
      setLoading(true);
      setZkStatus('IDLE');
      setVerifyStep(0);
      getSovereignInsight(country.name)
        .then(setInsight)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setInsight(null);
    }
  }, [country]);

  const handleZkExport = () => {
    setZkStatus('GENERATING');
    setTimeout(() => {
      setZkStatus('VERIFYING');
      const steps = 3;
      let currentStep = 1;
      const stepInterval = setInterval(() => {
        setVerifyStep(currentStep);
        if (currentStep >= steps) {
          clearInterval(stepInterval);
          setTimeout(() => {
            setZkStatus('COMMITTED');
          }, 800);
        }
        currentStep++;
      }, 1000);
    }, 2000);
  };

  if (!country) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-slate-950/98 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] z-40 flex flex-col transition-all duration-500 ease-out border-t border-blue-500/20">
      {/* Registry Header */}
      <div className="bg-slate-950 p-8 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <div className="w-24 h-24 border-r-2 border-t-2 border-blue-500"></div>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <div className="mono text-[10px] text-blue-500 font-black uppercase tracking-[0.5em] mb-1">Spatial_Registry_Voxel</div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">{country.name}</h2>
            <div className="flex items-center gap-3 mt-3">
              <span className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded text-[9px] text-blue-400 mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                INDEX: {country.id}
              </span>
              <span className="text-[9px] text-slate-500 mono font-bold uppercase tracking-widest">Aggregate Registry Status</span>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 rounded-full p-2 transition-colors">
            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 scroll-smooth">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-8 py-20">
            <div className="relative">
              <div className="w-20 h-20 border-2 border-blue-500/10 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 border border-emerald-500/20 border-b-transparent rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
            </div>
            <div className="text-center">
              <p className="text-blue-400 mono text-xs font-black animate-pulse uppercase tracking-[0.4em] mb-2">Quantizing Spatial Data...</p>
              <p className="text-slate-600 mono text-[9px] uppercase tracking-widest">Decompressing Gaussian Splats (QSB)</p>
            </div>
          </div>
        ) : insight ? (
          <>
            {/* Architectural Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-1">
                <div className="text-slate-500 text-[8px] mono uppercase tracking-widest">Splatting Fidelity</div>
                <div className="text-white text-xl font-black">99.2%</div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className="w-[99%] h-full bg-emerald-500"></div>
                </div>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-1">
                <div className="text-slate-500 text-[8px] mono uppercase tracking-widest">Spatial Governance</div>
                <div className="text-blue-400 text-sm font-black italic uppercase leading-tight">Heritage Sanctuary</div>
                <div className="text-[8px] text-slate-600 mono uppercase">SGP-Active</div>
              </div>
            </div>

            {/* ZK Section */}
            <div className="bg-slate-900 border border-blue-500/20 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0"></div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white text-[10px] mono font-black uppercase tracking-[0.2em]">Spatial ZK-Proof Generation</h3>
                <span className="text-emerald-400 text-[8px] mono px-2 py-0.5 border border-emerald-500/20 bg-emerald-500/5 rounded">NON_CUSTODIAL_OK</span>
              </div>

              {zkStatus === 'VERIFYING' && (
                <div className="mb-6 space-y-2 p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] text-blue-400 mono font-black uppercase tracking-widest">AggLayer_Verifier</span>
                    <span className="text-[10px] text-white mono font-bold">{Math.round((verifyStep / 3) * 100)}%</span>
                  </div>
                  <div className="space-y-1.5">
                    {['ANCHOR_STATE_HASH', 'ZK_SNARK_VALIDATION', 'CROSS_CHAIN_FINALITY'].map((step, idx) => (
                      <div key={idx} className={`flex items-center gap-3 text-[9px] mono ${verifyStep >= idx + 1 ? 'text-emerald-400' : 'text-slate-600'}`}>
                        <div className={`w-3 h-3 border rounded-sm flex items-center justify-center ${verifyStep >= idx + 1 ? 'border-emerald-500 bg-emerald-500/20' : 'border-slate-800'}`}>
                          {verifyStep >= idx + 1 && '✓'}
                        </div>
                        <span className="tracking-tighter">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={handleZkExport}
                disabled={zkStatus !== 'IDLE'}
                className={`w-full py-4 rounded-xl border mono text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
                  zkStatus === 'IDLE' ? 'bg-blue-600 border-blue-400 text-white hover:bg-blue-500 shadow-blue-600/20' :
                  zkStatus === 'COMMITTED' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 cursor-default' :
                  'bg-slate-800 border-slate-700 text-slate-500 animate-pulse cursor-wait'
                }`}
              >
                {zkStatus === 'IDLE' && '⊕ Commit Spatial State to AggLayer'}
                {zkStatus === 'GENERATING' && 'Generating SNARK Proof...'}
                {zkStatus === 'VERIFYING' && 'Verifying Proof...'}
                {zkStatus === 'COMMITTED' && '✓ State-Root Finalized on Polygon'}
              </button>
            </div>

            <section className="space-y-4">
              <h3 className="text-slate-500 text-[10px] mono font-bold uppercase tracking-[0.4em] flex items-center gap-3">
                <span className="w-1.5 h-4 bg-blue-600"></span> Executive Summary
              </h3>
              <p className="text-slate-200 text-base leading-relaxed font-medium">{insight.summary}</p>
            </section>

            {/* Risk Distribution */}
            <section className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 relative">
              <h3 className="text-slate-500 text-[10px] mono font-bold uppercase mb-6 tracking-[0.4em]">Sovereign Risk Matrix</h3>
              <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={insight.keyRisks}
                      dataKey="severity"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {insight.keyRisks.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-white font-black text-2xl tracking-tighter">
                      {Math.round(insight.keyRisks.reduce((acc, r) => acc + r.severity, 0) / insight.keyRisks.length)}
                    </div>
                    <div className="text-[8px] text-slate-500 mono uppercase tracking-widest">Agg_Risk</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-4">
                {insight.keyRisks.map((risk, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-[10px] text-slate-300 mono truncate font-medium uppercase tracking-tighter">{risk.name}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-colors">
                <h4 className="text-blue-500 text-[10px] font-black uppercase mb-3 mono tracking-widest">Political Intelligence</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{insight.politicalStatus}</p>
              </div>
              <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 group hover:border-emerald-500/30 transition-colors">
                <h4 className="text-emerald-500 text-[10px] font-black uppercase mb-3 mono tracking-widest">Economic Trajectory</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{insight.economicOutlook}</p>
              </div>
            </section>

            <section className="pb-12 border-t border-white/5 pt-10">
              <h3 className="text-slate-500 text-[10px] mono font-bold uppercase mb-4 tracking-[0.4em]">Intelligence Citations</h3>
              <div className="flex flex-wrap gap-2">
                {insight.sources?.map((source, i) => (
                  <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] mono bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full border border-blue-500/20 hover:bg-blue-500/20 transition-all font-bold uppercase truncate max-w-[200px]">
                    {source.title}
                  </a>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </div>
      
      <div className="p-5 bg-slate-950 border-t border-white/5 text-[9px] text-slate-500 mono flex justify-between items-center shrink-0">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
          SPATIAL_SYNC_ENABLED
        </span>
        <div className="flex items-center gap-4">
          <span className="text-slate-600">v.2035.1</span>
          <div className="h-1 w-16 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-full animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryPanel;
