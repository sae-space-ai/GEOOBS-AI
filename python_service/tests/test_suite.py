#!/usr/bin/env python3
"""
GEOOBS-AI Python Service Test Suite
Validates Python 3 scientific service functionality
"""

import sys
import os
import json
import time
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

def test_imports():
    """Test that all required modules can be imported"""
    print("Testing imports...")
    try:
        import numpy as np
        print("  ✓ NumPy imported")
        
        try:
            import cv2
            print("  ✓ OpenCV imported")
        except ImportError:
            print("  ⚠ OpenCV not available (optional)")
        
        try:
            from scipy import ndimage
            print("  ✓ SciPy imported")
        except ImportError:
            print("  ⚠ SciPy not available (optional)")
        
        return True
    except Exception as e:
        print(f"  ✗ Import failed: {e}")
        return False

def test_detection_module():
    """Test detection module functionality"""
    print("\nTesting detection module...")
    try:
        from geobs_ai_service import detection
        
        # Create a simple test image
        import numpy as np
        test_image = np.random.randint(0, 255, (512, 512, 3), dtype=np.uint8)
        
        # Test Shi-Tomasi detection
        features = detection.detect_shi_tomasi(test_image, max_corners=100)
        print(f"  ✓ Shi-Tomasi detected {len(features)} features")
        
        # Test ORB detection
        features = detection.detect_orb(test_image, max_features=100)
        print(f"  ✓ ORB detected {len(features)} features")
        
        return True
    except Exception as e:
        print(f"  ✗ Detection test failed: {e}")
        return False

def test_matching_module():
    """Test matching module functionality"""
    print("\nTesting matching module...")
    try:
        from geobs_ai_service import matching
        import numpy as np
        
        # Create mock features
        features1 = [
            {
                'id': f'f1_{i}',
                'position': {'row': i * 10, 'col': i * 10},
                'descriptor': np.random.randint(0, 2, 32).tolist(),
                'response': 1.0,
                'octave': 0,
                'quality': 1.0,
                'method': 'orb',
                'validated': True
            }
            for i in range(10)
        ]
        
        features2 = [
            {
                'id': f'f2_{i}',
                'position': {'row': i * 10 + 2, 'col': i * 10 + 2},
                'descriptor': np.random.randint(0, 2, 32).tolist(),
                'response': 1.0,
                'octave': 0,
                'quality': 1.0,
                'method': 'orb',
                'validated': True
            }
            for i in range(10)
        ]
        
        # Test matching
        matches = matching.match_features(features1, features2, method='hamming')
        print(f"  ✓ Matched {len(matches)} feature pairs")
        
        # Test RANSAC
        if len(matches) >= 3:
            result = matching.ransac_affine(matches, iterations=100, threshold=5.0)
            print(f"  ✓ RANSAC found {len([m for m in result['inliers'] if m['inlier']])} inliers")
        
        return True
    except Exception as e:
        print(f"  ✗ Matching test failed: {e}")
        return False

def test_gqa_module():
    """Test GQA module functionality"""
    print("\nTesting GQA module...")
    try:
        from geobs_ai_service import gqa
        
        # Create mock references
        references = [
            {
                'id': f'ref_{i}',
                'expectedPosition': {'row': i * 50, 'col': i * 50},
                'observedPosition': {'row': i * 50 + 2, 'col': i * 50 + 3},
                'referenceSource': 'test',
                'referenceUncertainty': 0.5,
                'geographicPosition': None
            }
            for i in range(10)
        ]
        
        # Test absolute GQA
        result = gqa.compute_absolute_gqa(references, image_width=512, image_height=512)
        print(f"  ✓ Absolute GQA computed: RMSE={result['rmseTotal']:.3f}px")
        
        return True
    except Exception as e:
        print(f"  ✗ GQA test failed: {e}")
        return False

def test_observables_module():
    """Test observables module functionality"""
    print("\nTesting observables module...")
    try:
        from geobs_ai_service import observables
        import tempfile
        import os
        
        # Create mock observables
        obs_list = [
            {
                'id': f'obs_{i}',
                'instrument': 'SYNTHETIC',
                'platform': 'SYNTHETIC',
                'productLevel': 'L1b',
                'acquisitionTime': '2026-01-01T00:00:00Z',
                'spectralBand': 'VIS006',
                'pixelPosition': {'row': i * 50, 'col': i * 50},
                'geoPosition': None,
                'coordinateSystem': 'pixel',
                'featureId': f'feat_{i}',
                'featureDescriptor': 'test',
                'referenceSystem': 'test',
                'expectedPosition': {'row': i * 50, 'col': i * 50},
                'observedPosition': {'row': i * 50 + 2, 'col': i * 50 + 3},
                'displacement': {
                    'dx_pixels': 3.0,
                    'dy_pixels': 2.0,
                    'dx_geodetic_m': None,
                    'dy_geodetic_m': None,
                    'magnitude_pixels': 3.6,
                    'magnitude_geodetic_m': None,
                    'direction_rad': 0.59,
                    'direction_deg': 33.7
                },
                'uncertainty': {
                    'sigma_x_pixels': 0.5,
                    'sigma_y_pixels': 0.5,
                    'sigma_x_geodetic_m': None,
                    'sigma_y_geodetic_m': None,
                    'confidence': 0.9,
                    'source': 'test'
                },
                'qualityMetric': 0.9,
                'detectionMethod': 'orb',
                'modelId': None,
                'modelVersion': None,
                'cloudCondition': 'clear',
                'dayNightCondition': 'day',
                'status': 'accepted',
                'sourceFileId': 'test',
                'processingChainId': 'test',
                'createdAt': '2026-01-01T00:00:00Z',
                'checksum': 'test'
            }
            for i in range(5)
        ]
        
        # Test JSON export
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            temp_json = f.name
        
        observables.export_json(obs_list, temp_json)
        print(f"  ✓ JSON export successful ({os.path.getsize(temp_json)} bytes)")
        os.unlink(temp_json)
        
        # Test CSV export
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            temp_csv = f.name
        
        observables.export_csv(obs_list, temp_csv)
        print(f"  ✓ CSV export successful ({os.path.getsize(temp_csv)} bytes)")
        os.unlink(temp_csv)
        
        return True
    except Exception as e:
        print(f"  ✗ Observables test failed: {e}")
        return False

def run_all_tests():
    """Run all tests and report results"""
    print("=" * 60)
    print("GEOOBS-AI Python Service Test Suite")
    print("=" * 60)
    
    start_time = time.time()
    
    tests = [
        ("Imports", test_imports),
        ("Detection", test_detection_module),
        ("Matching", test_matching_module),
        ("GQA", test_gqa_module),
        ("Observables", test_observables_module)
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n✗ Test '{name}' crashed: {e}")
            results.append((name, False))
    
    elapsed = time.time() - start_time
    
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print(f"Time: {elapsed:.2f}s")
    
    if passed == total:
        print("\n✓ ALL TESTS PASSED")
        return 0
    else:
        print(f"\n✗ {total - passed} TEST(S) FAILED")
        return 1

if __name__ == "__main__":
    sys.exit(run_all_tests())
