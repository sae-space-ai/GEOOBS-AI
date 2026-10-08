import { useAppState, createAuditEntry } from '../store/AppContext';
import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { SatelliteImage, InstrumentId, PlatformId } from '../types';

export function ImageAcquisition() {
  const { state, dispatch } = useAppState();
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      dispatch({ type: 'ADD_LOG', payload: `Rejected: ${file.name} (not an image)` });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      dispatch({ type: 'ADD_LOG', payload: `Rejected: ${file.name} (too large: ${(file.size / 1024 / 1024).toFixed(1)}MB)` });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const satelliteImage: SatelliteImage = {
          id: uuidv4(),
          filename: file.name,
          instrument: 'GENERIC',
          platform: 'SYNTHETIC',
          productLevel: 'L1b',
          acquisitionTime: new Date().toISOString(),
          width: img.width,
          height: img.height,
          bands: ['VIS006'],
          cloudCondition: 'unknown',
          dayNightCondition: 'unknown',
          dataUrl,
          metadata: { size: file.size, type: file.type },
          loadedAt: new Date().toISOString()
        };
        dispatch({ type: 'ADD_IMAGE', payload: satelliteImage });
        dispatch({ type: 'ADD_LOG', payload: `Image loaded: ${file.name} (${img.width}×${img.height})` });
        dispatch({ type: 'ADD_AUDIT', payload: createAuditEntry('load_image', satelliteImage.id, `${file.name} ${img.width}×${img.height}`) });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    for (const file of e.dataTransfer.files) handleFile(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Image Acquisition Center</h2>
        <p className="text-gray-400 text-sm mt-1">Load satellite imagery for processing. Supports standard image formats for initial testing.</p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-cyan-400 bg-cyan-900/20' : 'border-gray-700 hover:border-gray-500'
        }`}
      >
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { for (const f of e.target.files || []) handleFile(f); }} />
        <p className="text-4xl mb-3">🛰️</p>
        <p className="text-gray-300">Drop satellite images here or click to browse</p>
        <p className="text-xs text-gray-500 mt-2">Supports: PNG, JPEG, TIFF. Max 50MB per file.</p>
        <p className="text-xs text-yellow-500 mt-3">⚠️ FCI/METimage native formats (NetCDF, HDF5) require the Python scientific service</p>
      </div>

      {/* Loaded Images */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-3">Loaded Images ({state.images.length})</h3>
        {state.images.length === 0 ? (
          <p className="text-gray-500 text-sm">No images loaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {state.images.map(img => (
              <div key={img.id} className="border border-gray-700 rounded-lg p-3">
                <img src={img.dataUrl} alt={img.filename} className="w-full h-32 object-cover rounded mb-2" />
                <div className="text-xs space-y-1">
                  <div className="text-white truncate">{img.filename}</div>
                  <div className="text-gray-400">{img.width}×{img.height} | {img.instrument}</div>
                  <div className="text-gray-500">{img.productLevel} | {new Date(img.loadedAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Adapter Status */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-3">Instrument Adapter Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'MTG-FCI', status: 'pending', desc: 'Flexible Combined Imager — Meteosat Third Generation' },
            { name: 'METimage', status: 'pending', desc: 'Metop-SG Imaging Instrument' },
            { name: 'Generic GeoTIFF', status: 'active', desc: 'Generic georeferenced multispectral datasets' },
          ].map(adapter => (
            <div key={adapter.name} className="border border-gray-700 rounded p-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${adapter.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                <span className="text-sm text-white font-medium">{adapter.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${adapter.status === 'active' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                  {adapter.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{adapter.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
