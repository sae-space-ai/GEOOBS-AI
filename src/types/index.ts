// GEOOBS-AI Core Type Definitions
// Aligned with OBSERVABLE_SCHEMA.md

export type ProcessingLevel = 'L1b' | 'L1c' | 'L2';
export type InstrumentId = 'MTG-FCI' | 'METimage' | 'GENERIC';
export type PlatformId = 'MTG-I1' | 'MTG-S1' | 'METOP-SG-A' | 'METOP-SG-B' | 'SYNTHETIC';
export type DetectorMethod = 'shi-tomasi' | 'orb' | 'sift' | 'deep-feature' | 'synthetic';
export type ObservableStatus = 'accepted' | 'rejected' | 'pending_validation' | 'cloud_contaminated';
export type CoordinateSystem = 'pixel' | 'geographic' | 'projected';
export type SpectralBand = 'VIS004' | 'VIS005' | 'VIS006' | 'VIS008' | 'VIS009' | 'NIR13' | 'NIR16' | 'NIR22' | 'WV063' | 'WV073' | 'IR038' | 'IR087' | 'IR097' | 'IR105' | 'IR123' | 'IR133';
export type CloudCondition = 'clear' | 'partial' | 'overcast' | 'unknown';
export type DayNightCondition = 'day' | 'night' | 'twilight' | 'unknown';

export interface GeoCoordinate {
  lat: number;
  lon: number;
  crs: string; // e.g., 'EPSG:4326'
}

export interface PixelCoordinate {
  row: number;
  col: number;
}

export interface Displacement {
  dx_pixels: number;
  dy_pixels: number;
  dx_geodetic_m: number | null;
  dy_geodetic_m: number | null;
  magnitude_pixels: number;
  magnitude_geodetic_m: number | null;
  direction_rad: number;
  direction_deg: number;
}

export interface Uncertainty {
  sigma_x_pixels: number;
  sigma_y_pixels: number;
  sigma_x_geodetic_m: number | null;
  sigma_y_geodetic_m: number | null;
  confidence: number; // 0-1
  source: string;
}

export interface FeaturePoint {
  id: string;
  position: PixelCoordinate;
  geoPosition: GeoCoordinate | null;
  descriptor: number[];
  response: number;
  octave: number;
  quality: number;
  method: DetectorMethod;
  validated: boolean;
}

export interface FeatureMatch {
  id: string;
  featureRef: FeaturePoint;
  featureTarget: FeaturePoint;
  distance: number;
  ratio: number;
  inlier: boolean;
  ransacResidual: number | null;
}

export interface GeometricObservable {
  id: string;
  // Provenance
  instrument: InstrumentId;
  platform: PlatformId;
  productLevel: ProcessingLevel;
  acquisitionTime: string; // ISO 8601
  spectralBand: SpectralBand | 'MULTI' | 'COMPOSITE';
  // Position
  pixelPosition: PixelCoordinate;
  geoPosition: GeoCoordinate | null;
  coordinateSystem: CoordinateSystem;
  // Feature
  featureId: string;
  featureDescriptor: string;
  // Reference
  referenceSystem: string;
  expectedPosition: PixelCoordinate;
  observedPosition: PixelCoordinate;
  // Displacement
  displacement: Displacement;
  // Quality
  uncertainty: Uncertainty;
  qualityMetric: number;
  detectionMethod: DetectorMethod;
  modelId: string | null;
  modelVersion: string | null;
  // Conditions
  cloudCondition: CloudCondition;
  dayNightCondition: DayNightCondition;
  // Status
  status: ObservableStatus;
  // Traceability
  sourceFileId: string;
  processingChainId: string;
  createdAt: string;
  checksum: string;
}

export interface GQAResult {
  id: string;
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
  // Computed at
  computedAt: string;
  observableIds: string[];
}

export interface SatelliteImage {
  id: string;
  filename: string;
  instrument: InstrumentId;
  platform: PlatformId;
  productLevel: ProcessingLevel;
  acquisitionTime: string;
  width: number;
  height: number;
  bands: SpectralBand[];
  cloudCondition: CloudCondition;
  dayNightCondition: DayNightCondition;
  dataUrl: string;
  metadata: Record<string, string | number>;
  loadedAt: string;
}

export interface TrainingExperiment {
  id: string;
  name: string;
  detectorMethod: DetectorMethod;
  datasetId: string;
  parameters: Record<string, number | string | boolean>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string | null;
  completedAt: string | null;
  results: {
    rmse: number | null;
    precision: number | null;
    recall: number | null;
    f1: number | null;
    featureCount: number | null;
    matchCount: number | null;
    inlierRatio: number | null;
  };
  metrics: Record<string, number>;
  cpuTime: number | null;
  gpuTime: number | null;
  memoryPeak: number | null;
  seed: number;
  notes: string;
}

export interface ModelEntry {
  id: string;
  name: string;
  version: string;
  method: DetectorMethod;
  architecture: string;
  license: string;
  source: string;
  trainedOn: string;
  metrics: Record<string, number>;
  onnxPath: string | null;
  checksum: string;
  status: 'experimental' | 'validated' | 'operational';
  createdAt: string;
}

export interface SystemStatus {
  frontend: 'ok' | 'degraded' | 'down';
  backend: 'ok' | 'degraded' | 'down' | 'not_configured';
  scientificService: 'ok' | 'degraded' | 'down' | 'not_configured';
  database: 'ok' | 'degraded' | 'down';
  storage: 'ok' | 'degraded' | 'down';
  gpuAvailable: boolean;
  version: string;
  uptime: number;
  lastCheck: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  resource: string;
  details: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface SyntheticScene {
  id: string;
  name: string;
  width: number;
  height: number;
  knownDisplacement: Displacement;
  noiseLevel: number;
  cloudCoverage: number;
  contrastLevel: number;
  refImageData: ImageData | null;
  targetImageData: ImageData | null;
  refFeatures: FeaturePoint[];
  targetFeatures: FeaturePoint[];
  matches: FeatureMatch[];
}
