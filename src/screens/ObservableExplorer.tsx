import { useAppState } from '../store/AppContext';
import { useState } from 'react';

export function ObservableExplorer() {
  const { state } = useAppState();
  const [filter, setFilter] = useState<'all' | 'accepted' | 'rejected' | 'cloud_contaminated'>('all');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const filtered = state.observables.filter(o => filter === 'all' || o.status === filter);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const exportJSON = () => {
    const data = JSON.stringify(filtered, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `geobs-observables-${Date.now()}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = ['id', 'instrument', 'platform', 'level', 'band', 'row', 'col', 'dx_px', 'dy_px', 'magnitude_px', 'direction_deg', 'quality', 'method', 'status', 'cloud', 'daynight'];
    const rows = filtered.map(o => [
      o.id, o.instrument, o.platform, o.productLevel, o.spectralBand,
      o.pixelPosition.row.toFixed(1), o.pixelPosition.col.toFixed(1),
      o.displacement.dx_pixels.toFixed(4), o.displacement.dy_pixels.toFixed(4),
      o.displacement.magnitude_pixels.toFixed(4), o.displacement.direction_deg.toFixed(2),
      o.qualityMetric.toFixed(4), o.detectionMethod, o.status, o.cloudCondition, o.dayNightCondition
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `geobs-observables-${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Observable Explorer</h2>
          <p className="text-gray-400 text-sm mt-1">Browse, filter, and export geometric observables</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportJSON} disabled={filtered.length === 0} className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 disabled:bg-gray-700 text-white text-sm rounded">Export JSON</button>
          <button onClick={exportCSV} disabled={filtered.length === 0} className="px-3 py-1.5 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-white text-sm rounded">Export CSV</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded p-3 text-center">
          <div className="text-xl font-bold text-white">{state.observables.length}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded p-3 text-center">
          <div className="text-xl font-bold text-green-300">{state.observables.filter(o => o.status === 'accepted').length}</div>
          <div className="text-xs text-gray-500">Accepted</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded p-3 text-center">
          <div className="text-xl font-bold text-red-300">{state.observables.filter(o => o.status === 'rejected').length}</div>
          <div className="text-xs text-gray-500">Rejected</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded p-3 text-center">
          <div className="text-xl font-bold text-yellow-300">{state.observables.filter(o => o.status === 'cloud_contaminated').length}</div>
          <div className="text-xs text-gray-500">Cloud</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'accepted', 'rejected', 'cloud_contaminated'] as const).map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(0); }} className={`px-3 py-1 text-xs rounded ${filter === f ? 'bg-cyan-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {f === 'all' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No observables yet. Run feature detection and compute observables first.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-800 text-gray-400">
                  <th className="text-left py-2 px-2">ID</th>
                  <th className="text-left py-2 px-2">Position</th>
                  <th className="text-left py-2 px-2">Δx (px)</th>
                  <th className="text-left py-2 px-2">Δy (px)</th>
                  <th className="text-left py-2 px-2">|d| (px)</th>
                  <th className="text-left py-2 px-2">Dir (°)</th>
                  <th className="text-left py-2 px-2">Quality</th>
                  <th className="text-left py-2 px-2">Method</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">σx</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(o => (
                  <tr key={o.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                    <td className="py-1.5 px-2 font-mono text-gray-500">{o.id.slice(0, 8)}</td>
                    <td className="py-1.5 px-2 text-gray-300">({o.pixelPosition.row.toFixed(0)}, {o.pixelPosition.col.toFixed(0)})</td>
                    <td className="py-1.5 px-2 text-cyan-300">{o.displacement.dx_pixels.toFixed(3)}</td>
                    <td className="py-1.5 px-2 text-cyan-300">{o.displacement.dy_pixels.toFixed(3)}</td>
                    <td className="py-1.5 px-2 text-white">{o.displacement.magnitude_pixels.toFixed(3)}</td>
                    <td className="py-1.5 px-2 text-gray-300">{o.displacement.direction_deg.toFixed(1)}</td>
                    <td className="py-1.5 px-2">
                      <div className="flex items-center gap-1">
                        <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${o.qualityMetric * 100}%` }}></div>
                        </div>
                        <span className="text-gray-400">{o.qualityMetric.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="py-1.5 px-2 text-purple-300">{o.detectionMethod}</td>
                    <td className="py-1.5 px-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${
                        o.status === 'accepted' ? 'bg-green-900/50 text-green-400' :
                        o.status === 'rejected' ? 'bg-red-900/50 text-red-400' :
                        'bg-yellow-900/50 text-yellow-400'
                      }`}>{o.status}</span>
                    </td>
                    <td className="py-1.5 px-2 text-gray-400">{o.uncertainty.sigma_x_pixels.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-800">
            <span className="text-xs text-gray-500">Page {page + 1} of {totalPages} ({filtered.length} records)</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-2 py-1 text-xs bg-gray-800 rounded disabled:opacity-50">←</button>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-2 py-1 text-xs bg-gray-800 rounded disabled:opacity-50">→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
