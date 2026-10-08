# GEOOBS-AI Python Scientific Service

## Overview

Python 3 scientific core for GEOOBS-AI, implementing all computational functions required by EUM2026956.

## Architecture

```
python_service/
├── geobs_ai_service/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── detection.py         # Feature detection (Shi-Tomasi, ORB, SIFT)
│   ├── matching.py          # Feature matching and RANSAC
│   ├── gqa.py               # Three GQA engines
│   └── observables.py       # Observable generation and export
├── requirements.txt
├── Dockerfile
└── README.md
```

## Modules

### detection.py
- **Shi-Tomasi corner detection** — OpenCV `goodFeaturesToTrack`
- **ORB detection** — FAST keypoints + BRIEF descriptors
- **SIFT detection** — Scale-invariant feature transform
- **Input**: Image file path or numpy array
- **Output**: List of feature dictionaries with position, descriptor, response

### matching.py
- **Hamming distance matching** — For binary descriptors (ORB)
- **Euclidean distance matching** — For interchannel registration
- **Lowe's ratio test** — Configurable threshold (default 0.8)
- **RANSAC affine estimation** — Robust transform estimation
- **Input**: Feature lists
- **Output**: Match dictionaries with inlier flags

### gqa.py
Three independent GQA engines:

1. **ABSOLUTE_NAVIGATION_GQA**
   - Compares observed positions vs independent geographic references
   - Input: Reference points with expected/observed positions
   - Output: Bias, RMSE, percentiles, coverage

2. **INTERCHANNEL_REGISTRATION_GQA**
   - Compares feature positions across spectral channels
   - Input: Channel pairs with features
   - Output: Interchannel displacement statistics

3. **TEMPORAL_REGISTRATION_GQA**
   - Tracks features between successive acquisitions
   - Input: Temporal pairs with features
   - Output: Temporal displacement and error vs known

### observables.py
- **Observable generation** — Canonical schema with 30+ fields
- **JSON export** — Full schema
- **CSV export** — Tabular format
- **NetCDF-CF export** — Geospatial compliant format

## API Endpoints

### Health
- `GET /` — Health check
- `GET /health` — Detailed health status

### Processing
- `POST /api/v1/detect` — Detect features
- `POST /api/v1/match` — Match features
- `POST /api/v1/ransac` — RANSAC estimation
- `POST /api/v1/gqa` — Compute GQA metrics
- `POST /api/v1/observables` — Generate observables
- `POST /api/v1/preprocess` — Preprocess image (async)

### Adapters
- `POST /api/v1/adapters/fci/read` — Read FCI L1b product
- `POST /api/v1/adapters/metimage/read` — Read METimage L1b product

### Export
- `POST /api/v1/export/json` — Export to JSON
- `POST /api/v1/export/csv` — Export to CSV
- `POST /api/v1/export/netcdf` — Export to NetCDF-CF

## Installation

### Local Development
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run service
uvicorn geobs_ai_service.main:app --reload --port 8000
```

### Docker
```bash
# Build image
docker build -t geobs-ai-service .

# Run container
docker run -p 8000:8000 geobs-ai-service
```

## CLI Usage

```bash
# Detect features
python -m geobs_ai_service.cli detect --input image.tif --method orb --output features.json

# Compute GQA
python -m geobs_ai_service.cli gqa --mode absolute --input references.json --output gqa.json

# Generate observables
python -m geobs_ai_service.cli observables --input matches.json --output observables.json
```

## Testing

```bash
# Run tests
pytest tests/

# Run with coverage
pytest --cov=geobs_ai_service tests/
```

## Status

- ✅ Module structure complete
- ✅ API endpoints defined
- ✅ Three GQA engines implemented
- ✅ Observable generation implemented
- ⏳ FCI/METimage adapters (requires authentic products)
- ⏳ ML models (requires training data)
- ⏳ Performance benchmarks (requires execution)

## Dependencies

All dependencies listed in `requirements.txt`. Key packages:
- **FastAPI** — Web framework
- **OpenCV** — Computer vision
- **NumPy/SciPy** — Numerical computing
- **xarray** — Satellite data
- **PyTorch** — ML (optional)

## R32 Compliance

This service fulfills requirement R32: all scientific functions implemented in Python 3, executable via CLI, API, and scheduled jobs without React/Node.js dependency.

## Next Steps

1. Install Python dependencies
2. Run tests to verify functionality
3. Test with synthetic data
4. Integrate with frontend (CORS configured)
5. Deploy with Docker Compose
6. Validate with authentic satellite products (when available)
