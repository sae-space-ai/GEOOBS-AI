import { useState, useRef, useEffect } from 'react';
import { useAppState, createAuditEntry } from '../store/AppContext';
import { analyzeGeomorphology, crossReferenceWithIGME, exportAnomaliesToGeoJSON, DEFAULT_THRESHOLDS } from '../engine/geomorphology';
import type { GeomorphologicalAnalysis, GeomorphologicalThresholds } from '../engine/geomorphology';
import igmeData from '../../data/igme_query_result.json';

export function Mineral01Mission() {
  const { dispatch } = useAppState();
  const [analysis, setAnalysis] = useState<GeomorphologicalAnalysis | null>(null);
  const [thresholds, setThresholds] = useState<GeomorphologicalThresholds>(DEFAULT_THRESHOLDS);
  const [showIGME, setShowIGME] = useState(true);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('all');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // IGME data statistics
  const igmeFeatures = igmeData.features || [];
  const municipalities = [...new Set(igmeFeatures.map((f: any) => f.attributes.Municipio))];
  
  const filteredFeatures = selectedMunicipality === 'all' 
    ? igmeFeatures 
    : igmeFeatures.filter((f: any) => f.attributes.Municipio === selectedMunicipality);

  // Draw map on canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, h);

    // Map bounds (envelope from query)
    const xmin = -5.6, xmax = -5.5;
    const ymin = 38.1, ymax = 38.2;

    // Draw grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * w;
      const y = (i / 10) * h;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw IGME points
    if (showIGME) {
      filteredFeatures.forEach((f: any) => {
        const x = ((f.geometry.x - xmin) / (xmax - xmin)) * w;
        const y = h - ((f.geometry.y - ymin) / (ymax - ymin)) * h;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // Draw labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText(`${xmin}°W`, 5, h - 5);
    ctx.fillText(`${xmax}°W`, w - 40, h - 5);
    ctx.fillText(`${ymax}°N`, 5, 15);
    ctx.fillText(`${ymin}°N`, 5, h - 15);

    // Legend
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(w - 150, 10, 140, 60);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(w - 150, 10, 140, 60);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Legend', w - 140, 28);
    ctx.beginPath();
    ctx.arc(w - 130, 45, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.fillText('IGME Indications', w - 120, 48);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px sans-serif';
    ctx.fillText(`Count: ${filteredFeatures.length}`, w - 120, 62);

  }, [filteredFeatures, showIGME]);

  const runAnalysis = () => {
    const result = analyzeGeomorphology(null, 1000, 1000, 0.5, thresholds);
    
    const crossRef = crossReferenceWithIGME(result.anomalies, igmeFeatures);
    result.igmeCrossReference = {
      queried: true,
      endpoint: 'https://mapas.igme.es/gis/rest/services/BasesDatos/IGME_BDMIN_Indicios/MapServer/0/query',
      queryTime: igmeData.query_metadata.timestamp,
      resultsCount: igmeData.query_metadata.total_features,
      matchedAnomalies: crossRef.matched
    };
    
    setAnalysis(result);
    dispatch({ type: 'ADD_LOG', payload: `MINERAL-01: IGME query returned ${igmeData.query_metadata.total_features} mining indications` });
    dispatch({ type: 'ADD_AUDIT', payload: createAuditEntry('mineral01_query', 'igme', `Queried IGME BDMIN Indicios II: ${igmeData.query_metadata.total_features} results`) });
  };

  const exportGeoJSON = () => {
    if (!analysis) return;
    const geojson = exportAnomaliesToGeoJSON(analysis);
    
    geojson.igmeLayer = {
      type: 'FeatureCollection',
      features: filteredFeatures.map((f: any) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [f.geometry.x, f.geometry.y]
        },
        properties: {
          ...f.attributes,
          source: 'IGME_BDMIN_Indicios_II',
          dataClassification: 'OFFICIAL',
          queryTimestamp: igmeData.query_metadata.timestamp
        }
      }))
    };
    
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MINERAL01_anomalies_igme_${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">MINERAL-01 Mission</h2>
        <p className="text-gray-400 text-sm mt-1">
          Geospatial investigation for mining indications - Cortijo de Daniela, arroyo de Matarrama, Montemolín
        </p>
      </div>

      {/* Status Banner */}
      <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
        <p className="text-yellow-300 text-sm font-semibold">⚠️ MISSION STATUS: PARTIAL EXECUTION</p>
        <div className="text-xs text-yellow-200 mt-2 space-y-1">
          <p>✅ IGME BDMIN Indicios II query: <strong>COMPLETED</strong> ({igmeData.query_metadata.total_features} indications found)</p>
          <p>❌ LAZ processing: <strong>BLOCKED</strong> (file not provided)</p>
          <p>❌ Geomorphological analysis: <strong>BLOCKED</strong> (requires elevation data)</p>
          <p>❌ FIRECYCLE-AI integration: <strong>BLOCKED</strong> (repository not accessible)</p>
          <p className="mt-2 italic">No mining activity has been confirmed. Morphological analysis requires real elevation data.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-3">Analysis Controls</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400">Min Depth (m)</label>
              <input 
                type="number" 
                value={thresholds.minDepth} 
                onChange={e => setThresholds(t => ({ ...t, minDepth: parseFloat(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white mt-1"
                step="0.1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Min Area (m²)</label>
              <input 
                type="number" 
                value={thresholds.minArea} 
                onChange={e => setThresholds(t => ({ ...t, minArea: parseFloat(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Slope Threshold (°)</label>
              <input 
                type="number" 
                value={thresholds.slopeThreshold} 
                onChange={e => setThresholds(t => ({ ...t, slopeThreshold: parseFloat(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white mt-1"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-3">IGME Data</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Total indications:</span>
              <span className="text-white font-bold">{igmeData.query_metadata.total_features}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Query time:</span>
              <span className="text-white">{igmeData.query_metadata.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">CRS:</span>
              <span className="text-white">{igmeData.query_metadata.crs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="text-green-400 font-bold">SUCCESS</span>
            </div>
          </div>
          <div className="mt-3">
            <label className="text-xs text-gray-400">Filter by Municipality</label>
            <select 
              value={selectedMunicipality}
              onChange={e => setSelectedMunicipality(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white mt-1"
            >
              <option value="all">All Municipalities</option>
              {municipalities.map((m: string) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-3">Actions</h3>
          <div className="space-y-2">
            <button onClick={runAnalysis} className="w-full px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded">
              🔍 Run Analysis
            </button>
            <button onClick={() => setShowIGME(!showIGME)} className="w-full px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded">
              {showIGME ? '👁️ Hide' : '👁️ Show'} IGME Layer
            </button>
            <button onClick={exportGeoJSON} disabled={!analysis} className="w-full px-4 py-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-white rounded">
              📥 Export GeoJSON
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">Geospatial View (Canvas)</h3>
        <canvas ref={canvasRef} width={800} height={500} className="w-full rounded-lg border border-gray-700" />
        <p className="text-xs text-gray-500 mt-2">
          Map showing IGME mining indications in the query area. Red dots represent verified mining indications from official IGME database.
        </p>
      </div>

      {/* IGME Results Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-3">IGME Mining Indications ({filteredFeatures.length})</h3>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gray-900">
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="text-left py-2 px-2">Code</th>
                <th className="text-left py-2 px-2">Name</th>
                <th className="text-left py-2 px-2">Municipality</th>
                <th className="text-left py-2 px-2">Substance</th>
                <th className="text-left py-2 px-2">Morphology</th>
                <th className="text-left py-2 px-2">Coordinates</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeatures.map((f: any, i: number) => (
                <tr key={i} className="border-t border-gray-800 hover:bg-gray-800/50">
                  <td className="py-1.5 px-2 text-cyan-300 font-mono">{f.attributes.Codigo_indicio}</td>
                  <td className="py-1.5 px-2 text-white">{f.attributes.Nombre_mina || '-'}</td>
                  <td className="py-1.5 px-2 text-gray-300">{f.attributes.Municipio}</td>
                  <td className="py-1.5 px-2 text-gray-300">{f.attributes.Sustancia || '-'}</td>
                  <td className="py-1.5 px-2 text-gray-300">{f.attributes.Morfologia}</td>
                  <td className="py-1.5 px-2 text-gray-400 font-mono text-[10px]">
                    {f.geometry.y.toFixed(4)}, {f.geometry.x.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-3">Analysis Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-gray-800/50 rounded p-3">
              <div className="text-xl font-bold text-white">{analysis.statistics.totalAnomalies}</div>
              <div className="text-xs text-gray-500">Anomalies Detected</div>
            </div>
            <div className="bg-gray-800/50 rounded p-3">
              <div className="text-xl font-bold text-green-300">{analysis.igmeCrossReference.resultsCount}</div>
              <div className="text-xs text-gray-500">IGME Indications</div>
            </div>
            <div className="bg-gray-800/50 rounded p-3">
              <div className="text-xl font-bold text-amber-300">{analysis.statistics.anomaliesRequiringReview}</div>
              <div className="text-xs text-gray-500">Require Review</div>
            </div>
            <div className="bg-gray-800/50 rounded p-3">
              <div className="text-xl font-bold text-purple-300">{analysis.sourceData.type}</div>
              <div className="text-xs text-gray-500">Data Source</div>
            </div>
          </div>
          
          {analysis.warnings.length > 0 && (
            <div className="mt-4 bg-yellow-900/20 border border-yellow-800/50 rounded p-3">
              <h4 className="text-yellow-300 text-sm font-semibold mb-2">Warnings</h4>
              <ul className="text-xs text-yellow-200 space-y-1">
                {analysis.warnings.map((w, i) => (
                  <li key={i}>⚠️ {w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-5">
        <h3 className="text-red-300 font-semibold mb-2">⚠️ Scientific Disclaimer</h3>
        <div className="text-xs text-red-200 space-y-2">
          <p>• This mission does <strong>NOT</strong> confirm any mining activity.</p>
          <p>• Morphological analysis alone cannot prove mining exploitation.</p>
          <p>• Cadastral boundaries do not prove ownership or mining rights.</p>
          <p>• IGME indications are historical records, not field verifications.</p>
          <p>• <strong>Human expert review is required</strong> for any conclusions.</p>
          <p>• No simulated or fictitious data has been generated.</p>
          <p>• All IGME data is from official public service (verified endpoint).</p>
        </div>
      </div>
    </div>
  );
}
