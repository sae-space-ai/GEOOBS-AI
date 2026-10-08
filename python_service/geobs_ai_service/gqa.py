"""
GEOOBS-AI GQA Module — Three Independent Engines
ABSOLUTE_NAVIGATION_GQA, INTERCHANNEL_REGISTRATION_GQA, TEMPORAL_REGISTRATION_GQA
"""

import numpy as np
from typing import List, Dict, Any
import uuid
from datetime import datetime
from . import matching


def compute_absolute_gqa(
    references: List[Dict],
    image_width: int = 512,
    image_height: int = 512,
    grid_size: int = 10,
    ransac_threshold: float = 5.0
) -> Dict:
    """
    Absolute Navigation GQA: measure displacements vs independent geographic references.
    
    Args:
        references: List of reference points with expected and observed positions
        image_width: Image width in pixels
        image_height: Image height in pixels
        grid_size: Grid size for coverage computation
        ransac_threshold: RANSAC inlier threshold
    
    Returns:
        GQA result dictionary with all metrics
    """
    # Create pseudo-matches from references
    pseudo_matches = []
    for ref in references:
        pseudo_matches.append({
            'id': ref['id'],
            'featureRef': {
                'id': ref['id'],
                'position': ref['expectedPosition'],
                'descriptor': [],
                'response': 1.0,
                'octave': 0,
                'quality': 1.0,
                'method': 'shi-tomasi',
                'validated': True
            },
            'featureTarget': {
                'id': ref['id'] + '_obs',
                'position': ref['observedPosition'],
                'descriptor': [],
                'response': 1.0,
                'octave': 0,
                'quality': 1.0,
                'method': 'shi-tomasi',
                'validated': True
            },
            'distance': 0,
            'ratio': 1.0,
            'inlier': True,
            'ransacResidual': None
        })
    
    # Run RANSAC
    ransac_result = matching.ransac_affine(pseudo_matches, 500, ransac_threshold)
    inliers = [m for m in ransac_result['inliers'] if m['inlier']]
    
    # Compute metrics
    return _compute_metrics_from_matches(
        'ABSOLUTE_NAVIGATION', inliers, len(pseudo_matches),
        grid_size, image_width, image_height,
        {
            'referenceCount': len(references),
            'ransacInliers': len(inliers),
            'ransacResidual': ransac_result['residual'],
            'meanReferenceUncertainty': np.mean([r.get('referenceUncertainty', 0) for r in references]) if references else 0
        }
    )


def compute_interchannel_gqa(
    channel_pairs: List[Dict],
    grid_size: int = 10,
    ransac_threshold: float = 3.0
) -> Dict:
    """
    Interchannel Registration GQA: compare positions across spectral channels.
    
    Args:
        channel_pairs: List of channel pair dictionaries
        grid_size: Grid size for coverage
        ransac_threshold: RANSAC threshold
    
    Returns:
        GQA result dictionary
    """
    all_matches = []
    channel_stats = {}
    
    for pair in channel_pairs:
        # Match features between channels
        matches = matching.match_euclidean(
            pair['featuresRef'],
            pair['featuresTarget'],
            max_distance=20.0
        )
        
        # Run RANSAC
        ransac_result = matching.ransac_affine(matches, 500, ransac_threshold)
        inliers = [m for m in ransac_result['inliers'] if m['inlier']]
        
        key = f"{pair['channelRef']}-{pair['channelTarget']}"
        channel_stats[key] = len(inliers)
        all_matches.extend(inliers)
    
    return _compute_metrics_from_matches(
        'INTERCHANNEL_REGISTRATION', all_matches,
        sum(len(matching.match_euclidean(p['featuresRef'], p['featuresTarget'], 20.0)) for p in channel_pairs),
        grid_size, 512, 512,
        {'channelPairsProcessed': len(channel_pairs), **channel_stats}
    )


def compute_temporal_gqa(
    temporal_pairs: List[Dict],
    grid_size: int = 10,
    ransac_threshold: float = 5.0
) -> Dict:
    """
    Temporal Registration GQA: compare features between successive acquisitions.
    
    Args:
        temporal_pairs: List of temporal pair dictionaries
        grid_size: Grid size for coverage
        ransac_threshold: RANSAC threshold
    
    Returns:
        GQA result dictionary
    """
    all_matches = []
    pair_stats = {}
    error_vs_known = []
    
    for i, pair in enumerate(temporal_pairs):
        # Match features
        matches = matching.match(
            pair['featuresRef'],
            pair['featuresTarget'],
            method='hamming',
            ratio_threshold=0.8
        )
        
        # Run RANSAC
        ransac_result = matching.ransac_affine(matches, 1000, ransac_threshold)
        inliers = [m for m in ransac_result['inliers'] if m['inlier']]
        
        key = f"pair_{i}"
        pair_stats[key] = len(inliers)
        all_matches.extend(inliers)
        
        # Compute error vs known displacement if available
        if pair.get('expectedDisplacement'):
            for m in inliers:
                dx = m['featureTarget']['position']['col'] - m['featureRef']['position']['col']
                dy = m['featureTarget']['position']['row'] - m['featureRef']['position']['row']
                err_x = dx - pair['expectedDisplacement']['dx_pixels']
                err_y = dy - pair['expectedDisplacement']['dy_pixels']
                error_vs_known.append(np.sqrt(err_x**2 + err_y**2))
    
    mode_specific = {
        'temporalPairsProcessed': len(temporal_pairs),
        **pair_stats
    }
    
    if error_vs_known:
        mode_specific['meanErrorVsKnown'] = float(np.mean(error_vs_known))
        mode_specific['maxErrorVsKnown'] = float(np.max(error_vs_known))
        mode_specific['minErrorVsKnown'] = float(np.min(error_vs_known))
    
    total_observables = sum(len(matching.match(p['featuresRef'], p['featuresTarget'], 'hamming', 0.8)) for p in temporal_pairs)
    
    return _compute_metrics_from_matches(
        'TEMPORAL_REGISTRATION', all_matches, total_observables,
        grid_size, 512, 512, mode_specific
    )


def _compute_metrics_from_matches(
    mode: str,
    inliers: List[Dict],
    total_observables: int,
    grid_size: int,
    image_width: int,
    image_height: int,
    mode_specific: Dict
) -> Dict:
    """Compute common GQA metrics from matched features."""
    accepted_count = len(inliers)
    rejected_count = total_observables - accepted_count
    
    if not inliers:
        return {
            'id': str(uuid.uuid4()),
            'mode': mode,
            'computedAt': datetime.utcnow().isoformat(),
            'observableCount': total_observables,
            'acceptedCount': 0,
            'rejectedCount': rejected_count,
            'validRatio': 0.0,
            'meanBiasX': 0.0, 'meanBiasY': 0.0,
            'medianBiasX': 0.0, 'medianBiasY': 0.0,
            'rmseX': 0.0, 'rmseY': 0.0, 'rmseTotal': 0.0,
            'p50': 0.0, 'p90': 0.0, 'p95': 0.0, 'p99': 0.0,
            'stdX': 0.0, 'stdY': 0.0,
            'spatialCoverageRatio': 0.0,
            'gridCellsCovered': 0,
            'gridCellsTotal': grid_size * grid_size,
            'modeSpecific': mode_specific,
            'displacementVectors': []
        }
    
    # Compute displacements
    dx = np.array([m['featureTarget']['position']['col'] - m['featureRef']['position']['col'] for m in inliers])
    dy = np.array([m['featureTarget']['position']['row'] - m['featureRef']['position']['row'] for m in inliers])
    magnitudes = np.sqrt(dx**2 + dy**2)
    
    # Bias
    mean_bias_x = float(np.mean(dx))
    mean_bias_y = float(np.mean(dy))
    median_bias_x = float(np.median(dx))
    median_bias_y = float(np.median(dy))
    
    # RMSE
    rmse_x = float(np.sqrt(np.mean(dx**2)))
    rmse_y = float(np.sqrt(np.mean(dy**2)))
    rmse_total = float(np.sqrt(np.mean(magnitudes**2)))
    
    # Percentiles
    p50 = float(np.percentile(magnitudes, 50))
    p90 = float(np.percentile(magnitudes, 90))
    p95 = float(np.percentile(magnitudes, 95))
    p99 = float(np.percentile(magnitudes, 99))
    
    # Standard deviation
    std_x = float(np.std(dx))
    std_y = float(np.std(dy))
    
    # Spatial coverage
    cell_w = image_width / grid_size
    cell_h = image_height / grid_size
    covered_cells = set()
    vectors = []
    
    for m in inliers:
        x = m['featureRef']['position']['col']
        y = m['featureRef']['position']['row']
        gx = int(x / cell_w)
        gy = int(y / cell_h)
        covered_cells.add(f"{gx},{gy}")
        
        vectors.append({
            'x': x, 'y': y,
            'dx': m['featureTarget']['position']['col'] - x,
            'dy': m['featureTarget']['position']['row'] - y,
            'inlier': True
        })
    
    return {
        'id': str(uuid.uuid4()),
        'mode': mode,
        'computedAt': datetime.utcnow().isoformat(),
        'observableCount': total_observables,
        'acceptedCount': accepted_count,
        'rejectedCount': rejected_count,
        'validRatio': accepted_count / max(total_observables, 1),
        'meanBiasX': mean_bias_x,
        'meanBiasY': mean_bias_y,
        'medianBiasX': median_bias_x,
        'medianBiasY': median_bias_y,
        'rmseX': rmse_x,
        'rmseY': rmse_y,
        'rmseTotal': rmse_total,
        'p50': p50,
        'p90': p90,
        'p95': p95,
        'p99': p99,
        'stdX': std_x,
        'stdY': std_y,
        'spatialCoverageRatio': len(covered_cells) / (grid_size * grid_size),
        'gridCellsCovered': len(covered_cells),
        'gridCellsTotal': grid_size * grid_size,
        'modeSpecific': mode_specific,
        'displacementVectors': vectors
    }
