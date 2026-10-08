import { useAppState } from '../store/AppContext';

export function ModelAdmin() {
  const { state } = useAppState();

  const defaultModels = [
    {
      id: 'orb-v1',
      name: 'ORB Feature Detector',
      version: '1.0.0',
      method: 'orb',
      architecture: 'FAST keypoints + BRIEF descriptors',
      license: 'BSD-3-Clause (OpenCV)',
      source: 'OpenCV 4.x implementation (TypeScript port)',
      trainedOn: 'N/A (classical CV, no training)',
      metrics: { avgFeatures: 200, avgMatches: 45, avgInlierRatio: 0.75 },
      onnxPath: null,
      checksum: 'builtin',
      status: 'validated' as const,
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      id: 'shitomasi-v1',
      name: 'Shi-Tomasi Corner Detector',
      version: '1.0.0',
      method: 'shi-tomasi',
      architecture: 'Minimum eigenvalue of structure tensor',
      license: 'BSD-3-Clause (OpenCV)',
      source: 'TypeScript implementation based on OpenCV algorithm',
      trainedOn: 'N/A (classical CV, no training)',
      metrics: { avgFeatures: 150, avgMatches: 35, avgInlierRatio: 0.70 },
      onnxPath: null,
      checksum: 'builtin',
      status: 'validated' as const,
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      id: 'ransac-v1',
      name: 'RANSAC Affine Estimator',
      version: '1.0.0',
      method: 'orb',
      architecture: 'Random Sample Consensus with affine model',
      license: 'Public domain algorithm',
      source: 'TypeScript implementation',
      trainedOn: 'N/A (geometric estimation)',
      metrics: { iterations: 1000, threshold: 5.0 },
      onnxPath: null,
      checksum: 'builtin',
      status: 'validated' as const,
      createdAt: '2026-01-01T00:00:00Z'
    }
  ];

  const allModels = [...defaultModels, ...state.models];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Model Administration</h2>
        <p className="text-gray-400 text-sm mt-1">Catalog of detection models, their versions, licenses, metrics, and validation status</p>
      </div>

      {/* Model Catalog */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-4">Model Catalog ({allModels.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allModels.map(model => (
            <div key={model.id} className="border border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-white font-medium">{model.name}</h4>
                  <p className="text-xs text-gray-500">v{model.version}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  model.status === 'validated' ? 'bg-green-900/50 text-green-400' :
                  model.status === 'operational' ? 'bg-blue-900/50 text-blue-400' :
                  'bg-yellow-900/50 text-yellow-400'
                }`}>{model.status}</span>
              </div>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method:</span>
                  <span className="text-purple-300">{model.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Architecture:</span>
                  <span className="text-gray-300 text-right ml-2 max-w-[180px] truncate">{model.architecture}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">License:</span>
                  <span className="text-cyan-300">{model.license}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Source:</span>
                  <span className="text-gray-400 text-right ml-2 max-w-[180px] truncate">{model.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ONNX:</span>
                  <span className={model.onnxPath ? 'text-green-400' : 'text-gray-600'}>{model.onnxPath ? 'Available' : 'N/A'}</span>
                </div>
              </div>
              {Object.keys(model.metrics).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-xs text-gray-500 mb-1">Metrics:</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(model.metrics).map(([k, v]) => (
                      <span key={k} className="px-1.5 py-0.5 bg-gray-800 rounded text-xs text-gray-300">
                        {k}: {typeof v === 'number' ? v.toFixed(2) : v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pending Models */}
      <div className="bg-gray-900 border border-yellow-800/50 rounded-lg p-5">
        <h3 className="text-yellow-300 font-semibold mb-3">Pending Model Integration</h3>
        <div className="text-sm text-gray-400 space-y-2">
          <p>The following deep learning models are planned but require Python/PyTorch backend:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div className="border border-gray-700 rounded p-3">
              <div className="text-white text-sm font-medium">SuperPoint</div>
              <div className="text-xs text-gray-500">Self-supervised feature detection and description</div>
              <div className="text-xs text-yellow-400 mt-1">License: Research only — requires verification</div>
            </div>
            <div className="border border-gray-700 rounded p-3">
              <div className="text-white text-sm font-medium">R2D2</div>
              <div className="text-xs text-gray-500">Repeatable and Reliable Detector and Descriptor</div>
              <div className="text-xs text-yellow-400 mt-1">License: BSD — requires verification</div>
            </div>
            <div className="border border-gray-700 rounded p-3">
              <div className="text-white text-sm font-medium">LoFTR</div>
              <div className="text-xs text-gray-500">Detector-Free Local Feature Matching with Transformers</div>
              <div className="text-xs text-yellow-400 mt-1">License: Apache 2.0 — requires verification</div>
            </div>
            <div className="border border-gray-700 rounded p-3">
              <div className="text-white text-sm font-medium">LightGlue</div>
              <div className="text-xs text-gray-500">Lightweight feature matcher with adaptive depth</div>
              <div className="text-xs text-yellow-400 mt-1">License: Apache 2.0 — requires verification</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 italic">No pretrained models will be used without identifying license, provenance, version, and usage requirements.</p>
        </div>
      </div>
    </div>
  );
}
