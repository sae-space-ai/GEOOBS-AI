import { useAppState } from '../store/AppContext';

export function AuditCenter() {
  const { state } = useAppState();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Audit & Traceability Center</h2>
        <p className="text-gray-400 text-sm mt-1">Complete audit trail of all operations, data provenance, and processing chain</p>
      </div>

      {/* Audit Log */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-3">Audit Log ({state.auditLog.length} entries)</h3>
        {state.auditLog.length === 0 ? (
          <p className="text-gray-500 text-sm">No audit entries yet. Operations will be logged as you use the system.</p>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-gray-900">
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="text-left py-2 px-2">Timestamp</th>
                  <th className="text-left py-2 px-2">Severity</th>
                  <th className="text-left py-2 px-2">Action</th>
                  <th className="text-left py-2 px-2">Actor</th>
                  <th className="text-left py-2 px-2">Resource</th>
                  <th className="text-left py-2 px-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {state.auditLog.map(entry => (
                  <tr key={entry.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                    <td className="py-1.5 px-2 text-gray-400 font-mono whitespace-nowrap">{new Date(entry.timestamp).toLocaleString()}</td>
                    <td className="py-1.5 px-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${
                        entry.severity === 'info' ? 'bg-blue-900/50 text-blue-300' :
                        entry.severity === 'warning' ? 'bg-yellow-900/50 text-yellow-300' :
                        entry.severity === 'error' ? 'bg-red-900/50 text-red-300' :
                        'bg-red-900/70 text-red-200'
                      }`}>{entry.severity}</span>
                    </td>
                    <td className="py-1.5 px-2 text-white">{entry.action}</td>
                    <td className="py-1.5 px-2 text-gray-400">{entry.actor}</td>
                    <td className="py-1.5 px-2 text-cyan-300 font-mono">{entry.resource.slice(0, 12)}</td>
                    <td className="py-1.5 px-2 text-gray-400 max-w-xs truncate">{entry.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Provenance Chain */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-3">Processing Chain Traceability</h3>
        <div className="text-sm text-gray-400 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 bg-cyan-900/50 rounded-full flex items-center justify-center text-cyan-300 text-sm">1</span>
            <div>
              <div className="text-white">Data Ingestion</div>
              <div className="text-xs text-gray-500">File validation, metadata extraction, format recognition</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 bg-purple-900/50 rounded-full flex items-center justify-center text-purple-300 text-sm">2</span>
            <div>
              <div className="text-white">Preprocessing</div>
              <div className="text-xs text-gray-500">Radiometric normalization, cloud masking, ROI selection</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 bg-green-900/50 rounded-full flex items-center justify-center text-green-300 text-sm">3</span>
            <div>
              <div className="text-white">Feature Detection</div>
              <div className="text-xs text-gray-500">Shi-Tomasi / ORB detection, descriptor computation</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 bg-amber-900/50 rounded-full flex items-center justify-center text-amber-300 text-sm">4</span>
            <div>
              <div className="text-white">Matching & Estimation</div>
              <div className="text-xs text-gray-500">Feature matching, RANSAC, displacement estimation</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 bg-pink-900/50 rounded-full flex items-center justify-center text-pink-300 text-sm">5</span>
            <div>
              <div className="text-white">Observable Generation</div>
              <div className="text-xs text-gray-500">Canonical observable records with full metadata</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 bg-blue-900/50 rounded-full flex items-center justify-center text-blue-300 text-sm">6</span>
            <div>
              <div className="text-white">Quality Assessment</div>
              <div className="text-xs text-gray-500">GQA metrics, statistical analysis, acceptance/rejection</div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notes */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-3">Security & Integrity</h3>
        <div className="text-sm text-gray-400 space-y-1">
          <p>• <span className="text-green-400">✓</span> All operations logged with timestamps and resource IDs</p>
          <p>• <span className="text-green-400">✓</span> File validation on input (type, size, extension)</p>
          <p>• <span className="text-green-400">✓</span> No external data transmission without explicit authorization</p>
          <p>• <span className="text-green-400">✓</span> Processing chain fully traceable from input to output</p>
          <p>• <span className="text-yellow-400">⏳</span> Cryptographic checksums — partial (UUIDs only, no SHA-256 yet)</p>
          <p>• <span className="text-yellow-400">⏳</span> Role-based access control — requires backend deployment</p>
        </div>
      </div>
    </div>
  );
}
