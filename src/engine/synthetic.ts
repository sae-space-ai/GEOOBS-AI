// GEOOBS-AI Synthetic Data Generator
// Creates deterministic test scenes with known geometric displacements

import { v4 as uuidv4 } from 'uuid';
import type { SyntheticScene, Displacement, FeaturePoint, FeatureMatch } from '../types';
import { shiTomasiDetect, orbDetect, matchFeatures, ransacAffine } from './scientific';

// Seeded PRNG for reproducibility
class SeededRNG {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max));
  }
}

export function generateSyntheticScene(
  width: number = 512,
  height: number = 512,
  knownDx: number = 3.5,
  knownDy: number = -2.1,
  noiseLevel: number = 10,
  cloudCoverage: number = 0.0,
  contrastLevel: number = 0.8,
  seed: number = 42
): SyntheticScene {
  const rng = new SeededRNG(seed);
  const sceneId = uuidv4();

  // Create reference image with features
  const refCanvas = document.createElement('canvas');
  refCanvas.width = width;
  refCanvas.height = height;
  const refCtx = refCanvas.getContext('2d')!;

  // Background gradient (simulating terrain)
  const gradient = refCtx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, `rgb(${60 + rng.int(0, 40)}, ${80 + rng.int(0, 30)}, ${40 + rng.int(0, 20)})`);
  gradient.addColorStop(0.5, `rgb(${100 + rng.int(0, 50)}, ${120 + rng.int(0, 40)}, ${80 + rng.int(0, 30)})`);
  gradient.addColorStop(1, `rgb(${70 + rng.int(0, 30)}, ${90 + rng.int(0, 30)}, ${60 + rng.int(0, 20)})`);
  refCtx.fillStyle = gradient;
  refCtx.fillRect(0, 0, width, height);

  // Add terrain-like features (coastlines, boundaries)
  const numFeatures = 15 + rng.int(0, 10);
  for (let i = 0; i < numFeatures; i++) {
    const cx = rng.range(50, width - 50);
    const cy = rng.range(50, height - 50);
    const size = rng.range(20, 80);
    const brightness = rng.int(40, 200);

    refCtx.beginPath();
    // Random polygon-like shapes
    const points = rng.int(4, 8);
    for (let p = 0; p < points; p++) {
      const angle = (p / points) * Math.PI * 2;
      const r = size * (0.5 + rng.next() * 0.5);
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      if (p === 0) refCtx.moveTo(px, py);
      else refCtx.lineTo(px, py);
    }
    refCtx.closePath();
    refCtx.fillStyle = `rgb(${brightness}, ${brightness + rng.int(-20, 20)}, ${brightness + rng.int(-10, 10)})`;
    refCtx.fill();
  }

  // Add edge-like features (lines simulating coastlines, roads)
  for (let i = 0; i < 8; i++) {
    refCtx.beginPath();
    refCtx.moveTo(rng.range(0, width), rng.range(0, height));
    refCtx.lineTo(rng.range(0, width), rng.range(0, height));
    refCtx.strokeStyle = `rgb(${rng.int(30, 180)}, ${rng.int(30, 180)}, ${rng.int(30, 180)})`;
    refCtx.lineWidth = rng.range(1, 4);
    refCtx.stroke();
  }

  // Add corner-like features (buildings, structures)
  for (let i = 0; i < 20; i++) {
    const cx = rng.range(30, width - 30);
    const cy = rng.range(30, height - 30);
    const w = rng.range(5, 25);
    const h = rng.range(5, 25);
    const b = rng.int(60, 220);
    refCtx.fillStyle = `rgb(${b}, ${b}, ${b})`;
    refCtx.fillRect(cx - w / 2, cy - h / 2, w, h);
  }

  // Add noise
  const refImageData = refCtx.getImageData(0, 0, width, height);
  for (let i = 0; i < refImageData.data.length; i += 4) {
    const noise = (rng.next() - 0.5) * noiseLevel;
    refImageData.data[i] = Math.max(0, Math.min(255, refImageData.data[i] + noise));
    refImageData.data[i + 1] = Math.max(0, Math.min(255, refImageData.data[i + 1] + noise));
    refImageData.data[i + 2] = Math.max(0, Math.min(255, refImageData.data[i + 2] + noise));
  }

  // Create target image (shifted reference + noise)
  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = width;
  targetCanvas.height = height;
  const targetCtx = targetCanvas.getContext('2d')!;

  // Apply known displacement
  targetCtx.drawImage(refCanvas, -knownDx, -knownDy);

  // Add additional noise to target
  const targetImageData = targetCtx.getImageData(0, 0, width, height);
  for (let i = 0; i < targetImageData.data.length; i += 4) {
    const noise = (rng.next() - 0.5) * noiseLevel * 1.2;
    targetImageData.data[i] = Math.max(0, Math.min(255, targetImageData.data[i] + noise));
    targetImageData.data[i + 1] = Math.max(0, Math.min(255, targetImageData.data[i + 1] + noise));
    targetImageData.data[i + 2] = Math.max(0, Math.min(255, targetImageData.data[i + 2] + noise));
  }

  // Add cloud contamination
  if (cloudCoverage > 0) {
    const numClouds = Math.floor(cloudCoverage * 10);
    for (let i = 0; i < numClouds; i++) {
      const cx = rng.range(0, width);
      const cy = rng.range(0, height);
      const cr = rng.range(30, 100);
      const cloudGrad = targetCtx.createRadialGradient(cx, cy, 0, cx, cy, cr);
      cloudGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      cloudGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      targetCtx.fillStyle = cloudGrad;
      targetCtx.fillRect(cx - cr, cy - cr, cr * 2, cr * 2);
    }
  }

  // Detect features
  const refFeatures = orbDetect(refImageData, 200);
  const targetFeatures = orbDetect(targetImageData, 200);

  // Match features
  const matches = matchFeatures(refFeatures, targetFeatures, 0.8);

  // Run RANSAC
  const ransacResult = ransacAffine(matches, 500, 5.0);

  const knownDisplacement: Displacement = {
    dx_pixels: knownDx,
    dy_pixels: knownDy,
    dx_geodetic_m: null,
    dy_geodetic_m: null,
    magnitude_pixels: Math.sqrt(knownDx * knownDx + knownDy * knownDy),
    magnitude_geodetic_m: null,
    direction_rad: Math.atan2(knownDy, knownDx),
    direction_deg: (Math.atan2(knownDy, knownDx) * 180 / Math.PI + 360) % 360
  };

  return {
    id: sceneId,
    name: `Synthetic Scene (dx=${knownDx.toFixed(1)}, dy=${knownDy.toFixed(1)}, noise=${noiseLevel}, cloud=${(cloudCoverage * 100).toFixed(0)}%)`,
    width,
    height,
    knownDisplacement,
    noiseLevel,
    cloudCoverage,
    contrastLevel,
    refImageData: refImageData,
    targetImageData: targetCtx.getImageData(0, 0, width, height),
    refFeatures,
    targetFeatures,
    matches: ransacResult.inliers
  };
}

export function generateTestSuite(): SyntheticScene[] {
  return [
    generateSyntheticScene(512, 512, 3.5, -2.1, 5, 0.0, 0.8, 42),
    generateSyntheticScene(512, 512, 5.0, 0.0, 10, 0.0, 0.7, 123),
    generateSyntheticScene(512, 512, 0.0, 4.0, 8, 0.1, 0.9, 456),
    generateSyntheticScene(512, 512, -2.5, 3.0, 15, 0.2, 0.6, 789),
    generateSyntheticScene(512, 512, 1.0, -1.0, 3, 0.0, 0.95, 101),
    generateSyntheticScene(512, 512, 7.0, -5.0, 20, 0.3, 0.5, 202),
  ];
}
