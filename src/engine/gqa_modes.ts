// GEOOBS-AI Three GQA Engines
// Implements: ABSOLUTE_NAVIGATION_GQA, INTERCHANNEL_REGISTRATION_GQA, TEMPORAL_REGISTRATION_GQA

import { v4 as uuidv4 } from 'uuid';
import type {
  PixelCoordinate, Displacement, Uncertainty, SpectralBand,
  CloudCondition, DayNightCondition, DetectorMethod
} from '../types';
import { ransacAffine, matchFeatures, matchFeaturesEuclidean } from './scientific';
import type { FeaturePoint, FeatureMatch } from '../types';

// ============================================================
// COMMON TYPES FOR GQA MODES
// ============================================================

export type GQAMode = 'ABSOLUTE_NAVIGATION' | 'INTERCHANNEL_REGISTRATION' | 'TEMPORAL_REGISTRATION';

export interface GQAModeResult {
  id: string;
  mode: GQAMode;
  computedAt: string;
  // Common metrics
  observableCount: number;
  acceptedCount: number;
  rejectedCount: number;
  validRatio: number;
  // Bias
  meanBiasX: number;
  meanBiasY: number;
  medianBiasX: number;
  medianBiasY: number;
  // RMSE
  rmseX: number;
  rmseY: number;
  rmseTotal: number;
  // Percentiles
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  // Dispersion
  stdX: number;
  stdY: number;
  // Coverage
  spatialCoverageRatio: number;
  gridCellsCovered: number;
  gridCellsTotal: number;
  // Mode-specific
  modeSpecific: Record<string, number | string>;
  // Displacement vectors (for visualization)
  displacementVectors: { x: number; y: number; dx: number; dy: number; inlier: boolean }[];
}

// ============================================================
// MODE 1: ABSOLUTE NAVIGATION GQA
// ============================================================
// Measures displacements between observed positions and independent
// geographic references (ground control points, known landmarks).

export interface AbsoluteReference {
  id: string;
  expectedPosition: PixelCoordinate; // Expected position from reference
  observedPosition: PixelCoordinate; // Position detected in image
  referenceSource: string; // e.g., 'GCP_database', 'coastline_db', 'orthorectified_product'
  referenceUncertainty: number; // pixels
  geographicPosition: { lat: number; lon: number } | null;
}

export function computeAbsoluteGQA(
  references: AbsoluteReference[],
  imageWidth: number,
  imageHeight: number,
  gridSize: number = 10,
  ransacThreshold: number = 5.0
): GQAModeResult {
  // Compute displacements
  const displacements = references.map(ref => ({
    dx: ref.observedPosition.col - ref.expectedPosition.col,
    dy: ref.observedPosition.row - ref.expectedPosition.row,
    ref
  }));

  // Create pseudo-matches for RANSAC
  const pseudoMatches: FeatureMatch[] = references.map(ref => ({
    id: uuidv4(),
    featureRef: {
      id: ref.id,
      position: ref.expectedPosition,
      geoPosition: null,
      descriptor: [],
      response: 1,
      octave: 0,
      quality: 1,
      method: 'shi-tomasi' as DetectorMethod,
      validated: true
    },
    featureTarget: {
      id: ref.id + '_obs',
      position: ref.observedPosition,
      geoPosition: null,
      descriptor: [],
      response: 1,
      octave: 0,
      quality: 1,
      method: 'shi-tomasi' as DetectorMethod,
      validated: true
    },
    distance: 0,
    ratio: 1,
    inlier: true,
    ransacResidual: null
  }));

  // Run RANSAC to identify inliers
  const ransacResult = ransacAffine(pseudoMatches, 500, ransacThreshold);
  const inliers = ransacResult.inliers.filter(m => m.inlier);

  // Compute metrics from inliers
  const dx = inliers.map(m => m.featureTarget.position.col - m.featureRef.position.col);
  const dy = inliers.map(m => m.featureTarget.position.row - m.featureRef.position.row);
  const magnitudes = inliers.map(m => {
    const ddx = m.featureTarget.position.col - m.featureRef.position.col;
    const ddy = m.featureTarget.position.row - m.featureRef.position.row;
    return Math.sqrt(ddx * ddx + ddy * ddy);
  });

  return computeMetricsFromDisplacements(
    'ABSOLUTE_NAVIGATION',
    dx, dy, magnitudes,
    references.length, inliers.length,
    inliers.map(m => ({
      x: m.featureRef.position.col,
      y: m.featureRef.position.row,
      dx: m.featureTarget.position.col - m.featureRef.position.col,
      dy: m.featureTarget.position.row - m.featureRef.position.row,
      inlier: true
    })),
    gridSize,
    {
      referenceCount: references.length,
      ransacInliers: inliers.length,
      ransacResidual: ransacResult.residual,
      meanReferenceUncertainty: references.reduce((s, r) => s + r.referenceUncertainty, 0) / Math.max(references.length, 1)
    }
  );
}

// ============================================================
// MODE 2: INTERCHANNEL REGISTRATION GQA
// ============================================================
// Compares positions of corresponding features across different
// spectral channels of the same acquisition.

export interface ChannelPair {
  channelRef: SpectralBand;
  channelTarget: SpectralBand;
  featuresRef: FeaturePoint[];
  featuresTarget: FeaturePoint[];
  imageWidth: number;
  imageHeight: number;
}

export function computeInterchannelGQA(
  channelPairs: ChannelPair[],
  gridSize: number = 10,
  ransacThreshold: number = 3.0
): GQAModeResult {
  let allDx: number[] = [];
  let allDy: number[] = [];
  let allMag: number[] = [];
  let totalObservables = 0;
  let totalInliers = 0;
  let allVectors: { x: number; y: number; dx: number; dy: number; inlier: boolean }[] = [];
  const channelStats: Record<string, number> = {};

  for (const pair of channelPairs) {
    // Match features between channels
    const matches = matchFeaturesEuclidean(pair.featuresRef, pair.featuresTarget, 20);
    const ransacResult = ransacAffine(matches, 500, ransacThreshold);
    const inliers = ransacResult.inliers.filter(m => m.inlier);

    totalObservables += matches.length;
    totalInliers += inliers.length;

    const key = `${pair.channelRef}-${pair.channelTarget}`;
    channelStats[key] = inliers.length;

    for (const m of inliers) {
      const dx = m.featureTarget.position.col - m.featureRef.position.col;
      const dy = m.featureTarget.position.row - m.featureRef.position.row;
      allDx.push(dx);
      allDy.push(dy);
      allMag.push(Math.sqrt(dx * dx + dy * dy));
      allVectors.push({
        x: m.featureRef.position.col,
        y: m.featureRef.position.row,
        dx, dy, inlier: true
      });
    }
  }

  return computeMetricsFromDisplacements(
    'INTERCHANNEL_REGISTRATION',
    allDx, allDy, allMag,
    totalObservables, totalInliers,
    allVectors,
    gridSize,
    {
      channelPairsProcessed: channelPairs.length,
      ...channelStats
    }
  );
}

// ============================================================
// MODE 3: TEMPORAL REGISTRATION GQA
// ============================================================
// Compares corresponding features between successive acquisitions
// from the same sensor, tracking geometric stability over time.

export interface TemporalPair {
  timeRef: string; // ISO timestamp
  timeTarget: string; // ISO timestamp
  featuresRef: FeaturePoint[];
  featuresTarget: FeaturePoint[];
  imageWidth: number;
  imageHeight: number;
  expectedDisplacement: Displacement | null; // Known displacement if available
}

export function computeTemporalGQA(
  temporalPairs: TemporalPair[],
  gridSize: number = 10,
  ransacThreshold: number = 5.0
): GQAModeResult {
  let allDx: number[] = [];
  let allDy: number[] = [];
  let allMag: number[] = [];
  let totalObservables = 0;
  let totalInliers = 0;
  let allVectors: { x: number; y: number; dx: number; dy: number; inlier: boolean }[] = [];
  let errorVsKnown: number[] = [];
  const pairStats: Record<string, number> = {};

  for (let i = 0; i < temporalPairs.length; i++) {
    const pair = temporalPairs[i];
    const matches = matchFeatures(pair.featuresRef, pair.featuresTarget, 0.8);
    const ransacResult = ransacAffine(matches, 1000, ransacThreshold);
    const inliers = ransacResult.inliers.filter(m => m.inlier);

    totalObservables += matches.length;
    totalInliers += inliers.length;

    const key = `pair_${i}`;
    pairStats[key] = inliers.length;

    for (const m of inliers) {
      const dx = m.featureTarget.position.col - m.featureRef.position.col;
      const dy = m.featureTarget.position.row - m.featureRef.position.row;
      allDx.push(dx);
      allDy.push(dy);
      allMag.push(Math.sqrt(dx * dx + dy * dy));
      allVectors.push({
        x: m.featureRef.position.col,
        y: m.featureRef.position.row,
        dx, dy, inlier: true
      });

      // If known displacement available, compute error
      if (pair.expectedDisplacement) {
        const errX = dx - pair.expectedDisplacement.dx_pixels;
        const errY = dy - pair.expectedDisplacement.dy_pixels;
        errorVsKnown.push(Math.sqrt(errX * errX + errY * errY));
      }
    }
  }

  const modeSpecific: Record<string, number | string> = {
    temporalPairsProcessed: temporalPairs.length,
    ...pairStats
  };

  if (errorVsKnown.length > 0) {
    modeSpecific.meanErrorVsKnown = errorVsKnown.reduce((s, v) => s + v, 0) / errorVsKnown.length;
    modeSpecific.maxErrorVsKnown = Math.max(...errorVsKnown);
    modeSpecific.minErrorVsKnown = Math.min(...errorVsKnown);
  }

  return computeMetricsFromDisplacements(
    'TEMPORAL_REGISTRATION',
    allDx, allDy, allMag,
    totalObservables, totalInliers,
    allVectors,
    gridSize,
    modeSpecific
  );
}

// ============================================================
// COMMON METRICS COMPUTATION
// ============================================================

function computeMetricsFromDisplacements(
  mode: GQAMode,
  dx: number[],
  dy: number[],
  magnitudes: number[],
  totalObservables: number,
  acceptedCount: number,
  vectors: { x: number; y: number; dx: number; dy: number; inlier: boolean }[],
  gridSize: number,
  modeSpecific: Record<string, number | string>
): GQAModeResult {
  const rejectedCount = totalObservables - acceptedCount;

  if (dx.length === 0) {
    return {
      id: uuidv4(),
      mode,
      computedAt: new Date().toISOString(),
      observableCount: totalObservables,
      acceptedCount: 0,
      rejectedCount,
      validRatio: 0,
      meanBiasX: 0, meanBiasY: 0,
      medianBiasX: 0, medianBiasY: 0,
      rmseX: 0, rmseY: 0, rmseTotal: 0,
      p50: 0, p90: 0, p95: 0, p99: 0,
      stdX: 0, stdY: 0,
      spatialCoverageRatio: 0,
      gridCellsCovered: 0,
      gridCellsTotal: gridSize * gridSize,
      modeSpecific,
      displacementVectors: vectors
    };
  }

  // Bias
  const meanBiasX = dx.reduce((a, b) => a + b, 0) / dx.length;
  const meanBiasY = dy.reduce((a, b) => a + b, 0) / dy.length;

  // Median
  const sortedDx = [...dx].sort((a, b) => a - b);
  const sortedDy = [...dy].sort((a, b) => a - b);
  const medianBiasX = sortedDx[Math.floor(sortedDx.length / 2)];
  const medianBiasY = sortedDy[Math.floor(sortedDy.length / 2)];

  // RMSE
  const rmseX = Math.sqrt(dx.reduce((s, v) => s + v * v, 0) / dx.length);
  const rmseY = Math.sqrt(dy.reduce((s, v) => s + v * v, 0) / dy.length);
  const rmseTotal = Math.sqrt(magnitudes.reduce((s, v) => s + v * v, 0) / magnitudes.length);

  // Percentiles
  const sortedMag = [...magnitudes].sort((a, b) => a - b);
  const percentile = (p: number) => sortedMag[Math.min(Math.floor(sortedMag.length * p / 100), sortedMag.length - 1)] || 0;

  // Standard deviation
  const stdX = Math.sqrt(dx.reduce((s, v) => s + (v - meanBiasX) ** 2, 0) / dx.length);
  const stdY = Math.sqrt(dy.reduce((s, v) => s + (v - meanBiasY) ** 2, 0) / dy.length);

  // Spatial coverage
  const coveredCells = new Set<string>();
  const cellW = 512 / gridSize;
  const cellH = 512 / gridSize;
  for (const v of vectors) {
    const gx = Math.floor(v.x / cellW);
    const gy = Math.floor(v.y / cellH);
    coveredCells.add(`${gx},${gy}`);
  }

  return {
    id: uuidv4(),
    mode,
    computedAt: new Date().toISOString(),
    observableCount: totalObservables,
    acceptedCount,
    rejectedCount,
    validRatio: acceptedCount / Math.max(totalObservables, 1),
    meanBiasX, meanBiasY,
    medianBiasX, medianBiasY,
    rmseX, rmseY, rmseTotal,
    p50: percentile(50),
    p90: percentile(90),
    p95: percentile(95),
    p99: percentile(99),
    stdX, stdY,
    spatialCoverageRatio: coveredCells.size / (gridSize * gridSize),
    gridCellsCovered: coveredCells.size,
    gridCellsTotal: gridSize * gridSize,
    modeSpecific,
    displacementVectors: vectors
  };
}
