import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './screens/Dashboard';
import { ImageAcquisition } from './screens/ImageAcquisition';
import { ProductExplorer } from './screens/ProductExplorer';
import { AILaboratory } from './screens/AILaboratory';
import { TrainingCenter } from './screens/TrainingCenter';
import { MultispectralViewer } from './screens/MultispectralViewer';
import { FeatureDetector } from './screens/FeatureDetector';
import { ObservableExplorer } from './screens/ObservableExplorer';
import { GQAEvaluation } from './screens/GQAEvaluation';
import { ThreeGQAModes } from './screens/ThreeGQAModes';
import { ScientificReportCenter } from './screens/ScientificReportCenter';
import { R23Laboratory } from './screens/R23Laboratory';
import { GEOvsLEO } from './screens/GEOvsLEO';
import { ChannelComparison } from './screens/ChannelComparison';
import { ReportCenter } from './screens/ReportCenter';
import { AuditCenter } from './screens/AuditCenter';
import { ModelAdmin } from './screens/ModelAdmin';
import { SystemStatus } from './screens/SystemStatus';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="acquisition" element={<ImageAcquisition />} />
            <Route path="products" element={<ProductExplorer />} />
            <Route path="ai-lab" element={<AILaboratory />} />
            <Route path="training" element={<TrainingCenter />} />
            <Route path="viewer" element={<MultispectralViewer />} />
            <Route path="features" element={<FeatureDetector />} />
            <Route path="observables" element={<ObservableExplorer />} />
            <Route path="gqa" element={<GQAEvaluation />} />
            <Route path="three-gqa" element={<ThreeGQAModes />} />
            <Route path="reports-pro" element={<ScientificReportCenter />} />
            <Route path="r23-lab" element={<R23Laboratory />} />
            <Route path="geo-leo" element={<GEOvsLEO />} />
            <Route path="channels" element={<ChannelComparison />} />
            <Route path="reports" element={<ReportCenter />} />
            <Route path="audit" element={<AuditCenter />} />
            <Route path="models" element={<ModelAdmin />} />
            <Route path="system" element={<SystemStatus />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
