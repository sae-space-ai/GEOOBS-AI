# Geometric Quality Assessment — GEOOBS-AI

## Definition

GQA evaluates the geometric accuracy of satellite image geolocation by comparing observed feature positions against expected positions derived from a reference system.

## Metrics Implemented

### Bias
- **Mean Bias X**: Average horizontal displacement (systematic error)
- **Mean Bias Y**: Average vertical displacement
- **Median Bias X/Y**: Robust alternative to mean, less sensitive to outliers

### RMSE (Root Mean Square Error)
- **RMSE X**: √(Σdx²/n) — horizontal error magnitude
- **RMSE Y**: √(Σdy²/n) — vertical error magnitude
- **RMSE Total**: √(Σ(dx²+dy²)/n) — total displacement magnitude

### Percentiles
- **P50**: Median displacement magnitude
- **P90**: 90th percentile
- **P95**: 95th percentile
- **P99**: 99th percentile

### Dispersion
- **Std X**: Standard deviation of horizontal displacements
- **Std Y**: Standard deviation of vertical displacements

### Coverage
- **Spatial Coverage Ratio**: Fraction of image grid cells containing valid observables
- **Grid Cells**: Configurable grid (default 10×10)

### Quality Indicators
- **Valid Ratio**: Proportion of accepted observables
- **Inlier Ratio**: Proportion of RANSAC inliers among all matches

## Acceptance Criteria (Preliminary)

An observable is accepted when:
1. Displacement magnitude is within physically plausible range
2. Detection confidence exceeds threshold (ratio test < 0.8)
3. RANSAC residual is below threshold
4. Cloud condition is not overcast at the feature location
5. Feature is not in an image border region

## GQA Engine Independence

The GQA engine operates independently of the detection method:
- Input: Set of observables with displacements and metadata
- Output: Statistical metrics, distributions, coverage maps
- No assumption about how displacements were computed

## Limitations

- Current implementation works in pixel space only
- Geodetic displacement computation requires geolocation parameters (not yet available)
- Spatial coverage grid assumes uniform pixel size
- No temporal stability analysis yet (requires time series)
- No inter-channel comparison yet (requires multi-band data)

## Future Extensions

1. **Residual Maps**: 2D visualization of displacement residuals across the image
2. **Temporal Analysis**: Stability of GQA metrics over time
3. **Channel Comparison**: GQA per spectral band
4. **Uncertainty Propagation**: Including reference and geolocation uncertainties
5. **Automated Acceptance Thresholds**: Based on instrument specifications
