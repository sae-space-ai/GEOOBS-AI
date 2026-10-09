import { useAppState } from '../store/AppContext';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { state } = useAppState();

  const stats = [
    { label: 'Images Loaded', value: state.images.length, icon: '🛰️', gradient: 'from-sky-400 to-blue-500' },
    { label: 'Synthetic Scenes', value: state.syntheticScenes.length, icon: '🎬', gradient: 'from-purple-400 to-indigo-500' },
    { label: 'Observables', value: state.observables.length, icon: '📐', gradient: 'from-emerald-400 to-teal-500' },
    { label: 'GQA Results', value: state.gqaResults.length, icon: '✅', gradient: 'from-amber-400 to-orange-500' },
    { label: 'Experiments', value: state.experiments.length, icon: '🧪', gradient: 'from-pink-400 to-rose-500' },
    { label: 'Models', value: state.models.length, icon: '🤖', gradient: 'from-indigo-400 to-violet-500' },
  ];

  const latestGQA = state.gqaResults[state.gqaResults.length - 1];
  const latestScene = state.currentScene;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h2>
          <p className="text-slate-600 text-sm mt-2">Geometric Earth Observation Intelligence System — Overview</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-full font-semibold border border-amber-200 shadow-sm">
            ALPHA v{state.systemStatus.version}
          </span>
          <span className="px-4 py-2 bg-white text-slate-600 rounded-full border border-slate-200 shadow-sm font-medium">
            Local-first
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all card-hover">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-2xl mb-3 shadow-sm`}>
              {s.icon}
            </div>
            <div className="text-3xl font-bold text-slate-800">{s.value}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link to="/features" className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all card-hover group">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl mb-4 shadow-md group-hover:scale-110 transition-transform">
            🎯
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Run Feature Detection</h3>
          <p className="text-slate-600 text-sm">Generate synthetic scenes and detect features using Shi-Tomasi and ORB algorithms with RANSAC matching.</p>
        </Link>
        <Link to="/gqa" className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-lg transition-all card-hover group">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-3xl mb-4 shadow-md group-hover:scale-110 transition-transform">
            ✅
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Compute GQA Metrics</h3>
          <p className="text-slate-600 text-sm">Calculate geometric quality assessment metrics: bias, RMSE, percentiles, spatial coverage.</p>
        </Link>
        <Link to="/three-gqa" className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-amber-300 hover:shadow-lg transition-all card-hover group">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-3xl mb-4 shadow-md group-hover:scale-110 transition-transform">
            📐
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Three GQA Engines</h3>
          <p className="text-slate-600 text-sm">Absolute Navigation, Interchannel Registration, and Temporal Registration GQA modes with automated tests.</p>
        </Link>
      </div>

      {/* Latest Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Latest GQA */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xl shadow-sm">
              ✅
            </div>
            <h3 className="text-lg font-bold text-slate-800">Latest GQA Result</h3>
          </div>
          {latestGQA ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Observables:</span>
                <span className="text-slate-800 font-bold">{latestGQA.observableCount}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Valid Ratio:</span>
                <span className="text-emerald-600 font-bold">{(latestGQA.validRatio * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Mean Bias X:</span>
                <span className="text-indigo-600 font-bold">{latestGQA.meanBiasX.toFixed(3)} px</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Mean Bias Y:</span>
                <span className="text-indigo-600 font-bold">{latestGQA.meanBiasY.toFixed(3)} px</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">RMSE Total:</span>
                <span className="text-amber-600 font-bold">{latestGQA.rmseTotal.toFixed(3)} px</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">P95:</span>
                <span className="text-purple-600 font-bold">{latestGQA.p95.toFixed(3)} px</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 font-medium">Coverage:</span>
                <span className="text-teal-600 font-bold">{(latestGQA.spatialCoverageRatio * 100).toFixed(1)}%</span>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm italic">No GQA results yet. Run feature detection first.</p>
          )}
        </div>

        {/* Current Scene */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-xl shadow-sm">
              🎬
            </div>
            <h3 className="text-lg font-bold text-slate-800">Current Scene</h3>
          </div>
          {latestScene ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Name:</span>
                <span className="text-slate-800 font-bold truncate ml-2 max-w-[200px]">{latestScene.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Size:</span>
                <span className="text-slate-800 font-bold">{latestScene.width}×{latestScene.height}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Known Δx:</span>
                <span className="text-indigo-600 font-bold">{latestScene.knownDisplacement.dx_pixels.toFixed(2)} px</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Known Δy:</span>
                <span className="text-indigo-600 font-bold">{latestScene.knownDisplacement.dy_pixels.toFixed(2)} px</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Ref Features:</span>
                <span className="text-slate-800 font-bold">{latestScene.refFeatures.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Matches:</span>
                <span className="text-emerald-600 font-bold">{latestScene.matches.filter(m => m.inlier).length}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 font-medium">Cloud:</span>
                <span className="text-slate-800 font-bold">{(latestScene.cloudCoverage * 100).toFixed(0)}%</span>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm italic">No scene loaded. Go to Feature Detection to generate synthetic data.</p>
          )}
        </div>
      </div>

      {/* Processing Log */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-xl shadow-sm">
            📝
          </div>
          <h3 className="text-lg font-bold text-slate-800">Processing Log</h3>
        </div>
        <div className="max-h-48 overflow-y-auto bg-slate-50 rounded-xl p-4 border border-slate-200">
          {state.processingLog.length === 0 ? (
            <p className="text-slate-400 text-sm italic text-center py-4">No processing events yet.</p>
          ) : (
            <div className="font-mono text-xs text-slate-600 space-y-1.5">
              {state.processingLog.slice(-20).reverse().map((log, i) => (
                <div key={i} className="py-1.5 px-3 bg-white rounded-lg border border-slate-100">{log}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Compliance Status */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl shadow-sm">
            ⚠️
          </div>
          <h3 className="text-lg font-bold text-amber-800">EUMETSAT Compliance Status</h3>
        </div>
        <div className="text-sm text-amber-900 space-y-2">
          <p>• <span className="text-emerald-600 font-semibold">✓</span> Synthetic data generation and feature detection operational</p>
          <p>• <span className="text-emerald-600 font-semibold">✓</span> GQA metrics computation operational</p>
          <p>• <span className="text-emerald-600 font-semibold">✓</span> Observable schema defined and populated</p>
          <p>• <span className="text-amber-600 font-semibold">⏳</span> FCI/METimage adapter validation pending authentic products</p>
          <p>• <span className="text-amber-600 font-semibold">⏳</span> Backend (FastAPI/Node.js) not deployed in this environment</p>
          <p>• <span className="text-amber-600 font-semibold">⏳</span> GSoW EUM/RSP/SOW/18/985385 review pending</p>
          <p className="text-amber-700 mt-4 italic text-xs bg-white/50 p-3 rounded-lg border border-amber-200">
            Full contractual compliance requires review of complete Statement of Work and validation with authentic EUMETSAT products.
          </p>
        </div>
      </div>
    </div>
  );
}
