import { useAppState } from '../store/AppContext';

export function ProductExplorer() {
  const { state } = useAppState();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Satellite Product Explorer</h2>
        <p className="text-gray-400 text-sm mt-1">Browse and inspect loaded satellite products and their metadata</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-3">Available Products</h3>
        {state.images.length === 0 && state.syntheticScenes.length === 0 ? (
          <p className="text-gray-500 text-sm">No products loaded. Use Image Acquisition to load data.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="text-left py-2 px-3">ID</th>
                  <th className="text-left py-2 px-3">Source</th>
                  <th className="text-left py-2 px-3">Instrument</th>
                  <th className="text-left py-2 px-3">Level</th>
                  <th className="text-left py-2 px-3">Size</th>
                  <th className="text-left py-2 px-3">Time</th>
                  <th className="text-left py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {state.images.map(img => (
                  <tr key={img.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-2 px-3 font-mono text-xs text-gray-400">{img.id.slice(0, 8)}</td>
                    <td className="py-2 px-3 text-white">{img.filename}</td>
                    <td className="py-2 px-3 text-cyan-300">{img.instrument}</td>
                    <td className="py-2 px-3"><span className="px-1.5 py-0.5 bg-blue-900/50 text-blue-300 rounded text-xs">{img.productLevel}</span></td>
                    <td className="py-2 px-3 text-gray-300">{img.width}×{img.height}</td>
                    <td className="py-2 px-3 text-gray-400 text-xs">{new Date(img.acquisitionTime).toLocaleString()}</td>
                    <td className="py-2 px-3"><span className="text-green-400 text-xs">loaded</span></td>
                  </tr>
                ))}
                {state.syntheticScenes.map(s => (
                  <tr key={s.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-2 px-3 font-mono text-xs text-gray-400">{s.id.slice(0, 8)}</td>
                    <td className="py-2 px-3 text-white">{s.name}</td>
                    <td className="py-2 px-3 text-purple-300">SYNTHETIC</td>
                    <td className="py-2 px-3"><span className="px-1.5 py-0.5 bg-purple-900/50 text-purple-300 rounded text-xs">L1b-sim</span></td>
                    <td className="py-2 px-3 text-gray-300">{s.width}×{s.height}</td>
                    <td className="py-2 px-3 text-gray-400 text-xs">synthetic</td>
                    <td className="py-2 px-3"><span className="text-purple-400 text-xs">synthetic</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-yellow-800/50 rounded-lg p-5">
        <h3 className="text-yellow-300 font-semibold mb-2">⚠️ Data Format Support</h3>
        <div className="text-sm text-gray-400 space-y-1">
          <p>• <span className="text-green-400">✓</span> Standard image formats (PNG, JPEG) — via browser File API</p>
          <p>• <span className="text-yellow-400">⏳</span> NetCDF/HDF5 (FCI L1b/L1c) — requires Python scientific service with xarray, netCDF4, h5py</p>
          <p>• <span className="text-yellow-400">⏳</span> GRIB2 — requires eccodes or Python backend</p>
          <p>• <span className="text-yellow-400">⏳</span> Native EUMETSAT formats — requires adapter validation with authentic products</p>
        </div>
      </div>
    </div>
  );
}
