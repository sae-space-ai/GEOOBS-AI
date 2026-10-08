# Requirements Compliance Matrix — GEOOBS-AI

## Reference
- **Document**: EUM2026956 v2, 7 August 2026
- **Study**: Creation of observables through AI/ML methods
- **Matrix Version**: 1.0 (Pre-contractual)
- **Last Updated**: 2026

## Status Definitions

| Status | Meaning |
|--------|---------|
| NOT_STARTED | Work has not begun |
| IN_PROGRESS | Work is actively underway |
| IMPLEMENTED_NOT_TESTED | Code exists but tests have not run |
| TESTED_LOCALLY | Tested on synthetic/local data |
| VERIFIED | Verified with authentic data and evidence |
| BLOCKED_EXTERNAL | Blocked by external dependency |
| NOT_APPLICABLE_JUSTIFIED | Not applicable with documented justification |

## Compliance Matrix

### Block 1: Geometric Evaluation Engines

| ID | Requirement | Module | Code | Test | Evidence | Status | Dependencies | Risk | Deliverable |
|----|-------------|--------|------|------|----------|--------|--------------|------|-------------|
| R01 | Absolute navigation GQA: displacements between observed positions and independent geographic references | engine/gqa_absolute.ts | computeAbsoluteGQA() | Recover known displacements within 1px RMSE | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D4/D7 |
| R02 | Interchannel registration GQA: compare positions across spectral channels | engine/gqa_interchannel.ts | computeInterchannelGQA() | Match features between VIS/IR with uncertainty | TEST_REPORT.md | TESTED_LOCALLY | None | Medium | D4/D7 |
| R03 | Temporal registration GQA: compare features between successive acquisitions | engine/gqa_temporal.ts | computeTemporalGQA() | Track features across time with known displacements | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D4/D7 |

### Block 2: Core Algorithms

| ID | Requirement | Module | Code | Test | Evidence | Status | Dependencies | Risk | Deliverable |
|----|-------------|--------|------|------|----------|--------|--------------|------|-------------|
| R04 | Observable canonical schema (30+ fields) | src/types/index.ts | GeometricObservable | All fields present and populated | src/types/index.ts | IMPLEMENTED_NOT_TESTED | None | Low | D4/D7 |
| R05 | Shi-Tomasi corner detection | engine/scientific.ts | shiTomasiDetect() | Detect corners with quality/NMS | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D4 |
| R06 | ORB feature detection (FAST+BRIEF) | engine/scientific.ts | orbDetect() | Detect features with binary descriptors | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D4 |
| R07 | RANSAC affine estimation | engine/scientific.ts | ransacAffine() | Robust estimation with configurable params | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D4 |
| R08 | Feature matching with ratio test | engine/scientific.ts | matchFeatures() | Lowe's ratio test | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D4 |
| R09 | Synthetic scene generation with known truth | engine/synthetic.ts | generateSyntheticScene() | Deterministic scenes | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D4/D7 |
| R10 | GQA metrics: bias, RMSE, percentiles, coverage | engine/scientific.ts | computeGQA() | All metrics computed correctly | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D4 |

### Block 3: Data I/O and Adapters

| ID | Requirement | Module | Code | Test | Evidence | Status | Dependencies | Risk | Deliverable |
|----|-------------|--------|------|------|----------|--------|--------------|------|-------------|
| R11 | Export observables to JSON | screens/ObservableExplorer.tsx | exportJSON() | Valid JSON with full schema | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D4 |
| R12 | Export observables to CSV | screens/ObservableExplorer.tsx | exportCSV() | Valid CSV with headers | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D4 |
| R13 | Export observables to NetCDF-CF | Planned Python service | — | NetCDF-CF compliant file | — | BLOCKED_EXTERNAL | Python/xarray | High | D7 |
| R14 | FCI L1b data adapter | Planned Python service | — | Read authentic FCI L1b | — | BLOCKED_EXTERNAL | Authentic FCI products | High | D4/D7 |
| R15 | METimage L1b data adapter | Planned Python service | — | Read authentic METimage L1b | — | BLOCKED_EXTERNAL | Authentic METimage products | High | D4/D7 |
| R16 | AVHRR data adapter (complementary) | Planned Python service | — | Read authentic AVHRR | — | BLOCKED_EXTERNAL | Authentic AVHRR products | Medium | D7 |

### Block 4: Preprocessing and Conditions

| ID | Requirement | Module | Code | Test | Evidence | Status | Dependencies | Risk | Deliverable |
|----|-------------|--------|------|------|----------|--------|--------------|------|-------------|
| R17 | Cloud detection and masking | engine/scientific.ts | Synthetic only | Mask cloudy pixels | — | IN_PROGRESS | Real algorithm needed | Medium | D4 |
| R18 | Day/night condition handling | engine/scientific.ts | dayNightCondition field | Tag with illumination | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D4 |
| R19 | Multi-spectral channel comparison | screens/ChannelComparison.tsx | Based on specs | Compare detectability | — | IN_PROGRESS | Authentic multi-band data | Medium | D6 |
| R20 | GEO vs LEO comparative analysis | screens/GEOvsLEO.tsx | Based on specs | Compare characteristics | — | IN_PROGRESS | Authentic GEO/LEO data | Medium | D6 |

### Block 5: User Interface

| ID | Requirement | Module | Code | Test | Evidence | Status | Dependencies | Risk | Deliverable |
|----|-------------|--------|------|------|----------|--------|--------------|------|-------------|
| R21 | Image acquisition via web | screens/ImageAcquisition.tsx | File upload | Load images with validation | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D3/D4 |
| R22 | Multispectral viewer with overlays | screens/MultispectralViewer.tsx | Canvas rendering | Visualize features/vectors | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D3/D4 |
| R23 | Feature detection laboratory | screens/FeatureDetector.tsx | Interactive detection | Detect/match interactively | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D3/D4 |
| R24 | Observable explorer with filtering | screens/ObservableExplorer.tsx | Filter/browse | Browse and filter | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D3/D4 |
| R25 | GQA evaluation dashboard | screens/GQAEvaluation.tsx | Charts/metrics | Visualize GQA results | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D3/D4 |
| R26 | AI laboratory for batch experiments | screens/AILaboratory.tsx | Batch runner | Multiple configurations | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D4/D5 |
| R27 | Training center with reproducibility | screens/TrainingCenter.tsx | Seeded training | Reproducible experiments | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D5/D7 |
| R28 | Model catalog with versioning | screens/ModelAdmin.tsx | Model entries | Track versions/licenses | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D4/D7 |
| R29 | Audit trail and traceability | store/AppContext.tsx | Operation logging | Full audit trail | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D6/D8 |
| R30 | Report generation center | screens/ReportCenter.tsx | Export reports | Downloadable reports | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D1/D2/D6 |
| R31 | System status and dependencies | screens/SystemStatus.tsx | Health monitoring | Monitor components | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D8 |

### Block 6: Architecture and Infrastructure

| ID | Requirement | Module | Code | Test | Evidence | Status | Dependencies | Risk | Deliverable |
|----|-------------|--------|------|------|----------|--------|--------------|------|-------------|
| R32 | Python 3 scientific core | Planned Python service | — | All ops via Python CLI | — | NOT_STARTED | Python development | High | D4/D7 |
| R33 | Git repository for EUMETSAT | Infrastructure | .gitignore | Ready for EUMETSAT hosting | — | BLOCKED_EXTERNAL | EUMETSAT Git access | Medium | D4 |
| R34 | Near-real-time monitoring | Planned Python service | — | Automated reception/analysis | — | NOT_STARTED | Operational data feed | High | D4/D7 |
| R35 | Geometric degradation detection | Planned Python service | — | Detect statistical degradation | — | NOT_STARTED | None | Medium | D4 |

### Block 7: AI Governance (R36–R47)

| ID | Requirement | Module | Code | Test | Evidence | Status | Dependencies | Risk | Deliverable |
|----|-------------|--------|------|------|----------|--------|--------------|------|-------------|
| R36 | AI coding assistant authorization | AI_USAGE_APPROVAL_REGISTER.md | PENDING_AUTHORIZATION | Written EUMETSAT authorization | — | BLOCKED_EXTERNAL | EUMETSAT authorization | High | All |
| R37 | AI tool register | AI_USAGE_APPROVAL_REGISTER.md | Register created | Document AI tools | — | IN_PROGRESS | Authorization first | Medium | All |
| R38 | Human review of AI output | Governance process | — | All AI output reviewed | — | NOT_STARTED | Authorization first | Medium | All |
| R39 | License audit of dependencies | screens/SystemStatus.tsx | Inventory created | Verify license compatibility | — | IN_PROGRESS | Full scan | Low | D8 |
| R40 | Vulnerability review | Planned security scan | — | Security scan passed | — | NOT_STARTED | Security tools | Low | D8 |
| R41 | Code originality analysis | Governance process | — | Originality verified | — | NOT_STARTED | Originality tools | Low | D8 |
| R42 | Sensitive information protection | docs/SECURITY_AND_SOVEREIGNTY.md | Local-first | No data leaked | — | IN_PROGRESS | Classification procedures | Low | D8 |
| R43 | Traceability of operations | store/AppContext.tsx | Audit trail | Full chain traceable | TEST_REPORT.md | TESTED_LOCALLY | None | Low | D6/D8 |
| R44 | Responsibility documentation | docs/ARCHITECTURE.md | Roles defined | RACI matrix | — | NOT_STARTED | Contract start | Low | D8 |
| R45 | AI output validation | Testing framework | — | All outputs validated | — | NOT_STARTED | Authorization first | Medium | All |
| R46 | Version control of AI code | Infrastructure | Git planned | All changes tracked | — | BLOCKED_EXTERNAL | Repository access | Low | D4 |
| R47 | AI usage reporting | AI_USAGE_APPROVAL_REGISTER.md | Register mechanism | Regular reports | — | NOT_STARTED | Authorization first | Low | All |

### Block 8: Deliverables and Efficiency

| ID | Requirement | Module | Code | Test | Evidence | Status | Dependencies | Risk | Deliverable |
|----|-------------|--------|------|------|----------|--------|--------------|------|-------------|
| R48 | Deliverable D1-D9 structure | docs/ | Placeholders | All deliverables structured | — | IN_PROGRESS | Contract start | Medium | All |
| R49 | Computational efficiency measurement | Planned benchmark | — | Measure CPU/GPU/memory | — | NOT_STARTED | None | Medium | D6/D8 |

## Summary Statistics

| Status | Count | Percentage |
|--------|-------|------------|
| TESTED_LOCALLY | 22 | 44.9% |
| IMPLEMENTED_NOT_TESTED | 1 | 2.0% |
| IN_PROGRESS | 6 | 12.2% |
| NOT_STARTED | 8 | 16.3% |
| BLOCKED_EXTERNAL | 7 | 14.3% |
| NOT_APPLICABLE_JUSTIFIED | 0 | 0.0% |
| VERIFIED | 0 | 0.0% |
| **Total** | **49** | **100%** |

## Critical Blockers

1. **R36**: AI authorization — blocks all AI-assisted contractual work
2. **R14/R15**: Authentic satellite products — blocks adapter validation
3. **R32**: Python scientific core — blocks operational processing
4. **R33**: EUMETSAT Git access — blocks repository integration
5. **R34**: Operational data feed — blocks near-real-time monitoring

## Verification Path

```
Current State (TESTED_LOCALLY on synthetic data)
    ↓
Phase 1: Python core + adapters (requires development)
    ↓
Phase 2: Authentic data validation (requires products)
    ↓
Phase 3: Operational testing (requires infrastructure)
    ↓
VERIFIED status (requires EUMETSAT acceptance)
```

## Notes

- No requirement is declared VERIFIED without authentic data evidence
- BLOCKED_EXTERNAL items require EUMETSAT cooperation to proceed
- All synthetic data tests are necessary but insufficient for operational validation
- The matrix shall be updated at each project milestone
