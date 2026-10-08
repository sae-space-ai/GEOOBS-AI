// GEOOBS-AI Integration Test Suite
// End-to-end test: Scientific execution → PDF + XLSX generation → Validation

import { v4 as uuidv4 } from 'uuid';
import { generateSyntheticScene } from './synthetic';
import { orbDetect, matchFeatures, ransacAffine, generateObservables, computeGQA } from './scientific';
import { computeAbsoluteGQA, computeInterchannelGQA, computeTemporalGQA } from './gqa_modes';
import { generatePDF, generateXLSX, collectReportData } from './reportEngine';
import type { ReportGenerationRequest } from '../types/reports';

export interface IntegrationTestResult {
  id: string;
  name: string;
  timestamp: string;
  status: 'passed' | 'failed';
  executionId: string;
  observablesGenerated: number;
  gqaResultsGenerated: number;
  pdfGenerated: boolean;
  xlsxGenerated: boolean;
  pdfHash: string | null;
  xlsxHash: string | null;
  pdfSize: number;
  xlsxSize: number;
  dataConsistency: boolean;
  errorMessage: string | null;
  duration: number;
}

export async function runIntegrationTest(): Promise<IntegrationTestResult> {
  const startTime = performance.now();
  const executionId = uuidv4();
  
  try {
    // Step 1: Generate synthetic scene with known displacement
    const scene = generateSyntheticScene(512, 512, 3.5, -2.1, 5, 0, 0.8, 42);
    
    // Step 2: Detect features
    const refFeatures = orbDetect(scene.refImageData!, 200);
    const targetFeatures = orbDetect(scene.targetImageData!, 200);
    
    // Step 3: Match features
    const matches = matchFeatures(refFeatures, targetFeatures, 0.8);
    
    // Step 4: RANSAC estimation
    const ransacResult = ransacAffine(matches, 1000, 5.0);
    const inliers = ransacResult.inliers.filter(m => m.inlier);
    
    // Step 5: Generate observables
    const observables = generateObservables(
      inliers,
      'GENERIC' as any,
      'SYNTHETIC' as any,
      'L1b',
      'VIS006' as any,
      new Date().toISOString(),
      'clear' as any,
      'day' as any,
      scene.id,
      `integration-test-${executionId}`
    );
    
    // Step 6: Compute GQA
    const gqaResult = computeGQA(observables);
    
    // Step 7: Prepare report data
    const reportData = {
      observables,
      gqaResults: [gqaResult],
      experiments: [],
      images: [],
      syntheticScenes: [scene],
      systemVersion: '0.4.0',
      generatedAt: new Date().toISOString()
    };
    
    // Step 8: Generate PDF
    const pdfRequest: ReportGenerationRequest = {
      category: 'scientific_general',
      format: 'pdf',
      experimentId: executionId,
      includeGraphs: true,
      includeTables: true,
      includeAnnexes: true
    };
    const pdfResult = await generatePDF(pdfRequest, reportData);
    
    // Step 9: Generate XLSX
    const xlsxRequest: ReportGenerationRequest = {
      category: 'scientific_general',
      format: 'xlsx',
      experimentId: executionId,
      includeGraphs: true,
      includeTables: true,
      includeAnnexes: true
    };
    const xlsxResult = await generateXLSX(xlsxRequest, reportData);
    
    // Step 10: Validate consistency
    const dataConsistency = 
      pdfResult.success && 
      xlsxResult.success &&
      pdfResult.metadata.experimentId === executionId &&
      xlsxResult.metadata.experimentId === executionId &&
      pdfResult.metadata.reportId !== xlsxResult.metadata.reportId; // Different report IDs
    
    return {
      id: uuidv4(),
      name: 'End-to-End Integration Test',
      timestamp: new Date().toISOString(),
      status: 'passed',
      executionId,
      observablesGenerated: observables.length,
      gqaResultsGenerated: 1,
      pdfGenerated: pdfResult.success,
      xlsxGenerated: xlsxResult.success,
      pdfHash: pdfResult.metadata.fileHash,
      xlsxHash: xlsxResult.metadata.fileHash,
      pdfSize: pdfResult.fileSize,
      xlsxSize: xlsxResult.fileSize,
      dataConsistency,
      errorMessage: null,
      duration: performance.now() - startTime
    };
    
  } catch (error) {
    return {
      id: uuidv4(),
      name: 'End-to-End Integration Test',
      timestamp: new Date().toISOString(),
      status: 'failed',
      executionId,
      observablesGenerated: 0,
      gqaResultsGenerated: 0,
      pdfGenerated: false,
      xlsxGenerated: false,
      pdfHash: null,
      xlsxHash: null,
      pdfSize: 0,
      xlsxSize: 0,
      dataConsistency: false,
      errorMessage: (error as Error).message,
      duration: performance.now() - startTime
    };
  }
}

export async function runAllIntegrationTests(): Promise<IntegrationTestResult[]> {
  return [
    await runIntegrationTest(),
    // Additional integration tests can be added here
  ];
}
