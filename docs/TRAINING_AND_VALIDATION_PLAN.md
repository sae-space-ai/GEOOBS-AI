# Training and Validation Plan — GEOOBS-AI

## Phase 1: Synthetic Validation (Current)

### Objective
Validate that displacement estimation algorithms recover known geometric transformations.

### Method
1. Generate synthetic scenes with known displacements (dx, dy)
2. Add noise and cloud contamination at controlled levels
3. Run feature detection and matching
4. Compare estimated displacement against known truth
5. Compute error statistics across parameter variations

### Parameters Varied
- Displacement magnitude: 0-10 pixels
- Noise level: 0-30 intensity units
- Cloud coverage: 0-50%
- Feature density: controlled by scene complexity

### Acceptance Criteria
- RMSE < 2 pixels for noise < 15 and cloud < 20%
- Inlier ratio > 50% for all non-degenerate cases
- Bias < 0.5 pixels for symmetric conditions

## Phase 2: Cross-Validation (Planned)

### Objective
Prevent overfitting and ensure generalization.

### Method
1. Generate large dataset (100+ scenes)
2. K-fold cross-validation (k=5)
3. Measure variance across folds
4. Identify parameter regimes where performance degrades

### Data Leakage Prevention
- No spatial overlap between folds
- No temporal correlation between folds
- Different random seeds per fold

## Phase 3: Real Data Validation (Pending)

### Objective
Validate on authentic satellite products.

### Method (when data available)
1. Obtain FCI L1b sample products from EUMETSAT
2. Verify format against IDD documentation
3. Extract calibrated radiances
4. Apply detection algorithms
5. Compare against operational geolocation products (if available)
6. Document discrepancies and their causes

### Challenges
- No ground truth for real satellite displacements
- Operational geolocation products have their own uncertainties
- Atmospheric effects not present in synthetic data
- Instrument-specific noise characteristics

## Phase 4: ML Model Training (Pending)

### Objective
Train deep learning feature detectors on satellite imagery.

### Method
1. Pretrain on natural images (if license permits)
2. Fine-tune on synthetic satellite data
3. Validate on held-out synthetic scenes
4. Evaluate on real satellite data (when available)

### Training Configuration
- Optimizer: AdamW
- Learning rate: 1e-4 with cosine annealing
- Batch size: 16 (GPU) or 4 (CPU)
- Epochs: 100 with early stopping
- Augmentation: rotation, scale, brightness, noise

### Evaluation Metrics
- Detection repeatability
- Descriptor matching accuracy
- Displacement estimation RMSE
- Computational cost (FLOPs, latency)
