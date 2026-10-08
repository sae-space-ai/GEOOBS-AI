"""
GEOOBS-AI Feature Detection Module
Implements Shi-Tomasi and ORB detection using OpenCV
"""

import cv2
import numpy as np
from typing import List, Dict, Optional
import uuid


def detect(
    image_path: str,
    method: str = 'orb',
    max_features: int = 500,
    quality_level: float = 0.01,
    min_distance: int = 10
) -> List[Dict]:
    """
    Detect features in an image using specified method.
    
    Args:
        image_path: Path to image file
        method: Detection method ('shi-tomasi', 'orb', 'sift')
        max_features: Maximum number of features to detect
        quality_level: Quality level for Shi-Tomasi (0-1)
        min_distance: Minimum distance between features (pixels)
    
    Returns:
        List of feature dictionaries with position, descriptor, response, etc.
    """
    # Read image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image: {image_path}")
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    if method == 'shi-tomasi':
        return _detect_shi_tomasi(gray, max_features, quality_level, min_distance)
    elif method == 'orb':
        return _detect_orb(gray, max_features)
    elif method == 'sift':
        return _detect_sift(gray, max_features)
    else:
        raise ValueError(f"Unknown detection method: {method}")


def _detect_shi_tomasi(
    gray: np.ndarray,
    max_corners: int,
    quality_level: float,
    min_distance: int
) -> List[Dict]:
    """Shi-Tomasi corner detection"""
    corners = cv2.goodFeaturesToTrack(
        gray,
        maxCorners=max_corners,
        qualityLevel=quality_level,
        minDistance=min_distance
    )
    
    if corners is None:
        return []
    
    features = []
    for corner in corners:
        x, y = corner.ravel()
        features.append({
            'id': str(uuid.uuid4()),
            'position': {'row': int(y), 'col': int(x)},
            'descriptor': [],  # Shi-Tomasi doesn't produce descriptors
            'response': float(cv2.cornerMinEigenVal(gray, 5)[int(y), int(x)]),
            'octave': 0,
            'quality': 1.0,
            'method': 'shi-tomasi',
            'validated': True
        })
    
    return features


def _detect_orb(gray: np.ndarray, max_features: int) -> List[Dict]:
    """ORB feature detection (FAST + BRIEF)"""
    orb = cv2.ORB_create(nfeatures=max_features)
    keypoints, descriptors = orb.detectAndCompute(gray, None)
    
    if keypoints is None or descriptors is None:
        return []
    
    features = []
    for i, kp in enumerate(keypoints):
        features.append({
            'id': str(uuid.uuid4()),
            'position': {'row': int(kp.pt[1]), 'col': int(kp.pt[0])},
            'descriptor': descriptors[i].tolist() if descriptors is not None else [],
            'response': float(kp.response),
            'octave': kp.octave,
            'quality': min(float(kp.response) / 100.0, 1.0),
            'method': 'orb',
            'validated': True
        })
    
    return features


def _detect_sift(gray: np.ndarray, max_features: int) -> List[Dict]:
    """SIFT feature detection"""
    sift = cv2.SIFT_create(nfeatures=max_features)
    keypoints, descriptors = sift.detectAndCompute(gray, None)
    
    if keypoints is None or descriptors is None:
        return []
    
    features = []
    for i, kp in enumerate(keypoints):
        features.append({
            'id': str(uuid.uuid4()),
            'position': {'row': int(kp.pt[1]), 'col': int(kp.pt[0])},
            'descriptor': descriptors[i].tolist() if descriptors is not None else [],
            'response': float(kp.response),
            'octave': kp.octave,
            'quality': min(float(kp.response) / 100.0, 1.0),
            'method': 'sift',
            'validated': True
        })
    
    return features


def detect_from_array(
    image_array: np.ndarray,
    method: str = 'orb',
    max_features: int = 500,
    quality_level: float = 0.01,
    min_distance: int = 10
) -> List[Dict]:
    """
    Detect features from numpy array instead of file path.
    
    Args:
        image_array: Image as numpy array (BGR or grayscale)
        method: Detection method
        max_features: Maximum features
        quality_level: Quality level for Shi-Tomasi
        min_distance: Minimum distance between features
    
    Returns:
        List of feature dictionaries
    """
    if len(image_array.shape) == 3:
        gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
    else:
        gray = image_array
    
    if method == 'shi-tomasi':
        return _detect_shi_tomasi(gray, max_features, quality_level, min_distance)
    elif method == 'orb':
        return _detect_orb(gray, max_features)
    elif method == 'sift':
        return _detect_sift(gray, max_features)
    else:
        raise ValueError(f"Unknown detection method: {method}")
