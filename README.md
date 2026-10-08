# GEOOBS-AI — Geometric Earth Observation Intelligence System

## Overview

GEOOBS-AI is a scientific platform for generating, evaluating, and managing geometric observables from satellite imagery using artificial intelligence and classical computer vision methods.

The system is oriented toward the technical objectives of the EUMETSAT Study EUM2026956 (v2, 7 August 2026) on the creation of observables through AI/ML methods.

## Current Status: Alpha v0.6.0 (R23 Distortion Recovery Laboratory)

### What is operational

- ✅ Full web interface with 18 scientific screens
- ✅ **R23 Distortion Recovery Laboratory** with 10 distortion types
- ✅ Scientific Reporting Center with PDF/XLSX generation
- ✅ Three independent GQA engines (Absolute, Interchannel, Temporal)
- ✅ ML Training Engine with train/validation split
- ✅ Scientific Validation Engine with 5 validation suites
- ✅ Performance Monitoring Engine with benchmarks
- ✅ Integration Test Suite (end-to-end validation)
- ✅ Algorithm Benchmark (ORB vs Shi-Tomasi vs RANSAC)
- ✅ Synthetic data generation with known geometric displacements
- ✅ Shi-Tomasi corner detection (TypeScript implementation)
- ✅ ORB feature detection (FAST + BRIEF, TypeScript implementation)
- ✅ Feature matching with Hamming distance
- ✅ RANSAC affine estimation
- ✅ Observable generation with full metadata schema (33 fields)
- ✅ Geometric Quality Assessment (GQA) metrics
- ✅ Export to JSON, CSV, PDF, XLSX, and plain text reports
- ✅ Complete audit trail and traceability
- ✅ Deterministic synthetic test suite
- ✅ Automated test runner (33+ tests)
- ✅ Requirements compliance matrix (R1-R49) — 49.0% operational
- ✅ AI usage approval register (R36 governance)
- ✅ 16 report categories with professional formatting
- ✅ 24-sheet XLSX workbooks with structured data
- ✅ Full audit documentation (AUDIT_ALPHA_040.md, EXECUTION_REPORT_ALPHA_V060.md)

### What is pending

- ⏳ FCI/METimage native format adapters (requires authentic products)
- ⏳ Python service execution (structure complete, runtime pending)
- ⏳ Deep learning detectors (PyTorch: SuperPoint, R2D2, LoFTR)
- ⏳ ONNX model export and inference
- ⏳ Docker Compose deployment
- ⏳ PostgreSQL and S3 storage integration
- ⏳ Validation with authentic EUMETSAT products (BLOCKED_EXTERNAL)
- ⏳ GSoW EUM/RSP/SOW/18/985385 review
- ⏳ R36 AI authorization from EUMETSAT (BLOCKED_EXTERNAL)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Architecture

```
frontend/          React + TypeScript + Vite + Tailwind
backend/           Node.js + Fastify (planned)
scientific/        Python + FastAPI + OpenCV + PyTorch (planned)
docs/              Technical documentation
```

## Scientific Engine

The TypeScript scientific engine implements:

1. **Shi-Tomasi Corner Detection**: Minimum eigenvalue of the structure tensor with non-maximum suppression
2. **ORB Detection**: FAST keypoint detection + BRIEF binary descriptors
3. **Feature Matching**: Hamming distance with Lowe's ratio test
4. **RANSAC**: Robust affine estimation with configurable iterations and threshold
5. **Observable Generation**: Canonical records with full provenance metadata
6. **GQA Computation**: Bias, RMSE, percentiles, spatial coverage, dispersion

## Synthetic Data

The system generates deterministic test scenes with:
- Known geometric displacements (ground truth)
- Configurable noise levels
- Cloud contamination simulation
- Terrain-like features for detection

This enables validation of displacement estimation accuracy against known truth.

## Documentation

### Contractual Compliance
- [REQUIREMENTS_COMPLIANCE_MATRIX.md](REQUIREMENTS_COMPLIANCE_MATRIX.md) — Full R1-R49 traceability matrix
- [REQUIREMENTS_COMPLIANCE_MATRIX.csv](REQUIREMENTS_COMPLIANCE_MATRIX.csv) — Machine-readable matrix
- [AI_USAGE_APPROVAL_REGISTER.md](AI_USAGE_APPROVAL_REGISTER.md) — R36 AI governance register

### Technical Documentation
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — System architecture
- [OBSERVABLE_SCHEMA.md](docs/OBSERVABLE_SCHEMA.md) — Observable data model
- [ML_METHODOLOGY.md](docs/ML_METHODOLOGY.md) — ML approach and limitations
- [GEOMETRIC_QUALITY_ASSESSMENT.md](docs/GEOMETRIC_QUALITY_ASSESSMENT.md) — GQA methodology
- [EUMETSAT_REQUIREMENTS_TRACEABILITY.md](docs/EUMETSAT_REQUIREMENTS_TRACEABILITY.md) — Requirements matrix (legacy)
- [SECURITY_AND_SOVEREIGNTY.md](docs/SECURITY_AND_SOVEREIGNTY.md) — Security principles
- [KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md) — Current limitations
- [TEST_REPORT.md](docs/TEST_REPORT.md) — Test results
- [TRAINING_AND_VALIDATION_PLAN.md](docs/TRAINING_AND_VALIDATION_PLAN.md) — Validation strategy
- [INSTRUMENT_DATA_INTERFACES.md](docs/INSTRUMENT_DATA_INTERFACES.md) — FCI/METimage interfaces
- [MODEL_EXPORT_AND_L1_INTEGRATION.md](docs/MODEL_EXPORT_AND_L1_INTEGRATION.md) — ONNX/L1 integration
- [COMPUTATIONAL_RESOURCE_ESTIMATE.md](docs/COMPUTATIONAL_RESOURCE_ESTIMATE.md) — Resource requirements

### Reporting System Documentation
- [REPORTING_ARCHITECTURE.md](docs/REPORTING_ARCHITECTURE.md) — Report generation architecture
- [PDF_REPORT_SPECIFICATION.md](docs/PDF_REPORT_SPECIFICATION.md) — PDF format specification
- [XLSX_REPORT_SPECIFICATION.md](docs/XLSX_REPORT_SPECIFICATION.md) — XLSX format specification
- [REPORT_VALIDATION_TESTS.md](docs/REPORT_VALIDATION_TESTS.md) — Report generation test results
- [REPORT_CENTER_EXECUTION_REPORT.md](REPORT_CENTER_EXECUTION_REPORT.md) — Implementation report

## License

This project is developed as an independent scientific tool. No EUMETSAT proprietary code is included. All algorithms are independently implemented or use open-source libraries with compatible licenses.

## Disclaimer

This system has NOT been validated with authentic EUMETSAT FCI or METimage products. No claim of operational compliance with EUMETSAT requirements is made until:
1. Authentic products are obtained and format specifications verified
2. GSoW EUM/RSP/SOW/18/985385 is fully reviewed
3. Complete Statement of Work requirements are mapped and validated
4. Results are evaluated by qualified domain experts
