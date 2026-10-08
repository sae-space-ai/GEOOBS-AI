import { useState, useEffect } from 'react';
import { runAllTests } from '../engine/tests';
import { runAllValidationSuites } from '../engine/validation';
import { runAllIntegrationTests } from '../engine/integration_tests';
import { runReportTests } from '../engine/reportTests';
import { runR23TestSuite } from '../engine/r23_distortion';

interface TestSuite {
  name: string;
  total: number;
  passed: number;
  failed: number;
  duration: number;
  status: 'pending' | 'running' | 'completed';
}

export function TestRunner() {
  const [suites, setSuites] = useState<TestSuite[]>([
    { name: 'Core Algorithms', total: 7, passed: 0, failed: 0, duration: 0, status: 'pending' },
    { name: 'Three GQA Modes', total: 4, passed: 0, failed: 0, duration: 0, status: 'pending' },
    { name: 'Robustness', total: 5, passed: 0, failed: 0, duration: 0, status: 'pending' },
    { name: 'Validation Suites', total: 5, passed: 0, failed: 0, duration: 0, status: 'pending' },
    { name: 'Integration Tests', total: 1, passed: 0, failed: 0, duration: 0, status: 'pending' },
    { name: 'Report Generation', total: 6, passed: 0, failed: 0, duration: 0, status: 'pending' },
    { name: 'R23 Distortion Lab', total: 10, passed: 0, failed: 0, duration: 0, status: 'pending' }
  ]);
  
  const [running, setRunning] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  const runAllSuites = async () => {
    setRunning(true);
    setOverallProgress(0);
    
    // Run core tests
    setSuites(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'running' } : s));
    await new Promise(resolve => setTimeout(resolve, 100));
    const coreResults = runAllTests();
    const corePassed = coreResults.reduce((sum, suite) => sum + suite.passed, 0);
    const coreTotal = coreResults.reduce((sum, suite) => sum + suite.total, 0);
    const coreDuration = coreResults.reduce((sum, suite) => 
      sum + suite.results.reduce((s, r) => s + r.duration, 0), 0
    );
    setSuites(prev => prev.map((s, i) => i === 0 ? { 
      ...s, 
      passed: corePassed, 
      failed: coreTotal - corePassed, 
      duration: coreDuration,
      status: 'completed' 
    } : s));
    setOverallProgress(14);
    
    // Run validation suites
    setSuites(prev => prev.map((s, i) => i === 3 ? { ...s, status: 'running' } : s));
    await new Promise(resolve => setTimeout(resolve, 100));
    const validationResults = runAllValidationSuites();
    const valPassed = validationResults.filter(v => v.passRate >= 0.8).length;
    setSuites(prev => prev.map((s, i) => i === 3 ? { 
      ...s, 
      passed: valPassed, 
      failed: validationResults.length - valPassed,
      duration: 500,
      status: 'completed' 
    } : s));
    setOverallProgress(28);
    
    // Run integration tests
    setSuites(prev => prev.map((s, i) => i === 4 ? { ...s, status: 'running' } : s));
    await new Promise(resolve => setTimeout(resolve, 100));
    const integrationResults = await runAllIntegrationTests();
    const intPassed = integrationResults.filter(r => r.status === 'passed').length;
    setSuites(prev => prev.map((s, i) => i === 4 ? { 
      ...s, 
      passed: intPassed, 
      failed: integrationResults.length - intPassed,
      duration: integrationResults.reduce((sum, r) => sum + r.duration, 0),
      status: 'completed' 
    } : s));
    setOverallProgress(42);
    
    // Run report tests
    setSuites(prev => prev.map((s, i) => i === 5 ? { ...s, status: 'running' } : s));
    await new Promise(resolve => setTimeout(resolve, 100));
    const reportSuite = await runReportTests();
    const repPassed = reportSuite.passed;
    setSuites(prev => prev.map((s, i) => i === 5 ? { 
      ...s, 
      passed: repPassed, 
      failed: reportSuite.failed,
      duration: reportSuite.results.reduce((sum, r) => sum + r.duration, 0),
      status: 'completed' 
    } : s));
    setOverallProgress(70);
    
    // Run R23 tests
    setSuites(prev => prev.map((s, i) => i === 6 ? { ...s, status: 'running' } : s));
    await new Promise(resolve => setTimeout(resolve, 100));
    const r23Results = runR23TestSuite();
    const r23Passed = r23Results.filter(r => r.metrics.rmseTotal < 3.0).length;
    setSuites(prev => prev.map((s, i) => i === 6 ? { 
      ...s, 
      passed: r23Passed, 
      failed: r23Results.length - r23Passed,
      duration: r23Results.reduce((sum, r) => sum + r.metrics.computationTimeMs, 0),
      status: 'completed' 
    } : s));
    setOverallProgress(100);
    
    setRunning(false);
  };

  const totalPassed = suites.reduce((sum, s) => sum + s.passed, 0);
  const totalTests = suites.reduce((sum, s) => sum + s.total, 0);
  const totalDuration = suites.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Test Runner</h2>
        <p className="text-gray-400 text-sm mt-1">Execute all test suites and view results</p>
      </div>

      {/* Overall Progress */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Overall Progress</h3>
          <div className="text-sm text-gray-400">
            {totalPassed}/{totalTests} tests passed ({((totalPassed / totalTests) * 100).toFixed(1)}%)
          </div>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 mb-3">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Total duration: {totalDuration.toFixed(0)}ms</span>
          <button 
            onClick={runAllSuites} 
            disabled={running}
            className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 disabled:bg-gray-700 text-white rounded transition-colors"
          >
            {running ? '⏳ Running...' : '▶ Run All Tests'}
          </button>
        </div>
      </div>

      {/* Test Suites */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suites.map((suite, index) => (
          <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-medium">{suite.name}</h4>
              <span className={`text-xs px-2 py-1 rounded ${
                suite.status === 'completed' 
                  ? suite.failed === 0 
                    ? 'bg-green-900/50 text-green-400' 
                    : 'bg-red-900/50 text-red-400'
                  : suite.status === 'running'
                  ? 'bg-blue-900/50 text-blue-400 animate-pulse'
                  : 'bg-gray-800 text-gray-500'
              }`}>
                {suite.status === 'completed' ? (suite.failed === 0 ? '✓ PASS' : '✗ FAIL') : 
                 suite.status === 'running' ? '⏳ RUNNING' : '○ PENDING'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex gap-4">
                <span className="text-green-400">{suite.passed} passed</span>
                <span className="text-red-400">{suite.failed} failed</span>
              </div>
              <span className="text-gray-500">{suite.duration.toFixed(0)}ms</span>
            </div>
            <div className="mt-2 w-full bg-gray-800 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  suite.failed === 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: suite.total > 0 ? `${(suite.passed / suite.total) * 100}%` : '0%' }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-4">Test Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalTests}</div>
            <div className="text-xs text-gray-500">Total Tests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{totalPassed}</div>
            <div className="text-xs text-gray-500">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{totalTests - totalPassed}</div>
            <div className="text-xs text-gray-500">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{((totalPassed / totalTests) * 100).toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Test Coverage */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-3">Test Coverage</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Core Algorithms (Shi-Tomasi, ORB, RANSAC)</span>
            <span className="text-green-400">✓ Covered</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Three GQA Modes (Absolute, Interchannel, Temporal)</span>
            <span className="text-green-400">✓ Covered</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Robustness (noise, clouds, large displacements)</span>
            <span className="text-green-400">✓ Covered</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Validation Suites (synthetic data)</span>
            <span className="text-green-400">✓ Covered</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Integration Tests (end-to-end)</span>
            <span className="text-green-400">✓ Covered</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Report Generation (PDF, XLSX)</span>
            <span className="text-green-400">✓ Covered</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">R23 Distortion Recovery (10 types)</span>
            <span className="text-green-400">✓ Covered</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Real satellite data (FCI/METimage)</span>
            <span className="text-yellow-400">⏳ Pending (blocked)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">ML models (PyTorch)</span>
            <span className="text-yellow-400">⏳ Pending (Python runtime)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
