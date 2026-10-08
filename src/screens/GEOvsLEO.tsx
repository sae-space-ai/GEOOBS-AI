import { useAppState } from '../store/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function GEOvsLEO() {
  const { state } = useAppState();

  // Simulated comparison data (GEO = geostationary like MTG-FCI, LEO = low-earth-orbit like METimage)
  const comparisonData = [
    { metric: 'Temporal Resolution', GEO: 95, LEO: 40, unit: 'score' },
    { metric: 'Spatial Resolution', GEO: 50, LEO: 90, unit: 'score' },
    { metric: 'Feature Density', GEO: 70, LEO: 75, unit: 'score' },
    { metric: 'Geolocation Accuracy', GEO: 80, LEO: 85, unit: 'score' },
    { metric: 'Cloud Penetration', GEO: 60, LEO: 55, unit: 'score' },
    { metric: 'Coverage per Pass', GEO: 90, LEO: 30, unit: 'score' },
  ];

  const observablesByScene = state.syntheticScenes.map((s, i) => ({
    scene: `Scene ${i + 1}`,
    type: s.width > 1000 ? 'GEO-like' : 'LEO-like',
    features: s.refFeatures.length,
    matches: s.matches.filter(m => m.inlier).length
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">GEO vs LEO Comparison</h2>
        <p className="text-gray-400 text-sm mt-1">Comparative analysis between geostationary (MTG-FCI) and polar-orbiting (METimage) observation characteristics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Comparison Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-4">Capability Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <YAxis dataKey="metric" type="category" tick={{ fontSize: 10, fill: '#9CA3AF' }} width={120} />
              <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 4, fontSize: 11 }} />
              <Legend />
              <Bar dataKey="GEO" fill="#06b6d4" name="GEO (MTG-FCI)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="LEO" fill="#a855f7" name="LEO (METimage)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Key Differences */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-4">Key Technical Differences</h3>
          <div className="space-y-3 text-sm">
            <div className="border-l-2 border-cyan-500 pl-3">
              <div className="text-cyan-300 font-medium">MTG-FCI (Geostationary)</div>
              <div className="text-gray-400 text-xs mt-1">1 km at subsatellite point • 15 min (FDHS) / 2.5 min (HR) • 16 spectral channels • Continuous disk coverage</div>
            </div>
            <div className="border-l-2 border-purple-500 pl-3">
              <div className="text-purple-300 font-medium">METimage (Polar Orbit)</div>
              <div className="text-gray-400 text-xs mt-1">~500 m resolution • Twice daily per location • 20+ spectral channels • Higher spatial detail</div>
            </div>
            <div className="border-l-2 border-amber-500 pl-3">
              <div className="text-amber-300 font-medium">Implications for GQA</div>
              <div className="text-gray-400 text-xs mt-1">GEO: better temporal tracking of displacements. LEO: better spatial accuracy per feature. Combined: complementary constraints.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scene Analysis */}
      {observablesByScene.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-3">Scene Analysis</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="text-left py-2 px-3">Scene</th>
                  <th className="text-left py-2 px-3">Type</th>
                  <th className="text-left py-2 px-3">Features</th>
                  <th className="text-left py-2 px-3">Valid Matches</th>
                </tr>
              </thead>
              <tbody>
                {observablesByScene.map((s, i) => (
                  <tr key={i} className="border-t border-gray-800">
                    <td className="py-1.5 px-3 text-white">{s.scene}</td>
                    <td className="py-1.5 px-3"><span className={`px-1.5 py-0.5 rounded text-xs ${s.type === 'GEO-like' ? 'bg-cyan-900/50 text-cyan-300' : 'bg-purple-900/50 text-purple-300'}`}>{s.type}</span></td>
                    <td className="py-1.5 px-3 text-gray-300">{s.features}</td>
                    <td className="py-1.5 px-3 text-green-300">{s.matches}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-yellow-800/50 rounded-lg p-5">
        <h3 className="text-yellow-300 font-semibold mb-2">⚠️ Comparative Analysis Status</h3>
        <div className="text-sm text-gray-400 space-y-1">
          <p>• Scores above are illustrative based on instrument specifications</p>
          <p>• Real comparative analysis requires authentic FCI and METimage L1b products</p>
          <p>• Cross-instrument feature matching methodology pending validation</p>
          <p>• Geolocation error models differ between GEO and LEO platforms</p>
        </div>
      </div>
    </div>
  );
}
