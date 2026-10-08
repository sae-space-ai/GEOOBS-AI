import { useAppState } from '../store/AppContext';

export function SystemStatus() {
  const { state } = useAppState();

  const components = [
    { name: 'Frontend (React/Vite)', status: state.systemStatus.frontend, type: 'active', details: 'TypeScript, Tailwind CSS, Recharts' },
    { name: 'Backend (Node.js/Fastify)', status: state.systemStatus.backend, type: 'planned', details: 'Orchestration, job queue, REST API' },
    { name: 'Scientific Service (Python/FastAPI)', status: state.systemStatus.scientificService, type: 'planned', details: 'OpenCV, PyTorch, xarray, netCDF4' },
    { name: 'Database (SQLite → PostgreSQL)', status: state.systemStatus.database, type: 'active', details: 'Local SQLite, interface for PostgreSQL' },
    { name: 'Storage (Local → S3)', status: state.systemStatus.storage, type: 'active', details: 'Local filesystem, S3-compatible interface planned' },
    { name: 'GPU Acceleration', status: state.systemStatus.gpuAvailable ? 'ok' : 'not_configured', type: 'optional', details: 'CUDA/ROCm for PyTorch training' },
    { name: 'Docker Compose', status: 'not_configured', type: 'planned', details: 'Multi-container orchestration' },
    { name: 'ONNX Runtime', status: 'not_configured', type: 'planned', details: 'Model export and inference optimization' },
  ];

  const dependencies = [
    { name: 'React', version: '18.2', license: 'MIT', status: 'installed' },
    { name: 'TypeScript', version: '5.7', license: 'Apache-2.0', status: 'installed' },
    { name: 'Vite', version: '6.3', license: 'MIT', status: 'installed' },
    { name: 'Tailwind CSS', version: '4.1', license: 'MIT', status: 'installed' },
    { name: 'React Router', version: '6.8', license: 'MIT', status: 'installed' },
    { name: 'Recharts', version: '2.10', license: 'MIT', status: 'installed' },
    { name: 'Lucide React', version: '0.294', license: 'ISC', status: 'installed' },
    { name: 'uuid', version: '9.0', license: 'MIT', status: 'installed' },
    { name: 'OpenCV (Python)', version: '4.x', license: 'Apache-2.0', status: 'pending' },
    { name: 'PyTorch', version: '2.x', license: 'BSD-3', status: 'pending' },
    { name: 'xarray', version: '2024.x', license: 'Apache-2.0', status: 'pending' },
    { name: 'netCDF4', version: '1.6', license: 'MIT', status: 'pending' },
    { name: 'rasterio', version: '1.3', license: 'BSD-3', status: 'pending' },
    { name: 'h5py', version: '3.x', license: 'BSD-3', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">System Status & Infrastructure</h2>
        <p className="text-gray-400 text-sm mt-1">Component health, dependencies, and deployment status</p>
      </div>

      {/* Component Status */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-4">Component Status</h3>
        <div className="space-y-3">
          {components.map(comp => (
            <div key={comp.name} className="flex items-center justify-between py-2 border-b border-gray-800/50">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${
                  comp.status === 'ok' ? 'bg-green-500' :
                  comp.status === 'degraded' ? 'bg-yellow-500' :
                  comp.status === 'not_configured' ? 'bg-gray-500' :
                  'bg-red-500'
                }`}></span>
                <div>
                  <div className="text-sm text-white">{comp.name}</div>
                  <div className="text-xs text-gray-500">{comp.details}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  comp.type === 'active' ? 'bg-green-900/50 text-green-400' :
                  comp.type === 'planned' ? 'bg-gray-800 text-gray-400' :
                  'bg-blue-900/50 text-blue-400'
                }`}>{comp.type}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  comp.status === 'ok' ? 'bg-green-900/50 text-green-400' :
                  comp.status === 'not_configured' ? 'bg-gray-800 text-gray-500' :
                  'bg-yellow-900/50 text-yellow-400'
                }`}>{comp.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dependencies */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-4">Dependency Inventory</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="text-left py-2 px-3">Package</th>
                <th className="text-left py-2 px-3">Version</th>
                <th className="text-left py-2 px-3">License</th>
                <th className="text-left py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {dependencies.map(dep => (
                <tr key={dep.name} className="border-t border-gray-800 hover:bg-gray-800/50">
                  <td className="py-1.5 px-3 text-white">{dep.name}</td>
                  <td className="py-1.5 px-3 text-gray-400">{dep.version}</td>
                  <td className="py-1.5 px-3 text-cyan-300">{dep.license}</td>
                  <td className="py-1.5 px-3">
                    <span className={`px-1.5 py-0.5 rounded ${dep.status === 'installed' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                      {dep.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-4">Target Architecture</h3>
        <div className="font-mono text-xs text-gray-400 bg-gray-950 rounded p-4 overflow-x-auto">
          <pre>{`
┌─────────────────────────────────────────────────────────────┐
│                    GEOOBS-AI System                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Frontend   │  │   Backend    │  │  Scientific Svc  │  │
│  │ React/Vite   │──│ Node/Fastify │──│ Python/FastAPI   │  │
│  │ TypeScript   │  │ REST API     │  │ OpenCV/PyTorch   │  │
│  └──────────────┘  └──────┬───────┘  └────────┬─────────┘  │
│                           │                    │             │
│                    ┌──────┴───────┐  ┌────────┴─────────┐  │
│                    │   SQLite /   │  │  ONNX Runtime    │  │
│                    │  PostgreSQL  │  │  (CPU/GPU)       │  │
│                    └──────────────┘  └──────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Docker Compose Orchestration             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Storage: Local FS → S3-compatible                          │
│  Models: Local → ONNX export                                │
│  Data: Synthetic → FCI/METimage authentic products          │
└─────────────────────────────────────────────────────────────┘
`}</pre>
        </div>
      </div>

      {/* Version Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-3">Version Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Version:</span>
            <span className="text-white ml-2">{state.systemStatus.version}</span>
          </div>
          <div>
            <span className="text-gray-500">Stage:</span>
            <span className="text-yellow-300 ml-2">Alpha</span>
          </div>
          <div>
            <span className="text-gray-500">Last Check:</span>
            <span className="text-gray-300 ml-2">{new Date(state.systemStatus.lastCheck).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-500">GPU:</span>
            <span className={state.systemStatus.gpuAvailable ? 'text-green-300 ml-2' : 'text-gray-500 ml-2'}>
              {state.systemStatus.gpuAvailable ? 'Available' : 'Not detected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
