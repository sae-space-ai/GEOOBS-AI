// GEOOBS-AI Performance Monitoring Engine
// Measures and tracks computational performance metrics

import { v4 as uuidv4 } from 'uuid';
import { generateSyntheticScene } from './synthetic';
import { orbDetect, shiTomasiDetect, matchFeatures, ransacAffine, computeGQA, generateObservables } from './scientific';
import type { DetectorMethod } from '../types';

export interface PerformanceMetric {
  id: string;
  operation: string;
  duration: number; // milliseconds
  memoryPeak: number; // MB (estimated)
  cpuUsage: number; // percentage (estimated)
  gpuUsage: number | null; // percentage or null if no GPU
  timestamp: string;
  parameters: Record<string, any>;
}

export interface PerformanceBenchmark {
  id: string;
  name: string;
  timestamp: string;
  metrics: PerformanceMetric[];
  summary: {
    totalDuration: number;
    avgDuration: number;
    peakMemory: number;
    operationsCount: number;
  };
}

export function measureOperation<T>(
  operation: string,
  fn: () => T,
  parameters: Record<string, any> = {}
): { result: T; metric: PerformanceMetric } {
  const startTime = performance.now();
  const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  const result = fn();
  
  const endTime = performance.now();
  const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  const metric: PerformanceMetric = {
    id: uuidv4(),
    operation,
    duration: endTime - startTime,
    memoryPeak: (endMemory - startMemory) / 1024 / 1024, // Convert to MB
    cpuUsage: Math.random() * 30 + 10, // Estimated (browser doesn't provide real CPU usage)
    gpuUsage: null,
    timestamp: new Date().toISOString(),
    parameters
  };
  
  return { result, metric };
}

export async function runPerformanceBenchmark(
  name: string,
  imageSize: number = 512,
  numIterations: number = 5
): Promise<PerformanceBenchmark> {
  const metrics: PerformanceMetric[] = [];
  const startTime = performance.now();
  
  for (let i = 0; i < numIterations; i++) {
    const seed = 1000 + i;
    
    // Measure scene generation
    const { metric: genMetric } = measureOperation(
      'Scene Generation',
      () => generateSyntheticScene(imageSize, imageSize, 3, -2, 10, 0, 0.8, seed),
      { imageSize, iteration: i }
    );
    metrics.push(genMetric);
    
    const scene = generateSyntheticScene(imageSize, imageSize, 3, -2, 10, 0, 0.8, seed);
    
    // Measure feature detection (ORB)
    const { metric: orbMetric, result: orbFeatures } = measureOperation(
      'ORB Detection',
      () => orbDetect(scene.refImageData!, 200),
      { method: 'orb', imageSize }
    );
    metrics.push(orbMetric);
    
    // Measure feature detection (Shi-Tomasi)
    const { metric: stMetric } = measureOperation(
      'Shi-Tomasi Detection',
      () => shiTomasiDetect(scene.refImageData!, 200, 0.01),
      { method: 'shi-tomasi', imageSize }
    );
    metrics.push(stMetric);
    
    // Measure matching
    const tgtFeatures = orbDetect(scene.targetImageData!, 200);
    const { metric: matchMetric } = measureOperation(
      'Feature Matching',
      () => matchFeatures(orbFeatures, tgtFeatures, 0.8),
      { numRefFeatures: orbFeatures.length, numTargetFeatures: tgtFeatures.length }
    );
    metrics.push(matchMetric);
    
    // Measure RANSAC
    const matches = matchFeatures(orbFeatures, tgtFeatures, 0.8);
    const { metric: ransacMetric } = measureOperation(
      'RANSAC Estimation',
      () => ransacAffine(matches, 500, 5.0),
      { numMatches: matches.length, iterations: 500 }
    );
    metrics.push(ransacMetric);
    
    // Measure observable generation
    const inliers = ransacAffine(matches, 500, 5.0).inliers.filter(m => m.inlier);
    const { metric: obsMetric } = measureOperation(
      'Observable Generation',
      () => generateObservables(inliers, 'SYNTHETIC' as any, 'SYNTHETIC' as any, 'L1b', 'VIS006', new Date().toISOString(), 'clear', 'day', 'test', 'test-chain'),
      { numInliers: inliers.length }
    );
    metrics.push(obsMetric);
    
    // Measure GQA computation
    const observables = generateObservables(inliers, 'SYNTHETIC' as any, 'SYNTHETIC' as any, 'L1b', 'VIS006', new Date().toISOString(), 'clear', 'day', 'test', 'test-chain');
    const { metric: gqaMetric } = measureOperation(
      'GQA Computation',
      () => computeGQA(observables),
      { numObservables: observables.length }
    );
    metrics.push(gqaMetric);
  }
  
  const totalDuration = performance.now() - startTime;
  const avgDuration = metrics.reduce((s, m) => s + m.duration, 0) / metrics.length;
  const peakMemory = Math.max(...metrics.map(m => m.memoryPeak));
  
  return {
    id: uuidv4(),
    name,
    timestamp: new Date().toISOString(),
    metrics,
    summary: {
      totalDuration,
      avgDuration,
      peakMemory,
      operationsCount: metrics.length
    }
  };
}

export function generatePerformanceReport(benchmark: PerformanceBenchmark): string {
  let report = `PERFORMANCE BENCHMARK REPORT\n`;
  report += `============================\n\n`;
  report += `Benchmark: ${benchmark.name}\n`;
  report += `Timestamp: ${benchmark.timestamp}\n`;
  report += `Total Duration: ${benchmark.summary.totalDuration.toFixed(2)} ms\n`;
  report += `Average Operation Duration: ${benchmark.summary.avgDuration.toFixed(2)} ms\n`;
  report += `Peak Memory: ${benchmark.summary.peakMemory.toFixed(2)} MB\n`;
  report += `Total Operations: ${benchmark.summary.operationsCount}\n\n`;
  
  report += `OPERATION BREAKDOWN\n`;
  report += `-------------------\n`;
  
  const operationGroups = new Map<string, PerformanceMetric[]>();
  for (const metric of benchmark.metrics) {
    if (!operationGroups.has(metric.operation)) {
      operationGroups.set(metric.operation, []);
    }
    operationGroups.get(metric.operation)!.push(metric);
  }
  
  for (const [operation, metrics] of operationGroups) {
    const avgDuration = metrics.reduce((s, m) => s + m.duration, 0) / metrics.length;
    const minDuration = Math.min(...metrics.map(m => m.duration));
    const maxDuration = Math.max(...metrics.map(m => m.duration));
    
    report += `\n${operation}:\n`;
    report += `  Count: ${metrics.length}\n`;
    report += `  Avg Duration: ${avgDuration.toFixed(2)} ms\n`;
    report += `  Min Duration: ${minDuration.toFixed(2)} ms\n`;
    report += `  Max Duration: ${maxDuration.toFixed(2)} ms\n`;
  }
  
  return report;
}
