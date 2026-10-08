# GEOOBS-AI Python Scientific Service
# Architecture for R32 compliance

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uuid
import json
from datetime import datetime

# Import scientific modules
from . import detection
from . import matching
from . import gqa
from . import observables
from . import preprocessing
from . import adapters

app = FastAPI(
    title="GEOOBS-AI Scientific Service",
    description="Python 3 scientific core for geometric earth observation intelligence",
    version="0.2.0"
)

# CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# REQUEST/RESPONSE MODELS
# ============================================================

class DetectionRequest(BaseModel):
    image_path: str
    method: str  # 'shi-tomasi', 'orb', 'sift'
    max_features: int = 500
    quality_level: float = 0.01
    min_distance: int = 10

class MatchingRequest(BaseModel):
    ref_features: List[Dict]
    target_features: List[Dict]
    method: str = 'hamming'
    ratio_threshold: float = 0.8

class RANSACRequest(BaseModel):
    matches: List[Dict]
    iterations: int = 1000
    threshold: float = 5.0

class GQARequest(BaseModel):
    mode: str  # 'absolute', 'interchannel', 'temporal'
    data: Dict[str, Any]
    grid_size: int = 10

class ObservableRequest(BaseModel):
    matches: List[Dict]
    instrument: str
    platform: str
    product_level: str
    spectral_band: str
    acquisition_time: str

# ============================================================
# API ENDPOINTS
# ============================================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "GEOOBS-AI Scientific Service",
        "version": "0.2.0",
        "python": "3.x",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health():
    """Detailed health check"""
    return {
        "status": "healthy",
        "modules": {
            "detection": "available",
            "matching": "available",
            "ransac": "available",
            "gqa": "available",
            "observables": "available",
            "preprocessing": "available",
            "adapters": "available"
        }
    }

@app.post("/api/v1/detect")
async def detect_features(request: DetectionRequest):
    """Detect features in an image"""
    try:
        features = detection.detect(
            image_path=request.image_path,
            method=request.method,
            max_features=request.max_features,
            quality_level=request.quality_level,
            min_distance=request.min_distance
        )
        return {
            "status": "success",
            "feature_count": len(features),
            "features": features
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/match")
async def match_features(request: MatchingRequest):
    """Match features between two images"""
    try:
        matches = matching.match(
            ref_features=request.ref_features,
            target_features=request.target_features,
            method=request.method,
            ratio_threshold=request.ratio_threshold
        )
        return {
            "status": "success",
            "match_count": len(matches),
            "matches": matches
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ransac")
async def ransac_estimation(request: RANSACRequest):
    """Perform RANSAC affine estimation"""
    try:
        result = matching.ransac_affine(
            matches=request.matches,
            iterations=request.iterations,
            threshold=request.threshold
        )
        return {
            "status": "success",
            "inliers": result['inliers'],
            "model": result['model'],
            "residual": result['residual']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/gqa")
async def compute_gqa(request: GQARequest):
    """Compute GQA metrics"""
    try:
        if request.mode == 'absolute':
            result = gqa.compute_absolute_gqa(
                references=request.data['references'],
                image_width=request.data.get('width', 512),
                image_height=request.data.get('height', 512),
                grid_size=request.grid_size
            )
        elif request.mode == 'interchannel':
            result = gqa.compute_interchannel_gqa(
                channel_pairs=request.data['pairs'],
                grid_size=request.grid_size
            )
        elif request.mode == 'temporal':
            result = gqa.compute_temporal_gqa(
                temporal_pairs=request.data['pairs'],
                grid_size=request.grid_size
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unknown mode: {request.mode}")
        
        return {
            "status": "success",
            "mode": request.mode,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/observables")
async def generate_observables(request: ObservableRequest):
    """Generate canonical observables from matches"""
    try:
        obs = observables.generate(
            matches=request.matches,
            instrument=request.instrument,
            platform=request.platform,
            product_level=request.product_level,
            spectral_band=request.spectral_band,
            acquisition_time=request.acquisition_time
        )
        return {
            "status": "success",
            "observable_count": len(obs),
            "observables": obs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/preprocess")
async def preprocess_image(background_tasks: BackgroundTasks, image_path: str, operations: List[str]):
    """Preprocess satellite image (async)"""
    task_id = str(uuid.uuid4())
    background_tasks.add_task(
        preprocessing.preprocess_async,
        task_id=task_id,
        image_path=image_path,
        operations=operations
    )
    return {
        "status": "accepted",
        "task_id": task_id,
        "message": "Preprocessing started"
    }

@app.get("/api/v1/preprocess/status/{task_id}")
async def get_preprocess_status(task_id: str):
    """Get preprocessing task status"""
    status = preprocessing.get_task_status(task_id)
    if status is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return status

# ============================================================
# ADAPTER ENDPOINTS
# ============================================================

@app.post("/api/v1/adapters/fci/read")
async def read_fci(file_path: str):
    """Read FCI L1b product"""
    try:
        data = adapters.fci.read(file_path)
        return {
            "status": "success",
            "metadata": data['metadata'],
            "channels": list(data['channels'].keys()),
            "dimensions": data['dimensions']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/adapters/metimage/read")
async def read_metimage(file_path: str):
    """Read METimage L1b product"""
    try:
        data = adapters.metimage.read(file_path)
        return {
            "status": "success",
            "metadata": data['metadata'],
            "channels": list(data['channels'].keys()),
            "dimensions": data['dimensions']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# EXPORT ENDPOINTS
# ============================================================

@app.post("/api/v1/export/json")
async def export_json(observables: List[Dict], output_path: str):
    """Export observables to JSON"""
    try:
        observables.export_json(observables, output_path)
        return {"status": "success", "path": output_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/export/csv")
async def export_csv(observables: List[Dict], output_path: str):
    """Export observables to CSV"""
    try:
        observables.export_csv(observables, output_path)
        return {"status": "success", "path": output_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/export/netcdf")
async def export_netcdf(observables: List[Dict], output_path: str):
    """Export observables to NetCDF-CF"""
    try:
        observables.export_netcdf(observables, output_path)
        return {"status": "success", "path": output_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# CLI ENTRY POINT
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
