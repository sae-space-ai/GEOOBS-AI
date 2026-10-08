import { useAppState } from '../store/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ChannelComparison() {
  const { state } = useAppState();

  // Simulated channel performance data based on FCI spectral characteristics
  const channelData = [
    { channel: 'VIS004', wavelength: 0.44, detectability: 65, usable: 'day-only', features: 45 },
    { channel: 'VIS005', wavelength: 0.51, detectability: 72, usable: 'day-only', features: 52 },
    { channel: 'VIS006', wavelength: 0.64, detectability: 85, usable: 'day-only', features: 68 },
    { channel: 'VIS008', wavelength: 0.81, detectability: 78, usable: 'day-only', features: 61 },
    { channel: 'VIS009', wavelength: 0.91, detectability: 70, usable: 'day-only', features: 55 },
    { channel: 'NIR13', wavelength: 1.38, detectability: 55, usable: 'day-only', features: 38 },
    { channel: 'NIR16', wavelength: 1.61, detectability: 60, usable: 'day-only', features: 42 },
    { channel: 'NIR22', wavelength: 2.25, detectability: 50, usable: 'day-only', features: 35 },
    { channel: 'WV063', wavelength: 6.3, detectability: 40, usable: 'day+night', features: 28 },
    { channel: 'WV073', wavelength: 7.3, detectability: 45, usable: 'day+night', features: 32 },
    { channel: 'IR038', wavelength: 3.8, detectability: 55, usable: 'day+night', features: 40 },
    { channel: 'IR087', wavelength: 8.7, detectability: 50, usable: 'day+night', features: 36 },
    { channel: 'IR097', wavelength: 9.7, detectability: 42, usable: 'day+night', features: 30 },
    { channel: 'IR105', wavelength: 10.5, detectability: 60, usable: 'day+night', features: 44 },
    { channel: 'IR123', wavelength: 12.3, detectability: 65, usable: 'day+night', features: 48 },
    { channel: 'IR133', wavelength: 13.3, detectability: 48, usable: 'day+night', features: 34 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Spectral Channel Comparison</h2>
        <p className="text-gray-400 text-sm mt-1">Analysis of feature detectability across MTG-FCI spectral channels</p>
      </div>

      {/* Channel Performance Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-4">Feature Detectability by Channel</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={channelData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="channel" tick={{ fontSize: 9, fill: '#9CA3AF' }} angle={-45} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 4, fontSize: 11 }} />
            <Bar dataKey="detectability" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Detectability Score" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Channel Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-3">Channel Characteristics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="text-left py-2 px-3">Channel</th>
                <th className="text-left py-2 px-3">λ (μm)</th>
                <th className="text-left py-2 px-3">Type</th>
                <th className="text-left py-2 px-3">Detectability</th>
                <th className="text-left py-2 px-3">Usable</th>
                <th className="text-left py-2 px-3">Est. Features</th>
                <th className="text-left py-2 px-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {channelData.map(ch => (
                <tr key={ch.channel} className="border-t border-gray-800 hover:bg-gray-800/50">
                  <td className="py-1.5 px-3 text-white font-medium">{ch.channel}</td>
                  <td className="py-1.5 px-3 text-gray-300">{ch.wavelength}</td>
                  <td className="py-1.5 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                      ch.channel.startsWith('VIS') ? 'bg-yellow-900/50 text-yellow-300' :
                      ch.channel.startsWith('NIR') ? 'bg-orange-900/50 text-orange-300' :
                      ch.channel.startsWith('WV') ? 'bg-blue-900/50 text-blue-300' :
                      'bg-red-900/50 text-red-300'
                    }`}>{ch.channel.startsWith('VIS') ? 'Visible' : ch.channel.startsWith('NIR') ? 'NIR' : ch.channel.startsWith('WV') ? 'Water Vapor' : 'Thermal IR'}</span>
                  </td>
                  <td className="py-1.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${ch.detectability}%`, background: ch.detectability > 70 ? '#22c55e' : ch.detectability > 50 ? '#f59e0b' : '#ef4444' }}></div>
                      </div>
                      <span className="text-gray-300">{ch.detectability}</span>
                    </div>
                  </td>
                  <td className="py-1.5 px-3 text-gray-400">{ch.usable}</td>
                  <td className="py-1.5 px-3 text-cyan-300">{ch.features}</td>
                  <td className="py-1.5 px-3 text-gray-500 italic">
                    {ch.channel.startsWith('VIS') ? 'Surface features, clouds' :
                     ch.channel.startsWith('NIR') ? 'Vegetation, moisture' :
                     ch.channel.startsWith('WV') ? 'Upper troposphere' :
                     'Cloud top temp, surface'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-900 border border-yellow-800/50 rounded-lg p-5">
        <h3 className="text-yellow-300 font-semibold mb-2">⚠️ Channel Analysis Notes</h3>
        <div className="text-sm text-gray-400 space-y-1">
          <p>• Detectability scores are estimated from instrument specifications and typical scene contrast</p>
          <p>• VIS channels only usable during daytime; IR/WV channels usable day and night</p>
          <p>• Same physical feature may not be detectable across all bands — cross-channel matching requires careful validation</p>
          <p>• Real channel performance requires authentic FCI L1b data with calibrated radiances</p>
          <p>• Twilight conditions create mixed illumination challenges for VIS channels</p>
        </div>
      </div>
    </div>
  );
}
