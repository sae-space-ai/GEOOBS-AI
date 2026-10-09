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
  { path: '/three-gqa', label: 'Three GQA Engines', icon: '📐' },
  { path: '/reports-pro', label: 'Scientific Reports', icon: '📑' },
  { path: '/r23-lab', label: 'R23 Distortion Lab', icon: '🔬' },
  { path: '/test-runner', label: 'Test Runner', icon: '🧪' },
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
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <span className="text-3xl">🌐</span>
            GEOOBS-AI
          </h1>
          <p className="text-xs text-slate-500 mt-2">Geometric Earth Observation Intelligence System</p>
          <div className="mt-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
            <p className="text-xs text-indigo-700 font-medium">v{state.systemStatus.version} — Alpha</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm rounded-xl mb-1 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span className="truncate font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${state.systemStatus.frontend === 'ok' ? 'bg-emerald-500' : 'bg-red-500'} shadow-sm`}></span>
              <span className="text-slate-600 font-medium">Frontend:</span>
              <span className="text-slate-700">{state.systemStatus.frontend}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${state.systemStatus.backend === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'} shadow-sm`}></span>
              <span className="text-slate-600 font-medium">Backend:</span>
              <span className="text-slate-700">{state.systemStatus.backend}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-slate-200 flex items-center px-8 justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {navItems.find(n => n.path === location.pathname)?.icon}
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-800">
                {navItems.find(n => n.path === location.pathname)?.label || 'GEOOBS-AI'}
              </div>
              <div className="text-xs text-slate-500">Scientific Interface</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-emerald-600 font-medium">Images:</span>
                <span className="text-emerald-700 font-bold">{state.images.length}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-200">
                <span className="text-indigo-600 font-medium">Observables:</span>
                <span className="text-indigo-700 font-bold">{state.observables.length}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-200">
                <span className="text-purple-600 font-medium">Scenes:</span>
                <span className="text-purple-700 font-bold">{state.syntheticScenes.length}</span>
              </div>
            </div>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
