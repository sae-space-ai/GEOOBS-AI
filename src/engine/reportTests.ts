// GEOOBS-AI Report Generation Tests
// Validates PDF and XLSX generation functionality

import { generatePDF, generateXLSX, generatePackage, collectReportData } from './reportEngine';
import type { ReportGenerationRequest } from '../types/reports';

export interface ReportTestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
  details?: Record<string, any>;
}

export interface ReportTestSuiteResult {
  suite: string;
  timestamp: string;
  total: number;
  passed: number;
  failed: number;
  results: ReportTestResult[];
}

// Mock state for testing
const mockState = {
  observables: [
    {
      id: 'obs-001',
      instrument: 'SYNTHETIC',
      platform: 'SYNTHETIC',
      productLevel: 'L1b',
      acquisitionTime: new Date().toISOString(),
      spectralBand: 'VIS006',
      pixelPosition: { row: 100, col: 200 },
      geoPosition: null,
      coordinateSystem: 'pixel' as const,
      featureId: 'feat-001',
      featureDescriptor: 'abc123',
      referenceSystem: 'test',
      expectedPosition: { row: 100, col: 200 },
      observedPosition: { row: 103, col: 203 },
      displacement: {
        dx_pixels: 3,
        dy_pixels: 3,
        dx_geodetic_m: null,
        dy_geodetic_m: null,
        magnitude_pixels: 4.24,
        magnitude_geodetic_m: null,
        direction_rad: 0.785,
        direction_deg: 45
      },
      uncertainty: {
        sigma_x_pixels: 0.5,
        sigma_y_pixels: 0.5,
        sigma_x_geodetic_m: null,
        sigma_y_geodetic_m: null,
        confidence: 0.85,
        source: 'test'
      },
      qualityMetric: 0.85,
      detectionMethod: 'orb' as const,
      modelId: null,
      modelVersion: null,
      cloudCondition: 'clear' as const,
      dayNightCondition: 'day' as const,
      status: 'accepted' as const,
      sourceFileId: 'test-file',
      processingChainId: 'test-chain',
      createdAt: new Date().toISOString(),
      checksum: 'test-checksum'
    }
  ],
  gqaResults: [
    {
      id: 'gqa-001',
      observableCount: 1,
      acceptedCount: 1,
      rejectedCount: 0,
      validRatio: 1.0,
      meanBiasX: 3.0,
      meanBiasY: 3.0,
      medianBiasX: 3.0,
      medianBiasY: 3.0,
      rmseX: 3.0,
      rmseY: 3.0,
      rmseTotal: 4.24,
      p50: 4.24,
      p90: 4.24,
      p95: 4.24,
      p99: 4.24,
      stdX: 0,
      stdY: 0,
      spatialCoverageRatio: 0.01,
      gridCellsCovered: 1,
      gridCellsTotal: 100,
      computedAt: new Date().toISOString(),
      observableIds: ['obs-001']
    }
  ],
  experiments: [],
  images: [],
  syntheticScenes: [
    {
      id: 'scene-001',
      name: 'Test Scene',
      width: 512,
      height: 512,
      knownDisplacement: { dx_pixels: 3, dy_pixels: 3 },
      noiseLevel: 5,
      cloudCoverage: 0,
      contrastLevel: 0.8,
      refImageData: null,
      targetImageData: null,
      refFeatures: [],
      targetFeatures: [],
      matches: []
    }
  ],
  systemStatus: {
    version: '0.3.0'
  }
};

async function runTest(name: string, fn: () => Promise<void>): Promise<ReportTestResult> {
  const start = performance.now();
  try {
    await fn();
    return { name, passed: true, message: 'OK', duration: performance.now() - start };
  } catch (e) {
    return { name, passed: false, message: (e as Error).message, duration: performance.now() - start };
  }
}

export async function runReportTests(): Promise<ReportTestSuiteResult> {
  const results: ReportTestResult[] = [];

  results.push(await runTest('Data collection', async () => {
    const data = collectReportData(mockState);
    if (data.observables.length !== 1) throw new Error('Expected 1 observable');
    if (data.gqaResults.length !== 1) throw new Error('Expected 1 GQA result');
    if (data.syntheticScenes.length !== 1) throw new Error('Expected 1 synthetic scene');
    if (data.systemVersion !== '0.3.0') throw new Error('Expected version 0.3.0');
  }));

  results.push(await runTest('PDF generation', async () => {
    const data = collectReportData(mockState);
    const request: ReportGenerationRequest = {
      category: 'scientific_general',
      format: 'pdf',
      includeGraphs: true,
      includeTables: true,
      includeAnnexes: true
    };
    const result = await generatePDF(request, data);
    if (!result.success) throw new Error(`PDF generation failed: ${result.error}`);
    if (result.fileSize === 0) throw new Error('PDF file size is 0');
    if (!result.metadata.reportId) throw new Error('No report ID');
    if (!result.metadata.fileHash) throw new Error('No file hash');
    if (!result.metadata.filename.endsWith('.pdf')) throw new Error('Filename does not end with .pdf');
  }));

  results.push(await runTest('XLSX generation', async () => {
    const data = collectReportData(mockState);
    const request: ReportGenerationRequest = {
      category: 'scientific_general',
      format: 'xlsx',
      includeGraphs: true,
      includeTables: true,
      includeAnnexes: true
    };
    const result = await generateXLSX(request, data);
    if (!result.success) throw new Error(`XLSX generation failed: ${result.error}`);
    if (result.fileSize === 0) throw new Error('XLSX file size is 0');
    if (!result.metadata.reportId) throw new Error('No report ID');
    if (!result.metadata.fileHash) throw new Error('No file hash');
    if (!result.metadata.filename.endsWith('.xlsx')) throw new Error('Filename does not end with .xlsx');
  }));

  results.push(await runTest('Package generation', async () => {
    const data = collectReportData(mockState);
    const request: ReportGenerationRequest = {
      category: 'scientific_general',
      format: 'package',
      includeGraphs: true,
      includeTables: true,
      includeAnnexes: true
    };
    const pkg = await generatePackage(request, data);
    if (!pkg.pdf.success) throw new Error(`PDF in package failed: ${pkg.pdf.error}`);
    if (!pkg.xlsx.success) throw new Error(`XLSX in package failed: ${pkg.xlsx.error}`);
    if (!pkg.manifest.manifestId) throw new Error('No manifest ID');
    if (pkg.manifest.totalFiles !== 2) throw new Error('Expected 2 files in package');
    if (Object.keys(pkg.manifest.checksums).length !== 2) throw new Error('Expected 2 checksums');
  }));

  results.push(await runTest('Report metadata completeness', async () => {
    const data = collectReportData(mockState);
    const request: ReportGenerationRequest = {
      category: 'gqa_quality',
      format: 'pdf',
      includeGraphs: true,
      includeTables: true,
      includeAnnexes: true
    };
    const result = await generatePDF(request, data);
    if (!result.success) throw new Error('Generation failed');
    const meta = result.metadata;
    if (!meta.reportId) throw new Error('Missing reportId');
    if (!meta.softwareVersion) throw new Error('Missing softwareVersion');
    if (!meta.generationDate) throw new Error('Missing generationDate');
    if (!meta.dataSource) throw new Error('Missing dataSource');
    if (!meta.validationStatus) throw new Error('Missing validationStatus');
    if (meta.validationStatus !== 'synthetic_data') throw new Error('Validation status should be synthetic_data');
    if (!meta.fileHash) throw new Error('Missing fileHash');
    if (!meta.category) throw new Error('Missing category');
    if (!meta.format) throw new Error('Missing format');
    if (!meta.filename) throw new Error('Missing filename');
  }));

  results.push(await runTest('Empty data handling', async () => {
    const emptyState = { observables: [], gqaResults: [], experiments: [], images: [], syntheticScenes: [], systemStatus: { version: '0.3.0' } };
    const data = collectReportData(emptyState);
    const request: ReportGenerationRequest = {
      category: 'scientific_general',
      format: 'pdf',
      includeGraphs: true,
      includeTables: true,
      includeAnnexes: true
    };
    const result = await generatePDF(request, data);
    if (!result.success) throw new Error('Should handle empty data');
    if (result.metadata.dataSource !== 'none') throw new Error('Data source should be none');
  }));

  return {
    suite: 'Report Generation',
    timestamp: new Date().toISOString(),
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    results
  };
}
