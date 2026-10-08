import { useState } from 'react';
import { useAppState, createAuditEntry } from '../store/AppContext';
import { generatePDF, generateXLSX, generatePackage, collectReportData } from '../engine/reportEngine';
import type { ReportCategory, ReportFormat, ReportGenerationRequest, ReportGenerationResult, ReportMetadata } from '../types/reports';
import { REPORT_CATEGORIES } from '../types/reports';

export function ScientificReportCenter() {
  const { state, dispatch } = useAppState();
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>('scientific_general');
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('pdf');
  const [generating, setGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<ReportGenerationResult | null>(null);
  const [reportHistory, setReportHistory] = useState<ReportMetadata[]>([]);

  const handleGenerate = async () => {
    setGenerating(true);
    setLastResult(null);

    const data = collectReportData(state);
    const request: ReportGenerationRequest = {
      category: selectedCategory,
      format: selectedFormat,
      includeGraphs: true,
      includeTables: true,
      includeAnnexes: true
    };

    let result: ReportGenerationResult;

    if (selectedFormat === 'pdf') {
      result = await generatePDF(request, data);
    } else if (selectedFormat === 'xlsx') {
      result = await generateXLSX(request, data);
    } else {
      const pkg = await generatePackage(request, data);
      result = pkg.pdf.success ? pkg.pdf : pkg.xlsx;
    }

    setLastResult(result);
    
    if (result.success) {
      setReportHistory(prev => [result.metadata, ...prev].slice(0, 20));
      dispatch({ type: 'ADD_LOG', payload: `Report generated: ${result.metadata.filename} (${(result.fileSize / 1024).toFixed(1)} KB)` });
      dispatch({ type: 'ADD_AUDIT', payload: createAuditEntry('generate_report', result.metadata.reportId, `${selectedFormat} - ${selectedCategory}`) });
    } else {
      dispatch({ type: 'ADD_LOG', payload: `Report generation failed: ${result.error}` });
    }

    setGenerating(false);
  };

  const data = collectReportData(state);
  const hasData = data.observables.length > 0 || data.gqaResults.length > 0 || data.syntheticScenes.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Scientific Reporting and Evidence Center</h2>
        <p className="text-gray-400 text-sm mt-1">Generate professional PDF and Excel reports from scientific executions</p>
      </div>

      {/* Data Status Warning */}
      {!hasData && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
          <p className="text-yellow-300 text-sm">⚠️ No scientific data available. Generate synthetic scenes or run experiments first to create meaningful reports.</p>
        </div>
      )}

      {/* Report Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Selection */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-4">Report Category</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {Object.entries(REPORT_CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as ReportCategory)}
                className={`w-full text-left p-3 rounded transition-colors ${
                  selectedCategory === key
                    ? 'bg-cyan-900/30 border border-cyan-600'
                    : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.icon}</span>
                  <div>
                    <div className="text-sm text-white font-medium">{cat.label}</div>
                    <div className="text-xs text-gray-400">{cat.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Format and Options */}
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h3 className="text-white font-semibold mb-4">Output Format</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedFormat('pdf')}
                className={`w-full p-3 rounded text-left transition-colors ${
                  selectedFormat === 'pdf' ? 'bg-red-900/30 border border-red-600' : 'bg-gray-800/50 border border-gray-700'
                }`}
              >
                <div className="text-sm text-white font-medium">📄 PDF Document</div>
                <div className="text-xs text-gray-400">Multi-page scientific report with cover, TOC, tables</div>
              </button>
              <button
                onClick={() => setSelectedFormat('xlsx')}
                className={`w-full p-3 rounded text-left transition-colors ${
                  selectedFormat === 'xlsx' ? 'bg-green-900/30 border border-green-600' : 'bg-gray-800/50 border border-gray-700'
                }`}
              >
                <div className="text-sm text-white font-medium">📊 Excel Workbook (XLSX)</div>
                <div className="text-xs text-gray-400">24 structured sheets with data, statistics, evidence</div>
              </button>
              <button
                onClick={() => setSelectedFormat('package')}
                className={`w-full p-3 rounded text-left transition-colors ${
                  selectedFormat === 'package' ? 'bg-purple-900/30 border border-purple-600' : 'bg-gray-800/50 border border-gray-700'
                }`}
              >
                <div className="text-sm text-white font-medium">📦 Complete Package</div>
                <div className="text-xs text-gray-400">PDF + XLSX + JSON manifest with checksums</div>
              </button>
            </div>
          </div>

          {/* Data Summary */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h3 className="text-white font-semibold mb-3">Data Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Observables:</span>
                <span className="text-white">{data.observables.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">GQA Assessments:</span>
                <span className="text-white">{data.gqaResults.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Experiments:</span>
                <span className="text-white">{data.experiments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Synthetic Scenes:</span>
                <span className="text-white">{data.syntheticScenes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Images Loaded:</span>
                <span className="text-white">{data.images.length}</span>
              </div>
              <div className="pt-2 border-t border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Data Source:</span>
                  <span className="text-yellow-300">{data.syntheticScenes.length > 0 ? 'SYNTHETIC' : 'NONE'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all"
          >
            {generating ? '⏳ Generating Report...' : `🚀 GENERATE ${selectedFormat.toUpperCase()} REPORT`}
          </button>
        </div>
      </div>

      {/* Last Result */}
      {lastResult && (
        <div className={`border rounded-lg p-5 ${lastResult.success ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'}`}>
          <h3 className={`font-semibold mb-3 ${lastResult.success ? 'text-green-300' : 'text-red-300'}`}>
            {lastResult.success ? '✅ Report Generated Successfully' : '❌ Report Generation Failed'}
          </h3>
          {lastResult.success ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Filename:</span>
                <span className="text-white font-mono">{lastResult.metadata.filename}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Report ID:</span>
                <span className="text-cyan-300 font-mono">{lastResult.metadata.reportId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">File Size:</span>
                <span className="text-white">{(lastResult.fileSize / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Generation Time:</span>
                <span className="text-white">{lastResult.generationTime.toFixed(0)} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Data Source:</span>
                <span className="text-yellow-300">{lastResult.metadata.validationStatus.replace('_', ' ').toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hash:</span>
                <span className="text-gray-300 font-mono text-xs">{lastResult.metadata.fileHash}</span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-red-300">
              <p>Error: {lastResult.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Report History */}
      {reportHistory.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-3">Report History ({reportHistory.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {reportHistory.map((report, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{REPORT_CATEGORIES[report.category]?.icon || '📄'}</span>
                  <div>
                    <div className="text-white">{report.filename}</div>
                    <div className="text-xs text-gray-500">{report.reportId} • {new Date(report.generationDate).toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">{report.format.toUpperCase()}</div>
                  <div className="text-xs text-gray-500">{report.validationStatus}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Classification Notice */}
      <div className="bg-gray-900 border border-yellow-800/50 rounded-lg p-5">
        <h3 className="text-yellow-300 font-semibold mb-2">⚠️ Data Classification Notice</h3>
        <div className="text-sm text-gray-400 space-y-1">
          <p>• All reports generated from this system are based on <span className="text-yellow-300">SYNTHETIC DATA</span> unless explicitly marked otherwise</p>
          <p>• No authentic EUMETSAT FCI or METimage products have been used in this analysis</p>
          <p>• Results are for algorithm validation and system testing only</p>
          <p>• No contractual compliance with EUMETSAT requirements is claimed</p>
          <p>• R36 AI authorization status: <span className="text-yellow-300">PENDING_AUTHORIZATION</span></p>
        </div>
      </div>
    </div>
  );
}
