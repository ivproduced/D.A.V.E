'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, Loader2, AlertCircle } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface AssessmentScope {
  baseline: string
  control_families: string[]
  mode: string
  predefined_scope?: string
}

interface FileUploadProps {
  onUploadComplete: (sessionId: string) => void
  assessmentScope?: AssessmentScope | null
}

export default function FileUpload({ onUploadComplete, assessmentScope }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles])
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/json': ['.json'],
      'text/yaml': ['.yaml', '.yml'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    maxSize: 50 * 1024 * 1024 // 50MB
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file')
      return
    }

    setUploading(true)
    setError(null)

    // Artificial delay for e2e test reliability (500ms)
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      // Add assessment scope if provided
      if (assessmentScope) {
        formData.append('scope_json', JSON.stringify(assessmentScope))
      }

      const response = await axios.post(`${API_URL}/api/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      onUploadComplete(response.data.session_id)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.')
      setUploading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-3 border-dashed rounded-3xl p-20 text-center cursor-pointer
          transition-all duration-300 transform hover:scale-[1.02]
          backdrop-blur-xl shadow-2xl
          ${isDragActive 
            ? 'border-purple-400 bg-purple-500/20 scale-105 shadow-purple-500/50' 
            : 'border-purple-400/50 hover:border-purple-400 bg-white/5 hover:bg-white/10 hover:shadow-purple-500/30'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full blur-2xl opacity-60 animate-pulse"></div>
          <Upload className="relative w-24 h-24 mx-auto text-purple-300" />
        </div>
        <p className="text-3xl font-bold text-white mb-4">
          {isDragActive ? 'Drop your files here!' : 'Drag & Drop Files Here'}
        </p>
        <p className="text-lg text-purple-200 mb-6">
          or click to browse from your computer
        </p>
        <div className="inline-flex items-center space-x-2 px-8 py-3 bg-purple-500/30 backdrop-blur-sm rounded-full border border-purple-400/40">
          <span className="text-sm font-bold text-white">
            PDF • DOCX • PNG • JPG • JSON • YAML
          </span>
        </div>
        <p className="mt-6 text-sm text-purple-300 font-medium">Maximum 50MB per file</p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center">
            <span className="bg-blue-600 text-white w-6 h-6 rounded flex items-center justify-center mr-3 text-xs font-bold">
              {files.length}
            </span>
            Selected Files
          </h3>
          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-all"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="bg-blue-600/10 p-2 rounded border border-blue-600/20">
                    <File className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  className="p-1.5 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50 group"
                >
                  <X className="w-4 h-4 text-slate-400 group-hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 shadow-lg">
          <div className="flex items-start">
            <div className="bg-red-100 p-2 rounded-lg mr-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm font-medium text-red-900 flex-1">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={files.length === 0 || uploading}
        className="
          w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600
          text-white font-bold text-lg py-5 px-8 rounded-2xl
          hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-300 transform hover:scale-105 hover:shadow-2xl
          flex items-center justify-center space-x-3
          relative overflow-hidden group
        "
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        {uploading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin relative z-10" />
            <span className="relative z-10">Uploading & Processing...</span>
          </>
        ) : (
          <>
            <Upload className="w-6 h-6 relative z-10" />
            <span className="relative z-10">Analyze {files.length} Document{files.length !== 1 ? 's' : ''}</span>
          </>
        )}
      </button>
    </div>
  )
}
