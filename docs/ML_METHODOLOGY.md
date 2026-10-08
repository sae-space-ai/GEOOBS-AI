# ML Methodology — GEOOBS-AI

## Current Approach: Classical Computer Vision

### Shi-Tomasi Corner Detection
- Computes structure tensor (Ix², IxIy, Iy²) over a window
- Returns minimum eigenvalue as corner response
- Non-maximum suppression with configurable minimum distance
- **Strengths**: Fast, deterministic, well-understood error model
- **Limitations**: Sensitive to noise, limited to corner-type features

### ORB (Oriented FAST and Rotated BRIEF)
- FAST-9 keypoint detection with intensity threshold
- BRIEF binary descriptors (32 bytes)
- Hamming distance matching with Lowe's ratio test
- **Strengths**: Rotation invariant (in full implementation), efficient matching
- **Limitations**: Simplified TypeScript port lacks full orientation estimation

### RANSAC Affine Estimation
- Random sampling of 3 correspondences
- Affine model: x' = ax + by + tx, y' = cx + dy + ty
- Configurable iterations (default 1000) and inlier threshold
- **Strengths**: Robust to outliers, no assumption about error distribution
- **Limitations**: May not converge for very low inlier ratios

## Planned Deep Learning Approach

### Candidate Architectures
1. **SuperPoint**: Self-supervised detection + description
2. **R2D2**: Repeatable, reliable detector-descriptor
3. **LoFTR**: Detector-free matching with transformers
4. **LightGlue**: Adaptive-depth feature matcher

### Training Strategy
- Supervised learning with synthetic data (known displacements)
- Transfer learning from natural image models to satellite domain
- Strict train/validation/test split preventing spatial leakage
- Multi-spectral training when channels are physically compatible
- Self-supervised pretraining on unlabeled satellite imagery

### Validation Protocol
1. Synthetic data with known truth → algorithm validation
2. Cross-validation on held-out scenes → overfitting detection
3. Temporal split → generalization assessment
4. Authentic satellite data → operational readiness (pending)

### Data Leakage Prevention
- No overlap between training and test images
- No spatially adjacent images in different sets
- No same-date images across sets
- No same-orbit images across sets

## Reinforcement Learning

**Not currently planned.** RL is not appropriate for this problem because:
- The objective (geometric displacement estimation) has a clear supervised formulation
- No sequential decision-making is required
- Reward signal would be equivalent to supervised loss
- Sample efficiency would be poor compared to supervised approaches

RL may be reconsidered if:
- Adaptive observation planning is required
- Multi-step processing chains need optimization
- Active learning strategies prove beneficial

## Uncertainty Quantification

- Classical methods: Uncertainty from RANSAC residual distribution
- ML methods: Monte Carlo dropout, ensemble variance, or learned uncertainty
- All observables carry explicit uncertainty estimates
- Uncertainty propagation into GQA metrics

## Model Governance

- Every model has: name, version, license, source, training data, metrics
- No pretrained model used without license verification
- Model checksums tracked for integrity
- Export to ONNX for deployment independence
