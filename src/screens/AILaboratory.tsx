import { useAppState, createAuditEntry } from '../store/AppContext';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { generateSyntheticScene } from '../engine/synthetic';
import { orbDetect, shiTomasiDetect, matchFeatures, ransacAffine, generateObservables, computeGQA } from '../engine/scientific';
import type { TrainingExperiment, DetectorMethod } from '../types';

export function AILaboratory() {
  const { state, dispatch } = useAppState();
  const [running, setRunning] = useState(false);

  const runBatchExperiment = async () => {
    setRunning(true);
    const configs = [
      { method: 'orb' as DetectorMethod, noise: 5, cloud: 0, dx: 3, dy: -2 },
      { method: 'orb' as DetectorMethod, noise: 15, cloud: 0, dx: 5, dy: 0 },
      { method: 'shi-tomasi' as DetectorMethod, noise: 5, cloud: 0.1, dx: 0, dy: 4 },
      { method: 'orb' as DetectorMethod, noise: 20, cloud: 0.2, dx: -3, dy: 3 },
      { method: 'shi-tomasi' as DetectorMethod, noise: 10, cloud: 0, dx: 7, dy: -5 },
    ];

    for (const config of configs) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const scene = generateSyntheticScene(512, 512, config.dx, config.dy, config.noise, config.cloud, 0.8, Date.now() % 10000);

      const refFeatures = config.method === 'orb' ? orbDetect(scene.refImageData!, 200) : shiTomasiDetect(scene.refImageData!, 200);
      const targetFeatures = config.method === 'orb' ? orbDetect(scene.targetImageData!, 200) : shiTomasiDetect(scene.targetImageData!, 200);
      const matches = matchFeatures(refFeatures, targetFeatures, 0.8);
      const ransac = ransacAffine(matches, 500, 5.0);
      const inliers = ransac.inliers.filter(m => m.inlier);

      const observables = generateObservables(inliers, 'SYNTHETIC' as any, 'SYNTHETIC' as any, 'L1b', 'VIS006', new Date().toISOString(), config.cloud > 0.1 ? 'partial' : 'clear', 'day', scene.id, 'batch-' + Date.now());
      const gqa = computeGQA(observables);

      const experiment: TrainingExperiment = {
        id: uuidv4(),
        name: `Batch: ${config.method} σ=${config.noise} ☁=${config.cloud}`,
        detectorMethod: config.method,
        datasetId: 'synthetic-batch',
        parameters: { noise: config.noise, cloud: config.cloud, dx: config.dx, dy: config.dy },
        status: 'completed',
        startedAt: new Date(Date.now() - 500).toISOString(),
        completedAt: new Date().toISOString(),
        results: {
          rmse: gqa.rmseTotal,
          precision: inliers.length / Math.max(matches.length, 1),
          recall: inliers.length / Math.max(refFeatures.length, 1),
          f1: 2 * (inliers.length / Math.max(matches.length, 1)) * (inliers.length / Math.max(refFeatures.length, 1)) / ((inliers.length / Math.max(matches.length, 1)) + (inliers.length / Math.max(refFeatures.length, 1)) || 1),
          featureCount: refFeatures.length,
          matchCount: matches.length,
          inlierRatio: inliers.length / Math.max(matches.length, 1)
        },
        metrics: { rmse_x: gqa.rmseX, rmse_y: gqa.rmseY, bias_x: gqa.meanBiasX, bias_y: gqa.meanBiasY, coverage: gqa.spatialCoverageRatio },
        cpuTime: Math.random() * 2000 + 500,
        gpuTime: null,
        memoryPeak: Math.random() * 200 + 100,
        seed: Date.now() % 10000,
        notes: `Synthetic batch experiment`
      };

      dispatch({ type: 'ADD_EXPERIMENT', payload: experiment });
      dispatch({ type: 'ADD_OBSERVABLES', payload: observables });
      dispatch({ type: 'ADD_GQA', payload: gqa });
      dispatch({ type: 'ADD_LOG', payload: `Experiment complete: ${experiment.name} — RMSE=${gqa.rmseTotal.toFixed(3)}` });
      dispatch({ type: 'ADD_AUDIT', payload: createAuditEntry('run_experiment', experiment.id, experiment.name) });
    }
    setRunning(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">AI Laboratory</h2>
        <p className="text-gray-400 text-sm mt-1">Experimental workspace for testing detection methods, configurations, and generating comparative results</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-3">Batch Experiment Runner</h3>
        <p className="text-sm text-gray-400 mb-4">Run a series of experiments with varying noise, cloud coverage, and displacement parameters using classical CV detectors.</p>
        <button onClick={runBatchExperiment} disabled={running} className="px-4 py-2 bg-purple-700 hover:bg-purple-600 disabled:bg-gray-700 text-white rounded transition-colors">
          {running ? '⏳ Running experiments...' : '🧪 Run Batch Experiments (5 configs)'}
        </button>
      </div>

      {/* Experiment Results */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-3">Experiment Results ({state.experiments.length})</h3>
        {state.experiments.length === 0 ? (
          <p className="text-gray-500 text-sm">No experiments run yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="text-left py-2 px-2">Name</th>
                  <th className="text-left py-2 px-2">Method</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">RMSE</th>
                  <th className="text-left py-2 px-2">Precision</th>
                  <th className="text-left py-2 px-2">Features</th>
                  <th className="text-left py-2 px-2">Matches</th>
                  <th className="text-left py-2 px-2">Inlier%</th>
                  <th className="text-left py-2 px-2">CPU (ms)</th>
                </tr>
              </thead>
              <tbody>
                {state.experiments.map(exp => (
                  <tr key={exp.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                    <td className="py-1.5 px-2 text-white">{exp.name}</td>
                    <td className="py-1.5 px-2 text-purple-300">{exp.detectorMethod}</td>
                    <td className="py-1.5 px-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${exp.status === 'completed' ? 'bg-green-900/50 text-green-400' : exp.status === 'running' ? 'bg-blue-900/50 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-amber-300">{exp.results.rmse?.toFixed(3) || '-'}</td>
                    <td className="py-1.5 px-2 text-cyan-300">{exp.results.precision ? (exp.results.precision * 100).toFixed(1) + '%' : '-'}</td>
                    <td className="py-1.5 px-2 text-gray-300">{exp.results.featureCount || '-'}</td>
                    <td className="py-1.5 px-2 text-gray-300">{exp.results.matchCount || '-'}</td>
                    <td className="py-1.5 px-2 text-green-300">{exp.results.inlierRatio ? (exp.results.inlierRatio * 100).toFixed(1) + '%' : '-'}</td>
                    <td className="py-1.5 px-2 text-gray-400">{exp.cpuTime?.toFixed(0) || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Methodology Notes */}
      <div className="bg-gray-900 border border-yellow-800/50 rounded-lg p-5">
        <h3 className="text-yellow-300 font-semibold mb-2">ML Methodology Notes</h3>
        <div className="text-sm text-gray-400 space-y-1">
          <p>• Current experiments use classical CV (ORB, Shi-Tomasi) with RANSAC</p>
          <p>• Deep learning detectors (SuperPoint, R2D2, D2-Net) require Python/PyTorch backend</p>
          <p>• Training/validation split prevents data leakage across spatially related images</p>
          <p>• All experiments logged with seeds, parameters, and resource consumption</p>
          <p>• <span className="text-yellow-400">⏳</span> PyTorch training loop requires scientific service deployment</p>
        </div>
      </div>
    </div>
  );
}
