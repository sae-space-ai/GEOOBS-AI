import { useState } from 'react';
import { useAppState, createAuditEntry } from '../store/AppContext';
import { generateSyntheticScene } from '../engine/synthetic';
import { orbDetect, matchFeatures, ransacAffine } from '../engine/scientific';
import { computeAbsoluteGQA, computeInterchannelGQA, computeTemporalGQA, GQAModeResult } from '../engine/gqa_modes';
import { runAllTests, TestSuiteResult } from '../engine/tests';
import type { AbsoluteReference, TemporalPair, ChannelPair } from '../engine/gqa_modes';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

export function ThreeGQAModes() {
  const { dispatch } = useAppState();
  const [activeMode, setActiveMode] = useState<'absolute' | 'interchannel' | 'temporal'>('absolute');
  const [results, setResults] = useState<{ absolute: GQAModeResult | null; interchannel: GQAModeResult | null; temporal: GQAModeResult | null }>({ absolute: null, interchannel: null, temporal: null });
  const [testResults, setTestResults] = useState<TestSuiteResult[] | null>(null);
  const [running, setRunning] = useState(false);

  const runAbsoluteMode = () => {
    setRunning(true);
    setTimeout(() => {
      const references: AbsoluteReference[] = [];
      for (let i = 0; i < 40; i++) {
        const x = 40 + (i % 8) * 55;
        const y = 40 + Math.floor(i / 8) * 55;
        const trueDx = 3.2 + Math.random() * 0.8;
        const trueDy = -1.8 + Math.random() * 0.6;
        references.push({
          id: `gcp_${i}`,
          expectedPosition: { row: y, col: x },
          observedPosition: { row: y + trueDy, col: x + trueDx },
          referenceSource: 'synthetic_gcp_database',
          referenceUncertainty: 0.3 + Math.random() * 0.3,
          geographicPosition: null
        });
      }
      const result = computeAbsoluteGQA(references, 512, 512, 10, 5.0);
      setResults(r => ({ ...r, absolute: result }));
      dispatch({ type: 'ADD_LOG', payload: `Absolute GQA: ${result.acceptedCount}/${result.observableCount} accepted, RMSE=${result.rmseTotal.toFixed(3)}px` });
      dispatch({ type: 'ADD_AUDIT', payload: createAuditEntry('gqa_absolute', result.id, `RMSE=${result.rmseTotal.toFixed(3)}`) });
      setRunning(false);
    }, 100);
  };

  const runInterchannelMode = () => {
    setRunning(true);
    setTimeout(() => {
      const scene1 = generateSyntheticScene(512, 512, 1.5, -0.8, 5, 0, 0.8, 42);
      const scene2 = generateSyntheticScene(512, 512, 1.5, -0.8, 8, 0, 0.7, 43);
      const scene3 = generateSyntheticScene(512, 512, 1.5, -0.8, 3, 0, 0.9, 44);

      const pairs: ChannelPair[] = [
        { channelRef: 'VIS006', channelTarget: 'VIS008', featuresRef: orbDetect(scene1.refImageData!, 150), featuresTarget: orbDetect(scene1.targetImageData!, 150), imageWidth: 512, imageHeight: 512 },
        { channelRef: 'VIS006', channelTarget: 'NIR16', featuresRef: orbDetect(scene2.refImageData!, 150), featuresTarget: orbDetect(scene2.targetImageData!, 150), imageWidth: 512, imageHeight: 512 },
        { channelRef: 'VIS008', channelTarget: 'IR105', featuresRef: orbDetect(scene3.refImageData!, 150), featuresTarget: orbDetect(scene3.targetImageData!, 150), imageWidth: 512, imageHeight: 512 }
      ];

      const result = computeInterchannelGQA(pairs, 10, 8.0);
      setResults(r => ({ ...r, interchannel: result }));
      dispatch({ type: 'ADD_LOG', payload: `Interchannel GQA: ${result.acceptedCount} inliers across ${pairs.length} channel pairs` });
      dispatch({ type: 'ADD_AUDIT', payload: createAuditEntry('gqa_interchannel', result.id, `${pairs.length} pairs, RMSE=${result.rmseTotal.toFixed(3)}`) });
      setRunning(false);
    }, 200);
  };

  const runTemporalMode = () => {
    setRunning(true);
    setTimeout(() => {
      const scenes = [
        generateSyntheticScene(512, 512, 2, -1, 5, 0, 0.8, 100),
        generateSyntheticScene(512, 512, 2.5, -1.2, 6, 0, 0.8, 101),
        generateSyntheticScene(512, 512, 1.8, -0.9, 4, 0.05, 0.8, 102),
        generateSyntheticScene(512, 512, 2.2, -1.1, 7, 0, 0.8, 103)
      ];

      const pairs: TemporalPair[] = [];
      for (let i = 0; i < scenes.length - 1; i++) {
        const refF = orbDetect(scenes[i].targetImageData!, 150);
        const tgtF = orbDetect(scenes[i + 1].targetImageData!, 150);
        pairs.push({
          timeRef: new Date(Date.now() + i * 900000).toISOString(),
          timeTarget: new Date(Date.now() + (i + 1) * 900000).toISOString(),
          featuresRef: refF,
          featuresTarget: tgtF,
          imageWidth: 512,
          imageHeight: 512,
          expectedDisplacement: scenes[i].knownDisplacement
        });
      }

      const result = computeTemporalGQA(pairs, 10, 5.0);
      setResults(r => ({ ...r, temporal: result }));
      dispatch({ type: 'ADD_LOG', payload: `Temporal GQA: ${result.acceptedCount} inliers across ${pairs.length} temporal pairs` });
      dispatch({ type: 'ADD_AUDIT', payload: createAuditEntry('gqa_temporal', result.id, `${pairs.length} pairs, RMSE=${result.rmseTotal.toFixed(3)}`) });
      setRunning(false);
    }, 300);
  };

  const runTests = () => {
    setRunning(true);
    setTimeout(() => {
      const results = runAllTests();
      setTestResults(results);
      dispatch({ type: 'ADD_LOG', payload: `Tests: ${results.reduce((s, r) => s + r.passed, 0)}/${results.reduce((s, r) => s + r.total, 0)} passed` });
      setRunning(false);
    }, 500);
  };

  const currentResult = results[activeMode];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Three Geometric Evaluation Engines</h2>
        <p className="text-gray-400 text-sm mt-1">ABSOLUTE_NAVIGATION_GQA · INTERCHANNEL_REGISTRATION_GQA · TEMPORAL_REGISTRATION_GQA</p>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => setActiveMode('absolute')} className={`p-4 rounded-lg border text-left transition-colors ${activeMode === 'absolute' ? 'bg-cyan-900/30 border-cyan-600' : 'bg-gray-900 border-gray-800 hover:border-gray-600'}`}>
          <div className="text-cyan-300 font-semibold">📍 Absolute Navigation</div>
          <div className="text-xs text-gray-400 mt-1">Displacements vs independent geographic references (GCPs)</div>
          {results.absolute && <div className="text-xs text-green-400 mt-2">RMSE: {results.absolute.rmseTotal.toFixed(3)}px</div>}
        </button>
        <button onClick={() => setActiveMode('interchannel')} className={`p-4 rounded-lg border text-left transition-colors ${activeMode === 'interchannel' ? 'bg-purple-900/30 border-purple-600' : 'bg-gray-900 border-gray-800 hover:border-gray-600'}`}>
          <div className="text-purple-300 font-semibold">🌈 Interchannel Registration</div>
          <div className="text-xs text-gray-400 mt-1">Feature positions across spectral channels</div>
          {results.interchannel && <div className="text-xs text-green-400 mt-2">RMSE: {results.interchannel.rmseTotal.toFixed(3)}px</div>}
        </button>
        <button onClick={() => setActiveMode('temporal')} className={`p-4 rounded-lg border text-left transition-colors ${activeMode === 'temporal' ? 'bg-amber-900/30 border-amber-600' : 'bg-gray-900 border-gray-800 hover:border-gray-600'}`}>
          <div className="text-amber-300 font-semibold">⏱️ Temporal Registration</div>
          <div className="text-xs text-gray-400 mt-1">Features between successive acquisitions</div>
          {results.temporal && <div className="text-xs text-green-400 mt-2">RMSE: {results.temporal.rmseTotal.toFixed(3)}px</div>}
        </button>
      </div>

      {/* Run Button */}
      <div className="flex gap-3">
        <button onClick={activeMode === 'absolute' ? runAbsoluteMode : activeMode === 'interchannel' ? runInterchannelMode : runTemporalMode} disabled={running} className="px-4 py-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-white rounded transition-colors">
          {running ? '⏳ Computing...' : `▶ Run ${activeMode === 'absolute' ? 'Absolute' : activeMode === 'interchannel' ? 'Interchannel' : 'Temporal'} GQA`}
        </button>
        <button onClick={runTests} disabled={running} className="px-4 py-2 bg-blue-700 hover:bg-blue-600 disabled:bg-gray-700 text-white rounded transition-colors">
          🧪 Run All Tests
        </button>
      </div>

      {/* Results */}
      {currentResult && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-4">
            {activeMode === 'absolute' ? '📍 Absolute Navigation GQA' : activeMode === 'interchannel' ? '🌈 Interchannel Registration GQA' : '⏱️ Temporal Registration GQA'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <MetricBox label="Observables" value={currentResult.observableCount.toString()} />
            <MetricBox label="Accepted" value={currentResult.acceptedCount.toString()} color="green" />
            <MetricBox label="Valid Ratio" value={`${(currentResult.validRatio * 100).toFixed(1)}%`} color="green" />
            <MetricBox label="Mean Bias X" value={`${currentResult.meanBiasX.toFixed(3)} px`} color="cyan" />
            <MetricBox label="Mean Bias Y" value={`${currentResult.meanBiasY.toFixed(3)} px`} color="cyan" />
            <MetricBox label="RMSE Total" value={`${currentResult.rmseTotal.toFixed(3)} px`} color="amber" />
            <MetricBox label="RMSE X" value={`${currentResult.rmseX.toFixed(3)} px`} color="amber" />
            <MetricBox label="RMSE Y" value={`${currentResult.rmseY.toFixed(3)} px`} color="amber" />
            <MetricBox label="P50" value={`${currentResult.p50.toFixed(3)} px`} color="blue" />
            <MetricBox label="P90" value={`${currentResult.p90.toFixed(3)} px`} color="blue" />
            <MetricBox label="P95" value={`${currentResult.p95.toFixed(3)} px`} color="blue" />
            <MetricBox label="Coverage" value={`${(currentResult.spatialCoverageRatio * 100).toFixed(1)}%`} color="purple" />
          </div>

          {/* Displacement Scatter */}
          {currentResult.displacementVectors.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm text-gray-400 mb-2">Displacement Vectors</h4>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="dx" name="Δx (px)" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <YAxis dataKey="dy" name="Δy (px)" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 4, fontSize: 11 }} />
                  <Scatter data={currentResult.displacementVectors} fill={activeMode === 'absolute' ? '#06b6d4' : activeMode === 'interchannel' ? '#a855f7' : '#f59e0b'} fillOpacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Mode-specific info */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <h4 className="text-sm text-gray-400 mb-2">Mode-Specific Metrics</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(currentResult.modeSpecific).map(([k, v]) => (
                <span key={k} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
                  {k}: {typeof v === 'number' ? v.toFixed(3) : v}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {!currentResult && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
          <p className="text-4xl mb-4">📐</p>
          <p className="text-gray-500">Select a mode and click Run to compute GQA metrics</p>
        </div>
      )}

      {/* Test Results */}
      {testResults && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-4">Automated Test Results</h3>
          <div className="flex gap-4 mb-4">
            <div className="text-sm">
              <span className="text-green-400 font-bold">{testResults.reduce((s, r) => s + r.passed, 0)}</span>
              <span className="text-gray-400"> passed / </span>
              <span className="text-red-400 font-bold">{testResults.reduce((s, r) => s + r.failed, 0)}</span>
              <span className="text-gray-400"> failed / </span>
              <span className="text-white font-bold">{testResults.reduce((s, r) => s + r.total, 0)}</span>
              <span className="text-gray-400"> total</span>
            </div>
          </div>
          {testResults.map(suite => (
            <div key={suite.suite} className="mb-4">
              <h4 className="text-sm text-gray-300 mb-2">{suite.suite} ({suite.passed}/{suite.total})</h4>
              <div className="space-y-1">
                {suite.results.map(test => (
                  <div key={test.name} className="flex items-center gap-2 text-xs py-1 border-b border-gray-800/50">
                    <span className={test.passed ? 'text-green-400' : 'text-red-400'}>{test.passed ? '✅' : '❌'}</span>
                    <span className="text-white flex-1">{test.name}</span>
                    <span className="text-gray-500">{test.duration.toFixed(1)}ms</span>
                    {!test.passed && <span className="text-red-400 max-w-xs truncate">{test.message}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricBox({ label, value, color = 'white' }: { label: string; value: string; color?: string }) {
  const colorMap: Record<string, string> = {
    white: 'text-white', green: 'text-green-300', cyan: 'text-cyan-300',
    amber: 'text-amber-300', purple: 'text-purple-300', blue: 'text-blue-300'
  };
  return (
    <div className="bg-gray-800/50 rounded p-2">
      <div className={`text-sm font-bold ${colorMap[color]}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
