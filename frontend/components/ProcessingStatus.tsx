'use client'

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ProcessingStatusProps {
  sessionId: string
  onComplete: (results: any) => void
}

interface Status {
  session_id: string
  stage: string
  progress: number
  current_step: string
  message: string
  error?: string
}

export default function ProcessingStatus({ sessionId, onComplete }: ProcessingStatusProps) {
  const [status, setStatus] = useState<Status | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout

    // Set an initial status so the progress UI shows immediately
    setStatus({
      session_id: sessionId,
      stage: 'initializing',
      progress: 1,
      current_step: 'Initializing',
      message: 'Starting AI agent processing pipeline...'
    })

    const pollStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/status/${sessionId}`)
        const statusData = response.data

        setStatus(statusData)

        // Check if complete
        if (statusData.stage === 'complete') {
          clearInterval(interval)
          // Fetch results
          const resultsResponse = await axios.get(`${API_URL}/api/results/${sessionId}`)
          onComplete(resultsResponse.data)
        } else if (statusData.stage === 'error') {
          clearInterval(interval)
          setError(statusData.error || 'An error occurred during processing')
        }
      } catch (err: any) {
        console.error('Error polling status:', err)
        if (err?.response?.status === 404) {
          // Session may not be registered yet; keep waiting
          return
        }
        // Don't set error on first few polls, the session might just be starting
        if (status !== null) {
          setError('Failed to get processing status')
        }
      }
    }

    // Poll immediately
    pollStatus()

    // Then poll every 1 second for faster updates
    interval = setInterval(pollStatus, 1000)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [sessionId, onComplete])

  if (error) {
    return (
      <div className="glass-effect rounded-2xl shadow-2xl border border-white/30 p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="bg-red-100 p-6 rounded-full mb-6">
            <AlertCircle className="w-20 h-20 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
            Processing Error
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-md text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="glass-effect rounded-2xl shadow-2xl border border-white/30 p-12 text-center">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-xl animate-pulse"></div>
          <Loader2 className="relative w-16 h-16 mx-auto text-indigo-600 animate-spin" />
        </div>
        <p className="text-xl text-gray-700 font-medium">Connecting to AI agents...</p>
        <p className="text-sm text-gray-500 mt-2">Starting analysis pipeline</p>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="bg-indigo-600 h-full rounded-full animate-pulse" style={{ width: '10%' }}></div>
        </div>
      </div>
    )
  }

  const stages = [
    { id: 'uploading', label: 'Uploading Files', icon: '📤' },
    { id: 'initializing', label: 'Initializing AI Agents', icon: '🤖' },
    { id: 'scoping', label: 'Applying Scope', icon: '🎯' },
    { id: 'processing', label: 'Processing Documents', icon: '📄' },
    { id: 'analyzing', label: 'Analyzing Evidence', icon: '🔍' },
    { id: 'mapping', label: 'Mapping Controls', icon: '🗺️' },
    { id: 'generating', label: 'Generating OSCAL', icon: '📋' },
    { id: 'validating_nist', label: 'NIST Validation', icon: '✅' },
    { id: 'validating_oscal', label: 'OSCAL Validation', icon: '📝' },
    { id: 'planning', label: 'Planning Remediation', icon: '🛠️' },
    { id: 'finalizing', label: 'Finalizing Results', icon: '🎉' },
  ]

  const currentStageIndex = stages.findIndex(s => s.id === status.stage)

  return (
    <div className="glass-effect rounded-2xl shadow-2xl border border-white/30 p-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-2xl animate-glow"></div>
          <Loader2 className="relative w-20 h-20 mx-auto text-indigo-600 animate-spin" />
        </div>
        <h2 className="text-3xl font-black gradient-text mb-3">
          AI Agents Processing Your Documents
        </h2>
        <p className="text-gray-700 text-lg">{status.message}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-gray-800">Overall Progress</span>
          <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            {status.progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 h-full transition-all duration-500 ease-out rounded-full relative overflow-hidden"
            style={{ width: `${status.progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Stage Indicators */}
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const isActive = index === currentStageIndex
          const isComplete = index < currentStageIndex
          const isPending = index > currentStageIndex

          return (
            <div
              key={stage.id}
              className={`
                flex items-center p-5 rounded-xl border-2 transition-all duration-500 transform
                ${isActive ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 scale-105 shadow-lg' : ''}
                ${isComplete ? 'border-green-500 bg-green-50' : ''}
                ${isPending ? 'border-gray-200 bg-gray-50 opacity-60' : ''}
              `}
            >
              <div className="text-4xl mr-5">{stage.icon}</div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-lg">{stage.label}</p>
                {isActive && (
                  <p className="text-sm text-gray-700 mt-1 font-medium">{status.current_step}</p>
                )}
              </div>
              {isComplete && (
                <CheckCircle className="w-8 h-8 text-green-600" />
              )}
              {isActive && (
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              )}
            </div>
          )
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-10 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
        <p className="text-sm text-indigo-900 text-center font-medium leading-relaxed">
          <strong className="text-indigo-700">Multi-Agent System Active:</strong> Four specialized AI agents are analyzing your evidence, 
          mapping controls to NIST 800-53, generating OSCAL artifacts, and creating actionable remediation plans.
        </p>
      </div>
    </div>
  )
}
