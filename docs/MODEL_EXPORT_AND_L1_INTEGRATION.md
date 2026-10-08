# Model Export and L1 Integration — GEOOBS-AI

## ONNX Export Strategy

### When to Export
- After model training is complete and validated
- When deployment environment differs from training environment
- For CPU-only inference (edge devices, servers without GPU)

### Export Pipeline (Planned)
1. Train model in PyTorch
2. Validate on test set
3. Export to ONNX with `torch.onnx.export()`
4. Validate ONNX model with `onnxruntime`
5. Compare outputs between PyTorch and ONNX (tolerance < 1e-5)
6. Package with metadata (version, metrics, license)

### ONNX Runtime Deployment
```python
import onnxruntime as ort

session = ort.InferenceSession("model.onnx")
outputs = session.run(None, {"input": image_tensor})
```

### Target Platforms
- CPU: ONNX Runtime (Intel, AMD, ARM)
- GPU: ONNX Runtime with CUDA EP
- Edge: ONNX Runtime with OpenVINO or TensorRT EP

## L1 Processor Integration

### Interface Design
The system is designed to potentially integrate with L1 processors as:
1. **Consumer**: Receives L1b/L1c products and generates observables
2. **Producer**: Exports observables for downstream processing

### Input Interface
```
L1b/L1c Product → [Adapter] → Calibrated Radiances + Geolocation
                                    ↓
                            [Preprocessing]
                                    ↓
                            [Feature Detection]
                                    ↓
                            [Observable Generation]
```

### Output Interface
```
Observables → [Export Module] → JSON / CSV / NetCDF-CF
```

### GQA Integration (Studied, Not Implemented)
- GQA results could feed back into L1 processor for geolocation update
- LOS (Line of Sight) update would require:
  - Observable positions in instrument coordinates
  - Geolocation parameters
  - Attitude information
  - This integration is studied but NOT implemented

### Computational Requirements for Inference
| Operation | CPU Time (est.) | GPU Time (est.) | Memory |
|-----------|-----------------|-----------------|--------|
| Feature detection (classical) | 50-200ms | N/A | 50-100MB |
| Feature detection (DL, small) | 200-500ms | 20-50ms | 200-500MB |
| Feature detection (DL, large) | 1-5s | 100-300ms | 500MB-2GB |
| Matching | 10-50ms | N/A | 10-50MB |
| RANSAC | 50-200ms | N/A | 10-50MB |
| GQA computation | 10-50ms | N/A | 10-50MB |

## Status

- ONNX export: ⏳ Requires trained models first
- L1 integration: ⏳ Studied, interface designed, not implemented
- GQA feedback to L1: ⏳ Requires operational validation first
