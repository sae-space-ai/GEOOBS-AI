// GEOOBS-AI Report Types
// Scientific Reporting and Evidence Center

export type ReportCategory =
  | 'scientific_general'
  | 'observables_geometric'
  | 'gqa_quality'
  | 'absolute_navigation'
  | 'interchannel_registration'
  | 'temporal_registration'
  | 'ai_training'
  | 'scientific_validation'
  | 'monitoring_degradation'
  | 'computational_performance'
  | 'security_audit'
  | 'requirements_traceability'
  | 'contractual_compliance'
  | 'l1_integration'
  | 'executive_summary'
  | 'consolidated_final';

export type ReportFormat = 'pdf' | 'xlsx' | 'package';

export type ValidationStatus = 'synthetic_data' | 'public_real_data' | 'eumetsat_agreed' | 'pending';

export interface ReportMetadata {
  reportId: string;
  experimentId: string | null;
  datasetId: string | null;
  modelId: string | null;
  runId: string | null;
  softwareVersion: string;
  executionDate: string;
  generationDate: string;
  dataSource: string;
  processingParameters: Record<string, any>;
  validationStatus: ValidationStatus;
  fileHash: string | null;
  documentVersion: string;
  author: string | null;
  category: ReportCategory;
  format: ReportFormat;
  filename: string;
}

export interface ReportManifest {
  manifestId: string;
  generatedAt: string;
  reports: ReportMetadata[];
  totalFiles: number;
  totalSize: number;
  checksums: Record<string, string>;
}

export interface ReportGenerationRequest {
  category: ReportCategory;
  format: ReportFormat;
  experimentId?: string;
  datasetId?: string;
  dateRange?: { start: string; end: string };
  instrument?: string;
  channel?: string;
  includeGraphs: boolean;
  includeTables: boolean;
  includeAnnexes: boolean;
}

export interface ReportGenerationResult {
  success: boolean;
  metadata: ReportMetadata;
  filePath: string;
  fileSize: number;
  generationTime: number;
  error: string | null;
}

export const REPORT_CATEGORIES: Record<ReportCategory, { label: string; description: string; icon: string }> = {
  scientific_general: {
    label: 'Scientific General Report',
    description: 'Comprehensive scientific analysis report',
    icon: '📊'
  },
  observables_geometric: {
    label: 'Geometric Observables Report',
    description: 'Detailed analysis of geometric observables',
    icon: '📐'
  },
  gqa_quality: {
    label: 'GQA Quality Report',
    description: 'Geometric Quality Assessment results',
    icon: '✅'
  },
  absolute_navigation: {
    label: 'Absolute Navigation Report',
    description: 'Absolute navigation GQA analysis',
    icon: '📍'
  },
  interchannel_registration: {
    label: 'Interchannel Registration Report',
    description: 'Interchannel registration analysis',
    icon: '🌈'
  },
  temporal_registration: {
    label: 'Temporal Registration Report',
    description: 'Temporal registration analysis',
    icon: '⏱️'
  },
  ai_training: {
    label: 'AI Training Report',
    description: 'Machine learning training results',
    icon: '🧠'
  },
  scientific_validation: {
    label: 'Scientific Validation Report',
    description: 'Validation results and verification',
    icon: '🔬'
  },
  monitoring_degradation: {
    label: 'Monitoring & Degradation Report',
    description: 'System monitoring and degradation analysis',
    icon: '📈'
  },
  computational_performance: {
    label: 'Computational Performance Report',
    description: 'Performance benchmarks and analysis',
    icon: '⚡'
  },
  security_audit: {
    label: 'Security & Audit Report',
    description: 'Security audit and compliance',
    icon: '🔒'
  },
  requirements_traceability: {
    label: 'Requirements Traceability Report',
    description: 'R1-R49 requirements compliance',
    icon: '📋'
  },
  contractual_compliance: {
    label: 'Contractual Compliance Report',
    description: 'EUMETSAT contractual compliance status',
    icon: '📑'
  },
  l1_integration: {
    label: 'L1 Integration Report',
    description: 'L1 processor integration analysis',
    icon: '🔗'
  },
  executive_summary: {
    label: 'Executive Summary',
    description: 'High-level project summary',
    icon: '📄'
  },
  consolidated_final: {
    label: 'Consolidated Final Report',
    description: 'Complete project consolidation',
    icon: '📚'
  }
};

export const XLSX_SHEETS = [
  '01_RESUMEN_EJECUTIVO',
  '02_INSTRUMENTOS',
  '03_DATASETS',
  '04_PROCESAMIENTO',
  '05_OBSERVABLES',
  '06_GQA_ABSOLUTE',
  '07_GQA_INTERCHANNEL',
  '08_GQA_TEMPORAL',
  '09_ESTADISTICAS',
  '10_SERIES_TEMPORALES',
  '11_TENDENCIAS',
  '12_ANOMALIAS',
  '13_MODELOS_IA',
  '14_ENTRENAMIENTOS',
  '15_VALIDACION',
  '16_RENDIMIENTO',
  '17_REQUISITOS_R1_R49',
  '18_EVIDENCIAS',
  '19_RIESGOS',
  '20_LIMITACIONES',
  '21_TRAZABILIDAD',
  '22_AUDITORIA',
  '23_METADATOS',
  '24_CONCLUSIONES'
];
