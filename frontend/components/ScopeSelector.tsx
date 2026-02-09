"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Shield, Zap, Brain, Clock, DollarSign, Filter, Download, Upload } from "lucide-react"

interface ControlFamily {
  code: string
  name: string
  control_count: number
}

interface PredefinedScope {
  id: string
  name: string
  description: string
  families: string[]
  control_count: number
}

interface ProcessingEstimate {
  control_count: number
  estimated_tokens: number
  estimated_minutes: number
  estimated_cost_usd: number
}

interface AssessmentScope {
  baseline: string
  control_families: string[]
  mode: string
  predefined_scope?: string
}

interface ScopeSelectorProps {
  onScopeChange: (scope: AssessmentScope, estimate: ProcessingEstimate | null) => void
  apiBaseUrl?: string
}

export default function ScopeSelector({ onScopeChange, apiBaseUrl = "http://localhost:8000" }: ScopeSelectorProps) {
  const [baseline, setBaseline] = useState<string>("moderate")
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([])
  const [assessmentMode, setAssessmentMode] = useState<string>("smart")
  const [predefinedScope, setPredefinedScope] = useState<string | undefined>(undefined)
  
  const [controlFamilies, setControlFamilies] = useState<ControlFamily[]>([])
  const [predefinedScopes, setPredefinedScopes] = useState<PredefinedScope[]>([])
  const [estimate, setEstimate] = useState<ProcessingEstimate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load control families and predefined scopes on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [familiesRes, scopesRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/control-families`),
          fetch(`${apiBaseUrl}/api/predefined-scopes`)
        ])
        
        const familiesData = await familiesRes.json()
        const scopesData = await scopesRes.json()
        
        setControlFamilies(familiesData.families || [])
        setPredefinedScopes(scopesData.scopes || [])
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading scope data:", error)
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [apiBaseUrl])

  // Update estimate whenever scope changes
  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/estimate-scope`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            baseline,
            control_families: selectedFamilies.length > 0 ? selectedFamilies : null,
            mode: assessmentMode,
            predefined_scope: predefinedScope
          })
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setEstimate(data)
        
        // Notify parent component
        onScopeChange(
          {
            baseline,
            control_families: selectedFamilies,
            mode: assessmentMode,
            predefined_scope: predefinedScope
          },
          data
        )
      } catch (error) {
        console.error("Error fetching estimate:", error)
        setEstimate(null)
      }
    }
    
    if (!isLoading) {
      fetchEstimate()
    }
  }, [baseline, selectedFamilies, assessmentMode, predefinedScope, isLoading, apiBaseUrl, onScopeChange])

  const handleFamilyToggle = (familyCode: string) => {
    setSelectedFamilies(prev => 
      prev.includes(familyCode)
        ? prev.filter(f => f !== familyCode)
        : [...prev, familyCode]
    )
    setPredefinedScope(undefined) // Clear predefined scope when manually selecting
  }

  const handlePredefinedScope = (scopeId: string) => {
    const scope = predefinedScopes.find(s => s.id === scopeId)
    if (scope) {
      setSelectedFamilies(scope.families)
      setPredefinedScope(scopeId)
    }
  }

  const clearFamilySelection = () => {
    setSelectedFamilies([])
    setPredefinedScope(undefined)
  }

  const handleExportScope = () => {
    const scopeConfig = {
      baseline,
      control_families: selectedFamilies,
      mode: assessmentMode,
      predefined_scope: predefinedScope,
      exported_at: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(scopeConfig, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dave-scope-${baseline}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleImportScope = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const scopeConfig = JSON.parse(e.target?.result as string)
        setBaseline(scopeConfig.baseline || 'moderate')
        setSelectedFamilies(scopeConfig.control_families || [])
        setAssessmentMode(scopeConfig.mode || 'smart')
        setPredefinedScope(scopeConfig.predefined_scope)
      } catch (error) {
        console.error('Error importing scope:', error)
        alert('Invalid scope configuration file')
      }
    }
    reader.readAsText(file)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Assessment Scope...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900 mb-1">Assessment Scope Configuration</CardTitle>
                <CardDescription className="text-slate-600 text-sm leading-relaxed">
                  Configure which NIST 800-53 controls to assess and optimize processing performance
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 rounded-md text-sm font-medium transition-all shadow-sm"
                title="Import scope configuration"
              >
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </button>
              <button
                onClick={handleExportScope}
                className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 rounded-md text-sm font-medium transition-all shadow-sm"
                title="Export scope configuration"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportScope}
                className="hidden"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-2">
          {/* Baseline Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1 w-1 rounded-full bg-blue-600"></div>
              <Label className="text-sm font-semibold text-slate-900 uppercase tracking-wide">NIST Baseline</Label>
            </div>
            <RadioGroup value={baseline} onValueChange={setBaseline} className="space-y-3">
              <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group">
                <RadioGroupItem value="low" id="baseline-low" className="mt-0.5" />
                <Label htmlFor="baseline-low" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 group-hover:text-blue-900">Low Baseline</div>
                      <div className="text-sm text-slate-600 mt-0.5">Development environments, low-impact systems</div>
                    </div>
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300 font-mono text-xs">139</Badge>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-blue-200 bg-blue-50/50 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group">
                <RadioGroupItem value="moderate" id="baseline-moderate" className="mt-0.5" />
                <Label htmlFor="baseline-moderate" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 group-hover:text-blue-900 flex items-center gap-2">
                        Moderate Baseline
                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Recommended</span>
                      </div>
                      <div className="text-sm text-slate-600 mt-0.5">Most federal systems, financial services</div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 font-mono text-xs">188</Badge>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group">
                <RadioGroupItem value="high" id="baseline-high" className="mt-0.5" />
                <Label htmlFor="baseline-high" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 group-hover:text-blue-900">High Baseline</div>
                      <div className="text-sm text-slate-600 mt-0.5">Critical infrastructure, national security</div>
                    </div>
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300 font-mono text-xs">238</Badge>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group">
                <RadioGroupItem value="all" id="baseline-all" className="mt-0.5" />
                <Label htmlFor="baseline-all" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 group-hover:text-blue-900">All Controls</div>
                      <div className="text-sm text-slate-600 mt-0.5">Complete catalog assessment</div>
                    </div>
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300 font-mono text-xs">1,191</Badge>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Predefined Scopes */}
          {predefinedScopes.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Quick Scopes (Optional)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {predefinedScopes.map((scope) => (
                  <button
                    key={scope.id}
                    onClick={() => handlePredefinedScope(scope.id)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      predefinedScope === scope.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium text-sm">{scope.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{scope.description}</div>
                    <Badge variant="secondary" className="mt-2">{scope.control_count} controls</Badge>
                  </button>
                ))}
              </div>
              {predefinedScope && (
                <button
                  onClick={clearFamilySelection}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Clear scope selection
                </button>
              )}
            </div>
          )}

          {/* Control Families (Manual Selection) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-blue-600"></div>
                <Label className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Control Families</Label>
              </div>
              {selectedFamilies.length > 0 && (
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  {selectedFamilies.length} selected
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-4 bg-slate-50 border border-slate-200 rounded-lg">
              {controlFamilies.map((family) => (
                <div key={family.code} className="flex items-start space-x-2.5 p-2.5 bg-white border border-slate-200 rounded-md hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                  <Checkbox
                    id={`family-${family.code}`}
                    checked={selectedFamilies.includes(family.code)}
                    onCheckedChange={() => handleFamilyToggle(family.code)}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor={`family-${family.code}`}
                    className="text-sm cursor-pointer flex-1 leading-tight"
                  >
                    <span className="font-semibold text-slate-900">{family.code}</span>
                    <span className="text-slate-600 text-xs block mt-0.5">{family.name}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Assessment Mode */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1 w-1 rounded-full bg-blue-600"></div>
              <Label className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Assessment Mode</Label>
            </div>
            <RadioGroup value={assessmentMode} onValueChange={setAssessmentMode} className="grid grid-cols-3 gap-3">
              <div className="flex flex-col space-y-2 p-4 rounded-lg border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group">
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="quick" id="mode-quick" className="mt-0.5" />
                  <Label htmlFor="mode-quick" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-amber-600" />
                      <div className="font-semibold text-slate-900 group-hover:text-blue-900">Quick</div>
                    </div>
                    <div className="text-xs text-slate-600">Batch processing</div>
                    <div className="text-xs text-slate-500 mt-1">~0.5 sec/control</div>
                  </Label>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 p-4 rounded-lg border-2 border-blue-200 bg-blue-50/50 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group">
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="smart" id="mode-smart" className="mt-0.5" />
                  <Label htmlFor="mode-smart" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <div className="font-semibold text-slate-900 group-hover:text-blue-900">Smart</div>
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">Rec</span>
                    </div>
                    <div className="text-xs text-slate-600">Selective reasoning</div>
                    <div className="text-xs text-slate-500 mt-1">~1.5 sec/control</div>
                  </Label>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 p-4 rounded-lg border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group">
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="deep" id="mode-deep" className="mt-0.5" />
                  <Label htmlFor="mode-deep" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-indigo-600" />
                      <div className="font-semibold text-slate-900 group-hover:text-blue-900">Deep</div>
                    </div>
                    <div className="text-xs text-slate-600">Full reasoning</div>
                    <div className="text-xs text-slate-500 mt-1">~5 sec/control</div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Processing Estimate */}
      {estimate && (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-md">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-semibold text-slate-900">Processing Estimate</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-blue-600" />
                  Controls
                </div>
                <div className="text-2xl font-bold text-slate-900">{estimate.control_count}</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-600" />
                  Tokens
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {estimate.estimated_tokens?.toLocaleString() ?? "0"}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-indigo-600" />
                  Time
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {estimate.estimated_minutes < 1 
                    ? "<1 min" 
                    : `${estimate.estimated_minutes} min`}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                  Est. Cost
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  ${estimate.estimated_cost_usd.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
