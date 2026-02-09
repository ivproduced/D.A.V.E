'use client'

import { useState } from 'react'
import { FileText, Shield, Sparkles, Zap, Target, Brain } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import ProcessingStatus from '@/components/ProcessingStatus'
import ResultsDashboard from '@/components/ResultsDashboard'
import ScopeSelector from '@/components/ScopeSelectorNew'

interface AssessmentScope {
  baseline: string
  control_families: string[]
  mode: string
  predefined_scope?: string
}

interface ProcessingEstimate {
  control_count: number
  estimated_tokens: number
  estimated_minutes: number
  estimated_cost_usd: number
}

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [stage, setStage] = useState<'scope' | 'upload' | 'processing' | 'results'>('scope')
  const [results, setResults] = useState<any>(null)
  const [assessmentScope, setAssessmentScope] = useState<AssessmentScope | null>(null)
  const [processingEstimate, setProcessingEstimate] = useState<ProcessingEstimate | null>(null)

  const handleScopeChange = (scope: AssessmentScope, estimate: ProcessingEstimate | null) => {
    setAssessmentScope(scope)
    setProcessingEstimate(estimate)
  }

  const handleScopeConfirmed = () => {
    setStage('upload')
  }

  const handleUploadComplete = (id: string) => {
    setSessionId(id)
    setStage('processing')
  }

  const handleProcessingComplete = (analysisResults: any) => {
    setResults(analysisResults)
    setStage('results')
  }

  const handleReset = () => {
    setSessionId(null)
    setStage('scope')
    setResults(null)
    setAssessmentScope(null)
    setProcessingEstimate(null)
  }

  return (
    <main className="min-h-screen bg-slate-950 w-full flex flex-col">
      {/* Subtle Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(100, 116, 139, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(100, 116, 139, 0.5) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative w-full bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 backdrop-blur-xl border-b border-slate-800 shadow-2xl">
        <div className="w-full max-w-[1400px] mx-auto px-8 sm:px-12 lg:px-16 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-xl shadow-xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-0.5">D.A.V.E</h1>
                <p className="text-sm text-slate-300 font-medium">Document Analysis & Validation Engine</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 px-5 py-2.5 bg-gradient-to-r from-slate-800/80 to-slate-800/60 rounded-xl border border-slate-700/60 shadow-lg">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-medium text-slate-300">Powered by</span>
              <span className="text-sm font-bold text-white">Google Gemini AI</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Stepper */}
      <div className="relative w-full bg-slate-900/60 backdrop-blur-sm border-b border-slate-800/50">
        <div className="w-full max-w-[1400px] mx-auto px-8 sm:px-12 lg:px-16 py-6">
          <div className="flex items-center justify-between">
            {[
              { key: 'scope', label: 'Define Scope', icon: Target, desc: 'Select assessment parameters' },
              { key: 'upload', label: 'Upload SSP', icon: FileText, desc: 'Provide compliance document' },
              { key: 'processing', label: 'AI Analysis', icon: Brain, desc: 'Automated validation' },
              { key: 'results', label: 'Results', icon: Shield, desc: 'Review findings' }
            ].map((step, index, arr) => {
              const isComplete = ['scope', 'upload', 'processing', 'results'].indexOf(stage) > index
              const isCurrent = ['scope', 'upload', 'processing', 'results'].indexOf(stage) === index
              
              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`relative flex items-center justify-center w-12 h-12 rounded-xl shadow-lg transition-all duration-300 ${
                      isComplete ? 'bg-gradient-to-br from-green-600 to-emerald-600 shadow-green-500/50' :
                      isCurrent ? 'bg-gradient-to-br from-blue-600 to-cyan-600 shadow-blue-500/50 ring-4 ring-blue-500/20' :
                      'bg-slate-800 border-2 border-slate-700'
                    }`}>
                      <step.icon className={`w-6 h-6 ${
                        isComplete || isCurrent ? 'text-white' : 'text-slate-500'
                      }`} />
                    </div>
                    <div className="mt-3 text-center">
                      <div className={`text-sm font-semibold ${
                        isCurrent ? 'text-white' : isComplete ? 'text-green-400' : 'text-slate-500'
                      }`}>{step.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{step.desc}</div>
                    </div>
                  </div>
                  {index < arr.length - 1 && (
                    <div className={`flex-1 h-0.5 -mt-12 mx-2 transition-all duration-300 ${
                      isComplete ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-slate-800'
                    }`}></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-[1400px] mx-auto px-8 sm:px-12 lg:px-16 py-10 flex-1">
        {/* Hero Banner */}
        <div className="mb-10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-blue-950/40 backdrop-blur-md rounded-2xl p-10 border border-slate-800/60 shadow-2xl">
          <div className="flex items-start space-x-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur-sm opacity-60 group-hover:opacity-80 transition duration-200"></div>
              <div className="relative bg-gradient-to-br from-blue-600/20 to-cyan-600/20 p-5 rounded-xl border border-blue-500/30">
                <Zap className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-3">AI-Powered Compliance Automation</h2>
              <p className="text-slate-300 text-base leading-relaxed">
                Configure your assessment scope, upload security evidence (PDFs, screenshots, configurations), and leverage our multi-agent AI system to automatically 
                analyze controls, map to NIST 800-53 requirements, identify compliance gaps, and generate OSCAL-compliant artifacts.
              </p>
            </div>
          </div>
        </div>

        {/* Stage: Scope Configuration */}
        {stage === 'scope' && (
          <div className="space-y-6">
            <ScopeSelector 
              onScopeChange={handleScopeChange}
              apiBaseUrl="http://localhost:8000"
            />
            <div className="flex justify-end">
              <button
                onClick={handleScopeConfirmed}
                disabled={!processingEstimate}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                Continue to File Upload
                <Zap className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stage: Upload */}
        {stage === 'upload' && (
          <div className="space-y-8">
            {/* Scope Summary */}
            {assessmentScope && processingEstimate && (
              <div className="bg-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Assessment Scope Configured</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Baseline:</span>
                    <span className="ml-2 text-white font-medium capitalize">{assessmentScope.baseline}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Mode:</span>
                    <span className="ml-2 text-white font-medium capitalize">{assessmentScope.mode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Controls:</span>
                    <span className="ml-2 text-white font-medium">{processingEstimate.control_count}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Est. Time:</span>
                    <span className="ml-2 text-white font-medium">
                      {processingEstimate.estimated_minutes < 1 ? '<1 min' : `${Math.ceil(processingEstimate.estimated_minutes)} min`}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setStage('scope')}
                  className="mt-4 text-sm text-blue-400 hover:text-blue-300 underline"
                >
                  Change scope configuration
                </button>
              </div>
            )}

            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Upload Evidence Artifacts
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Submit security documentation, screenshots, network diagrams, and configuration files for analysis
                  </p>
                </div>
              </div>
              <div className="mb-5 p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                <p className="text-xs text-slate-300">
                  <span className="font-semibold text-white">Supported formats:</span> PDF, DOCX, PNG, JPG, JSON, YAML &nbsp;•&nbsp; <span className="font-semibold text-white">Max size:</span> 50MB per file
                </p>
              </div>
              <FileUpload 
                onUploadComplete={handleUploadComplete} 
                assessmentScope={assessmentScope}
              />
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-all">
                <div className="bg-blue-600/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-blue-600/20">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Multimodal AI Analysis</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Advanced AI processes text, images, and diagrams for comprehensive compliance assessment
                </p>
              </div>
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-all">
                <div className="bg-cyan-600/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-cyan-600/20">
                  <Target className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">NIST 800-53 Mapping</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Automated control mapping with intelligent gap analysis and risk prioritization
                </p>
              </div>
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-all">
                <div className="bg-emerald-600/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-emerald-600/20">
                  <FileText className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">OSCAL Generation</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Generate compliant SSP components and POA&M entries with full evidence traceability
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stage: Processing */}
        {stage === 'processing' && sessionId && (
          <ProcessingStatus 
            sessionId={sessionId} 
            onComplete={handleProcessingComplete}
          />
        )}

        {/* Stage: Results */}
        {stage === 'results' && results && (
          <ResultsDashboard 
            results={results} 
            sessionId={sessionId!}
            onReset={handleReset}
          />
        )}
      </div>
    </main>
  )
}
