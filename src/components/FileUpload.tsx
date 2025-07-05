'use client'

import { useState } from 'react'
import { Upload, FileText, Table, Download, Copy } from 'lucide-react'

interface FileUploadProps {
  onDataExtracted: (data: any[]) => void
  tableType: 'payment' | 'courses'
  title: string
}

export default function FileUpload({ onDataExtracted, tableType, title }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [showPasteArea, setShowPasteArea] = useState(false)

  // Handle CSV file upload
  const handleCSVFile = (file: File) => {
    setProcessing(true)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const data = parseCSVData(text, tableType)
        onDataExtracted(data)
        alert(`Successfully imported ${data.length} ${tableType} items!`)
      } catch (error) {
        console.error('CSV parsing error:', error)
        alert('Error parsing CSV file. Please check the format.')
      } finally {
        setProcessing(false)
      }
    }
    
    reader.readAsText(file)
  }

  // Handle Excel file upload (placeholder - requires xlsx library)
  const handleExcelFile = (file: File) => {
    alert('Excel support coming soon! Please use CSV format or copy-paste data for now.')
    setProcessing(false)
  }

  // Handle file drop/selection
  const handleFile = (file: File) => {
    const extension = file.name.toLowerCase().split('.').pop()
    
    if (extension === 'csv') {
      handleCSVFile(file)
    } else if (extension === 'xlsx' || extension === 'xls') {
      alert('Excel files not yet supported. Please save as CSV or use copy-paste.')
    } else {
      alert('Please upload a CSV file (.csv) or use copy-paste')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files[0]) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  // Handle paste text processing
  const handlePasteProcess = () => {
    if (!pasteText.trim()) {
      alert('Please paste some data first.')
      return
    }

    setProcessing(true)
    try {
      const data = parseTabularText(pasteText, tableType)
      if (data.length > 0) {
        onDataExtracted(data)
        setPasteText('')
        setShowPasteArea(false)
        alert(`Successfully imported ${data.length} ${tableType} items!`)
      } else {
        alert('No valid data found. Please check the format.')
      }
    } catch (error) {
      console.error('Text parsing error:', error)
      alert('Error parsing pasted data. Please check the format.')
    } finally {
      setProcessing(false)
    }
  }

  // Download template
  const downloadTemplate = () => {
    let csvContent = ''
    
    if (tableType === 'payment') {
      csvContent = 'Payment Name,Amount,Type\n'
      csvContent += 'Admission Fee,15000,registration\n'
      csvContent += 'Tuition Fee,45000,tuition\n'
      csvContent += 'Lab Fee,5000,lab\n'
      csvContent += 'Semester Fee,2000,other\n'
    } else {
      csvContent = 'Course Code,Course Title,Credits,Type\n'
      csvContent += 'CSE110,Computer Programming,3,Core Theory\n'
      csvContent += 'CSE111,Programming Lab,1,Core Lab\n'
      csvContent += 'MAT110,Mathematics I,3,Core Theory\n'
      csvContent += 'ENG101,English Composition,3,General Course\n'
    }

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tableType}_template.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Copy sample format to clipboard
  const copySampleFormat = () => {
    let sampleText = ''
    
    if (tableType === 'payment') {
      sampleText = `Admission Fee	15000
Tuition Fee	45000
Lab Fee	5000
Semester Fee	2000`
    } else {
      sampleText = `CSE110	Computer Programming	3
CSE111	Programming Lab	1
MAT110	Mathematics I	3
ENG101	English Composition	3`
    }

    navigator.clipboard.writeText(sampleText).then(() => {
      alert('Sample format copied to clipboard! You can paste this as a starting point.')
    })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      
      {/* Method Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Method 1: File Upload */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            📁 Upload File (Recommended)
          </h4>
          
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-blue-400 bg-blue-100' : 'border-blue-300 hover:border-blue-400'
            } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={processing}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-blue-800 font-medium">
                {processing ? 'Processing...' : 'Drop CSV file or click to browse'}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Supports .csv files
              </p>
            </label>
          </div>

          <div className="mt-3 space-y-2">
            <button
              onClick={downloadTemplate}
              className="w-full text-xs bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Download className="w-3 h-3 mr-1" />
              Download Template
            </button>
          </div>
        </div>

        {/* Method 2: Copy-Paste */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <h4 className="font-semibold text-green-800 mb-3 flex items-center">
            <Table className="w-5 h-5 mr-2" />
            📋 Copy & Paste
          </h4>
          
          <button
            onClick={() => setShowPasteArea(!showPasteArea)}
            className="w-full bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 transition-colors text-sm"
          >
            {showPasteArea ? 'Hide Paste Area' : 'Show Paste Area'}
          </button>

          <div className="mt-3">
            <button
              onClick={copySampleFormat}
              className="w-full text-xs bg-green-200 text-green-800 px-3 py-2 rounded hover:bg-green-300 transition-colors flex items-center justify-center"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy Sample Format
            </button>
          </div>

          <p className="text-xs text-green-700 mt-2">
            Copy table data from Excel, Google Sheets, or any spreadsheet
          </p>
        </div>

        {/* Method 3: Quick Sample */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
          <h4 className="font-semibold text-purple-800 mb-3">
            🚀 Quick Test
          </h4>
          
          <button
            onClick={() => {
              const sampleData = getSampleData(tableType)
              onDataExtracted(sampleData)
              alert(`Loaded ${sampleData.length} sample ${tableType} items!`)
            }}
            className="w-full bg-purple-600 text-white px-4 py-3 rounded hover:bg-purple-700 transition-colors text-sm"
          >
            Load Sample Data
          </button>

          <p className="text-xs text-purple-700 mt-2">
            Use realistic sample data for testing
          </p>
        </div>
      </div>

      {/* Paste Area */}
      {showPasteArea && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h5 className="font-medium text-green-800 mb-2">Paste Your Data:</h5>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={tableType === 'payment' 
              ? "Paste payment data like:\nAdmission Fee    15000\nTuition Fee    45000\nLab Fee    5000"
              : "Paste course data like:\nCSE110    Computer Programming    3\nCSE111    Programming Lab    1"
            }
            className="w-full h-32 p-3 border border-green-300 rounded font-mono text-sm"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handlePasteProcess}
              disabled={processing || !pasteText.trim()}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {processing ? 'Processing...' : 'Process Pasted Data'}
            </button>
            <button
              onClick={() => setPasteText('')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h5 className="font-medium text-gray-800 mb-2">💡 Tips:</h5>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>File Upload:</strong> Most reliable - export your data from Excel/Google Sheets as CSV</li>
          <li>• <strong>Copy-Paste:</strong> Select table data and paste directly from spreadsheets</li>
          <li>• <strong>Quick Test:</strong> Use sample data to try the calculator immediately</li>
        </ul>
      </div>
    </div>
  )
}

// Helper functions
function parseCSVData(csvText: string, tableType: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim())
  const data = []
  
  // Skip header row if it exists
  const startIndex = lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('code') ? 1 : 0
  
  for (let i = startIndex; i < lines.length; i++) {
    const row = lines[i].split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
    
    if (tableType === 'payment' && row.length >= 2) {
      data.push({
        name: row[0],
        amount: parseInt(row[1]) || 0,
        type: row[2] || 'other'
      })
    } else if (tableType === 'courses' && row.length >= 3) {
      data.push({
        code: row[0],
        title: row[1],
        credits: parseInt(row[2]) || 3,
        type: row[3] || 'Core Theory',
        waiverPercentage: 0
      })
    }
  }
  
  return data
}

function parseTabularText(text: string, tableType: string): any[] {
  const data = []
  const lines = text.split('\n').filter(line => line.trim())
  
  for (const line of lines) {
    // Try different delimiters: tab, multiple spaces, comma
    let parts = line.split('\t')
    if (parts.length < 2) parts = line.split(/\s{2,}/)
    if (parts.length < 2) parts = line.split(',')
    
    parts = parts.map(p => p.trim())
    
    if (tableType === 'payment' && parts.length >= 2) {
      data.push({
        name: parts[0],
        amount: parseInt(parts[1]) || 0,
        type: parts[2] || 'other'
      })
    } else if (tableType === 'courses' && parts.length >= 3) {
      data.push({
        code: parts[0],
        title: parts[1],
        credits: parseInt(parts[2]) || 3,
        type: parts[3] || 'Core Theory',
        waiverPercentage: 0
      })
    }
  }
  
  return data
}

function getSampleData(tableType: string): any[] {
  if (tableType === 'payment') {
    return [
      { name: 'Admission Fee', amount: 15000, type: 'registration' },
      { name: 'Campus Development Fee', amount: 4500, type: 'other' },
      { name: 'Extra Curriculam Fee', amount: 1500, type: 'other' },
      { name: 'Lab Fee', amount: 2000, type: 'lab' },
      { name: 'Library Fee', amount: 3000, type: 'other' },
      { name: 'Semester Fee', amount: 5500, type: 'other' },
      { name: 'Tuition Fee', amount: 4900, type: 'tuition' }
    ]
  } else {
    return [
      { code: 'CSE331', title: 'Compiler Design', credits: 3, type: 'Core Theory', waiverPercentage: 0 },
      { code: 'CSE332', title: 'Compiler Design Lab', credits: 1, type: 'Core Lab', waiverPercentage: 0 },
      { code: 'CSE335', title: 'Computer Architecture and Organization', credits: 3, type: 'Core Theory', waiverPercentage: 0 },
      { code: 'CSE411', title: 'Artificial Intelligence', credits: 3, type: 'Core Theory', waiverPercentage: 0 },
      { code: 'CSE412', title: 'Artificial Intelligence Lab', credits: 1, type: 'Core Lab', waiverPercentage: 0 },
      { code: 'CSE413', title: 'Mobile Application Design', credits: 1, type: 'Core Theory', waiverPercentage: 0 },
      { code: 'CSE414', title: 'Mobile Application Design Lab', credits: 2, type: 'Core Lab', waiverPercentage: 0 },
      { code: 'CSE499', title: 'FYDP (Title Defense)', credits: 1, type: 'Project/Internship', waiverPercentage: 0 }
    ]
  }
}
