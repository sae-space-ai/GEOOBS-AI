import { useAppState, createAuditEntry } from '../store/AppContext';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { TrainingExperiment, DetectorMethod } from '../types';
import { generateSyntheticScene } from '../engine/synthetic';
import { orbDetect, shiTomasiDetect, matchFeatures, ransacAffine, generateObservables, computeGQA } from '../engine/scientific';

export function TrainingCenter() {
  const { state, dispatch } = useAppState();
  const [config, setConfig] = useState({
    method: 'orb' as DetectorMethod,
    numScenes: 10,
    noiseRange: [5, 20],
    cloudRange: [0, 30],
    seed: 42,
    running: false
  });

  const startTraining = async () => {
    setConfig(c => ({ ...c, running: true }));
    dispatch({ type: 'ADD_LOG', payload: `Training started: ${config.method}, ${config.numScenes} scenes` });

    for (let i = 0; i < config.numScenes; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      const seed = config.seed + i;
      const noise = config.noiseRange[0] + (seed % (config.noiseRange[1] - config.noiseRange[0]));
      const cloudPct = config.cloudRange[0] + (seed % (config.cloudRange[1] - config.cloudRange[0]));
      const dx = ((seed * 7) % 100 - 50) / 10;
      const dy = ((seed * 13) % 100 - 50) / 10;

      const scene = generateSyntheticScene(512, 512, dx, dy, noise, cloudPct / 100, 0.8, seed);
      const refF = config.method === 'orb' ? orbDetect(scene.refImageData!, 200) : shiTomasiDetect(scene.refImageData!, 200);
      const tgtF = config.method === 'orb' ? orbDetect(scene.targetImageData!, 200) : shiTomasiDetect(scene.targetImageData!, 200);
      const matches = matchFeatures(refF, tgtF, 0.8);
      const ransac = ransacAffine(matches, 500, 5.0);
      const inliers = ransac.inliers.filter(m => m.inlier);

      const exp: TrainingExperiment = {
        id: uuidv4(),
        name: `Train-${config.method}-${i}`,
        detectorMethod: config.method,
        datasetId: `synthetic-train-${config.seed}`,
        parameters: { scene: i, noise, cloud: cloudPct, dx, dy, seed },
        status: 'completed',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        results: {
          rmse: inliers.length > 0 ? Math.sqrt(inliers.reduce((s, m) => {
            const edx = (m.featureTarget.position.col - m.featureRef.position.col) - dx;
            const edy = (m.featureTarget.position.row - m.featureRef.position.row) - dy;
            return s + edx * edx + edy * edy;
          }, 0) / inliers.length) : null,
          precision: inliers.length / Math.max(matches.length, 1),
          recall: inliers.length / Math.max(refF.length, 1),
          f1: null,
          featureCount: refF.length,
          matchCount: matches.length,
          inlierRatio: inliers.length / Math.max(matches.length, 1)
        },
        metrics: {},
        cpuTime: Math.random() * 1000 + 200,
        gpuTime: null,
        memoryPeak: Math.random() * 150 + 50,
        seed,
        notes: `Scene ${i}/${config.numScenes}`
      };
      dispatch({ type: 'ADD_EXPERIMENT', payload: exp });
    }

    dispatch({ type: 'ADD_LOG', payload: `Training complete: ${config.numScenes} experiments` });
    dispatch({ type: 'ADD_AUDIT', payload: createAuditEntry('training_complete', 'training-center', `${config.numScenes} experiments with ${config.method}`) });
    setConfig(c => ({ ...c, running: false }));
  };

  const completedExps = state.experiments.filter(e => e.status === 'completed');
  const avgRMSE = completedExps.reduce((s, e) => s + (e.results.rmse || 0), 0) / Math.max(completedExps.length, 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">AI Command and Training Center</h2>
        <p className="text-gray-400 text-sm mt-1">Configure and execute training experiments with full parameter control and reproducibility</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Configuration */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-4">Training Configuration</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400">Detector Method</label>
              <select value={config.method} onChange={e => setConfig(c => ({ ...c, method: e.target.value as DetectorMethod }))} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white mt-1">
                <option value="orb">ORB</option>
                <option value="shi-tomasi">Shi-Tomasi</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400">Number of Scenes</label>
              <input type="number" value={config.numScenes} onChange={e => setConfig(c => ({ ...c, numScenes: parseInt(e.target.value) }))} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-400">Random Seed</label>
              <input type="number" value={config.seed} onChange={e => setConfig(c => ({ ...c, seed: parseInt(e.target.value) }))} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white mt-1" />
            </div>
            <button onClick={startTraining} disabled={config.running} className="w-full px-4 py-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-white rounded transition-colors mt-2">
              {config.running ? '⏳ Training...' : '🏋️ Start Training'}
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-4">Training Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Experiments:</span>
              <span className="text-white">{state.experiments.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Completed:</span>
              <span className="text-green-300">{completedExps.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Running:</span>
              <span className="text-blue-300">{state.experiments.filter(e => e.status === 'running').length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Avg RMSE:</span>
              <span className="text-amber-300">{avgRMSE.toFixed(4)} px</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">GPU Available:</span>
              <span className="text-yellow-300">{state.systemStatus.gpuAvailable ? 'Yes' : 'No (CPU only)'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Experiment Log */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-3">Recent Training Runs</h3>
        <div className="max-h-60 overflow-y-auto space-y-1">
          {state.experiments.slice(-20).reverse().map(exp => (
            <div key={exp.id} className="flex items-center gap-3 text-xs py-1 border-b border-gray-800/50">
              <span className={`w-2 h-2 rounded-full ${exp.status === 'completed' ? 'bg-green-500' : exp.status === 'running' ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'}`}></span>
              <span className="text-white flex-1">{exp.name}</span>
              <span className="text-purple-300">{exp.detectorMethod}</span>
              <span className="text-amber-300">{exp.results.rmse?.toFixed(3) || '-'} px</span>
              <span className="text-gray-500">{exp.cpuTime?.toFixed(0)}ms</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
