// GEOOBS-AI State Management
// Global application state using React context

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  SatelliteImage, GeometricObservable, GQAResult,
  TrainingExperiment, ModelEntry, AuditEntry, SystemStatus,
  SyntheticScene, FeaturePoint, FeatureMatch
} from '../types';

interface AppState {
  images: SatelliteImage[];
  observables: GeometricObservable[];
  gqaResults: GQAResult[];
  experiments: TrainingExperiment[];
  models: ModelEntry[];
  auditLog: AuditEntry[];
  syntheticScenes: SyntheticScene[];
  systemStatus: SystemStatus;
  currentScene: SyntheticScene | null;
  currentFeatures: { ref: FeaturePoint[]; target: FeaturePoint[]; matches: FeatureMatch[] };
  processingLog: string[];
}

type Action =
  | { type: 'ADD_IMAGE'; payload: SatelliteImage }
  | { type: 'ADD_OBSERVABLES'; payload: GeometricObservable[] }
  | { type: 'ADD_GQA'; payload: GQAResult }
  | { type: 'ADD_EXPERIMENT'; payload: TrainingExperiment }
  | { type: 'UPDATE_EXPERIMENT'; payload: { id: string; updates: Partial<TrainingExperiment> } }
  | { type: 'ADD_MODEL'; payload: ModelEntry }
  | { type: 'ADD_AUDIT'; payload: AuditEntry }
  | { type: 'ADD_SYNTHETIC_SCENE'; payload: SyntheticScene }
  | { type: 'SET_CURRENT_SCENE'; payload: SyntheticScene | null }
  | { type: 'SET_FEATURES'; payload: { ref: FeaturePoint[]; target: FeaturePoint[]; matches: FeatureMatch[] } }
  | { type: 'ADD_LOG'; payload: string }
  | { type: 'CLEAR_ALL' };

const initialState: AppState = {
  images: [],
  observables: [],
  gqaResults: [],
  experiments: [],
  models: [],
  auditLog: [],
  syntheticScenes: [],
  systemStatus: {
    frontend: 'ok',
    backend: 'not_configured',
    scientificService: 'not_configured',
    database: 'ok',
    storage: 'ok',
    gpuAvailable: false,
    version: '0.1.0-alpha',
    uptime: 0,
    lastCheck: new Date().toISOString()
  },
  currentScene: null,
  currentFeatures: { ref: [], target: [], matches: [] },
  processingLog: []
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_IMAGE':
      return { ...state, images: [...state.images, action.payload] };
    case 'ADD_OBSERVABLES':
      return { ...state, observables: [...state.observables, ...action.payload] };
    case 'ADD_GQA':
      return { ...state, gqaResults: [...state.gqaResults, action.payload] };
    case 'ADD_EXPERIMENT':
      return { ...state, experiments: [...state.experiments, action.payload] };
    case 'UPDATE_EXPERIMENT':
      return {
        ...state,
        experiments: state.experiments.map(e =>
          e.id === action.payload.id ? { ...e, ...action.payload.updates } : e
        )
      };
    case 'ADD_MODEL':
      return { ...state, models: [...state.models, action.payload] };
    case 'ADD_AUDIT':
      return { ...state, auditLog: [action.payload, ...state.auditLog].slice(0, 500) };
    case 'ADD_SYNTHETIC_SCENE':
      return { ...state, syntheticScenes: [...state.syntheticScenes, action.payload] };
    case 'SET_CURRENT_SCENE':
      return { ...state, currentScene: action.payload };
    case 'SET_FEATURES':
      return { ...state, currentFeatures: action.payload };
    case 'ADD_LOG':
      return { ...state, processingLog: [...state.processingLog, `[${new Date().toISOString()}] ${action.payload}`].slice(-200) };
    case 'CLEAR_ALL':
      return initialState;
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}

export function createAuditEntry(action: string, resource: string, details: string, severity: 'info' | 'warning' | 'error' = 'info'): AuditEntry {
  return {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    action,
    actor: 'system',
    resource,
    details,
    severity
  };
}
