import { useAppState } from '../store/AppContext';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { state } = useAppState();

  const stats = [
    { label: 'Images Loaded', value: state.images.length, icon: '🛰️', color: 'cyan' },
    { label: 'Synthetic Scenes', value: state.syntheticScenes.length, icon: '🎬', color: 'purple' },
    { label: 'Observables', value: state.observables.length, icon: '📐', color: 'green' },
    { label: 'GQA Results', value: state.gqaResults.length, icon: '✅', color: 'yellow' },
    { label: 'Experiments', value: state.experiments.length, icon: '🧪', color: 'pink' },
    { label: 'Models', value: state.models.length, icon: '🤖', color: 'blue' },
  ];

  const latestGQA = state.gqaResults[state.gqaResults.length - 1];
  const latestScene = state.currentScene;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-400 text-sm mt-1">Geometric Earth Observation Intelligence System — Overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded">ALPHA v{state.systemStatus.version}</span>
          <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded">Local-first</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/features" className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/10 border border-cyan-800/50 rounded-lg p-5 hover:border-cyan-600 transition-colors">
          <h3 className="text-cyan-300 font-semibold">🎯 Run Feature Detection</h3>
          <p className="text-gray-400 text-sm mt-2">Generate synthetic scenes and detect features using Shi-Tomasi and ORB algorithms with RANSAC matching.</p>
        </Link>
        <Link to="/gqa" className="bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-800/50 rounded-lg p-5 hover:border-green-600 transition-colors">
          <h3 className="text-green-300 font-semibold">✅ Compute GQA Metrics</h3>
          <p className="text-gray-400 text-sm mt-2">Calculate geometric quality assessment metrics: bias, RMSE, percentiles, spatial coverage.</p>
        </Link>
        <Link to="/reports" className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-800/50 rounded-lg p-5 hover:border-purple-600 transition-colors">
          <h3 className="text-purple-300 font-semibold">📋 Generate Report</h3>
          <p className="text-gray-400 text-sm mt-2">Export comprehensive reports with observables, GQA results, and validation status.</p>
        </Link>
      </div>

      {/* Latest Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Latest GQA */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-3">Latest GQA Result</h3>
          {latestGQA ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Observables:</span><span className="text-white">{latestGQA.observableCount}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Valid Ratio:</span><span className="text-white">{(latestGQA.validRatio * 100).toFixed(1)}%</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Mean Bias X:</span><span className="text-white">{latestGQA.meanBiasX.toFixed(3)} px</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Mean Bias Y:</span><span className="text-white">{latestGQA.meanBiasY.toFixed(3)} px</span></div>
              <div className="flex justify-between"><span className="text-gray-400">RMSE Total:</span><span className="text-white">{latestGQA.rmseTotal.toFixed(3)} px</span></div>
              <div className="flex justify-between"><span className="text-gray-400">P95:</span><span className="text-white">{latestGQA.p95.toFixed(3)} px</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Coverage:</span><span className="text-white">{(latestGQA.spatialCoverageRatio * 100).toFixed(1)}%</span></div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No GQA results yet. Run feature detection first.</p>
          )}
        </div>

        {/* Current Scene */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-3">Current Scene</h3>
          {latestScene ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Name:</span><span className="text-white truncate ml-2">{latestScene.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Size:</span><span className="text-white">{latestScene.width}×{latestScene.height}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Known Δx:</span><span className="text-cyan-300">{latestScene.knownDisplacement.dx_pixels.toFixed(2)} px</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Known Δy:</span><span className="text-cyan-300">{latestScene.knownDisplacement.dy_pixels.toFixed(2)} px</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Ref Features:</span><span className="text-white">{latestScene.refFeatures.length}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Matches:</span><span className="text-white">{latestScene.matches.filter(m => m.inlier).length}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Cloud:</span><span className="text-white">{(latestScene.cloudCoverage * 100).toFixed(0)}%</span></div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No scene loaded. Go to Feature Detection to generate synthetic data.</p>
          )}
        </div>
      </div>

      {/* Processing Log */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-3">Processing Log</h3>
        <div className="max-h-40 overflow-y-auto font-mono text-xs text-gray-400 space-y-1">
          {state.processingLog.length === 0 ? (
            <p className="text-gray-600">No processing events yet.</p>
          ) : (
            state.processingLog.slice(-20).reverse().map((log, i) => (
              <div key={i}>{log}</div>
            ))
          )}
        </div>
      </div>

      {/* Compliance Status */}
      <div className="bg-gray-900 border border-yellow-800/50 rounded-lg p-5">
        <h3 className="text-yellow-300 font-semibold mb-3">⚠️ EUMETSAT Compliance Status</h3>
        <div className="text-sm text-gray-400 space-y-2">
          <p>• <span className="text-green-400">✓</span> Synthetic data generation and feature detection operational</p>
          <p>• <span className="text-green-400">✓</span> GQA metrics computation operational</p>
          <p>• <span className="text-green-400">✓</span> Observable schema defined and populated</p>
          <p>• <span className="text-yellow-400">⏳</span> FCI/METimage adapter validation pending authentic products</p>
          <p>• <span className="text-yellow-400">⏳</span> Backend (FastAPI/Node.js) not deployed in this environment</p>
          <p>• <span className="text-yellow-400">⏳</span> GSoW EUM/RSP/SOW/18/985385 review pending</p>
          <p className="text-gray-500 mt-3 italic">Full contractual compliance requires review of complete Statement of Work and validation with authentic EUMETSAT products.</p>
        </div>
      </div>
    </div>
  );
}
