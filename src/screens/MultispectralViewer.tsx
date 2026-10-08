import { useAppState } from '../store/AppContext';
import { useState, useRef, useEffect } from 'react';

export function MultispectralViewer() {
  const { state } = useAppState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedScene, setSelectedScene] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [overlay, setOverlay] = useState<'none' | 'features' | 'matches' | 'vectors'>('features');

  const scene = state.syntheticScenes[selectedScene];

  useEffect(() => {
    if (!canvasRef.current || !scene) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const w = scene.width;
    const h = scene.height;
    canvas.width = w * zoom;
    canvas.height = h * zoom;

    // Draw target image
    if (scene.targetImageData) {
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = w; tmpCanvas.height = h;
      tmpCanvas.getContext('2d')!.putImageData(scene.targetImageData, 0, 0);
      ctx.drawImage(tmpCanvas, 0, 0, w * zoom, h * zoom);
    }

    if (overlay === 'features') {
      for (const f of scene.targetFeatures) {
        ctx.beginPath();
        ctx.arc(f.position.col * zoom, f.position.row * zoom, 3 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    } else if (overlay === 'matches') {
      for (const m of scene.matches) {
        if (!m.inlier) continue;
        ctx.beginPath();
        ctx.arc(m.featureRef.position.col * zoom, m.featureRef.position.row * zoom, 4 * zoom, 0, Math.PI * 2);
        ctx.strokeStyle = m.inlier ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    } else if (overlay === 'vectors') {
      for (const m of scene.matches) {
        if (!m.inlier) continue;
        const x = m.featureRef.position.col * zoom;
        const y = m.featureRef.position.row * zoom;
        const ddx = (m.featureTarget.position.col - m.featureRef.position.col) * zoom * 5;
        const ddy = (m.featureTarget.position.row - m.featureRef.position.row) * zoom * 5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + ddx, y + ddy);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Arrow
        const angle = Math.atan2(ddy, ddx);
        ctx.beginPath();
        ctx.moveTo(x + ddx, y + ddy);
        ctx.lineTo(x + ddx - 8 * Math.cos(angle - 0.4), y + ddy - 8 * Math.sin(angle - 0.4));
        ctx.lineTo(x + ddx - 8 * Math.cos(angle + 0.4), y + ddy - 8 * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fillStyle = 'rgba(168, 85, 247, 0.8)';
        ctx.fill();
      }
    }
  }, [scene, zoom, overlay]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Multispectral Image Viewer</h2>
        <p className="text-gray-400 text-sm mt-1">Visualize images with feature overlays and displacement vectors</p>
      </div>

      {state.syntheticScenes.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
          <p className="text-4xl mb-4">🔬</p>
          <p className="text-gray-500">No scenes available. Generate synthetic data in Feature Detection first.</p>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="flex gap-4 items-center">
            <select value={selectedScene} onChange={e => setSelectedScene(parseInt(e.target.value))} className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white">
              {state.syntheticScenes.map((s, i) => (
                <option key={s.id} value={i}>{s.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Zoom:</span>
              <input type="range" min="0.5" max="3" step="0.25" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} className="w-24" />
              <span className="text-xs text-cyan-300">{zoom}x</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Overlay:</span>
              <select value={overlay} onChange={e => setOverlay(e.target.value as any)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white">
                <option value="none">None</option>
                <option value="features">Features</option>
                <option value="matches">Matches</option>
                <option value="vectors">Displacement Vectors</option>
              </select>
            </div>
          </div>

          {/* Viewer */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 overflow-auto">
            <canvas ref={canvasRef} className="border border-gray-700 rounded" />
          </div>

          {/* Scene Info */}
          {scene && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-gray-900 border border-gray-800 rounded p-3">
                <span className="text-gray-400 text-xs">Resolution</span>
                <div className="text-white">{scene.width}×{scene.height} px</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded p-3">
                <span className="text-gray-400 text-xs">Known Displacement</span>
                <div className="text-cyan-300">({scene.knownDisplacement.dx_pixels.toFixed(2)}, {scene.knownDisplacement.dy_pixels.toFixed(2)}) px</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded p-3">
                <span className="text-gray-400 text-xs">Features Detected</span>
                <div className="text-white">{scene.refFeatures.length + scene.targetFeatures.length}</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded p-3">
                <span className="text-gray-400 text-xs">Valid Matches</span>
                <div className="text-green-300">{scene.matches.filter(m => m.inlier).length}</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
