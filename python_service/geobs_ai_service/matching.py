"""
GEOOBS-AI Feature Matching and RANSAC Module
"""

import numpy as np
import cv2
from typing import List, Dict, Tuple, Optional
import uuid


def match(
    ref_features: List[Dict],
    target_features: List[Dict],
    method: str = 'hamming',
    ratio_threshold: float = 0.8
) -> List[Dict]:
    """
    Match features between reference and target.
    
    Args:
        ref_features: List of reference features
        target_features: List of target features
        method: Matching method ('hamming' for binary, 'euclidean' for float)
        ratio_threshold: Lowe's ratio test threshold
    
    Returns:
        List of match dictionaries
    """
    if not ref_features or not target_features:
        return []
    
    # Extract descriptors
    ref_desc = np.array([f['descriptor'] for f in ref_features if f['descriptor']], dtype=np.uint8)
    tgt_desc = np.array([f['descriptor'] for f in target_features if f['descriptor']], dtype=np.uint8)
    
    if len(ref_desc) == 0 or len(tgt_desc) == 0:
        return []
    
    # Create matcher
    if method == 'hamming':
        matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
    else:
        matcher = cv2.BFMatcher(cv2.NORM_L2, crossCheck=False)
    
    # KNN matching
    knn_matches = matcher.knnMatch(ref_desc, tgt_desc, k=2)
    
    # Apply ratio test
    matches = []
    for m_n in knn_matches:
        if len(m_n) == 2:
            m, n = m_n
            if m.distance < ratio_threshold * n.distance:
                matches.append({
                    'id': str(uuid.uuid4()),
                    'featureRef': ref_features[m.queryIdx],
                    'featureTarget': target_features[m.trainIdx],
                    'distance': float(m.distance),
                    'ratio': float(m.distance / n.distance),
                    'inlier': True,
                    'ransacResidual': None
                })
    
    return matches


def ransac_affine(
    matches: List[Dict],
    iterations: int = 1000,
    threshold: float = 5.0
) -> Dict:
    """
    RANSAC affine estimation.
    
    Args:
        matches: List of matches
        iterations: Number of RANSAC iterations
        threshold: Inlier threshold (pixels)
    
    Returns:
        Dictionary with inliers, model, and residual
    """
    if len(matches) < 3:
        return {'inliers': matches, 'model': None, 'residual': 0.0}
    
    # Extract points
    src_pts = np.float32([[m['featureRef']['position']['col'], m['featureRef']['position']['row']] for m in matches]).reshape(-1, 1, 2)
    dst_pts = np.float32([[m['featureTarget']['position']['col'], m['featureTarget']['position']['row']] for m in matches]).reshape(-1, 1, 2)
    
    # RANSAC
    M, mask = cv2.estimateAffinePartial2D(src_pts, dst_pts, method=cv2.RANSAC, ransacReprojThreshold=threshold, maxIters=iterations)
    
    if M is None or mask is None:
        return {'inliers': matches, 'model': None, 'residual': 0.0}
    
    # Mark inliers
    inliers = []
    total_residual = 0.0
    for i, m in enumerate(matches):
        is_inlier = bool(mask[i])
        if is_inlier:
            # Compute residual
            src = np.float32([[m['featureRef']['position']['col'], m['featureRef']['position']['row']]]).reshape(-1, 1, 2)
            dst_pred = cv2.transform(src, M)
            dst_actual = np.float32([[m['featureTarget']['position']['col'], m['featureTarget']['position']['row']]])
            residual = np.linalg.norm(dst_pred - dst_actual)
            total_residual += residual
        
        inliers.append({
            **m,
            'inlier': is_inlier,
            'ransacResidual': float(residual) if is_inlier else None
        })
    
    avg_residual = total_residual / len(matches) if matches else 0.0
    
    return {
        'inliers': inliers,
        'model': M.tolist() if M is not None else None,
        'residual': float(avg_residual)
    }


def match_euclidean(
    ref_features: List[Dict],
    target_features: List[Dict],
    max_distance: float = 50.0
) -> List[Dict]:
    """
    Match features by Euclidean distance (for interchannel registration).
    
    Args:
        ref_features: Reference features
        target_features: Target features
        max_distance: Maximum distance threshold
    
    Returns:
        List of matches
    """
    matches = []
    for f1 in ref_features:
        best_dist = float('inf')
        best_match = None
        
        for f2 in target_features:
            dx = f1['position']['col'] - f2['position']['col']
            dy = f1['position']['row'] - f2['position']['row']
            dist = np.sqrt(dx*dx + dy*dy)
            
            if dist < best_dist:
                best_dist = dist
                best_match = f2
        
        if best_match and best_dist < max_distance:
            matches.append({
                'id': str(uuid.uuid4()),
                'featureRef': f1,
                'featureTarget': best_match,
                'distance': float(best_dist),
                'ratio': 1.0 - best_dist / max_distance,
                'inlier': True,
                'ransacResidual': None
            })
    
    return matches
