import { useState } from 'react';
import { useAppState, createAuditEntry } from '../store/AppContext';
import { runR23TestSuite, executeR23Test, type DistortionTest, type DistortionType, type DistortionParameters } from '../engine/r23_distortion';
import { generatePDF, generateXLSX, collectReportData } from '../engine/reportEngine';
import type { ReportGenerationRequest } from '../types/reports';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export function R23Laboratory() {
  const { state, dispatch } = useAppState();
  const [tests, setTests] = useState<DistortionTest[]>([]);
  const [running, setRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState<DistortionTest | null>(null);

  const runFullSuite = () => {
    setRunning(true);
    setTimeout(() => {
      const results = runR23TestSuite();
      setTests(results);
      dispatch({ type: 'ADD_LOG', payload: `R23 Laboratory: ${results.length} distortion tests completed` });
      dispatch({ type: 'ADD_AUDIT', payload: createAuditEntry('r23_suite', 'r23-lab', `${results.length} tests executed`) });
      setRunning(false);
    }, 100);
  };

  const runSingleTest = (type: DistortionType, params: DistortionParameters, name: string) => {
    setRunning(true);
    setTimeout(() => {
      const result = executeR23Test(name, type, params, 512, 512, Date.now() % 10000, 5);
      setTests(prev => [...prev, result]);
      dispatch({ type: 'ADD_LOG', payload: `R23 test completed: ${name} — RMSE=${result.metrics.rmseTotal.toFixed(3)}px` });
      setRunning(false);
    }, 50);
  };

  const generateReports = async () => {
    if (tests.length === 0) return;
    
    const data = collectReportData(state);
    const r23Data = {
      ...data,
      r23Tests: tests
    };

    const pdfRequest: ReportGenerationRequest = {
      category: 'scientific_validation',
      format: 'pdf',
      includeGraphs: true,
      includeTables: true,
      includeAnnexes: true
    };

    const xlsxRequest: ReportGenerationRequest = {
      category: 'scientific_validation',
      format: 'xlsx',
      includeGraphs: true,
      includeTables: true,
      includeAnnexes: true
    };

    await generatePDF(pdfRequest, r23Data as any);
    await generateXLSX(xlsxRequest, r23Data as any);
    
    dispatch({ type: 'ADD_LOG', payload: 'R23 reports generated (PDF + XLSX)' });
  };

  // Prepare chart data
  const errorData = tests.map(t => ({
    name: t.name.split(':')[0],
    rmse: t.metrics.rmseTotal,
    bias: Math.sqrt(t.metrics.biasX ** 2 + t.metrics.biasY ** 2),
    coverage: t.metrics.spatialCoverage * 100
  }));

  const distortionData = tests.map(t => ({
    name: t.distortionType,
    error: t.metrics.rmseTotal,
    valid: t.metrics.validRatio * 100
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">R23 Distortion Recovery Laboratory</h2>
        <p className="text-gray-400 text-sm mt-1">Reproducible geometric distortion injection and recovery tests (EUM2026956 R23)</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-3">Full Test Suite</h3>
          <p className="text-xs text-gray-400 mb-3">Run all 10 distortion tests: translation, rotation, scale, affine, subpixel, non-uniform, barrel, pincushion, shear, combined.</p>
          <button onClick={runFullSuite} disabled={running} className="w-full px-4 py-2 bg-cyan-700 hover:bg-cyan-600 disabled:bg-gray-700 text-white rounded">
            {running ? '⏳ Running...' : '▶ Run Full Suite (10 tests)'}
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-3">Quick Tests</h3>
          <div className="space-y-2">
            <button onClick={() => runSingleTest('translation', { type: 'translation', tx: 5, ty: -3 }, 'Quick Translation')} disabled={running} className="w-full px-3 py-1 bg-gray-800 hover:bg-gray-700 text-sm text-white rounded">Translation (5, -3)</button>
            <button onClick={() => runSingleTest('rotation', { type: 'rotation', theta: 0.05 }, 'Quick Rotation')} disabled={running} className="w-full px-3 py-1 bg-gray-800 hover:bg-gray-700 text-sm text-white rounded">Rotation (0.05 rad)</button>
            <button onClick={() => runSingleTest('barrel', { type: 'barrel', k1: -0.0001 }, 'Quick Barrel')} disabled={running} className="w-full px-3 py-1 bg-gray-800 hover:bg-gray-700 text-sm text-white rounded">Barrel Distortion</button>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-3">Reports</h3>
          <p className="text-xs text-gray-400 mb-3">Generate PDF and XLSX reports from R23 test results.</p>
          <button onClick={generateReports} disabled={tests.length === 0} className="w-full px-4 py-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-white rounded">
            📊 Generate Reports (PDF + XLSX)
          </button>
        </div>
      </div>

      {/* Summary */}
      {tests.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded p-3 text-center">
            <div className="text-xl font-bold text-white">{tests.length}</div>
            <div className="text-xs text-gray-500">Tests Executed</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-3 text-center">
            <div className="text-xl font-bold text-amber-300">{(tests.reduce((s, t) => s + t.metrics.rmseTotal, 0) / tests.length).toFixed(3)}</div>
            <div className="text-xs text-gray-500">Mean RMSE (px)</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-3 text-center">
            <div className="text-xl font-bold text-cyan-300">{(tests.reduce((s, t) => s + t.metrics.biasVector, 0) / tests.length).toFixed(3)}</div>
            <div className="text-xs text-gray-500">Mean Bias (px)</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-3 text-center">
            <div className="text-xl font-bold text-green-300">{(tests.reduce((s, t) => s + t.metrics.validRatio, 0) / tests.length * 100).toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Avg Valid Ratio</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-3 text-center">
            <div className="text-xl font-bold text-purple-300">{(tests.reduce((s, t) => s + t.metrics.spatialCoverage, 0) / tests.length * 100).toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Avg Coverage</div>
          </div>
        </div>
      )}

      {/* Charts */}
      {tests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <h4 className="text-sm text-gray-300 mb-3">RMSE by Test</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={errorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9CA3AF' }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 4, fontSize: 11 }} />
                <Legend />
                <Bar dataKey="rmse" fill="#f59e0b" name="RMSE (px)" />
                <Bar dataKey="bias" fill="#06b6d4" name="Bias (px)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <h4 className="text-sm text-gray-300 mb-3">Error by Distortion Type</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={distortionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 4, fontSize: 11 }} />
                <Legend />
                <Bar dataKey="error" fill="#a855f7" name="RMSE (px)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Test Results Table */}
      {tests.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-3">Test Results ({tests.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="text-left py-2 px-2">Test</th>
                  <th className="text-left py-2 px-2">Type</th>
                  <th className="text-left py-2 px-2">RMSE (px)</th>
                  <th className="text-left py-2 px-2">Bias (px)</th>
                  <th className="text-left py-2 px-2">P95</th>
                  <th className="text-left py-2 px-2">Valid%</th>
                  <th className="text-left py-2 px-2">Coverage</th>
                  <th className="text-left py-2 px-2">Time (ms)</th>
                </tr>
              </thead>
              <tbody>
                {tests.map(t => (
                  <tr key={t.id} className="border-t border-gray-800 hover:bg-gray-800/50 cursor-pointer" onClick={() => setSelectedTest(t)}>
                    <td className="py-1.5 px-2 text-white">{t.name}</td>
                    <td className="py-1.5 px-2 text-purple-300">{t.distortionType}</td>
                    <td className="py-1.5 px-2 text-amber-300">{t.metrics.rmseTotal.toFixed(3)}</td>
                    <td className="py-1.5 px-2 text-cyan-300">{t.metrics.biasVector.toFixed(3)}</td>
                    <td className="py-1.5 px-2 text-blue-300">{t.metrics.p95.toFixed(3)}</td>
                    <td className="py-1.5 px-2 text-green-300">{(t.metrics.validRatio * 100).toFixed(1)}%</td>
                    <td className="py-1.5 px-2 text-purple-300">{(t.metrics.spatialCoverage * 100).toFixed(1)}%</td>
                    <td className="py-1.5 px-2 text-gray-400">{t.metrics.computationTimeMs.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Test Details */}
      {selectedTest && (
        <div className="bg-gray-900 border border-cyan-800/50 rounded-lg p-5">
          <h3 className="text-cyan-300 font-semibold mb-3">Test Details: {selectedTest.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-gray-400">True Parameters:</span>
              <div className="text-white font-mono text-xs mt-1">
                {JSON.stringify(selectedTest.trueParameters, null, 2).slice(0, 100)}...
              </div>
            </div>
            <div>
              <span className="text-gray-400">Error Decomposition:</span>
              <div className="text-xs mt-1 space-y-0.5">
                <div className="text-white">Detection: {selectedTest.errors.detection.toFixed(3)} px</div>
                <div className="text-white">Correspondence: {selectedTest.errors.correspondence.toFixed(3)} px</div>
                <div className="text-white">Estimation: {selectedTest.errors.estimation.toFixed(3)} px</div>
                <div className="text-amber-300">Total: {selectedTest.errors.total.toFixed(3)} px</div>
              </div>
            </div>
            <div>
              <span className="text-gray-400">Stability:</span>
              <div className="text-xs mt-1 space-y-0.5">
                <div className="text-white">Repeatability: {(selectedTest.metrics.repeatability * 100).toFixed(1)}%</div>
                <div className="text-white">Centroid Stability: {(selectedTest.metrics.centroidStability * 100).toFixed(1)}%</div>
              </div>
            </div>
            <div>
              <span className="text-gray-400">Performance:</span>
              <div className="text-xs mt-1 space-y-0.5">
                <div className="text-white">Time: {selectedTest.metrics.computationTimeMs.toFixed(0)} ms</div>
                <div className="text-white">Memory: {selectedTest.metrics.memoryPeakMB.toFixed(0)} MB</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tests.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
          <p className="text-4xl mb-4">🔬</p>
          <p className="text-gray-500">Run the test suite to evaluate distortion recovery performance</p>
          <p className="text-xs text-gray-600 mt-2">Tests cover: translation, rotation, scale, affine, subpixel, non-uniform, barrel, pincushion, shear</p>
        </div>
      )}
    </div>
  );
}
