# EUMETSAT Requirements Traceability — GEOOBS-AI

## Reference Documents

- EUM2026956 v2 (7 August 2026): Study on creation of observables through AI/ML
- EUM/RSP/SOW/18/985385: GSoW (requires full review — NOT YET COMPLETED)
- FCI L1b IDD: Format specification for MTG-FCI data
- METimage L1b IDD: Format specification for METimage data

## Traceability Matrix

| Req ID | Requirement | Module | Status | Evidence |
|--------|-------------|--------|--------|----------|
| R01 | Geometric observable generation | engine/scientific.ts | ✅ Implemented | Observable schema, generation function |
| R02 | Feature detection (classical) | engine/scientific.ts | ✅ Implemented | Shi-Tomasi, ORB implementations |
| R03 | Feature detection (ML) | Planned | ⏳ Pending | Requires PyTorch backend |
| R04 | RANSAC estimation | engine/scientific.ts | ✅ Implemented | Affine RANSAC with configurable params |
| R05 | GQA metrics | engine/scientific.ts | ✅ Implemented | Bias, RMSE, percentiles, coverage |
| R06 | Synthetic test data | engine/synthetic.ts | ✅ Implemented | Deterministic scenes with known truth |
| R07 | Observable export (JSON/CSV) | screens/ObservableExplorer.tsx | ✅ Implemented | Download functionality |
| R08 | Observable export (NetCDF) | Planned | ⏳ Pending | Requires Python/xarray |
| R09 | FCI data ingestion | Planned | ⏳ Pending | Requires authentic products |
| R10 | METimage data ingestion | Planned | ⏳ Pending | Requires authentic products |
| R11 | Cloud detection/masking | Partial | ⚠️ Partial | Synthetic cloud simulation only |
| R12 | Multi-spectral analysis | screens/ChannelComparison.tsx | ⚠️ Illustrative | Based on specs, not real data |
| R13 | Training/evaluation pipeline | screens/TrainingCenter.tsx | ✅ Implemented | Classical CV experiments |
| R14 | Model versioning | screens/ModelAdmin.tsx | ✅ Implemented | Catalog with metadata |
| R15 | Audit trail | store/AppContext.tsx | ✅ Implemented | Full operation logging |
| R16 | Uncertainty estimation | engine/scientific.ts | ✅ Implemented | Per-observable uncertainty |
| R17 | Reproducibility | engine/synthetic.ts | ✅ Implemented | Seeded PRNG, logged parameters |
| R18 | Data sovereignty | Architecture | ✅ By design | Local-first, no external transmission |
| R19 | ONNX export | Planned | ⏳ Pending | Requires model training first |
| R20 | GPU acceleration | Planned | ⏳ Pending | Requires PyTorch backend |

## Critical Pending Items

### 1. GSoW Review
The complete Statement of Work EUM/RSP/SOW/18/985385 has NOT been reviewed.
Requirements above are inferred from the study description and domain knowledge.
**Action required**: Obtain and review the full SoW before declaring any compliance.

### 2. Authentic Data Validation
No validation has been performed with authentic FCI or METimage products.
All current results are from synthetic data with known ground truth.
**Action required**: Obtain sample products and validate format adapters.

### 3. Format Specification Verification
FCI and METimage data format specifications (IDDs) have not been verified against actual files.
Variable names, dimensions, groups, and scales are NOT confirmed.
**Action required**: Cross-reference with official EUMETSAT documentation.

## Compliance Declaration

**This system does NOT claim compliance with any EUMETSAT requirement.**

Compliance can only be declared after:
1. Full SoW review and requirements extraction
2. Validation with authentic satellite products
3. Independent quality review by domain experts
4. Formal acceptance testing against defined criteria
