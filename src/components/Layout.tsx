import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAppState } from '../store/AppContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/acquisition', label: 'Image Acquisition', icon: '🛰️' },
  { path: '/products', label: 'Product Explorer', icon: '📁' },
  { path: '/viewer', label: 'Multispectral Viewer', icon: '🔬' },
  { path: '/features', label: 'Feature Detection', icon: '🎯' },
  { path: '/observables', label: 'Observables', icon: '📐' },
  { path: '/gqa', label: 'GQA Evaluation', icon: '✅' },
  { path: '/ai-lab', label: 'AI Laboratory', icon: '🧪' },
  { path: '/training', label: 'Training Center', icon: '🏋️' },
  { path: '/geo-leo', label: 'GEO vs LEO', icon: '🌍' },
  { path: '/channels', label: 'Channel Comparison', icon: '🌈' },
  { path: '/reports', label: 'Reports', icon: '📋' },
  { path: '/audit', label: 'Audit & Traceability', icon: '🔒' },
  { path: '/models', label: 'Model Admin', icon: '🤖' },
  { path: '/system', label: 'System Status', icon: '⚙️' },
];

export function Layout() {
  const { state } = useAppState();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
            <span className="text-2xl">🌐</span>
            GEOOBS-AI
          </h1>
          <p className="text-xs text-gray-500 mt-1">Geometric Earth Observation Intelligence System</p>
          <p className="text-xs text-gray-600 mt-0.5">v{state.systemStatus.version} — Alpha</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-cyan-900/30 text-cyan-300 border-r-2 border-cyan-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${state.systemStatus.frontend === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            Frontend: {state.systemStatus.frontend}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${state.systemStatus.backend === 'ok' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
            Backend: {state.systemStatus.backend}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-12 bg-gray-900/50 border-b border-gray-800 flex items-center px-6 justify-between">
          <div className="text-sm text-gray-400">
            {navItems.find(n => n.path === location.pathname)?.icon}{' '}
            {navItems.find(n => n.path === location.pathname)?.label || 'GEOOBS-AI'}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Images: {state.images.length}</span>
            <span>Observables: {state.observables.length}</span>
            <span>Scenes: {state.syntheticScenes.length}</span>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
