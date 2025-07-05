'use client'

import { useState } from 'react'
import { Copy, Table, Zap, Plus, Trash2 } from 'lucide-react'

interface DirectEntryProps {
  onDataExtracted: (data: any[]) => void
  tableType: 'payment' | 'courses'
  title: string
}

export default function DirectEntry({ onDataExtracted, tableType, title }: DirectEntryProps) {
  const [showCopyPaste, setShowCopyPaste] = useState(false)
  const [showManualForm, setShowManualForm] = useState(false)
  const [pasteText, setPasteText] = useState('')

  // Manual form states
  const [manualEntries, setManualEntries] = useState<any[]>([])
  const [currentEntry, setCurrentEntry] = useState<any>({})

  // Handle copy-paste from student portal
  const handlePortalPaste = () => {
    if (!pasteText.trim()) {
      alert('Please paste some data first.')
      return
    }

    try {
      const data = parsePortalData(pasteText, tableType)
      if (data.length > 0) {
        onDataExtracted(data)
        setPasteText('')
        setShowCopyPaste(false)
        alert(`Successfully imported ${data.length} ${tableType} items!`)
      } else {
        alert('No valid data found. Try the manual entry option below.')
      }
    } catch (error) {
      console.error('Parsing error:', error)
      alert('Could not parse the data. Please try manual entry.')
    }
  }

  // Add manual entry
  const addManualEntry = () => {
    if (tableType === 'payment') {
      if (!currentEntry.name || !currentEntry.amount) {
        alert('Please fill in payment name and amount.')
        return
      }
      setManualEntries([...manualEntries, {
        name: currentEntry.name,
        amount: parseInt(currentEntry.amount) || 0,
        type: currentEntry.type || 'other'
      }])
    } else {
      if (!currentEntry.code || !currentEntry.title || !currentEntry.credits) {
        alert('Please fill in course code, title, and credits.')
        return
      }
      setManualEntries([...manualEntries, {
        code: currentEntry.code.toUpperCase(),
        title: currentEntry.title,
        credits: parseInt(currentEntry.credits) || 3,
        type: currentEntry.type || 'Core Theory',
        waiverPercentage: 0
      }])
    }
    setCurrentEntry({})
  }

  const removeEntry = (index: number) => {
    setManualEntries(manualEntries.filter((_, i) => i !== index))
  }

  const submitManualEntries = () => {
    if (manualEntries.length === 0) {
      alert('Please add at least one entry.')
      return
    }
    onDataExtracted(manualEntries)
    setManualEntries([])
    setShowManualForm(false)
    alert(`Successfully added ${manualEntries.length} ${tableType} items!`)
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      
      {/* Input Methods */}
      {tableType === 'payment' ? (
        // For payment scheme - only copy-paste option
        <div className="max-w-2xl mx-auto">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
              <Copy className="w-5 h-5 mr-2" />
              📋 Copy from Student Portal
            </h4>
            
            <div className="space-y-3">
              <p className="text-sm text-blue-700">
                Copy your payment scheme table directly from your student portal for the most accurate calculation
              </p>
              
              <button
                onClick={() => setShowCopyPaste(!showCopyPaste)}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 transition-colors text-sm"
              >
                {showCopyPaste ? 'Hide Paste Area' : 'Paste Payment Scheme Data'}
              </button>

              <div className="text-xs text-blue-600 space-y-1">
                <div>💡 <strong>How to copy from portal:</strong></div>
                <div>1. Go to your student portal payment section</div>
                <div>2. Select the payment scheme table</div>
                <div>3. Copy (Ctrl+C)</div>
                <div>4. Paste below and click Process</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // For courses - keep both options
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Method 1: Copy from Portal */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
              <Copy className="w-5 h-5 mr-2" />
              📋 Copy from Portal (Recommended)
            </h4>
            
            <div className="space-y-3">
              <p className="text-sm text-blue-700">
                Copy table data directly from your student portal - most accurate method
              </p>
              
              <button
                onClick={() => setShowCopyPaste(!showCopyPaste)}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 transition-colors text-sm"
              >
                {showCopyPaste ? 'Hide Paste Area' : 'Paste Portal Data'}
              </button>

              <div className="text-xs text-blue-600 space-y-1">
                <div>💡 <strong>How to:</strong></div>
                <div>1. Select table on portal</div>
                <div>2. Copy (Ctrl+C)</div>
                <div>3. Paste here</div>
                <div>4. Click Process</div>
              </div>
            </div>
          </div>

          {/* Method 2: Manual Entry */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center">
              <Table className="w-5 h-5 mr-2" />
              ✏️ Manual Entry
            </h4>
            
            <div className="space-y-3">
              <p className="text-sm text-green-700">
                Type in your data manually - best for small amounts or when copy-paste doesn&apos;t work
              </p>
              
              <button
                onClick={() => setShowManualForm(!showManualForm)}
                className="w-full bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 transition-colors text-sm"
              >
                {showManualForm ? 'Hide Form' : 'Enter Manually'}
              </button>

              <div className="text-xs text-green-600">
                Simple form with dropdowns - add one item at a time
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copy-Paste Area */}
      {showCopyPaste && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-800 mb-3">📋 Paste Your Portal Data:</h5>
          
          <div className="bg-white border border-blue-300 rounded p-3 mb-3">
            <div className="text-sm text-blue-700 mb-2">
              <strong>Instructions:</strong>
            </div>
            <ol className="text-xs text-blue-600 space-y-1 list-decimal list-inside">
              <li>Go to your student portal</li>
              <li>Find the {tableType === 'payment' ? 'payment scheme' : 'course registration'} table</li>
              <li>Select the entire table (click and drag)</li>
              <li>Copy it (Ctrl+C or Cmd+C)</li>
              <li>Paste below and click Process</li>
            </ol>
          </div>
          
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={tableType === 'payment' 
              ? "Paste your payment table here...\nExample:\nAdmission Fee    15000\nTuition Fee    45000\nLab Fee    5000"
              : "Paste your course table here...\nExample:\nCSE110    Computer Programming    3\nCSE111    Programming Lab    1"
            }
            className="w-full h-32 p-3 border border-blue-300 rounded font-mono text-sm"
          />
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={handlePortalPaste}
              disabled={!pasteText.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Process Pasted Data
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

      {/* Manual Form - For payment entries */}
      {showManualForm && tableType === 'payment' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h5 className="font-medium text-green-800 mb-3">✏️ Manual Entry Form:</h5>
          
          {/* Entry Form */}
          <div className="bg-white border border-green-300 rounded p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Payment Name (e.g., Tuition Fee)"
                value={currentEntry.name || ''}
                onChange={(e) => setCurrentEntry({...currentEntry, name: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded"
              />
              <input
                type="number"
                placeholder="Amount (e.g., 45000)"
                value={currentEntry.amount || ''}
                onChange={(e) => setCurrentEntry({...currentEntry, amount: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded"
              />
              <select
                value={currentEntry.type || 'other'}
                onChange={(e) => setCurrentEntry({...currentEntry, type: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded"
              >
                <option value="registration">Registration</option>
                <option value="tuition">Tuition</option>
                <option value="lab">Lab</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <button
              onClick={addManualEntry}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Entry
            </button>
          </div>

          {/* Current Entries */}
          {manualEntries.length > 0 && (
            <div className="bg-white border border-green-300 rounded p-4 mb-4">
              <h6 className="font-medium text-green-800 mb-2">Added Entries ({manualEntries.length}):</h6>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {manualEntries.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">
                      {`${entry.name} - ৳${entry.amount}`}
                    </span>
                    <button
                      onClick={() => removeEntry(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={submitManualEntries}
              disabled={manualEntries.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Use These Entries ({manualEntries.length})
            </button>
            <button
              onClick={() => setManualEntries([])}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Manual Form - For course entries */}
      {showManualForm && tableType === 'courses' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h5 className="font-medium text-green-800 mb-3">✏️ Manual Entry Form:</h5>
          
          {/* Entry Form */}
          <div className="bg-white border border-green-300 rounded p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Course Code (e.g., CSE110)"
                  value={currentEntry.code || ''}
                  onChange={(e) => setCurrentEntry({...currentEntry, code: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  placeholder="Course Title"
                  value={currentEntry.title || ''}
                  onChange={(e) => setCurrentEntry({...currentEntry, title: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded"
                />
                <input
                  type="number"
                  placeholder="Credits"
                  min="1"
                  max="6"
                  value={currentEntry.credits || ''}
                  onChange={(e) => setCurrentEntry({...currentEntry, credits: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded"
                />
                <select
                  value={currentEntry.type || 'Core Theory'}
                  onChange={(e) => setCurrentEntry({...currentEntry, type: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="Core Theory">Core Theory</option>
                  <option value="Core Lab">Core Lab</option>
                  <option value="GED Lab">GED Lab</option>
                  <option value="General Course">General Course</option>
                  <option value="Project/Internship">Project/Internship</option>
                </select>
              </div>
            
            <button
              onClick={addManualEntry}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Entry
            </button>
          </div>

          {/* Current Entries */}
          {manualEntries.length > 0 && (
            <div className="bg-white border border-green-300 rounded p-4 mb-4">
              <h6 className="font-medium text-green-800 mb-2">Added Entries ({manualEntries.length}):</h6>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {manualEntries.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">
                      {`${entry.code} - ${entry.title} (${entry.credits} credits)`}
                    </span>
                    <button
                      onClick={() => removeEntry(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={submitManualEntries}
              disabled={manualEntries.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Use These Entries ({manualEntries.length})
            </button>
            <button
              onClick={() => setManualEntries([])}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h5 className="font-medium text-gray-800 mb-2 flex items-center">
          <Zap className="w-4 h-4 mr-1" />
          💡 Need Help?
        </h5>
        <div className="text-sm text-gray-700 space-y-1">
          <div><strong>Copy-Paste not working?</strong> Try manual entry - it&apos;s quick!</div>
          <div><strong>Have questions?</strong> The data format is very flexible</div>
        </div>
      </div>
    </div>
  )
}

// Parse data copied from student portal
function parsePortalData(text: string, tableType: string): any[] {
  const data = []
  const lines = text.split('\n').filter(line => line.trim())
  
  for (const line of lines) {
    // Skip header lines
    if (line.toLowerCase().includes('sl') && (line.toLowerCase().includes('payment name') || line.toLowerCase().includes('course code'))) continue
    
    // Try different delimiters: tab first, then multiple spaces
    let parts = line.split('\t').map(p => p.trim()).filter(p => p)
    if (parts.length < 3) {
      parts = line.split(/\s{2,}/).map(p => p.trim()).filter(p => p)
    }
    if (parts.length < 3) {
      // For single space separation, need to be more careful
      const spaceParts = line.split(/\s+/)
      if (spaceParts.length >= 5) {
        parts = spaceParts
      }
    }

    if (tableType === 'payment' && parts.length >= 5) {
      // Payment scheme format: SL, Payment name, Course Type, Course Category, Amount
      const sl = parseInt(parts[0])
      if (isNaN(sl)) continue // Skip non-numeric SL
      
      const paymentName = parts[1]
      const courseType = parts[2]
      const courseCategory = parts[3]
      const amount = parseInt(parts[4].replace(/[^\d]/g, ''))
      
      if (paymentName && amount > 0) {
        data.push({
          sl,
          paymentName,
          courseType,
          courseCategory,
          amount
        })
      }
    } else if (tableType === 'courses' && parts.length >= 4) {
      // Course format: SL, Course Code, Course Title, Credit, Type, Section, Teacher
      const sl = parseInt(parts[0])
      if (isNaN(sl)) continue // Skip non-numeric SL
      
      const courseCode = parts[1]
      let title = ''
      let credits = 0
      let section = ''
      let teacher = ''
      
      // Find credits (should be a number 1-6)
      let creditsIndex = -1
      for (let i = 2; i < parts.length; i++) {
        const num = parseInt(parts[i])
        if (num >= 1 && num <= 6) {
          credits = num
          creditsIndex = i
          break
        }
      }
      
      if (creditsIndex > 2) {
        // Title is between course code and credits
        title = parts.slice(2, creditsIndex).join(' ')
      }
      
      // Type, Section and teacher are after credits
      if (creditsIndex + 1 < parts.length) {
        const typeSection = parts[creditsIndex + 1] || 'REGULAR'
        section = parts[creditsIndex + 2] || ''
        teacher = parts.slice(creditsIndex + 3).join(' ') || ''
      }
      
      if (courseCode && title && credits > 0) {
        data.push({
          code: courseCode.toUpperCase(),
          title: title,
          credits: credits,
          type: 'Core', // Default type, will be updated in CourseEditor
          section: section,
          teacher: teacher,
          waiverPercentage: 0
        })
      }
    }
  }
  
  return data
}

function categorizePaymentType(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('tuition')) return 'tuition'
  if (lower.includes('admission')) return 'registration'
  if (lower.includes('lab')) return 'lab'
  return 'other'
}

function determineCourseType(code: string, title: string): string {
  const lowerTitle = title.toLowerCase()
  const lowerCode = code.toLowerCase()
  
  if (lowerTitle.includes('lab') || lowerCode.includes('lab')) {
    if (lowerTitle.includes('ged')) return 'GED Lab'
    return 'Core Lab'
  }
  
  if (lowerTitle.includes('project') || lowerTitle.includes('thesis') || 
      lowerTitle.includes('fyp') || code.includes('499')) {
    return 'Project/Internship'
  }
  
  if (lowerTitle.includes('general') || lowerTitle.includes('ged')) {
    return 'General Course'
  }
  
  return 'Core Theory'
}
