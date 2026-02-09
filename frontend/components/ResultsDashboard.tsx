'use client'

import { useState } from 'react'
import { Download, FileText, AlertTriangle, CheckCircle2, RefreshCw, Code, Filter, FolderOpen, CheckCircle, AlertCircle, FileCode, Wrench } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ResultsDashboardProps {
  results: any
  sessionId: string
  onReset: () => void
}

export default function ResultsDashboard({ results, sessionId, onReset }: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'nist-validation' | 'gaps' | 'oscal' | 'remediation'>('overview')

  const handleDownloadOSCAL = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/results/${sessionId}/oscal`)
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `oscal-artifacts-${sessionId}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading OSCAL:', error)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/30 p-10 hover:shadow-purple-500/20 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-5 rounded-2xl shadow-xl">
                <CheckCircle2 className="w-14 h-14 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">Analysis Complete!</h2>
              <p className="text-purple-200 text-lg mt-2">NIST 800-53 Rev 5 & OSCAL 1.2.0 validated</p>
            </div>
          </div>
          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* Assessment Scope Summary */}
      {results.assessment_scope && (
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl">
              <Filter className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Assessment Scope</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-sm text-purple-300 mb-1">Baseline</div>
              <div className="text-lg font-bold text-white uppercase">{results.assessment_scope.baseline}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-sm text-purple-300 mb-1">Assessment Mode</div>
              <div className="text-lg font-bold text-white capitalize">{results.assessment_scope.mode}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-sm text-purple-300 mb-1">Controls in Scope</div>
              <div className="text-lg font-bold text-white">{results.assessment_scope.controls_in_scope || 'N/A'}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-sm text-purple-300 mb-1">Controls Processed</div>
              <div className="text-lg font-bold text-white">{results.assessment_scope.controls_processed || results.control_mappings?.length || 0}</div>
            </div>
          </div>
          {results.assessment_scope.control_families && results.assessment_scope.control_families.length > 0 && (
            <div className="mt-4">
              <div className="text-sm text-purple-300 mb-2">Selected Control Families:</div>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(results.assessment_scope.control_families)).map((family: string) => (
                  <span key={family} className="px-3 py-1 bg-indigo-600/50 text-white rounded-lg text-sm font-semibold border border-indigo-400/30">
                    {family}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl hover:shadow-blue-500/20 transition-all transform hover:-translate-y-2 hover:border-blue-400/40">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <span className="text-5xl font-black text-white">{results.evidence_artifacts?.length || 0}</span>
          </div>
          <p className="text-sm font-bold text-purple-200">Evidence Analyzed</p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl hover:shadow-green-500/20 transition-all transform hover:-translate-y-2 hover:border-green-400/40">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <span className="text-5xl font-black text-white">{results.implemented_controls || 0}</span>
          </div>
          <p className="text-sm font-bold text-purple-200">Controls Implemented</p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl hover:shadow-orange-500/20 transition-all transform hover:-translate-y-2 hover:border-orange-400/40">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-xl shadow-lg">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <span className="text-5xl font-black text-white">{results.gaps_identified || 0}</span>
          </div>
          <p className="text-sm font-bold text-purple-200">Gaps Identified</p>
        </div>

        <div className="glass-effect rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between mb-3">
            <div className="text-4xl">📊</div>
            <span className="text-4xl font-black gradient-text">{results.overall_compliance_score?.toFixed(0) || 0}%</span>
          </div>
          <p className="text-sm font-semibold text-gray-600">Compliance Score</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass-effect rounded-2xl shadow-2xl border border-white/30">
        {/* Tabs */}
        <div className="border-b border-white/20 bg-white/5">
          <nav className="flex space-x-1 px-8" aria-label="Tabs">
            {[
              { id: 'overview', label: 'Overview', Icon: FolderOpen },
              { id: 'nist-validation', label: 'NIST Validation', Icon: CheckCircle },
              { id: 'gaps', label: 'Gaps & Risks', Icon: AlertCircle },
              { id: 'oscal', label: 'OSCAL Artifacts', Icon: FileCode },
              { id: 'remediation', label: 'Remediation', Icon: Wrench },
            ].map(tab => {
              const isActive = activeTab === tab.id
              const Icon = tab.Icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    py-4 px-4 border-b-2 font-medium text-sm transition-all duration-200 flex items-center space-x-2
                    ${isActive
                      ? 'border-white text-white bg-white/10'
                      : 'border-transparent text-white/60 hover:text-white/80 hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${
                    tab.id === 'nist-validation' && isActive ? 'text-green-400' :
                    tab.id === 'gaps' && isActive ? 'text-yellow-400' :
                    ''
                  }`} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-8 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Control Mappings</h3>
                <div className="space-y-3">
                  {results.control_mappings?.slice(0, 5).map((mapping: any, idx: number) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm font-bold text-blue-400">
                              {mapping.control_id}
                            </span>
                            <span className="text-white font-medium">{mapping.control_name}</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 text-xs font-semibold rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                          {mapping.implementation_status}
                        </span>
                      </div>
                      <p className="text-sm text-white/70 mb-3">{mapping.implementation_description}</p>
                      <div className="flex items-center text-xs text-white/50 space-x-4">
                        <span>Confidence: {(mapping.confidence_score * 100).toFixed(0)}%</span>
                        <span>Evidence: {mapping.evidence_ids?.length || 0} artifacts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NIST Validation Tab */}
          {activeTab === 'nist-validation' && (
            <div className="space-y-6">
              {/* OSCAL Validation Status */}
              {results.oscal_validation_result && (
                <div className={`border-2 rounded-xl p-6 ${
                  results.oscal_validation_result.is_valid 
                    ? 'border-green-500/30 bg-green-500/10' 
                    : 'border-red-500/30 bg-red-500/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      {results.oscal_validation_result.is_valid ? '✅' : '❌'} OSCAL 1.2.0 Validation
                    </h3>
                    <span className={`px-3 py-1 text-sm font-bold rounded-lg ${
                      results.oscal_validation_result.is_valid 
                        ? 'bg-green-500/30 text-green-300 border border-green-400/30' 
                        : 'bg-red-500/30 text-red-300 border border-red-400/30'
                    }`}>
                      {results.oscal_validation_result.is_valid ? 'VALID' : 'INVALID'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center bg-white/5 rounded-lg p-3">
                      <div className="text-2xl font-bold text-red-400">{results.oscal_validation_result.error_count}</div>
                      <div className="text-xs text-white/60">Errors</div>
                    </div>
                    <div className="text-center bg-white/5 rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-400">{results.oscal_validation_result.warning_count}</div>
                      <div className="text-xs text-white/60">Warnings</div>
                    </div>
                    <div className="text-center bg-white/5 rounded-lg p-3">
                      <div className="text-sm font-mono text-white">{results.oscal_validation_result.oscal_version}</div>
                      <div className="text-xs text-white/60">OSCAL Version</div>
                    </div>
                  </div>
                  {results.oscal_validation_result.validation_messages?.length > 0 && (
                    <div className="bg-white/5 rounded-lg p-3 max-h-40 overflow-y-auto">
                      <p className="text-xs font-semibold text-white/70 mb-2">Validation Messages:</p>
                      <ul className="text-xs text-white/60 space-y-1">
                        {results.oscal_validation_result.validation_messages.slice(0, 10).map((msg: string, idx: number) => (
                          <li key={idx} className="font-mono">• {msg}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* NIST Control Validation Results */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">NIST 800-53 Rev 5 Control Validation</h3>
                <div className="space-y-4">
                  {results.nist_validation_results?.map((validation: any, idx: number) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="font-mono text-sm font-bold text-blue-400">{validation.control_id}</span>
                          <span className="ml-2 text-white font-medium">{validation.control_title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                            validation.is_valid 
                              ? 'bg-green-500/30 text-green-300 border border-green-400/30' 
                              : 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/30'
                          }`}>
                            {validation.is_valid ? 'VALID' : 'PARTIAL'}
                          </span>
                          {validation.nist_guidance_applied && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-500/30 text-blue-300 rounded-lg border border-blue-400/30">
                              🧠 AI Reasoned
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-white/60">Coverage Score:</span>
                          <div className="flex-1 bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(validation.coverage_score * 100).toFixed(0)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-white">{(validation.coverage_score * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      {validation.requirements_met?.length > 0 && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-2">
                          <p className="text-xs font-semibold text-green-300 mb-2">✅ Requirements Met:</p>
                          <ul className="text-xs text-green-200/80 space-y-1">
                            {validation.requirements_met.slice(0, 3).map((req: string, reqIdx: number) => (
                              <li key={reqIdx}>• {req}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {validation.requirements_not_met?.length > 0 && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-2">
                          <p className="text-xs font-semibold text-yellow-300 mb-2">⚠️ Requirements Not Met:</p>
                          <ul className="text-xs text-yellow-200/80 space-y-1">
                            {validation.requirements_not_met.slice(0, 3).map((req: string, reqIdx: number) => (
                              <li key={reqIdx}>• {req}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {validation.recommendations?.length > 0 && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                          <p className="text-xs font-semibold text-blue-300 mb-2">💡 NIST Guidance-Based Recommendations:</p>
                          <ul className="text-xs text-blue-200/80 space-y-1">
                            {validation.recommendations.slice(0, 2).map((rec: string, recIdx: number) => (
                              <li key={recIdx}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Gaps Tab */}
          {activeTab === 'gaps' && (
            <div className="space-y-4">
              {results.control_gaps?.map((gap: any, idx: number) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-mono text-sm font-bold text-blue-400">
                        {gap.control_id}
                      </span>
                      <span className="ml-2 text-white font-medium">{gap.control_name}</span>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                      gap.risk_level === 'critical' ? 'bg-red-500/30 text-red-300 border border-red-400/30' :
                      gap.risk_level === 'high' ? 'bg-orange-500/30 text-orange-300 border border-orange-400/30' :
                      gap.risk_level === 'medium' ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/30' :
                      'bg-blue-500/30 text-blue-300 border border-blue-400/30'
                    }`}>
                      {gap.risk_level.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-white/70 mb-3">{gap.gap_description}</p>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs font-semibold text-white/70 mb-2">Recommended Actions:</p>
                    <ul className="text-xs text-white/60 space-y-1">
                      {gap.recommended_actions?.map((action: string, actionIdx: number) => (
                        <li key={actionIdx}>• {action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* OSCAL Tab */}
          {activeTab === 'oscal' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={handleDownloadOSCAL}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download OSCAL JSON
                </button>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">SSP Components ({results.oscal_components?.length || 0})</h4>
                <div className="space-y-3">
                  {results.oscal_components?.map((component: any, idx: number) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5">
                      <p className="font-mono text-sm text-blue-400 mb-1">{component.component_id}</p>
                      <p className="font-medium text-white mb-2">{component.title}</p>
                      <p className="text-sm text-white/70">{component.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">POA&M Entries ({results.poam_entries?.length || 0})</h4>
                <div className="space-y-3">
                  {results.poam_entries?.map((poam: any, idx: number) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-white">{poam.title}</p>
                        <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                          poam.risk_level === 'critical' ? 'bg-red-500/30 text-red-300 border border-red-400/30' :
                          poam.risk_level === 'high' ? 'bg-orange-500/30 text-orange-300 border border-orange-400/30' :
                          poam.risk_level === 'medium' ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/30' :
                          'bg-blue-500/30 text-blue-300 border border-blue-400/30'
                        }`}>
                          {poam.risk_level}
                        </span>
                      </div>
                      <p className="text-sm text-white/70 mb-2">{poam.description}</p>
                      <p className="text-xs text-white/50">Related: {poam.related_controls?.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Remediation Tab */}
          {activeTab === 'remediation' && (
            <div className="space-y-4">
              {results.remediation_tasks?.map((task: any, idx: number) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-white">{task.title}</h4>
                      <p className="text-sm text-white/70 mt-1">{task.description}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                      task.priority === 'critical' ? 'bg-red-500/30 text-red-300 border border-red-400/30' :
                      task.priority === 'high' ? 'bg-orange-500/30 text-orange-300 border border-orange-400/30' :
                      task.priority === 'medium' ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/30' :
                      'bg-blue-500/30 text-blue-300 border border-blue-400/30'
                    }`}>
                      {task.priority}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs font-semibold text-white/70 mb-2">Implementation Guide:</p>
                    <p className="text-sm text-white/60 whitespace-pre-wrap">{task.implementation_guide}</p>
                  </div>

                  {task.code_snippets?.length > 0 && (
                    <div className="bg-slate-950/50 border border-white/10 rounded-lg p-4 mb-3">
                      <div className="flex items-center mb-2">
                        <Code className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-xs text-white/60">Code Example</span>
                      </div>
                      <pre className="text-xs text-green-400 overflow-x-auto">
                        {task.code_snippets[0].code}
                      </pre>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-white/70 mb-1">Verification Steps:</p>
                    <ul className="text-xs text-white/60 space-y-1">
                      {task.verification_steps?.map((step: string, stepIdx: number) => (
                        <li key={stepIdx}>✓ {step}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/50">
                    Effort: {task.effort_estimate} • Related: {task.related_gaps?.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Analyze More Documents
        </button>
      </div>
    </div>
  )
}
