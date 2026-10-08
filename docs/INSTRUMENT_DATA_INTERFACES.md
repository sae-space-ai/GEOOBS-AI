# Instrument Data Interfaces — GEOOBS-AI

## MTG-FCI (Flexible Combined Imager)

### Mission
Meteosat Third Generation — Imaging (MTG-I) series

### Data Levels
- **L1b**: Calibrated radiances per channel, geolocated
- **L1c**: Gridded/rectified product on regular grid

### Expected Format
- NetCDF4 following FCI L1b IDD (Interface Data Document)
- Groups per channel or segmented file structure
- Variables: effective radiance, count, quality flags
- Dimensions: y, x (segment-based)

### Channels (16 spectral bands)
| Channel | λ (μm) | Type | Resolution |
|---------|---------|------|------------|
| VIS004 | 0.44 | Visible | 1 km |
| VIS005 | 0.51 | Visible | 1 km |
| VIS006 | 0.64 | Visible | 0.5 km (HRV-like) |
| VIS008 | 0.81 | Visible | 1 km |
| VIS009 | 0.91 | NIR | 1 km |
| NIR13 | 1.38 | NIR | 1 km |
| NIR16 | 1.61 | NIR | 1 km |
| NIR22 | 2.25 | NIR | 1 km |
| WV063 | 6.3 | Water Vapor | 2 km |
| WV073 | 7.3 | Water Vapor | 2 km |
| IR038 | 3.8 | Thermal IR | 2 km |
| IR087 | 8.7 | Thermal IR | 2 km |
| IR097 | 9.7 | Thermal IR | 2 km |
| IR105 | 10.5 | Thermal IR | 2 km |
| IR123 | 12.3 | Thermal IR | 2 km |
| IR133 | 13.3 | Thermal IR | 2 km |

### Status: ⏳ PENDING
- No authentic products available for testing
- Format specification not verified against actual files
- Variable names, dimensions, and scales NOT confirmed
- Adapter implementation requires Python/xarray/netCDF4

## METimage

### Mission
Metop-SG (Meteorological Operational Satellite - Second Generation)

### Data Levels
- **L1b**: Calibrated radiances, geolocated per scan line

### Expected Format
- HDF5 or NetCDF4 following METimage L1b IDD
- Scan-line based organization
- Variables: radiance, brightness temperature, quality

### Channels (20+ bands)
Similar spectral coverage to FCI with some differences in resolution and central wavelengths.

### Status: ⏳ PENDING
- Same limitations as FCI adapter
- Requires authentic products and format verification

## Generic Adapter

### Status: ✅ OPERATIONAL (limited)
- Accepts standard image formats (PNG, JPEG) via browser File API
- No geolocation metadata extraction
- No radiometric calibration
- Suitable for algorithm testing only

## Planned Implementation

```python
# Pseudocode for FCI adapter (Python scientific service)
import xarray as xr
import numpy as np

class FCIAdapter:
    def __init__(self, filepath: str):
        self.ds = xr.open_dataset(filepath)
        self.validate_format()
    
    def validate_format(self):
        # Check required variables exist
        # Check dimensions match IDD
        # Check calibration coefficients
        pass
    
    def get_channel(self, channel_id: str) -> np.ndarray:
        # Extract calibrated radiance
        pass
    
    def get_geolocation(self) -> tuple:
        # Extract lat/lon arrays
        pass
    
    def get_metadata(self) -> dict:
        # Extract acquisition time, platform, etc.
        pass
```

## Critical Note

**Variable names, dimension names, group structures, calibration coefficients, and quality flag definitions MUST be verified against the official IDD documents before implementation.** Assumptions about any of these could lead to incorrect scientific results.
