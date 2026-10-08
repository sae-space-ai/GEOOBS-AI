# Known Limitations — GEOOBS-AI

## Alpha v0.1.0

### Scientific Limitations

1. **No authentic satellite data processing**
   - FCI and METimage adapters are not implemented
   - All results are from synthetic data
   - Format specifications not verified against real files

2. **Simplified feature detection**
   - ORB implementation lacks full rotation estimation
   - No multi-scale pyramid (single scale only)
   - No sub-pixel refinement
   - Shi-Tomasi uses fixed window size

3. **Pixel-space only**
   - No geodetic displacement computation
   - No map projection handling
   - No geolocation parameter integration
   - GQA metrics are in pixel units only

4. **No deep learning**
   - No neural network feature detectors
   - No learned descriptors
   - No transformer-based matching
   - No GPU acceleration

5. **Simplified RANSAC**
   - Affine model only (no homography, no polynomial)
   - No MLESAC or PROSAC variants
   - Fixed iteration count (not adaptive)

### Engineering Limitations

1. **No backend**
   - All processing in browser (memory/CPU limited)
   - No persistent storage across sessions
   - No multi-user support
   - No job queue

2. **No Python scientific service**
   - No NetCDF/HDF5 reading
   - No xarray operations
   - No PyTorch training
   - No ONNX export

3. **Memory constraints**
   - Large images may cause browser memory issues
   - No streaming or chunked processing
   - All data in memory

4. **No Docker deployment**
   - Single-container (frontend only)
   - No service orchestration

### Data Limitations

1. **Synthetic data only**
   - Terrain features are geometric shapes, not real Earth features
   - Noise model is additive Gaussian, not sensor-specific
   - Cloud simulation is simplified
   - No atmospheric effects

2. **No real instrument characteristics**
   - No point spread function modeling
   - No radiometric calibration
   - No noise equivalent delta temperature
   - No spectral response functions

### Validation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Shi-Tomasi | Tested on synthetic | Not validated on real imagery |
| ORB | Tested on synthetic | Simplified implementation |
| RANSAC | Tested on synthetic | Convergence not proven for all cases |
| GQA metrics | Computed correctly | Not validated against reference values |
| Observable schema | Defined and populated | Not reviewed by domain experts |
| Export formats | JSON/CSV working | NetCDF not available |

## Roadmap to Production

### Phase 1: Backend & Scientific Service
- Deploy Node.js backend with Fastify
- Deploy Python scientific service with FastAPI
- Implement SQLite persistence
- Add job queue for async processing

### Phase 2: Data Adapters
- Implement FCI L1b reader (xarray + netCDF4)
- Implement METimage L1b reader
- Validate against sample products
- Verify variable names and dimensions

### Phase 3: Deep Learning
- Train SuperPoint on satellite imagery
- Implement R2D2 or LoFTR matching
- ONNX export and validation
- GPU-accelerated inference

### Phase 4: Operational Readiness
- Full GQA with geodetic coordinates
- Temporal stability analysis
- Multi-channel comparison
- Docker Compose deployment
- PostgreSQL and S3 integration
