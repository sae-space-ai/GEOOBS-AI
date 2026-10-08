import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppState, createAuditEntry } from '../store/AppContext';
import { generateSyntheticScene, generateTestSuite } from '../engine/synthetic';
import { shiTomasiDetect, orbDetect, matchFeatures, ransacAffine, generateObservables, computeGQA } from '../engine/scientific';
import type { SyntheticScene, DetectorMethod } from '../types';

export function FeatureDetector() {
  const { state, dispatch } = useAppState();
  const [scene, setScene] = useState<SyntheticScene | null>(state.currentScene);
  const [method, setMethod] = useState<DetectorMethod>('orb');
  const [maxFeatures, setMaxFeatures] = useState(200);
  const [qualityLevel, setQualityLevel] = useState(0.01);
  const [showRef, setShowRef] = useState(true);
  const [showTarget, setShowTarget] = useState(true);
  const [showMatches, setShowMatches] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dx, setDx] = useState(3.5);
  const [dy, setDy] = useState(-2.1);
  const [noise, setNoise] = useState(10);
  const [cloud, setCloud] = useState(0);

  // Render scene on canvas
  const renderScene = useCallback(() => {
    if (!canvasRef.current || !scene) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const w = scene.width;
    const h = scene.height;

    canvas.width = w * 2 + 40;
    canvas.height = h + 40;
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw reference image
    if (showRef && scene.refImageData) {
      const refCanvas = document.createElement('canvas');
      refCanvas.width = w; refCanvas.height = h;
      refCanvas.getContext('2d')!.putImageData(scene.refImageData, 0, 0);
      ctx.drawImage(refCanvas, 10, 10);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, w, h);
      ctx.fillStyle = '#06b6d4';
      ctx.font = '11px monospace';
      ctx.fillText('REFERENCE', 15, 25);
    }

    // Draw target image
    if (showTarget && scene.targetImageData) {
      const tgtCanvas = document.createElement('canvas');
      tgtCanvas.width = w; tgtCanvas.height = h;
      tgtCanvas.getContext('2d')!.putImageData(scene.targetImageData, 0, 0);
      ctx.drawImage(tgtCanvas, w + 30, 10);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.strokeRect(w + 30, 10, w, h);
      ctx.fillStyle = '#f59e0b';
      ctx.font = '11px monospace';
      ctx.fillText('TARGET', w + 35, 25);
    }

    // Draw detected features
    if (showRef) {
      for (const f of scene.refFeatures) {
        ctx.beginPath();
        ctx.arc(f.position.col + 10, f.position.row + 10, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
        ctx.fill();
      }
    }
    if (showTarget) {
      for (const f of scene.targetFeatures) {
        ctx.beginPath();
        ctx.arc(f.position.col + w + 30, f.position.row + 10, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
        ctx.fill();
      }
    }

    // Draw matches
    if (showMatches) {
      for (const m of scene.matches) {
        if (!m.inlier) continue;
        const x1 = m.featureRef.position.col + 10;
        const y1 = m.featureRef.position.row + 10;
        const x2 = m.featureTarget.position.col + w + 30;
        const y2 = m.featureTarget.position.row + 10;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = m.ransacResidual !== null && m.ransacResidual < 3 ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    // Draw displacement vectors
    if (showVectors) {
      for (const m of scene.matches) {
        if (!m.inlier) continue;
        const x = m.featureRef.position.col + 10;
        const y = m.featureRef.position.row + 10;
        const ddx = m.featureTarget.position.col - m.featureRef.position.col;
        const ddy = m.featureTarget.position.row - m.featureRef.position.row;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + ddx * 3, y + ddy * 3);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Arrow head
        const angle = Math.atan2(ddy, ddx);
        ctx.beginPath();
        ctx.moveTo(x + ddx * 3, y + ddy * 3);
        ctx.lineTo(x + ddx * 3 - 5 * Math.cos(angle - 0.4), y + ddy * 3 - 5 * Math.sin(angle - 0.4));
        ctx.lineTo(x + ddx * 3 - 5 * Math.cos(angle + 0.4), y + ddy * 3 - 5 * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fillStyle = 'rgba(168, 85, 247, 0.7)';
        ctx.fill();
      }
    }

    // Info overlay
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    const inliers = scene.matches.filter(m => m.inlier).length;
    ctx.fillText(`Features: ${scene.refFeatures.length} ref, ${scene.targetFeatures.length} tgt | Matches: ${scene.matches.length} | Inliers: ${inliers}`, 10, h + 30);
  }, [scene, showRef, showTarget, showMatches, showVectors]);

  useEffect(() => { renderScene(); }, [renderScene]);

  const generateScene = () => {
    setProcessing(true);
    setTimeout(() => {
      const newScene = generateSyntheticScene(512, 512, dx, dy, noise, cloud / 100, 0.8, Date.now() % 10000);
      setScene(newScene);
      dispatch({ type: 'SET_CURRENT_SCENE', payload: newScene });
      dispatch({ type: 'ADD_SYNTHETIC_SCENE', payload: newScene });
      dispatch({ type: 'SET_FEATURES', payload: { ref: newScene.refFeatures, target: newScene.targetFeatures, matches: newScene.matches } });
      dispatch({ type: 'ADD_LOG', payload: `Scene generated: ${newScene.name}` });
      dispatch({ type: 'ADD_AUDIT', payload: createAuditEntry('generate_scene', newScene.id, `Synthetic scene with dx=${dx}, dy=${dy}, noise=${noise}`) });
      setProcessing(false);
    }, 100);
  };

  const runDetection = () => {
    if (!scene?.refImageData || !scene?.targetImageData) return;
    setProcessing(true);
    setTimeout(() => {
      let refFeatures, targetFeatures;
      if (!scene.refImageData || !scene.targetImageData) return;
      if (method === 'shi-tomasi') {
        refFeatures = shiTomasiDetect(scene.refImageData, maxFeatures, qualityLevel);
        targetFeatures = shiTomasiDetect(scene.targetImageData, maxFeatures, qualityLevel);
      } else {
        refFeatures = orbDetect(scene.refImageData, maxFeatures);
        targetFeatures = orbDetect(scene.targetImageData, maxFeatures);
      }
      const matches = matchFeatures(refFeatures, targetFeatures, 0.8);
      const ransacResult = ransacAffine(matches, 1000, 5.0);

      const updatedScene = { ...scene, refFeatures, targetFeatures, matches: ransacResult.inliers };
      setScene(updatedScene);
      dispatch({ type: 'SET_CURRENT_SCENE', payload: updatedScene });
      dispatch({ type: 'SET_FEATURES', payload: { ref: refFeatures, target: targetFeatures, matches: ransacResult.inliers } });
      dispatch({ type: 'ADD_LOG', payload: `Detection complete: ${method}, ${refFeatures.length} ref, ${targetFeatures.length} tgt, ${ransacResult.inliers.filter(m => m.inlier).length} inliers` });
      dispatch({ type: 'ADD_AUDIT', payload: createAuditEntry('run_detection', scene.id, `${method}: ${refFeatures.length} features, ${matches.length} matches, ${ransacResult.inliers.filter(m => m.inlier).length} inliers`) });
      setProcessing(false);
    }, 100);
  };

  const generateAndCompute = () => {
    if (!scene) return;
    setProcessing(true);
    setTimeout(() => {
      const inlierMatches = scene.matches.filter(m => m.inlier);
      const observables = generateObservables(
        inlierMatches, 'SYNTHETIC' as any, 'SYNTHETIC' as any, 'L1b', 'VIS006',
        new Date().toISOString(), scene.cloudCoverage > 0.2 ? 'partial' : 'clear',
        'day', scene.id, 'chain-' + Date.now()
      );
      dispatch({ type: 'ADD_OBSERVABLES', payload: observables });

      const gqa = computeGQA(observables);
      dispatch({ type: 'ADD_GQA', payload: gqa });
      dispatch({ type: 'ADD_LOG', payload: `Generated ${observables.length} observables, GQA: RMSE=${gqa.rmseTotal.toFixed(3)}px` });
      dispatch({ type: 'ADD_AUDIT', payload: createAuditEntry('compute_gqa', gqa.id, `${observables.length} observables, RMSE=${gqa.rmseTotal.toFixed(3)}`) });
      setProcessing(false);
    }, 100);
  };

  const loadTestSuite = () => {
    setProcessing(true);
    setTimeout(() => {
      const scenes = generateTestSuite();
      scenes.forEach(s => dispatch({ type: 'ADD_SYNTHETIC_SCENE', payload: s }));
      if (scenes.length > 0) {
        setScene(scenes[0]);
        dispatch({ type: 'SET_CURRENT_SCENE', payload: scenes[0] });
      }
      dispatch({ type: 'ADD_LOG', payload: `Test suite loaded: ${scenes.length} scenes` });
      setProcessing(false);
    }, 200);
  };

  const inliers = scene?.matches.filter(m => m.inlier).length || 0;
  const totalMatches = scene?.matches.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Feature Detection Laboratory</h2>
        <p className="text-gray-400 text-sm mt-1">Detect and match features between reference and target images using classical CV algorithms</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <label className="text-xs text-gray-400 block mb-1">Scene Parameters</label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-8">Δx:</span>
              <input type="range" min="-10" max="10" step="0.5" value={dx} onChange={e => setDx(parseFloat(e.target.value))} className="flex-1" />
              <span className="text-xs text-cyan-300 w-10">{dx.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-8">Δy:</span>
              <input type="range" min="-10" max="10" step="0.5" value={dy} onChange={e => setDy(parseFloat(e.target.value))} className="flex-1" />
              <span className="text-xs text-cyan-300 w-10">{dy.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-8">σ:</span>
              <input type="range" min="0" max="30" step="1" value={noise} onChange={e => setNoise(parseInt(e.target.value))} className="flex-1" />
              <span className="text-xs text-cyan-300 w-10">{noise}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-8">☁:</span>
              <input type="range" min="0" max="50" step="5" value={cloud} onChange={e => setCloud(parseInt(e.target.value))} className="flex-1" />
              <span className="text-xs text-cyan-300 w-10">{cloud}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <label className="text-xs text-gray-400 block mb-1">Detection Method</label>
          <select value={method} onChange={e => setMethod(e.target.value as DetectorMethod)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white">
            <option value="orb">ORB (FAST + BRIEF)</option>
            <option value="shi-tomasi">Shi-Tomasi Corners</option>
          </select>
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Max:</span>
              <input type="number" value={maxFeatures} onChange={e => setMaxFeatures(parseInt(e.target.value))} className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white" />
            </div>
            {method === 'shi-tomasi' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Quality:</span>
                <input type="number" step="0.005" value={qualityLevel} onChange={e => setQualityLevel(parseFloat(e.target.value))} className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white" />
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <label className="text-xs text-gray-400 block mb-2">Display Options</label>
          <div className="space-y-1.5">
            {[
              { label: 'Reference Features', state: showRef, set: setShowRef },
              { label: 'Target Features', state: showTarget, set: setShowTarget },
              { label: 'Match Lines', state: showMatches, set: setShowMatches },
              { label: 'Displacement Vectors', state: showVectors, set: setShowVectors },
            ].map(opt => (
              <label key={opt.label} className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input type="checkbox" checked={opt.state} onChange={e => opt.set(e.target.checked)} className="rounded" />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <label className="text-xs text-gray-400 block mb-2">Actions</label>
            <div className="space-y-2">
              <button onClick={generateScene} disabled={processing} className="w-full px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 disabled:bg-gray-700 text-white text-sm rounded transition-colors">
                {processing ? '⏳ Processing...' : '🎬 Generate Scene'}
              </button>
              <button onClick={runDetection} disabled={processing || !scene} className="w-full px-3 py-1.5 bg-purple-700 hover:bg-purple-600 disabled:bg-gray-700 text-white text-sm rounded transition-colors">
                🎯 Run Detection
              </button>
              <button onClick={generateAndCompute} disabled={processing || !scene || inliers === 0} className="w-full px-3 py-1.5 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-white text-sm rounded transition-colors">
                📐 Compute Observables + GQA
              </button>
              <button onClick={loadTestSuite} disabled={processing} className="w-full px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors">
                📦 Load Test Suite (6 scenes)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {scene && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded p-3 text-center">
            <div className="text-xl font-bold text-cyan-300">{scene.refFeatures.length}</div>
            <div className="text-xs text-gray-500">Ref Features</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-3 text-center">
            <div className="text-xl font-bold text-amber-300">{scene.targetFeatures.length}</div>
            <div className="text-xs text-gray-500">Target Features</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-3 text-center">
            <div className="text-xl font-bold text-white">{totalMatches}</div>
            <div className="text-xs text-gray-500">Total Matches</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-3 text-center">
            <div className="text-xl font-bold text-green-300">{inliers}</div>
            <div className="text-xs text-gray-500">RANSAC Inliers</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-3 text-center">
            <div className="text-xl font-bold text-purple-300">{totalMatches > 0 ? ((inliers / totalMatches) * 100).toFixed(1) : '0'}%</div>
            <div className="text-xs text-gray-500">Inlier Ratio</div>
          </div>
        </div>
      )}

      {/* Canvas Visualization */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 overflow-x-auto">
        <canvas ref={canvasRef} className="border border-gray-700 rounded" />
        {!scene && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-4">🛰️</p>
            <p>Generate a synthetic scene to begin feature detection</p>
            <p className="text-xs mt-2">Known displacements will be embedded in the scene for validation</p>
          </div>
        )}
      </div>

      {/* Known vs Estimated Comparison */}
      {scene && inliers > 0 && (
        <div className="bg-gray-900 border border-green-800/50 rounded-lg p-5">
          <h3 className="text-green-300 font-semibold mb-3">Validation: Known vs Estimated Displacement</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Known Δx:</span>
              <span className="text-cyan-300 ml-2 font-mono">{scene.knownDisplacement.dx_pixels.toFixed(3)} px</span>
            </div>
            <div>
              <span className="text-gray-400">Known Δy:</span>
              <span className="text-cyan-300 ml-2 font-mono">{scene.knownDisplacement.dy_pixels.toFixed(3)} px</span>
            </div>
            <div>
              <span className="text-gray-400">Mean Est. Δx:</span>
              <span className="text-amber-300 ml-2 font-mono">
                {(scene.matches.filter(m => m.inlier).reduce((s, m) => s + (m.featureTarget.position.col - m.featureRef.position.col), 0) / inliers).toFixed(3)} px
              </span>
            </div>
            <div>
              <span className="text-gray-400">Mean Est. Δy:</span>
              <span className="text-amber-300 ml-2 font-mono">
                {(scene.matches.filter(m => m.inlier).reduce((s, m) => s + (m.featureTarget.position.row - m.featureRef.position.row), 0) / inliers).toFixed(3)} px
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
