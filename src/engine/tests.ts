// GEOOBS-AI Automated Test Suite
// Executable in browser console or via test runner

import { generateSyntheticScene } from './synthetic';
import { shiTomasiDetect, orbDetect, matchFeatures, ransacAffine, computeGQA, generateObservables } from './scientific';
import { computeAbsoluteGQA, computeInterchannelGQA, computeTemporalGQA } from './gqa_modes';
import type { AbsoluteReference, ChannelPair, TemporalPair } from './gqa_modes';
import { v4 as uuidv4 } from 'uuid';

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
  details?: Record<string, number | string>;
}

export interface TestSuiteResult {
  suite: string;
  timestamp: string;
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
}

// ============================================================
// TEST UTILITIES
// ============================================================

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function assertApprox(actual: number, expected: number, tolerance: number, message: string): void {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`Assertion failed: ${message} (expected ~${expected}, got ${actual}, tolerance ${tolerance})`);
  }
}

function runTest(name: string, fn: () => void): TestResult {
  const start = performance.now();
  try {
    fn();
    return { name, passed: true, message: 'OK', duration: performance.now() - start };
  } catch (e) {
    return { name, passed: false, message: (e as Error).message, duration: performance.now() - start };
  }
}

// ============================================================
// TEST SUITE: Core Algorithms
// ============================================================

export function runCoreTests(): TestSuiteResult {
  const results: TestResult[] = [];

  results.push(runTest('Synthetic scene generation', () => {
    const scene = generateSyntheticScene(256, 256, 3, -2, 5, 0, 0.8, 42);
    assert(scene.width === 256, 'Width should be 256');
    assert(scene.height === 256, 'Height should be 256');
    assert(scene.refImageData !== null, 'Ref image should exist');
    assert(scene.targetImageData !== null, 'Target image should exist');
    assertApprox(scene.knownDisplacement.dx_pixels, 3, 0.01, 'Known dx should be 3');
    assertApprox(scene.knownDisplacement.dy_pixels, -2, 0.01, 'Known dy should be -2');
  }));

  results.push(runTest('Shi-Tomasi detects corners', () => {
    const scene = generateSyntheticScene(256, 256, 2, -1, 5, 0, 0.8, 42);
    const features = shiTomasiDetect(scene.refImageData!, 100, 0.01);
    assert(features.length > 10, `Should detect >10 corners, got ${features.length}`);
    assert(features.length <= 100, 'Should respect maxCorners');
    for (const f of features) {
      assert(f.position.col >= 0 && f.position.col < 256, 'Col in range');
      assert(f.position.row >= 0 && f.position.row < 256, 'Row in range');
      assert(f.response > 0, 'Response should be positive');
    }
  }));

  results.push(runTest('ORB detects features with descriptors', () => {
    const scene = generateSyntheticScene(256, 256, 2, -1, 5, 0, 0.8, 42);
    const features = orbDetect(scene.refImageData!, 100);
    assert(features.length > 5, `Should detect >5 features, got ${features.length}`);
    for (const f of features) {
      assert(f.descriptor.length === 32, 'BRIEF descriptor should be 32 bits');
      assert(f.method === 'orb', 'Method should be orb');
    }
  }));

  results.push(runTest('Feature matching produces matches', () => {
    const scene = generateSyntheticScene(256, 256, 3, -2, 5, 0, 0.8, 42);
    const refF = orbDetect(scene.refImageData!, 150);
    const tgtF = orbDetect(scene.targetImageData!, 150);
    const matches = matchFeatures(refF, tgtF, 0.85);
    assert(matches.length > 0, 'Should produce some matches');
    for (const m of matches) {
      assert(m.ratio < 0.85, 'Ratio should be below threshold');
      assert(m.distance >= 0, 'Distance should be non-negative');
    }
  }));

  results.push(runTest('RANSAC identifies inliers', () => {
    const scene = generateSyntheticScene(256, 256, 3, -2, 5, 0, 0.8, 42);
    const refF = orbDetect(scene.refImageData!, 150);
    const tgtF = orbDetect(scene.targetImageData!, 150);
    const matches = matchFeatures(refF, tgtF, 0.85);
    const ransac = ransacAffine(matches, 500, 5.0);
    const inliers = ransac.inliers.filter(m => m.inlier);
    assert(inliers.length > 0, 'Should have inliers');
    assert(inliers.length <= matches.length, 'Inliers <= matches');
  }));

  results.push(runTest('Displacement recovery within tolerance', () => {
    const knownDx = 3.5;
    const knownDy = -2.0;
    const scene = generateSyntheticScene(512, 512, knownDx, knownDy, 5, 0, 0.8, 42);
    const refF = orbDetect(scene.refImageData!, 200);
    const tgtF = orbDetect(scene.targetImageData!, 200);
    const matches = matchFeatures(refF, tgtF, 0.85);
    const ransac = ransacAffine(matches, 1000, 5.0);
    const inliers = ransac.inliers.filter(m => m.inlier);
    
    if (inliers.length > 5) {
      const meanDx = inliers.reduce((s, m) => s + (m.featureTarget.position.col - m.featureRef.position.col), 0) / inliers.length;
      const meanDy = inliers.reduce((s, m) => s + (m.featureTarget.position.row - m.featureRef.position.row), 0) / inliers.length;
      assertApprox(meanDx, knownDx, 2.0, `Mean dx should be ~${knownDx}`);
      assertApprox(meanDy, knownDy, 2.0, `Mean dy should be ~${knownDy}`);
    }
  }));

  results.push(runTest('GQA metrics computed correctly', () => {
    const scene = generateSyntheticScene(512, 512, 3, -2, 5, 0, 0.8, 42);
    const refF = orbDetect(scene.refImageData!, 200);
    const tgtF = orbDetect(scene.targetImageData!, 200);
    const matches = matchFeatures(refF, tgtF, 0.85);
    const ransac = ransacAffine(matches, 500, 5.0);
    const inliers = ransac.inliers.filter(m => m.inlier);
    const observables = generateObservables(inliers, 'SYNTHETIC' as any, 'SYNTHETIC' as any, 'L1b', 'VIS006', new Date().toISOString(), 'clear', 'day', 'test', 'test-chain');
    const gqa = computeGQA(observables);
    assert(gqa.observableCount === observables.length, 'Count should match');
    assert(gqa.rmseTotal >= 0, 'RMSE should be non-negative');
    assert(gqa.p50 >= 0, 'P50 should be non-negative');
    assert(gqa.p95 >= gqa.p50, 'P95 >= P50');
    assert(gqa.validRatio >= 0 && gqa.validRatio <= 1, 'Valid ratio in [0,1]');
  }));

  return {
    suite: 'Core Algorithms',
    timestamp: new Date().toISOString(),
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    results
  };
}

// ============================================================
// TEST SUITE: Three GQA Modes
// ============================================================

export function runGQAModeTests(): TestSuiteResult {
  const results: TestResult[] = [];

  results.push(runTest('ABSOLUTE_NAVIGATION_GQA with known references', () => {
    // Create references with known displacements
    const references: AbsoluteReference[] = [];
    for (let i = 0; i < 30; i++) {
      const x = 50 + (i % 6) * 70;
      const y = 50 + Math.floor(i / 6) * 70;
      references.push({
        id: `ref_${i}`,
        expectedPosition: { row: y, col: x },
        observedPosition: { row: y + 2.5 + Math.random() * 0.5, col: x + 3.0 + Math.random() * 0.5 },
        referenceSource: 'synthetic_gcp',
        referenceUncertainty: 0.5,
        geographicPosition: null
      });
    }
    const result = computeAbsoluteGQA(references, 512, 512, 10, 5.0);
    assert(result.mode === 'ABSOLUTE_NAVIGATION', 'Mode should be ABSOLUTE_NAVIGATION');
    assert(result.observableCount === 30, 'Should have 30 observables');
    assert(result.acceptedCount > 0, 'Should have accepted observables');
    assert(result.rmseTotal >= 0, 'RMSE >= 0');
    assert(result.meanBiasX > 2 && result.meanBiasX < 4, `Bias X should be ~3, got ${result.meanBiasX}`);
    assert(result.meanBiasY > 2 && result.meanBiasY < 3.5, `Bias Y should be ~2.5, got ${result.meanBiasY}`);
  }));

  results.push(runTest('INTERCHANNEL_REGISTRATION_GQA with channel pairs', () => {
    const scene = generateSyntheticScene(256, 256, 1, -0.5, 3, 0, 0.8, 42);
    const refF = orbDetect(scene.refImageData!, 100);
    const tgtF = orbDetect(scene.targetImageData!, 100);
    
    const pairs: ChannelPair[] = [
      { channelRef: 'VIS006', channelTarget: 'VIS008', featuresRef: refF, featuresTarget: tgtF, imageWidth: 256, imageHeight: 256 },
      { channelRef: 'VIS006', channelTarget: 'NIR16', featuresRef: refF, featuresTarget: tgtF, imageWidth: 256, imageHeight: 256 }
    ];
    
    const result = computeInterchannelGQA(pairs, 10, 10.0);
    assert(result.mode === 'INTERCHANNEL_REGISTRATION', 'Mode should be INTERCHANNEL_REGISTRATION');
    assert(result.observableCount > 0, 'Should have observables');
    assert(Object.keys(result.modeSpecific).length > 0, 'Should have channel-specific stats');
  }));

  results.push(runTest('TEMPORAL_REGISTRATION_GQA with time pairs', () => {
    const scene1 = generateSyntheticScene(256, 256, 2, -1, 5, 0, 0.8, 42);
    const scene2 = generateSyntheticScene(256, 256, 2, -1, 5, 0, 0.8, 43);
    
    const refF1 = orbDetect(scene1.refImageData!, 100);
    const tgtF1 = orbDetect(scene1.targetImageData!, 100);
    const refF2 = orbDetect(scene2.refImageData!, 100);
    const tgtF2 = orbDetect(scene2.targetImageData!, 100);
    
    const pairs: TemporalPair[] = [
      {
        timeRef: '2026-01-01T00:00:00Z',
        timeTarget: '2026-01-01T00:15:00Z',
        featuresRef: refF1,
        featuresTarget: tgtF1,
        imageWidth: 256,
        imageHeight: 256,
        expectedDisplacement: scene1.knownDisplacement
      },
      {
        timeRef: '2026-01-01T00:15:00Z',
        timeTarget: '2026-01-01T00:30:00Z',
        featuresRef: refF2,
        featuresTarget: tgtF2,
        imageWidth: 256,
        imageHeight: 256,
        expectedDisplacement: scene2.knownDisplacement
      }
    ];
    
    const result = computeTemporalGQA(pairs, 10, 5.0);
    assert(result.mode === 'TEMPORAL_REGISTRATION', 'Mode should be TEMPORAL_REGISTRATION');
    assert(result.observableCount > 0, 'Should have observables');
    assert(result.displacementVectors.length > 0, 'Should have displacement vectors');
  }));

  results.push(runTest('GQA modes produce different results for different inputs', () => {
    // Absolute with large displacement
    const absRefs: AbsoluteReference[] = Array.from({ length: 20 }, (_, i) => ({
      id: `abs_${i}`,
      expectedPosition: { row: 100 + i * 15, col: 100 + i * 15 },
      observedPosition: { row: 105 + i * 15, col: 108 + i * 15 },
      referenceSource: 'test',
      referenceUncertainty: 0.5,
      geographicPosition: null
    }));
    const absResult = computeAbsoluteGQA(absRefs, 512, 512);
    
    // Temporal with small displacement
    const scene = generateSyntheticScene(256, 256, 0.5, -0.3, 3, 0, 0.8, 42);
    const refF = orbDetect(scene.refImageData!, 100);
    const tgtF = orbDetect(scene.targetImageData!, 100);
    const tempPairs: TemporalPair[] = [{
      timeRef: '2026-01-01T00:00:00Z',
      timeTarget: '2026-01-01T00:15:00Z',
      featuresRef: refF,
      featuresTarget: tgtF,
      imageWidth: 256,
      imageHeight: 256,
      expectedDisplacement: null
    }];
    const tempResult = computeTemporalGQA(tempPairs);
    
    // They should have different modes
    assert(absResult.mode !== tempResult.mode, 'Modes should differ');
    // Both should produce valid results
    assert(absResult.rmseTotal >= 0, 'Absolute RMSE >= 0');
    assert(tempResult.rmseTotal >= 0, 'Temporal RMSE >= 0');
  }));

  return {
    suite: 'Three GQA Modes',
    timestamp: new Date().toISOString(),
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    results
  };
}

// ============================================================
// TEST SUITE: Robustness
// ============================================================

export function runRobustnessTests(): TestSuiteResult {
  const results: TestResult[] = [];

  results.push(runTest('Detection under high noise', () => {
    const scene = generateSyntheticScene(256, 256, 3, -2, 25, 0, 0.8, 42);
    const features = orbDetect(scene.refImageData!, 100);
    assert(features.length > 0, 'Should detect features even with high noise');
  }));

  results.push(runTest('Detection under cloud contamination', () => {
    const scene = generateSyntheticScene(256, 256, 3, -2, 5, 0.3, 0.8, 42);
    const features = orbDetect(scene.refImageData!, 100);
    // Features may be fewer but should still detect some
    assert(features.length >= 0, 'Should handle cloud contamination without crash');
  }));

  results.push(runTest('Zero displacement recovery', () => {
    const scene = generateSyntheticScene(256, 256, 0, 0, 5, 0, 0.8, 42);
    const refF = orbDetect(scene.refImageData!, 150);
    const tgtF = orbDetect(scene.targetImageData!, 150);
    const matches = matchFeatures(refF, tgtF, 0.85);
    if (matches.length > 5) {
      const meanDx = matches.reduce((s, m) => s + (m.featureTarget.position.col - m.featureRef.position.col), 0) / matches.length;
      const meanDy = matches.reduce((s, m) => s + (m.featureTarget.position.row - m.featureRef.position.row), 0) / matches.length;
      assertApprox(meanDx, 0, 3.0, 'Zero displacement: mean dx ~0');
      assertApprox(meanDy, 0, 3.0, 'Zero displacement: mean dy ~0');
    }
  }));

  results.push(runTest('Large displacement handling', () => {
    const scene = generateSyntheticScene(256, 256, 8, -6, 5, 0, 0.8, 42);
    const refF = orbDetect(scene.refImageData!, 200);
    const tgtF = orbDetect(scene.targetImageData!, 200);
    const matches = matchFeatures(refF, tgtF, 0.9); // Relaxed threshold
    // Large displacements may reduce matches but shouldn't crash
    assert(matches.length >= 0, 'Should handle large displacement without crash');
  }));

  results.push(runTest('Empty input handling', () => {
    const emptyRefs: AbsoluteReference[] = [];
    const result = computeAbsoluteGQA(emptyRefs, 512, 512);
    assert(result.observableCount === 0, 'Empty input: 0 observables');
    assert(result.validRatio === 0, 'Empty input: 0 valid ratio');
    assert(result.rmseTotal === 0, 'Empty input: 0 RMSE');
  }));

  return {
    suite: 'Robustness',
    timestamp: new Date().toISOString(),
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    results
  };
}

// ============================================================
// RUN ALL TESTS
// ============================================================

export function runAllTests(): TestSuiteResult[] {
  return [
    runCoreTests(),
    runGQAModeTests(),
    runRobustnessTests()
  ];
}
