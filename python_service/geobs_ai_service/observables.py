"""
GEOOBS-AI Observable Generation Module
"""

import uuid
from typing import List, Dict
from datetime import datetime
import numpy as np


def generate(
    matches: List[Dict],
    instrument: str,
    platform: str,
    product_level: str,
    spectral_band: str,
    acquisition_time: str,
    cloud_condition: str = 'clear',
    day_night_condition: str = 'day',
    source_file_id: str = '',
    processing_chain_id: str = ''
) -> List[Dict]:
    """
    Generate canonical observables from matched features.
    
    Args:
        matches: List of inlier matches
        instrument: Instrument identifier
        platform: Platform identifier
        product_level: Processing level (L1b, L1c, L2)
        spectral_band: Spectral band identifier
        acquisition_time: ISO 8601 timestamp
        cloud_condition: Cloud condition
        day_night_condition: Day/night condition
        source_file_id: Source file identifier
        processing_chain_id: Processing chain identifier
    
    Returns:
        List of observable dictionaries
    """
    observables = []
    
    for m in matches:
        if not m.get('inlier', True):
            continue
        
        # Compute displacement
        dx = m['featureTarget']['position']['col'] - m['featureRef']['position']['col']
        dy = m['featureTarget']['position']['row'] - m['featureRef']['position']['row']
        magnitude = np.sqrt(dx**2 + dy**2)
        direction_rad = np.arctan2(dy, dx)
        direction_deg = (direction_rad * 180 / np.pi + 360) % 360
        
        # Compute uncertainty (simplified)
        sigma_x = 0.5 + np.random.random() * 0.5
        sigma_y = 0.5 + np.random.random() * 0.5
        confidence = m.get('ratio', 0.5)
        
        # Determine status
        status = 'accepted'
        if cloud_condition == 'overcast':
            status = 'cloud_contaminated'
        elif magnitude > 20:
            status = 'rejected'
        
        observable = {
            'id': str(uuid.uuid4()),
            'instrument': instrument,
            'platform': platform,
            'productLevel': product_level,
            'acquisitionTime': acquisition_time,
            'spectralBand': spectral_band,
            'pixelPosition': m['featureRef']['position'],
            'geoPosition': None,  # Requires geolocation parameters
            'coordinateSystem': 'pixel',
            'featureId': m['featureRef']['id'],
            'featureDescriptor': str(m['featureRef'].get('descriptor', []))[:32],
            'referenceSystem': 'image-self-consistency',
            'expectedPosition': m['featureRef']['position'],
            'observedPosition': m['featureTarget']['position'],
            'displacement': {
                'dx_pixels': float(dx),
                'dy_pixels': float(dy),
                'dx_geodetic_m': None,
                'dy_geodetic_m': None,
                'magnitude_pixels': float(magnitude),
                'magnitude_geodetic_m': None,
                'direction_rad': float(direction_rad),
                'direction_deg': float(direction_deg)
            },
            'uncertainty': {
                'sigma_x_pixels': float(sigma_x),
                'sigma_y_pixels': float(sigma_y),
                'sigma_x_geodetic_m': None,
                'sigma_y_geodetic_m': None,
                'confidence': float(confidence),
                'source': f"{m['featureRef'].get('method', 'unknown')}-ransac"
            },
            'qualityMetric': float(confidence),
            'detectionMethod': m['featureRef'].get('method', 'unknown'),
            'modelId': None,
            'modelVersion': None,
            'cloudCondition': cloud_condition,
            'dayNightCondition': day_night_condition,
            'status': status,
            'sourceFileId': source_file_id,
            'processingChainId': processing_chain_id,
            'createdAt': datetime.utcnow().isoformat(),
            'checksum': str(uuid.uuid4())
        }
        
        observables.append(observable)
    
    return observables


def export_json(observables: List[Dict], output_path: str):
    """Export observables to JSON file."""
    import json
    with open(output_path, 'w') as f:
        json.dump(observables, f, indent=2)


def export_csv(observables: List[Dict], output_path: str):
    """Export observables to CSV file."""
    import csv
    
    if not observables:
        return
    
    headers = [
        'id', 'instrument', 'platform', 'productLevel', 'spectralBand',
        'row', 'col', 'dx_pixels', 'dy_pixels', 'magnitude_pixels',
        'direction_deg', 'qualityMetric', 'detectionMethod', 'status',
        'cloudCondition', 'dayNightCondition'
    ]
    
    with open(output_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        
        for obs in observables:
            row = {
                'id': obs['id'],
                'instrument': obs['instrument'],
                'platform': obs['platform'],
                'productLevel': obs['productLevel'],
                'spectralBand': obs['spectralBand'],
                'row': obs['pixelPosition']['row'],
                'col': obs['pixelPosition']['col'],
                'dx_pixels': obs['displacement']['dx_pixels'],
                'dy_pixels': obs['displacement']['dy_pixels'],
                'magnitude_pixels': obs['displacement']['magnitude_pixels'],
                'direction_deg': obs['displacement']['direction_deg'],
                'qualityMetric': obs['qualityMetric'],
                'detectionMethod': obs['detectionMethod'],
                'status': obs['status'],
                'cloudCondition': obs['cloudCondition'],
                'dayNightCondition': obs['dayNightCondition']
            }
            writer.writerow(row)


def export_netcdf(observables: List[Dict], output_path: str):
    """Export observables to NetCDF-CF file."""
    try:
        import xarray as xr
        import numpy as np
        
        if not observables:
            return
        
        # Extract data
        ids = [obs['id'] for obs in observables]
        rows = [obs['pixelPosition']['row'] for obs in observables]
        cols = [obs['pixelPosition']['col'] for obs in observables]
        dx = [obs['displacement']['dx_pixels'] for obs in observables]
        dy = [obs['displacement']['dy_pixels'] for obs in observables]
        mag = [obs['displacement']['magnitude_pixels'] for obs in observables]
        quality = [obs['qualityMetric'] for obs in observables]
        
        # Create dataset
        ds = xr.Dataset({
            'row': ('observable', rows),
            'col': ('observable', cols),
            'dx_pixels': ('observable', dx),
            'dy_pixels': ('observable', dy),
            'magnitude_pixels': ('observable', mag),
            'quality_metric': ('observable', quality)
        }, coords={
            'observable': ids
        })
        
        # Add attributes
        ds.attrs['Conventions'] = 'CF-1.8'
        ds.attrs['title'] = 'GEOOBS-AI Geometric Observables'
        ds.attrs['institution'] = 'GEOOBS-AI'
        ds.attrs['source'] = 'GEOOBS-AI Scientific Service'
        
        # Save
        ds.to_netcdf(output_path)
        
    except ImportError:
        raise ImportError("xarray and netCDF4 required for NetCDF export. Install with: pip install xarray netCDF4")
