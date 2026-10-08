import { useAppState } from '../store/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line } from 'recharts';

export function GQAEvaluation() {
  const { state } = useAppState();
  const latestGQA = state.gqaResults[state.gqaResults.length - 1];

  // Prepare distribution data from observables
  const magnitudes = state.observables.filter(o => o.status === 'accepted').map(o => o.displacement.magnitude_pixels);
  const dxs = state.observables.filter(o => o.status === 'accepted').map(o => o.displacement.dx_pixels);
  const dys = state.observables.filter(o => o.status === 'accepted').map(o => o.displacement.dy_pixels);

  // Histogram data
  const histogramData = (() => {
    if (magnitudes.length === 0) return [];
    const bins = 20;
    const max = Math.max(...magnitudes, 0.1);
    const binWidth = max / bins;
    const counts = new Array(bins).fill(0);
    for (const m of magnitudes) {
      const bin = Math.min(Math.floor(m / binWidth), bins - 1);
      counts[bin]++;
    }
    return counts.map((c, i) => ({ range: (i * binWidth).toFixed(2), count: c }));
  })();

  // Scatter data
  const scatterData = state.observables.filter(o => o.status === 'accepted').slice(0, 500).map(o => ({
    x: o.displacement.dx_pixels,
    y: o.displacement.dy_pixels,
    quality: o.qualityMetric
  }));

  // GQA evolution
  const evolutionData = state.gqaResults.map((g, i) => ({
    index: i + 1,
    rmse: g.rmseTotal,
    bias: Math.sqrt(g.meanBiasX ** 2 + g.meanBiasY ** 2),
    coverage: g.spatialCoverageRatio * 100
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Geometric Quality Assessment</h2>
        <p className="text-gray-400 text-sm mt-1">Statistical evaluation of geometric observables: bias, RMSE, coverage, and distributions</p>
      </div>

      {state.gqaResults.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
          <p className="text-4xl mb-4">✅</p>
          <p className="text-gray-500">No GQA results yet. Generate observables from Feature Detection first.</p>
        </div>
      ) : (
        <>
          {/* Latest GQA Metrics */}
          {latestGQA && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <h3 className="text-white font-semibold mb-4">Latest Assessment — {new Date(latestGQA.computedAt).toLocaleString()}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <MetricCard label="Observables" value={latestGQA.observableCount.toString()} color="white" />
                <MetricCard label="Valid Ratio" value={`${(latestGQA.validRatio * 100).toFixed(1)}%`} color="green" />
                <MetricCard label="Mean Bias X" value={`${latestGQA.meanBiasX.toFixed(3)} px`} color="cyan" />
                <MetricCard label="Mean Bias Y" value={`${latestGQA.meanBiasY.toFixed(3)} px`} color="cyan" />
                <MetricCard label="RMSE Total" value={`${latestGQA.rmseTotal.toFixed(3)} px`} color="amber" />
                <MetricCard label="RMSE X" value={`${latestGQA.rmseX.toFixed(3)} px`} color="amber" />
                <MetricCard label="RMSE Y" value={`${latestGQA.rmseY.toFixed(3)} px`} color="amber" />
                <MetricCard label="Median Δx" value={`${latestGQA.medianBiasX.toFixed(3)} px`} color="purple" />
                <MetricCard label="Median Δy" value={`${latestGQA.medianBiasY.toFixed(3)} px`} color="purple" />
                <MetricCard label="P50" value={`${latestGQA.p50.toFixed(3)} px`} color="blue" />
                <MetricCard label="P90" value={`${latestGQA.p90.toFixed(3)} px`} color="blue" />
                <MetricCard label="P95" value={`${latestGQA.p95.toFixed(3)} px`} color="blue" />
                <MetricCard label="P99" value={`${latestGQA.p99.toFixed(3)} px`} color="blue" />
                <MetricCard label="Std X" value={`${latestGQA.stdX.toFixed(3)} px`} color="gray" />
                <MetricCard label="Std Y" value={`${latestGQA.stdY.toFixed(3)} px`} color="gray" />
                <MetricCard label="Coverage" value={`${(latestGQA.spatialCoverageRatio * 100).toFixed(1)}%`} color="green" />
                <MetricCard label="Grid Cells" value={`${latestGQA.gridCellsCovered}/${latestGQA.gridCellsTotal}`} color="white" />
                <MetricCard label="Accepted" value={latestGQA.acceptedCount.toString()} color="green" />
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Magnitude Distribution */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h4 className="text-sm text-gray-300 mb-3">Displacement Magnitude Distribution</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={histogramData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 4, fontSize: 11 }} />
                  <Bar dataKey="count" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Displacement Scatter */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h4 className="text-sm text-gray-300 mb-3">Displacement Vectors (Δx vs Δy)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="x" name="Δx" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <YAxis dataKey="y" name="Δy" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 4, fontSize: 11 }} />
                  <Scatter data={scatterData} fill="#a855f7" fillOpacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* GQA Evolution */}
            {evolutionData.length > 1 && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 md:col-span-2">
                <h4 className="text-sm text-gray-300 mb-3">GQA Evolution Across Assessments</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="index" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                    <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 4, fontSize: 11 }} />
                    <Line type="monotone" dataKey="rmse" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="RMSE" />
                    <Line type="monotone" dataKey="bias" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} name="|Bias|" />
                    <Line type="monotone" dataKey="coverage" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Coverage %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* All GQA Results */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h3 className="text-white font-semibold mb-3">All GQA Results ({state.gqaResults.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400">
                    <th className="text-left py-2 px-2">#</th>
                    <th className="text-left py-2 px-2">Time</th>
                    <th className="text-left py-2 px-2">Count</th>
                    <th className="text-left py-2 px-2">Valid%</th>
                    <th className="text-left py-2 px-2">Bias X</th>
                    <th className="text-left py-2 px-2">Bias Y</th>
                    <th className="text-left py-2 px-2">RMSE</th>
                    <th className="text-left py-2 px-2">P95</th>
                    <th className="text-left py-2 px-2">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {state.gqaResults.map((g, i) => (
                    <tr key={g.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                      <td className="py-1.5 px-2 text-gray-500">{i + 1}</td>
                      <td className="py-1.5 px-2 text-gray-400">{new Date(g.computedAt).toLocaleTimeString()}</td>
                      <td className="py-1.5 px-2 text-white">{g.observableCount}</td>
                      <td className="py-1.5 px-2 text-green-300">{(g.validRatio * 100).toFixed(1)}%</td>
                      <td className="py-1.5 px-2 text-cyan-300">{g.meanBiasX.toFixed(3)}</td>
                      <td className="py-1.5 px-2 text-cyan-300">{g.meanBiasY.toFixed(3)}</td>
                      <td className="py-1.5 px-2 text-amber-300">{g.rmseTotal.toFixed(3)}</td>
                      <td className="py-1.5 px-2 text-blue-300">{g.p95.toFixed(3)}</td>
                      <td className="py-1.5 px-2 text-purple-300">{(g.spatialCoverageRatio * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    white: 'text-white', green: 'text-green-300', cyan: 'text-cyan-300',
    amber: 'text-amber-300', purple: 'text-purple-300', blue: 'text-blue-300', gray: 'text-gray-300'
  };
  return (
    <div className="bg-gray-800/50 rounded p-2">
      <div className={`text-sm font-bold ${colorMap[color] || 'text-white'}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
