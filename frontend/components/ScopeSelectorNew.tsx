"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Shield, Zap, Brain, Clock, DollarSign, Download, Upload, Layers, Target, CheckCircle2, ChevronRight, ChevronDown, Filter } from "lucide-react"

interface Control {
  id: string
  title: string
  family_code: string
}

interface ControlFamily {
  code: string
  name: string
  control_count: number
  controls?: Control[]
}

interface PredefinedScope {
  id: string
  name: string
  description: string
  families: string[]
  control_count?: number
  icon?: string
  baseline?: string
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
  specific_controls?: string[]
  mode: string
  predefined_scope?: string
}

interface ScopeSelectorProps {
  onScopeChange: (scope: AssessmentScope, estimate: ProcessingEstimate | null) => void
  apiBaseUrl?: string
}

export default function ScopeSelector({ onScopeChange, apiBaseUrl = "http://localhost:8000" }: ScopeSelectorProps) {
  const [workflowMode, setWorkflowMode] = useState<'custom' | 'template'>('custom')
  const [baseline, setBaseline] = useState<string>("all") // Custom mode starts with full catalog
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([])
  const [selectedControls, setSelectedControls] = useState<string[]>([])
  const [expandedFamilies, setExpandedFamilies] = useState<string[]>([])
  const [assessmentMode, setAssessmentMode] = useState<string>("smart")
  const [predefinedScope, setPredefinedScope] = useState<string | undefined>(undefined)
  
  const [controlFamilies, setControlFamilies] = useState<ControlFamily[]>([])
  const [predefinedScopes, setPredefinedScopes] = useState<Record<string, PredefinedScope>>({})
  const [estimate, setEstimate] = useState<ProcessingEstimate | null>(null)
  const [isLoading, setIsLoading] = useState(false) // TEMP: Changed to false to test client-side rendering
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load control families and predefined scopes on mount
  useEffect(() => {
    const loadData = async () => {
      console.log("=" .repeat(60))
      console.log("[ScopeSelector] 🚀 STARTING DATA LOAD")
      console.log("[ScopeSelector] API Base URL:", apiBaseUrl)
      console.log("=" .repeat(60))
      
      try {
        const familiesUrl = `${apiBaseUrl}/api/control-families`
        const scopesUrl = `${apiBaseUrl}/api/predefined-scopes`
        
        console.log("[ScopeSelector] 📡 Fetching from:")
        console.log("  - Families:", familiesUrl)
        console.log("  - Scopes:", scopesUrl)
        
        const [familiesRes, scopesRes] = await Promise.all([
          fetch(familiesUrl),
          fetch(scopesUrl)
        ])
        
        console.log("[ScopeSelector] ✅ Families response:", familiesRes.status, familiesRes.ok)
        console.log("[ScopeSelector] ✅ Scopes response:", scopesRes.status, scopesRes.ok)
        
        if (!familiesRes.ok) {
          throw new Error(`Families API returned ${familiesRes.status}: ${familiesRes.statusText}`)
        }
        if (!scopesRes.ok) {
          throw new Error(`Scopes API returned ${scopesRes.status}: ${scopesRes.statusText}`)
        }
        
        const familiesData = await familiesRes.json()
        const scopesData = await scopesRes.json()
        
        console.log("[ScopeSelector] 📊 Found", familiesData.families?.length || 0, "families")
        console.log("[ScopeSelector] 📋 Families:", familiesData.families?.map((f: any) => f.code).join(", "))
        
        // Just set families without loading controls - will load lazily
        const familiesWithoutControls = (familiesData.families || []).map((family: ControlFamily) => ({
          ...family,
          controls: []
        }))
        
        console.log("[ScopeSelector] 🎯 Initialized", familiesWithoutControls.length, "families (controls will load lazily)")
        setControlFamilies(familiesWithoutControls)
        setPredefinedScopes(scopesData.scopes || {})
        setIsLoading(false)
        console.log("[ScopeSelector] ✨ DATA LOAD COMPLETE!")
        console.log("=" .repeat(60))
      } catch (error) {
        console.error("=" .repeat(60))
        console.error("[ScopeSelector] ❌ ERROR LOADING SCOPE DATA")
        console.error("[ScopeSelector] Error details:", error)
        console.error("[ScopeSelector] Error message:", (error as Error).message)
        console.error("[ScopeSelector] Stack:", (error as Error).stack)
        console.error("=" .repeat(60))
        setIsLoading(false)
      }
    }
    
    console.log("[ScopeSelector] 🔄 useEffect triggered, calling loadData()")
    loadData()
  }, [apiBaseUrl])

  // Load controls when family is expanded
  useEffect(() => {
    const loadControlsForExpanded = async () => {
      for (const familyCode of expandedFamilies) {
        const family = controlFamilies.find(f => f.code === familyCode)
        if (family && (!family.controls || family.controls.length === 0)) {
          try {
            const controlsRes = await fetch(`${apiBaseUrl}/api/controls?family=${familyCode}`)
            if (controlsRes.ok) {
              const controlsData = await controlsRes.json()
              setControlFamilies(prev => prev.map(f => 
                f.code === familyCode ? { ...f, controls: controlsData.controls || [] } : f
              ))
            }
          } catch (err) {
            console.error(`Error loading controls for ${familyCode}:`, err)
          }
        }
      }
    }
    
    loadControlsForExpanded()
  }, [expandedFamilies, apiBaseUrl])

  // Update estimate whenever scope changes
  useEffect(() => {
    const getEstimate = async () => {
      if (selectedFamilies.length === 0 && !predefinedScope) {
        setEstimate(null)
        return
      }

      try {
        const requestBody = {
          baseline,
          control_families: selectedFamilies,
          ...(selectedControls.length > 0 && { specific_controls: selectedControls }),
          mode: assessmentMode,
          ...(predefinedScope && { predefined_scope: predefinedScope })
        }

        const response = await fetch(`${apiBaseUrl}/api/estimate-scope`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })
        
        if (response.ok) {
          const data = await response.json()
          setEstimate(data)
        }
      } catch (error) {
        console.error("Error getting estimate:", error)
      }
    }

    getEstimate()
  }, [baseline, selectedFamilies, selectedControls, assessmentMode, predefinedScope, apiBaseUrl])

  // Notify parent of scope changes
  useEffect(() => {
    const scope: AssessmentScope = {
      baseline,
      control_families: selectedFamilies,
      ...(selectedControls.length > 0 && { specific_controls: selectedControls }),
      mode: assessmentMode,
      ...(predefinedScope && { predefined_scope: predefinedScope })
    }
    onScopeChange(scope, estimate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseline, selectedFamilies, selectedControls, assessmentMode, predefinedScope, estimate])

  const toggleFamilyExpand = (familyCode: string) => {
    setExpandedFamilies(prev =>
      prev.includes(familyCode)
        ? prev.filter(code => code !== familyCode)
        : [...prev, familyCode]
    )
  }

  const handleFamilyToggle = (familyCode: string) => {
    const family = controlFamilies.find(f => f.code === familyCode)
    if (!family) return

    const familyControlIds = family.controls?.map(c => c.id) || []
    const allSelected = familyControlIds.every(id => selectedControls.includes(id))

    if (allSelected) {
      // Deselect all controls in this family
      setSelectedControls(prev => prev.filter(id => !familyControlIds.includes(id)))
      setSelectedFamilies(prev => prev.filter(code => code !== familyCode))
    } else {
      // Select all controls in this family
      setSelectedControls(prev => {
        const newControls = familyControlIds.filter(id => !prev.includes(id))
        return [...prev, ...newControls]
      })
      if (!selectedFamilies.includes(familyCode)) {
        setSelectedFamilies(prev => [...prev, familyCode])
      }
    }
    setPredefinedScope(undefined)
  }

  const handleControlToggle = (controlId: string, familyCode: string) => {
    const isSelected = selectedControls.includes(controlId)
    
    if (isSelected) {
      // Remove the control
      const newSelectedControls = selectedControls.filter(id => id !== controlId)
      setSelectedControls(newSelectedControls)
      
      // Check if any controls from this family are still selected (using updated list)
      const family = controlFamilies.find(f => f.code === familyCode)
      const remainingControls = newSelectedControls.filter(id => 
        family?.controls?.some(c => c.id === id)
      )
      
      if (remainingControls.length === 0) {
        setSelectedFamilies(prev => prev.filter(code => code !== familyCode))
      }
    } else {
      setSelectedControls(prev => [...prev, controlId])
      if (!selectedFamilies.includes(familyCode)) {
        setSelectedFamilies(prev => [...prev, familyCode])
      }
    }
    setPredefinedScope(undefined)
  }

  const getSelectedControlCount = (familyCode: string) => {
    const family = controlFamilies.find(f => f.code === familyCode)
    if (!family?.controls) return 0
    return family.controls.filter(c => selectedControls.includes(c.id)).length
  }

  const handleSelectAll = () => {
    const allControlIds = controlFamilies.flatMap(f => f.controls?.map(c => c.id) || [])
    
    if (selectedControls.length === allControlIds.length) {
      // Clear all selections
      setSelectedControls([])
      setSelectedFamilies([])
    } else {
      // Warn before selecting all controls
      if (allControlIds.length > 500) {
        const confirmed = window.confirm(
          `You are about to select all ${allControlIds.length.toLocaleString()} controls from the catalog.\n\n` +
          `This will result in a very large assessment that may take hours to process.\n\n` +
          `Are you sure you want to continue?`
        )
        if (!confirmed) return
      }
      setSelectedControls(allControlIds)
      setSelectedFamilies(controlFamilies.map(f => f.code))
    }
    setPredefinedScope(undefined)
  }

  const handlePredefinedScopeClick = (scopeId: string) => {
    if (predefinedScope === scopeId) {
      // Deselect if already selected
      setPredefinedScope(undefined)
      setSelectedFamilies([])
      setSelectedControls([])
    } else {
      const scope = predefinedScopes[scopeId]
      if (scope) {
        setPredefinedScope(scopeId)
        setSelectedFamilies(scope.families)
        // Only set baseline if scope defines one AND we're in template mode
        // In custom mode, keep baseline as "all" to show full catalog
        if (scope.baseline && workflowMode === 'template') {
          setBaseline(scope.baseline)
        }
        // Clear individual control selection when using predefined scope
        setSelectedControls([])
      }
    }
  }

  const handleExportScope = () => {
    const exportData = {
      baseline,
      control_families: selectedFamilies,
      mode: assessmentMode,
      ...(predefinedScope && { predefined_scope: predefinedScope }),
      exported_at: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scope-${baseline}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportScope = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        if (imported.baseline) setBaseline(imported.baseline)
        if (imported.control_families) setSelectedFamilies(imported.control_families)
        if (imported.mode) setAssessmentMode(imported.mode)
        if (imported.predefined_scope) setPredefinedScope(imported.predefined_scope)
      } catch (error) {
        console.error('Error importing scope:', error)
      }
    }
    reader.readAsText(file)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-slate-900/60 border-slate-800/60">
        <CardHeader>
          <CardTitle className="text-white">Loading Assessment Scope...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Workflow Mode Selector */}
      <div className="flex items-center justify-center gap-4 p-6 bg-gradient-to-r from-slate-900/80 to-blue-950/40 rounded-2xl border border-slate-800/60">
        <button
          onClick={() => {
            setWorkflowMode('custom')
            setBaseline('all') // Custom mode uses full catalog
          }}
          className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 ${
            workflowMode === 'custom'
              ? 'border-cyan-500 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 shadow-xl ring-4 ring-cyan-500/20'
              : 'border-slate-700/60 bg-slate-800/40 hover:border-slate-600'
          }`}
        >
          <Target className={`h-8 w-8 ${workflowMode === 'custom' ? 'text-cyan-400' : 'text-slate-500'}`} />
          <div className="text-center">
            <h3 className={`text-lg font-bold mb-1 ${workflowMode === 'custom' ? 'text-white' : 'text-slate-300'}`}>
              Build Custom Baseline
            </h3>
            <p className="text-sm text-slate-400">Select specific control families for your needs</p>
          </div>
          {workflowMode === 'custom' && (
            <Badge className="text-xs font-bold text-cyan-600 bg-cyan-100 px-3 py-1 border-0">Active</Badge>
          )}
        </button>
        
        <button
          onClick={() => {
            setWorkflowMode('template')
            setBaseline('moderate') // Template mode uses selected baseline
          }}
          className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 ${
            workflowMode === 'template'
              ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 shadow-xl ring-4 ring-blue-500/20'
              : 'border-slate-700/60 bg-slate-800/40 hover:border-slate-600'
          }`}
        >
          <Layers className={`h-8 w-8 ${workflowMode === 'template' ? 'text-blue-400' : 'text-slate-500'}`} />
          <div className="text-center">
            <h3 className={`text-lg font-bold mb-1 ${workflowMode === 'template' ? 'text-white' : 'text-slate-300'}`}>
              Use NIST Template
            </h3>
            <p className="text-sm text-slate-400">Start with predefined baseline (Low/Moderate/High)</p>
          </div>
          {workflowMode === 'template' && (
            <Badge className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 border-0">Active</Badge>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Control Families - Primary Selection (Custom Mode) */}
          {workflowMode === 'custom' && (
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-900/70 border-slate-700/60 shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-cyan-950/60 to-blue-950/50 border-b border-slate-800/50 pb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg blur opacity-60 group-hover:opacity-80 transition"></div>
                      <div className="relative p-3 bg-gradient-to-br from-cyan-600/30 to-blue-600/30 rounded-lg border border-cyan-500/30">
                        <Target className="h-6 w-6 text-cyan-400" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white font-bold">Build Your Custom Baseline</CardTitle>
                      <CardDescription className="text-slate-400">Select specific controls or entire families for your assessment</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedControls.length > 0 ? (
                      <Badge variant="outline" className="bg-cyan-500/10 text-cyan-300 border-cyan-500/40 font-mono text-sm px-3 py-1">
                        {selectedControls.length} specific controls
                      </Badge>
                    ) : selectedFamilies.length > 0 ? (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/40 font-mono text-sm px-3 py-1">
                        {selectedFamilies.length} families selected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-500/10 text-slate-400 border-slate-500/40 text-sm px-3 py-1">
                        No controls selected
                      </Badge>
                    )}
                    <button
                      onClick={handleSelectAll}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-all border border-slate-700"
                    >
                      {selectedControls.length > 0 ? 'Clear All' : 'Select All'}
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 pb-6 px-6">
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {controlFamilies.map((family) => {
                    const isExpanded = expandedFamilies.includes(family.code)
                    const selectedCount = getSelectedControlCount(family.code)
                    const totalCount = family.controls?.length || 0
                    const allSelected = selectedCount === totalCount && totalCount > 0
                    
                    return (
                      <div
                        key={family.code}
                        className="bg-slate-800/40 border-2 border-slate-700/60 rounded-lg overflow-hidden transition-all hover:border-slate-600"
                      >
                        {/* Family Header */}
                        <div className="flex items-center gap-3 p-4">
                          <button
                            onClick={() => toggleFamilyExpand(family.code)}
                            className="text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </button>
                          
                          <Checkbox
                            id={`family-${family.code}`}
                            checked={allSelected}
                            onCheckedChange={() => handleFamilyToggle(family.code)}
                            className="border-2"
                          />
                          
                          <Label
                            htmlFor={`family-${family.code}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-bold text-base text-white">
                                  {family.code}
                                </span>
                                <p className="text-sm text-slate-400 mt-0.5">{family.name}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {selectedCount > 0 && (
                                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-mono text-xs px-2.5 py-1">
                                    {selectedCount} / {totalCount}
                                  </Badge>
                                )}
                                {selectedCount === 0 && (
                                  <Badge variant="outline" className="bg-slate-900/60 text-slate-400 border-slate-600/40 font-mono text-xs">
                                    {totalCount} controls
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </Label>
                        </div>
                        
                        {/* Expanded Controls List */}
                        {isExpanded && family.controls && family.controls.length > 0 && (
                          <div className="border-t border-slate-700/50 bg-slate-900/40 px-4 py-3">
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                              {family.controls.map((control) => {
                                const isSelected = selectedControls.includes(control.id)
                                
                                return (
                                  <div
                                    key={control.id}
                                    className={`flex items-start gap-3 p-3 rounded-md transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-cyan-500/10 border border-cyan-500/30'
                                        : 'bg-slate-800/60 border border-slate-700/30 hover:bg-slate-800/80 hover:border-slate-600/50'
                                    }`}
                                    onClick={() => handleControlToggle(control.id, family.code)}
                                  >
                                    <Checkbox
                                      id={`control-${control.id}`}
                                      checked={isSelected}
                                      onCheckedChange={() => handleControlToggle(control.id, family.code)}
                                      className="mt-0.5"
                                    />
                                    <Label
                                      htmlFor={`control-${control.id}`}
                                      className="flex-1 cursor-pointer"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div>
                                          <span className={`font-semibold text-sm ${
                                            isSelected ? 'text-cyan-300' : 'text-slate-300'
                                          }`}>
                                            {control.id}
                                          </span>
                                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                            {control.title}
                                          </p>
                                        </div>
                                      </div>
                                    </Label>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Baseline Templates (Template Mode) */}
          {workflowMode === 'template' && (
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-900/70 border-slate-700/60 shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-900/80 to-blue-950/40 border-b border-slate-800/50 pb-5">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-60 group-hover:opacity-80 transition"></div>
                <div className="relative p-3 bg-gradient-to-br from-blue-600/30 to-cyan-600/30 rounded-lg border border-blue-500/30">
                  <Shield className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
              <div>
                <CardTitle className="text-xl text-white font-bold">NIST Baseline Templates</CardTitle>
                <CardDescription className="text-slate-400">Quick-start with predefined NIST 800-53 Rev 5 baselines</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-8 px-8">
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'low', label: 'Low Impact', controls: 139, desc: 'Basic security requirements', gradient: 'from-emerald-500/20 to-green-500/20', border: 'emerald-500', icon: CheckCircle2 },
                { value: 'moderate', label: 'Moderate Impact', controls: 188, desc: 'Standard enterprise security', gradient: 'from-blue-500/20 to-cyan-500/20', border: 'blue-500', icon: Shield, recommended: true },
                { value: 'high', label: 'High Impact', controls: 238, desc: 'Stringent security controls', gradient: 'from-amber-500/20 to-orange-500/20', border: 'amber-500', icon: Target },
                { value: 'all', label: 'Complete Catalog', controls: 1191, desc: 'Full NIST 800-53 Rev 5', gradient: 'from-purple-500/20 to-pink-500/20', border: 'purple-500', icon: Layers }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setBaseline(option.value)}
                  className={`relative group p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                    baseline === option.value
                      ? `border-${option.border} bg-gradient-to-br ${option.gradient} shadow-xl ring-4 ring-${option.border}/20`
                      : 'border-slate-700/60 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <option.icon className={`h-5 w-5 ${baseline === option.value ? 'text-white' : 'text-slate-500'}`} />
                    {option.recommended && (
                      <Badge className="text-xs font-bold text-blue-600 bg-blue-100 px-2.5 py-1 border-0 shadow-sm">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <h4 className={`font-bold text-base mb-1.5 ${baseline === option.value ? 'text-white' : 'text-slate-300'}`}>
                    {option.label}
                  </h4>
                  <p className="text-sm text-slate-500 mb-4 leading-relaxed">{option.desc}</p>
                  <Badge variant="outline" className={`font-mono text-xs ${
                    baseline === option.value 
                      ? 'bg-white/10 text-white border-white/20' 
                      : 'bg-slate-900/60 text-slate-400 border-slate-600/40'
                  }`}>
                    {option.controls.toLocaleString()} controls
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
          )}

        {/* Predefined Assessment Scopes (Custom Mode Only) */}
        {workflowMode === 'custom' && Object.keys(predefinedScopes).length > 0 && (
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-900/70 border-slate-700/60 shadow-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-900/80 to-purple-950/40 border-b border-slate-800/50 pb-5">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-60 group-hover:opacity-80 transition"></div>
                  <div className="relative p-3 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-lg border border-purple-500/30">
                    <Filter className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-xl text-white font-bold">Quick Assessment Scopes</CardTitle>
                  <CardDescription className="text-slate-400">Pre-configured control family combinations for common scenarios</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 pb-8 px-8">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(predefinedScopes).map(([scopeId, scope]) => (
                  <button
                    key={scopeId}
                    onClick={() => handlePredefinedScopeClick(scopeId)}
                    className={`relative group p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                      predefinedScope === scopeId
                        ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-xl ring-4 ring-purple-500/20'
                        : 'border-slate-700/60 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{scope.icon}</span>
                      {predefinedScope === scopeId && (
                        <CheckCircle2 className="h-5 w-5 text-purple-400" />
                      )}
                    </div>
                    <h4 className={`font-bold text-base mb-2 ${predefinedScope === scopeId ? 'text-white' : 'text-slate-300'}`}>
                      {scope.name}
                    </h4>
                    <p className="text-sm text-slate-500 mb-4 leading-relaxed">{scope.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      {scope.families.map((familyCode) => (
                        <Badge 
                          key={familyCode}
                          variant="outline" 
                          className={`font-mono text-xs ${
                            predefinedScope === scopeId 
                              ? 'bg-white/10 text-white border-white/20' 
                              : 'bg-slate-900/60 text-slate-400 border-slate-600/40'
                          }`}
                        >
                          {familyCode}
                        </Badge>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              {predefinedScope && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setPredefinedScope(undefined)
                      setSelectedFamilies([])
                      setSelectedControls([])
                    }}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Clear scope selection
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Assessment Mode */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-900/70 border-slate-700/60 shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-900/80 to-indigo-950/40 border-b border-slate-800/50 pb-5">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-60 group-hover:opacity-80 transition"></div>
                <div className="relative p-3 bg-gradient-to-br from-indigo-600/30 to-purple-600/30 rounded-lg border border-indigo-500/30">
                  <Brain className="h-6 w-6 text-indigo-400" />
                </div>
              </div>
              <div>
                <CardTitle className="text-xl text-white font-bold">AI Analysis Mode</CardTitle>
                <CardDescription className="text-slate-400">Balance between speed and analysis depth</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-8 px-8">
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'quick', label: 'Quick Scan', desc: 'Fast validation', time: '~5 min', icon: Zap, gradient: 'from-amber-500/20 to-yellow-500/20', border: 'amber-500' },
                { value: 'smart', label: 'Smart Analysis', desc: 'Balanced review', time: '~15 min', icon: Brain, gradient: 'from-blue-500/20 to-cyan-500/20', border: 'blue-500', recommended: true },
                { value: 'deep', label: 'Deep Dive', desc: 'Thorough audit', time: '~30 min', icon: Target, gradient: 'from-indigo-500/20 to-purple-500/20', border: 'indigo-500' }
              ].map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setAssessmentMode(mode.value)}
                  className={`relative p-5 rounded-xl border-2 transition-all duration-200 ${
                    assessmentMode === mode.value
                      ? `border-${mode.border} bg-gradient-to-br ${mode.gradient} shadow-xl ring-4 ring-${mode.border}/20`
                      : 'border-slate-700/60 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <mode.icon className={`h-7 w-7 mb-3 ${assessmentMode === mode.value ? 'text-white' : 'text-slate-500'}`} />
                    <h4 className={`font-bold text-sm mb-1 ${assessmentMode === mode.value ? 'text-white' : 'text-slate-300'}`}>
                      {mode.label}
                    </h4>
                    {mode.recommended && (
                      <Badge className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 mb-2 border-0">Rec</Badge>
                    )}
                    <p className="text-xs text-slate-500 mb-2">{mode.desc}</p>
                    <Badge variant="outline" className={`text-xs font-mono ${
                      assessmentMode === mode.value 
                        ? 'bg-white/10 text-white border-white/20' 
                        : 'bg-slate-900/60 text-slate-400 border-slate-600/40'
                    }`}>
                      {mode.time}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Summary & Actions */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-900/70 border-slate-700/60 shadow-2xl">
          <CardHeader className="pb-4 border-b border-slate-800/50">
            <CardTitle className="text-lg text-white font-bold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 pb-5 space-y-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all shadow-lg"
            >
              <Upload className="h-4 w-4" />
              Import Configuration
            </button>
            <button
              onClick={handleExportScope}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-all border border-slate-700"
            >
              <Download className="h-4 w-4" />
              Export Configuration
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportScope}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Processing Estimate */}
        {estimate && (
          <Card className="bg-gradient-to-br from-blue-950/50 to-indigo-950/40 border-blue-900/60 shadow-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-950/60 to-indigo-950/50 border-b border-blue-900/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <CardTitle className="text-lg text-white font-bold">Processing Estimate</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-6 space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900/60 to-slate-900/40 border border-slate-700/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Controls</span>
                  <Shield className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-white">{estimate.control_count}</div>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900/60 to-slate-900/40 border border-slate-700/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Tokens</span>
                  <Zap className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-3xl font-bold text-white">{estimate.estimated_tokens?.toLocaleString() ?? "0"}</div>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900/60 to-slate-900/40 border border-slate-700/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Time</span>
                  <Clock className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {estimate.estimated_minutes < 1 ? "<1" : estimate.estimated_minutes} min
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-green-950/30 border border-emerald-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">Est. Cost</span>
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-emerald-400">
                  ${estimate.estimated_cost_usd.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </div>
  )
}
