// GEOOBS-AI Geomorphological Evaluation Engine
// For MINERAL-01 mission - Pattern detection for mining indications

import { v4 as uuidv4 } from 'uuid';

export type EvidenceLevel = 'OBSERVACION_TOPOGRAFICA' | 'HIPOTESIS_ACTIVIDAD_HUMANA' | 'INDICIO_MINERO_DOCUMENTAL';

export type AnomalyType = 'depresion' | 'zanja' | 'escombrera' | 'corte' | 'terraplen' | 'desmonte';

export interface GeomorphologicalThresholds {
  minDepth: number; // meters
  minArea: number; // square meters
  slopeThreshold: number; // degrees
  aspectConsistency: number; // 0-1
}

export interface Anomaly {
  id: string;
  type: AnomalyType;
  geometry: {
    type: 'Polygon' | 'Point' | 'LineString';
    coordinates: number[] | number[][] | number[][][];
  };
  dimensions: {
    width: number; // meters
    length: number; // meters
    depth: number; // meters (relative)
    area: number; // square meters
  };
  elevation: {
    min: number;
    max: number;
    mean: number;
    relative: number; // relative to surroundings
  };
  sourceFile: string;
  methodology: string;
  sourceHash: string;
  evidenceLevel: EvidenceLevel;
  alternativeInterpretations: string[];
  distanceToWatercourse: number | null; // meters
  igmeRecord: {
    status: 'VERIFICADO' | 'NO_VERIFICADO' | 'NO_CONSULTADO';
    code: string | null;
    distance: number | null; // meters
  };
  confidence: number; // 0-1
  requiresHumanReview: boolean;
  timestamp: string;
}

export interface GeomorphologicalAnalysis {
  id: string;
  timestamp: string;
  areaOfInterest: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  thresholds: GeomorphologicalThresholds;
  anomalies: Anomaly[];
  statistics: {
    totalAnomalies: number;
    byType: Record<AnomalyType, number>;
    byEvidenceLevel: Record<EvidenceLevel, number>;
    meanConfidence: number;
    anomaliesRequiringReview: number;
  };
  sourceData: {
    type: 'LAZ' | 'MDT_COG' | 'SYNTHETIC' | 'NOT_AVAILABLE';
    file: string | null;
    crs: string | null;
    resolution: number | null; // meters
  };
  igmeCrossReference: {
    queried: boolean;
    endpoint: string | null;
    queryTime: string | null;
    resultsCount: number;
    matchedAnomalies: number;
  };
  warnings: string[];
}

// Default thresholds for mining indication detection
export const DEFAULT_THRESHOLDS: GeomorphologicalThresholds = {
  minDepth: 0.5, // 50 cm minimum depth
  minArea: 25, // 25 m² minimum area
  slopeThreshold: 15, // 15 degrees for cuts/fills
  aspectConsistency: 0.7 // 70% aspect consistency
};

/**
 * Analyze elevation data for geomorphological patterns
 * NOTE: This is a placeholder for when real elevation data is available
 */
export function analyzeGeomorphology(
  elevationData: Float32Array | null,
  width: number,
  height: number,
  resolution: number,
  thresholds: GeomorphologicalThresholds = DEFAULT_THRESHOLDS
): GeomorphologicalAnalysis {
  const analysisId = uuidv4();
  const timestamp = new Date().toISOString();
  
  const warnings: string[] = [];
  const anomalies: Anomaly[] = [];
  
  if (!elevationData) {
    warnings.push('No elevation data available - analysis cannot be performed');
    warnings.push('LAZ file or MDT COG required for geomorphological analysis');
    
    return {
      id: analysisId,
      timestamp,
      areaOfInterest: {
        type: 'Polygon',
        coordinates: [[[0, 0], [width * resolution, 0], [width * resolution, height * resolution], [0, height * resolution], [0, 0]]]
      },
      thresholds,
      anomalies: [],
      statistics: {
        totalAnomalies: 0,
        byType: { depresion: 0, zanja: 0, escombrera: 0, corte: 0, terraplen: 0, desmonte: 0 },
        byEvidenceLevel: { OBSERVACION_TOPOGRAFICA: 0, HIPOTESIS_ACTIVIDAD_HUMANA: 0, INDICIO_MINERO_DOCUMENTAL: 0 },
        meanConfidence: 0,
        anomaliesRequiringReview: 0
      },
      sourceData: {
        type: 'NOT_AVAILABLE',
        file: null,
        crs: null,
        resolution: null
      },
      igmeCrossReference: {
        queried: false,
        endpoint: null,
        queryTime: null,
        resultsCount: 0,
        matchedAnomalies: 0
      },
      warnings
    };
  }
  
  // Placeholder for actual analysis when elevation data is available
  // This would include:
  // 1. Depression detection (sinkholes, excavations)
  // 2. Linear feature detection (trenches, cuts)
  // 3. Mound detection (spoil heaps, terraplens)
  // 4. Slope analysis for cut/fill identification
  // 5. Aspect consistency for人工 features
  
  warnings.push('Geomorphological analysis engine is prepared but requires real elevation data');
  warnings.push('Current implementation is a placeholder - no anomalies detected without data');
  
  return {
    id: analysisId,
    timestamp,
    areaOfInterest: {
      type: 'Polygon',
      coordinates: [[[0, 0], [width * resolution, 0], [width * resolution, height * resolution], [0, height * resolution], [0, 0]]]
    },
    thresholds,
    anomalies,
    statistics: {
      totalAnomalies: 0,
      byType: { depresion: 0, zanja: 0, escombrera: 0, corte: 0, terraplen: 0, desmonte: 0 },
      byEvidenceLevel: { OBSERVACION_TOPOGRAFICA: 0, HIPOTESIS_ACTIVIDAD_HUMANA: 0, INDICIO_MINERO_DOCUMENTAL: 0 },
      meanConfidence: 0,
      anomaliesRequiringReview: 0
    },
    sourceData: {
      type: 'SYNTHETIC',
      file: 'placeholder',
      crs: 'EPSG:25830',
      resolution
    },
    igmeCrossReference: {
      queried: false,
      endpoint: null,
      queryTime: null,
      resultsCount: 0,
      matchedAnomalies: 0
    },
    warnings
  };
}

/**
 * Cross-reference anomalies with IGME mining indications
 */
export function crossReferenceWithIGME(
  anomalies: Anomaly[],
  igmeData: any[],
  maxDistance: number = 500 // meters
): { matched: number; unmatched: number; details: any[] } {
  let matched = 0;
  let unmatched = 0;
  const details: any[] = [];
  
  for (const anomaly of anomalies) {
    let foundMatch = false;
    
    for (const igmeRecord of igmeData) {
      // Calculate distance between anomaly and IGME record
      const anomalyCenter = getAnomalyCenter(anomaly);
      const distance = calculateDistance(
        anomalyCenter.lat,
        anomalyCenter.lon,
        igmeRecord.geometry.y,
        igmeRecord.geometry.x
      );
      
      if (distance <= maxDistance) {
        matched++;
        foundMatch = true;
        anomaly.igmeRecord = {
          status: 'VERIFICADO',
          code: igmeRecord.attributes.Codigo_indicio,
          distance
        };
        details.push({
          anomalyId: anomaly.id,
          igmeCode: igmeRecord.attributes.Codigo_indicio,
          igmeName: igmeRecord.attributes.Nombre_mina,
          distance,
          matchType: 'SPATIAL_PROXIMITY'
        });
        break;
      }
    }
    
    if (!foundMatch) {
      unmatched++;
      anomaly.igmeRecord = {
        status: 'NO_VERIFICADO',
        code: null,
        distance: null
      };
    }
  }
  
  return { matched, unmatched, details };
}

/**
 * Get center coordinates of an anomaly
 */
function getAnomalyCenter(anomaly: Anomaly): { lat: number; lon: number } {
  // Simplified - would need proper coordinate transformation
  if (anomaly.geometry.type === 'Point') {
    const coords = anomaly.geometry.coordinates as number[];
    return { lat: coords[1], lon: coords[0] };
  }
  // For polygons, calculate centroid
  // This is a simplified implementation
  return { lat: 0, lon: 0 };
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Export anomalies to GeoJSON format
 */
export function exportAnomaliesToGeoJSON(analysis: GeomorphologicalAnalysis): any {
  return {
    type: 'FeatureCollection',
    features: analysis.anomalies.map(anomaly => ({
      type: 'Feature',
      id: anomaly.id,
      geometry: anomaly.geometry,
      properties: {
        type: anomaly.type,
        evidenceLevel: anomaly.evidenceLevel,
        confidence: anomaly.confidence,
        dimensions: anomaly.dimensions,
        elevation: anomaly.elevation,
        sourceFile: anomaly.sourceFile,
        methodology: anomaly.methodology,
        sourceHash: anomaly.sourceHash,
        alternativeInterpretations: anomaly.alternativeInterpretations,
        distanceToWatercourse: anomaly.distanceToWatercourse,
        igmeStatus: anomaly.igmeRecord.status,
        igmeCode: anomaly.igmeRecord.code,
        igmeDistance: anomaly.igmeRecord.distance,
        requiresHumanReview: anomaly.requiresHumanReview,
        timestamp: anomaly.timestamp,
        // Explicit classification
        dataClassification: 'CALCULATED',
        warning: 'Morphological analysis only - does not confirm mining activity'
      }
    })),
    metadata: {
      analysisId: analysis.id,
      timestamp: analysis.timestamp,
      totalAnomalies: analysis.statistics.totalAnomalies,
      sourceData: analysis.sourceData,
      igmeCrossReference: analysis.igmeCrossReference,
      warnings: analysis.warnings,
      disclaimer: 'Anomalies are morphological observations only. Mining activity cannot be inferred from morphology alone. Human review required.'
    }
  };
}
