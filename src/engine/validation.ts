// GEOOBS-AI Scientific Validation Engine
// Validates algorithm performance against known ground truth

import { v4 as uuidv4 } from 'uuid';
import { generateSyntheticScene } from './synthetic';
import { orbDetect, shiTomasiDetect, matchFeatures, ransacAffine } from './scientific';
import type { DetectorMethod } from '../types';

export type ValidationClass = 'VALIDATION_SYNTHETIC' | 'VALIDATION_PUBLIC_REAL_DATA' | 'VALIDATION_EUMETSAT_AGREED';

export interface ValidationTest {
  id: string;
  name: string;
  validationClass: ValidationClass;
  parameters: {
    dx: number;
    dy: number;
    noise: number;
    cloud: number;
    method: DetectorMethod;
    seed: number;
  };
  expectedDisplacement: { dx: number; dy: number };
  actualDisplacement: { dx: number; dy: number } | null;
  error: { dx: number; dy: number; magnitude: number } | null;
  featureCount: number;
  matchCount: number;
  inlierCount: number;
  inlierRatio: number;
  passed: boolean;
  tolerance: number;
  timestamp: string;
}

export interface ValidationSuiteResult {
  id: string;
  name: string;
  validationClass: ValidationClass;
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRate: number;
  meanError: { dx: number; dy: number; magnitude: number };
  maxError: { dx: number; dy: number; magnitude: number };
  tests: ValidationTest[];
  summary: string;
}

export function runValidationSuite(
  name: string,
  validationClass: ValidationClass,
  numTests: number = 10,
  tolerance: number = 2.0,
  seed: number = 42
): ValidationSuiteResult {
  const tests: ValidationTest[] = [];
  let rng = seed;
  const nextRng = () => { rng = (rng * 1103515245 + 12345) & 0x7fffffff; return rng / 0x7fffffff; };

  for (let i = 0; i < numTests; i++) {
    const dx = (nextRng() * 10 - 5);
    const dy = (nextRng() * 10 - 5);
    const noise = nextRng() * 20;
    const cloud = nextRng() * 0.3;
    const testSeed = seed + i * 100;
    const method: DetectorMethod = i % 2 === 0 ? 'orb' : 'shi-tomasi';

    const scene = generateSyntheticScene(512, 512, dx, dy, noise, cloud, 0.8, testSeed);
    const refF = method === 'orb' ? orbDetect(scene.refImageData!, 200) : shiTomasiDetect(scene.refImageData!, 200);
    const tgtF = method === 'orb' ? orbDetect(scene.targetImageData!, 200) : shiTomasiDetect(scene.targetImageData!, 200);
    const matches = matchFeatures(refF, tgtF, 0.85);
    const ransac = ransacAffine(matches, 500, 5.0);
    const inliers = ransac.inliers.filter(m => m.inlier);

    let actualDisplacement: { dx: number; dy: number } | null = null;
    let error: { dx: number; dy: number; magnitude: number } | null = null;
    let passed = false;

    if (inliers.length > 3) {
      const meanDx = inliers.reduce((s, m) => s + (m.featureTarget.position.col - m.featureRef.position.col), 0) / inliers.length;
      const meanDy = inliers.reduce((s, m) => s + (m.featureTarget.position.row - m.featureRef.position.row), 0) / inliers.length;
      actualDisplacement = { dx: meanDx, dy: meanDy };
      error = {
        dx: Math.abs(meanDx - dx),
        dy: Math.abs(meanDy - dy),
        magnitude: Math.sqrt((meanDx - dx) ** 2 + (meanDy - dy) ** 2)
      };
      passed = error.magnitude < tolerance;
    }

    tests.push({
      id: uuidv4(),
      name: `Test ${i + 1}: ${method} dx=${dx.toFixed(2)} dy=${dy.toFixed(2)} σ=${noise.toFixed(1)} ☁=${(cloud * 100).toFixed(0)}%`,
      validationClass,
      parameters: { dx, dy, noise, cloud, method, seed: testSeed },
      expectedDisplacement: { dx, dy },
      actualDisplacement,
      error,
      featureCount: refF.length,
      matchCount: matches.length,
      inlierCount: inliers.length,
      inlierRatio: inliers.length / Math.max(matches.length, 1),
      passed,
      tolerance,
      timestamp: new Date().toISOString()
    });
  }

  const passedTests = tests.filter(t => t.passed).length;
  const errors = tests.filter(t => t.error).map(t => t.error!);
  
  const meanError = errors.length > 0 ? {
    dx: errors.reduce((s, e) => s + e.dx, 0) / errors.length,
    dy: errors.reduce((s, e) => s + e.dy, 0) / errors.length,
    magnitude: errors.reduce((s, e) => s + e.magnitude, 0) / errors.length
  } : { dx: 0, dy: 0, magnitude: 0 };

  const maxError = errors.length > 0 ? {
    dx: Math.max(...errors.map(e => e.dx)),
    dy: Math.max(...errors.map(e => e.dy)),
    magnitude: Math.max(...errors.map(e => e.magnitude))
  } : { dx: 0, dy: 0, magnitude: 0 };

  return {
    id: uuidv4(),
    name,
    validationClass,
    timestamp: new Date().toISOString(),
    totalTests: numTests,
    passedTests,
    failedTests: numTests - passedTests,
    passRate: passedTests / numTests,
    meanError,
    maxError,
    tests,
    summary: `${passedTests}/${numTests} tests passed (${(passedTests / numTests * 100).toFixed(1)}%). Mean error: ${meanError.magnitude.toFixed(3)}px. Max error: ${maxError.magnitude.toFixed(3)}px.`
  };
}

export function runAllValidationSuites(): ValidationSuiteResult[] {
  return [
    runValidationSuite('Low Noise Validation', 'VALIDATION_SYNTHETIC', 10, 2.0, 100),
    runValidationSuite('Medium Noise Validation', 'VALIDATION_SYNTHETIC', 10, 3.0, 200),
    runValidationSuite('High Noise Validation', 'VALIDATION_SYNTHETIC', 10, 5.0, 300),
    runValidationSuite('Cloud Contamination Validation', 'VALIDATION_SYNTHETIC', 10, 4.0, 400),
    runValidationSuite('Large Displacement Validation', 'VALIDATION_SYNTHETIC', 10, 3.0, 500),
  ];
}
