import { useAppState } from '../store/AppContext';
import { useState } from 'react';

export function ReportCenter() {
  const { state } = useAppState();
  const [reportType, setReportType] = useState<'full' | 'gqa' | 'observables' | 'experiments'>('full');

  const generateReport = () => {
    const timestamp = new Date().toISOString();
    let content = '';

    if (reportType === 'full') {
      content = `GEOOBS-AI FULL REPORT
Generated: ${timestamp}
Version: ${state.systemStatus.version}
===========================================

1. SYSTEM STATUS
   Frontend: ${state.systemStatus.frontend}
   Backend: ${state.systemStatus.backend}
   Scientific Service: ${state.systemStatus.scientificService}

2. DATA INVENTORY
   Images loaded: ${state.images.length}
   Synthetic scenes: ${state.syntheticScenes.length}
   
3. OBSERVABLES SUMMARY
   Total observables: ${state.observables.length}
   Accepted: ${state.observables.filter(o => o.status === 'accepted').length}
   Rejected: ${state.observables.filter(o => o.status === 'rejected').length}
   Cloud contaminated: ${state.observables.filter(o => o.status === 'cloud_contaminated').length}

4. GQA RESULTS (${state.gqaResults.length} assessments)
${state.gqaResults.map((g, i) => `   [${i+1}] RMSE=${g.rmseTotal.toFixed(4)}px, Bias=(${g.meanBiasX.toFixed(4)},${g.meanBiasY.toFixed(4)}), Coverage=${(g.spatialCoverageRatio*100).toFixed(1)}%, Valid=${(g.validRatio*100).toFixed(1)}%`).join('\n')}

5. EXPERIMENTS (${state.experiments.length})
${state.experiments.map(e => `   ${e.name}: ${e.detectorMethod}, RMSE=${e.results.rmse?.toFixed(4) || 'N/A'}, Status=${e.status}`).join('\n')}

6. MODELS
   Registered models: ${state.models.length}

7. COMPLIANCE NOTES
   - Synthetic data validation: OPERATIONAL
   - FCI adapter: PENDING authentic products
   - METimage adapter: PENDING authentic products
   - GSoW EUM/RSP/SOW/18/985385 review: PENDING
   - Full EUMETSAT compliance: REQUIRES complete SoW review

===========================================
END OF REPORT
`;
    } else if (reportType === 'gqa') {
      content = `GQA REPORT — ${timestamp}\n\n`;
      state.gqaResults.forEach((g, i) => {
        content += `Assessment ${i+1}:\n  Observables: ${g.observableCount}\n  RMSE: ${g.rmseTotal.toFixed(4)}px\n  Bias: (${g.meanBiasX.toFixed(4)}, ${g.meanBiasY.toFixed(4)})\n  P95: ${g.p95.toFixed(4)}px\n  Coverage: ${(g.spatialCoverageRatio*100).toFixed(1)}%\n\n`;
      });
    } else if (reportType === 'observables') {
      content = `OBSERVABLES EXPORT — ${timestamp}\n\n`;
      content += `ID,Instrument,Platform,Level,Band,Row,Col,DX,DY,Mag,Dir,Quality,Method,Status\n`;
      state.observables.forEach(o => {
        content += `${o.id},${o.instrument},${o.platform},${o.productLevel},${o.spectralBand},${o.pixelPosition.row.toFixed(1)},${o.pixelPosition.col.toFixed(1)},${o.displacement.dx_pixels.toFixed(4)},${o.displacement.dy_pixels.toFixed(4)},${o.displacement.magnitude_pixels.toFixed(4)},${o.displacement.direction_deg.toFixed(2)},${o.qualityMetric.toFixed(4)},${o.detectionMethod},${o.status}\n`;
      });
    } else {
      content = `EXPERIMENTS REPORT — ${timestamp}\n\n`;
      state.experiments.forEach(e => {
        content += `${e.name}\n  Method: ${e.detectorMethod}\n  RMSE: ${e.results.rmse?.toFixed(4) || 'N/A'}\n  Precision: ${e.results.precision?.toFixed(4) || 'N/A'}\n  Features: ${e.results.featureCount || 'N/A'}\n  Inlier Ratio: ${e.results.inlierRatio?.toFixed(4) || 'N/A'}\n  CPU Time: ${e.cpuTime?.toFixed(0) || 'N/A'}ms\n\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geobs-report-${reportType}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Report Center</h2>
        <p className="text-gray-400 text-sm mt-1">Generate and export comprehensive reports of all analysis results</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-4">Report Configuration</h3>
        <div className="flex gap-3 mb-4">
          {[
            { id: 'full' as const, label: 'Full Report' },
            { id: 'gqa' as const, label: 'GQA Only' },
            { id: 'observables' as const, label: 'Observables CSV' },
            { id: 'experiments' as const, label: 'Experiments' },
          ].map(r => (
            <button key={r.id} onClick={() => setReportType(r.id)} className={`px-4 py-2 rounded text-sm ${reportType === r.id ? 'bg-cyan-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              {r.label}
            </button>
          ))}
        </div>
        <button onClick={generateReport} className="px-6 py-2 bg-green-700 hover:bg-green-600 text-white rounded transition-colors">
          📋 Generate & Download Report
        </button>
      </div>

      {/* Preview */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-3">Data Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-800/50 rounded p-3">
            <div className="text-2xl font-bold text-white">{state.observables.length}</div>
            <div className="text-xs text-gray-500">Observables</div>
          </div>
          <div className="bg-gray-800/50 rounded p-3">
            <div className="text-2xl font-bold text-green-300">{state.gqaResults.length}</div>
            <div className="text-xs text-gray-500">GQA Assessments</div>
          </div>
          <div className="bg-gray-800/50 rounded p-3">
            <div className="text-2xl font-bold text-purple-300">{state.experiments.length}</div>
            <div className="text-xs text-gray-500">Experiments</div>
          </div>
          <div className="bg-gray-800/50 rounded p-3">
            <div className="text-2xl font-bold text-cyan-300">{state.auditLog.length}</div>
            <div className="text-xs text-gray-500">Audit Entries</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-3">Export Formats</h3>
        <div className="text-sm text-gray-400 space-y-2">
          <p>• <span className="text-green-400">✓</span> Plain text reports (.txt)</p>
          <p>• <span className="text-green-400">✓</span> JSON export (observables, GQA results)</p>
          <p>• <span className="text-green-400">✓</span> CSV export (observables table)</p>
          <p>• <span className="text-yellow-400">⏳</span> NetCDF export — requires Python scientific service</p>
          <p>• <span className="text-yellow-400">⏳</span> CF-compliant metadata — requires instrument-specific conventions</p>
        </div>
      </div>
    </div>
  );
}
