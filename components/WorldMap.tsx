
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

interface WorldMapProps {
  onCountrySelect: (country: { id: string; name: string }) => void;
  selectedId?: string;
}

const countryCapitals: Record<string, string> = {
  "United States of America": "Washington, D.C.",
  "China": "Beijing",
  "India": "New Delhi",
  "United Kingdom": "London",
  "France": "Paris",
  "Germany": "Berlin",
  "Japan": "Tokyo",
  "Russia": "Moscow",
  "Brazil": "Brasilia",
  "Australia": "Canberra",
  "Canada": "Ottawa",
  "Italy": "Rome",
  "South Korea": "Seoul",
  "Mexico": "Mexico City",
  "Indonesia": "Jakarta",
  "Saudi Arabia": "Riyadh",
  "Turkey": "Ankara",
  "Switzerland": "Bern",
  "Argentina": "Buenos Aires",
  "South Africa": "Pretoria",
  "Nigeria": "Abuja",
  "Egypt": "Cairo",
  "Ukraine": "Kyiv",
  "Poland": "Warsaw",
  "Spain": "Madrid",
  "Netherlands": "Amsterdam",
  "Sweden": "Stockholm",
  "Norway": "Oslo",
  "Finland": "Helsinki",
  "Denmark": "Copenhagen",
  "Ireland": "Dublin",
  "Belgium": "Brussels",
  "Portugal": "Lisbon",
  "Greece": "Athens",
  "Israel": "Jerusalem",
  "Iran": "Tehran",
  "Iraq": "Baghdad",
  "Vietnam": "Hanoi",
  "Thailand": "Bangkok",
  "Singapore": "Singapore",
  "Malaysia": "Kuala Lumpur",
  "Philippines": "Manila",
  "Pakistan": "Islamabad",
  "Bangladesh": "Dhaka",
  "Colombia": "Bogotá",
  "Chile": "Santiago",
  "Peru": "Lima",
  "New Zealand": "Wellington"
};

// Heritage Sanctuaries defined in the project narrative
const sanctuaries = [
  { name: "MIT Great Dome", lat: 42.3601, lng: -71.0942, label: "SGP-001" },
  { name: "Vatican City", lat: 41.9029, lng: 12.4534, label: "SGP-002" },
  { name: "Great Wall", lat: 40.4319, lng: 116.5704, label: "SGP-003" }
];

const WorldMap: React.FC<WorldMapProps> = ({ onCountrySelect, selectedId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [worldData, setWorldData] = useState<any>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0, lat: 0, lng: 0 });
  const [hoveredCountry, setHoveredCountry] = useState<{ name: string; id: string } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(res => res.json())
      .then(data => {
        const countries = feature(data, data.objects.countries);
        setWorldData(countries);
      });
    return () => {
      if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!worldData || !svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .on('click', () => {
        svg.transition()
          .duration(1200)
          .ease(d3.easeCubicInOut)
          .call(zoom.transform as any, d3.zoomIdentity);
      });

    const g = svg.append('g');
    const projection = d3.geoMercator()
      .scale(width / 6.5)
      .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 12])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    const graticule = d3.geoGraticule();
    g.append('path')
      .datum(graticule)
      .attr('class', 'fill-none stroke-blue-500/10 stroke-[0.5px]')
      .attr('d', path as any);

    g.selectAll('path.country')
      .data((worldData as any).features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', path as any)
      .attr('class', (d: any) => 
        `cursor-crosshair transition-all duration-300 fill-slate-900/40 stroke-blue-500/20 stroke-[0.5px] hover:fill-blue-500/30 hover:stroke-blue-400/60 ${d.id === selectedId ? 'fill-blue-600/50 stroke-blue-400 stroke-[1px]' : ''}`
      )
      .on('mousemove', (event, d: any) => {
        const [mx, my] = d3.pointer(event, svgRef.current);
        const [lng, lat] = projection.invert!([mx, my]) || [0, 0];
        setCoords({ x: mx, y: my, lat, lng });
        
        if (hoveredCountry?.id !== d.id) {
          if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
          setShowTooltip(false);
          setHoveredCountry({ name: d.properties.name, id: d.id });
          hoverTimeoutRef.current = window.setTimeout(() => {
            setShowTooltip(true);
          }, 250);
        }
      })
      .on('mouseleave', () => {
        if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
        setShowTooltip(false);
        setHoveredCountry(null);
      })
      .on('click', (event, d: any) => {
        event.stopPropagation();
        onCountrySelect({ id: d.id, name: d.properties.name });
        
        const bounds = path.bounds(d);
        const dx = bounds[1][0] - bounds[0][0];
        const dy = bounds[1][1] - bounds[0][1];
        const x = (bounds[0][0] + bounds[1][0]) / 2;
        const y = (bounds[0][1] + bounds[1][1]) / 2;
        
        const scale = Math.max(1, Math.min(8, 0.8 / Math.max(dx / width, dy / height)));
        
        const transform = d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(scale)
          .translate(-x, -y);

        svg.transition()
          .duration(1200)
          .ease(d3.easeCubicInOut)
          .call(zoom.transform as any, transform);
      });

    // Draw Heritage Sanctuaries (SGP Markers)
    const sanctuaryNodes = g.selectAll('g.sanctuary')
      .data(sanctuaries)
      .enter()
      .append('g')
      .attr('class', 'sanctuary')
      .attr('transform', (d: any) => {
        const p = projection([d.lng, d.lat]);
        return p ? `translate(${p[0]}, ${p[1]})` : null;
      });

    sanctuaryNodes.append('circle')
      .attr('r', 4)
      .attr('class', 'fill-blue-500 animate-pulse');

    sanctuaryNodes.append('circle')
      .attr('r', 8)
      .attr('class', 'fill-blue-500/20 stroke-blue-500/40 stroke-[0.5px] animate-ping');

    sanctuaryNodes.append('text')
      .attr('dy', -10)
      .attr('text-anchor', 'middle')
      .attr('class', 'mono text-[5px] fill-blue-400 font-black uppercase tracking-widest pointer-events-none')
      .text((d: any) => d.label);

  }, [worldData, selectedId, hoveredCountry?.id]);

  const getRiskLevel = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const level = hash % 3;
    if (level === 0) return { 
      label: 'LOW', 
      color: 'text-emerald-400', 
      borderColor: 'border-emerald-500/30',
      bgColor: 'bg-emerald-500/10',
      icon: (
        <svg className="w-4 h-4 animate-[pulse_3s_infinite]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L4 5V11C4 16.07 7.41 20.74 12 22C16.59 20.74 20 16.07 20 11V5L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    };
    if (level === 1) return { 
      label: 'MED', 
      color: 'text-amber-400', 
      borderColor: 'border-amber-500/30',
      bgColor: 'bg-amber-500/10',
      icon: (
        <svg className="w-4 h-4 animate-[bounce_2s_infinite]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10.29 3.86L1.82 18C1.64531 18.3024 1.55299 18.6452 1.55251 18.9939C1.55203 19.3427 1.6434 19.6858 1.81725 19.9883C1.9911 20.2908 2.24121 20.5422 2.54175 20.7164C2.8423 20.8906 3.18241 20.9819 3.528 20.98H20.472C20.8176 20.9819 21.1577 20.8906 21.4582 20.7164C21.7588 20.5422 22.0089 20.2908 22.1827 19.9883C22.3566 19.6858 22.448 19.3427 22.4475 18.9939C22.447 18.6452 22.3547 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15449C12.6817 2.98585 12.3437 2.89746 12 2.89746C11.6563 2.89746 11.3183 2.98585 11.0188 3.15449C10.7193 3.32312 10.4683 3.56611 10.29 3.86V3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    };
    return { 
      label: 'HIGH', 
      color: 'text-rose-500', 
      borderColor: 'border-rose-500/30',
      bgColor: 'bg-rose-500/10',
      icon: (
        <div className="relative">
          <svg className="w-4 h-4 animate-[spin_4s_linear_infinite]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12L12 12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 12H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="absolute inset-0 w-4 h-4 animate-ping bg-rose-500 opacity-20 rounded-full"></div>
        </div>
      )
    };
  };

  const risk = hoveredCountry ? getRiskLevel(hoveredCountry.name) : null;

  return (
    <div className="w-full h-full bg-slate-950 overflow-hidden relative group">
      <svg ref={svgRef} className="w-full h-full" />
      
      {/* Tactical Tooltip Overlay */}
      {hoveredCountry && risk && (
        <div 
          className={`absolute pointer-events-none bg-slate-900/95 backdrop-blur-md border border-blue-500/40 p-3 rounded shadow-[0_0_20px_rgba(59,130,246,0.2)] z-50 flex flex-col gap-1 min-w-[200px] transition-all duration-300 ${showTooltip ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}`}
          style={{ 
            left: 0,
            top: 0,
            transform: `translate3d(${coords.x + 20}px, ${coords.y + 20}px, 0) ${coords.x > window.innerWidth - 240 ? 'translateX(-110%)' : ''}`,
            transition: 'transform 0.1s cubic-bezier(0.2, 0, 0.4, 1), opacity 0.2s ease, scale 0.2s ease'
          }}
        >
          <div className="flex justify-between items-center border-b border-blue-500/20 pb-1.5 mb-1.5">
            <div className="mono text-[9px] text-blue-500 font-bold uppercase tracking-widest">Sector_Telemetry</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(59,130,246,1)]"></div>
            </div>
          </div>
          
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="text-sm font-black text-white uppercase tracking-tighter truncate leading-none pt-1">
              {hoveredCountry.name}
            </div>
            <div className={`flex flex-col items-center gap-1 px-2 py-1 rounded border ${risk.borderColor} ${risk.bgColor}`}>
               <span className={`${risk.color}`}>{risk.icon}</span>
               <span className={`mono text-[7px] font-black ${risk.color} tracking-tighter`}>{risk.label}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <span className="text-[9px] text-slate-500 mono font-bold uppercase tracking-wider">Capital:</span>
            <span className="text-[10px] text-emerald-400 mono font-bold text-right truncate">
              {countryCapitals[hoveredCountry.name] || 'ANALYZING...'}
            </span>
          </div>

          <div className="mt-2 flex flex-col gap-1">
            <div className="flex justify-between text-[8px] mono text-slate-600 uppercase">
              <span>SCAN_PROGRESS</span>
              <span>100%</span>
            </div>
            <div className="h-0.5 w-full bg-slate-800 overflow-hidden rounded-full">
              <div className="h-full bg-blue-500 w-full animate-[shimmer_1.5s_infinite]"></div>
            </div>
          </div>
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className="absolute bottom-20 right-8 bg-slate-900/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl z-10 pointer-events-none min-w-[180px]">
        <div className="mono text-[10px] text-blue-500 font-bold uppercase tracking-[0.2em] mb-3 border-b border-white/5 pb-2">
          Engine_Symbology
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-600/50 border border-blue-400 rounded-sm"></div>
            <span className="mono text-[9px] text-slate-300 uppercase tracking-wider">Active Node</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500/30 border border-blue-400/60 rounded-sm animate-pulse"></div>
            <span className="mono text-[9px] text-slate-300 uppercase tracking-wider">Voxel Scanning</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="mono text-[9px] text-slate-300 uppercase tracking-wider">Heritage Sanctuary</span>
          </div>
          <div className="flex items-center gap-3 border-t border-white/5 pt-2 mt-2">
            <div className="w-3 h-0.5 bg-blue-500/20"></div>
            <span className="mono text-[9px] text-slate-500 uppercase tracking-wider">Spatial Grid (0.5°)</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 flex items-center gap-4 text-slate-600 text-[10px] mono uppercase tracking-[0.4em] font-medium pointer-events-none">
        <div className="flex gap-1">
          <span className="w-1 h-3 bg-blue-600"></span>
          <span>Sovereign_Engine_Active</span>
        </div>
        <div className="h-px w-24 bg-slate-800"></div>
        <span>Raster_v2.0</span>
      </div>
    </div>
  );
};

export default WorldMap;
