# Architecture — GEOOBS-AI

## System Layers

### 1. Frontend (Current: Operational)
- **Framework**: React 18 + TypeScript 5.7
- **Build**: Vite 6.x
- **Styling**: Tailwind CSS 4.x
- **Charts**: Recharts 2.x
- **Routing**: React Router 6.x
- **State**: React Context + useReducer

The frontend provides 15 scientific screens covering the full workflow from data ingestion to quality assessment.

### 2. Backend (Planned)
- **Framework**: Node.js + Fastify
- **Purpose**: REST API, job orchestration, authentication
- **Database**: SQLite (local) → PostgreSQL (production)
- **Job Queue**: Async processing for long-running tasks

### 3. Scientific Service (Planned)
- **Framework**: Python + FastAPI
- **Core Libraries**: OpenCV, PyTorch, xarray, netCDF4, h5py, rasterio
- **Purpose**: Heavy computation, ML training, satellite data I/O
- **Export**: ONNX Runtime for model inference

### 4. Storage
- **Current**: Browser localStorage + in-memory state
- **Planned**: Local filesystem → S3-compatible object storage
- **Database**: SQLite → PostgreSQL with migration path

## Data Flow

```
[Satellite Data] → [Ingestion Adapter] → [Preprocessing]
                                              ↓
[Observable Store] ← [Observable Generator] ← [Feature Matching + RANSAC]
       ↓                                            ↑
[GQA Engine] ← [Observable Validation]     [Feature Detection]
       ↓
[Report Export] → [JSON/CSV/NetCDF]
```

## Separation of Concerns

1. **Training vs Inference**: Strictly separated. Training produces models; inference uses them.
2. **Classical vs ML**: Both paths available. Classical CV provides baseline; ML extends capability.
3. **Synthetic vs Real**: Synthetic data validates algorithms; real data validates the system.
4. **Local vs Cloud**: Local-first. Cloud is optional for scaling.

## Coordinate Conventions

- **Pixel coordinates**: (row, col) with origin at top-left, row increasing downward
- **Geographic coordinates**: (lat, lon) in EPSG:4326 unless otherwise specified
- **Displacement signs**: Positive dx = rightward, positive dy = downward (in pixel space)
- **Units**: Pixels for image-space, meters for geodetic (when geolocation available)

## Reproducibility

- All random operations use seeded PRNGs
- Processing parameters are logged with each result
- Model versions and configurations are tracked
- Audit trail records every operation
