'use client'

import { useState, useEffect } from 'react'
import { Copy, CheckCircle } from 'lucide-react'

interface DirectEntryProps {
  onDataExtracted: (data: any[]) => void
  tableType: 'payment' | 'courses'
  title: string
  existingData?: any[] // Add this to preserve data when navigating back
  preserveTextOnSuccess?: boolean // Add this to optionally keep text after success
}

export default function DirectEntry({ onDataExtracted, tableType, title, existingData, preserveTextOnSuccess = false }: DirectEntryProps) {
  const [pasteText, setPasteText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasData, setHasData] = useState(false)

  // Update hasData when existingData changes
  useEffect(() => {
    setHasData(Boolean(existingData && existingData.length > 0))
  }, [existingData])

  // Handle copy-paste from student portal
  const handlePortalPaste = async () => {
    if (!pasteText.trim()) {
      alert('Please paste some data first.')
      return
    }

    setIsProcessing(true)
    try {
      const data = parsePortalData(pasteText, tableType)
      if (data.length > 0) {
        onDataExtracted(data)
        setHasData(true)
        if (!preserveTextOnSuccess) {
          setPasteText('')
        }
        alert(`Successfully imported ${data.length} ${tableType === 'courses' ? 'courses' : 'payment items'}!`)
      } else {
        alert('No valid data found. Please check your pasted data format.')
      }
    } catch (error) {
      console.error('Parsing error:', error)
      alert('Could not parse the data. Please check the format and try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <Copy className="w-6 h-6 mr-2 text-blue-600" />
        {title}
      </h2>
      
      {/* Show existing data if available */}
      {hasData && existingData && existingData.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 mb-1">✅ Data Already Imported</h3>
              <p className="text-sm text-green-700">
                You have {existingData.length} {tableType === 'courses' ? 'courses' : 'payment items'} imported. 
                You can re-import below if you need to update the data.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-blue-800 mb-2">📋 Copy from Student Portal</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Step 1:</strong> Go to your DIU student portal</p>
            <p><strong>Step 2:</strong> Find the {tableType === 'payment' ? 'payment scheme' : 'course registration'} table</p>
            <p><strong>Step 3:</strong> Select the entire table (click and drag from top-left to bottom-right)</p>
            <p><strong>Step 4:</strong> Copy it (Ctrl+C or Cmd+C)</p>
            <p><strong>Step 5:</strong> Paste below and click "Process Data"</p>
          </div>
        </div>
        
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder={tableType === 'payment' 
            ? "Paste your payment scheme table here...\n\nExample:\nSL\tPayment name\tCourse Type\tCourse Category\tAmount\n1\tAdmission Fee\tOthers\tOthers\t15000\n2\tTuition Fee\tCourse Fee\tCore\t4900"
            : "Paste your course registration table here...\n\nExample:\nSL\tCourse Code\tCourse Title\tCredit\tType\tSection\tTeacher\n1\tCSE110\tComputer Programming\t3\tREGULAR\t61_A\tTeacher Name\n2\tCSE111\tComputer Programming Lab\t1\tREGULAR\t61_A\tTeacher Name"
          }
          className="w-full h-40 p-4 border border-blue-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isProcessing}
        />
        
        <div className="flex gap-3 mt-4">
          <button
            onClick={handlePortalPaste}
            disabled={!pasteText.trim() || isProcessing}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Process Data
              </>
            )}
          </button>
          <button
            onClick={() => setPasteText('')}
            disabled={isProcessing}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}

// Parse portal data function with enhanced course type detection
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
        // Automatic course type detection
        const detectedType = determineCourseType(courseCode, title)
        
        data.push({
          code: courseCode.toUpperCase(),
          title: title,
          credits: credits,
          type: detectedType,
          section: section,
          teacher: teacher,
          waiverPercentage: 0
        })
      }
    }
  }
  
  return data
}

// Enhanced course type detection with comprehensive keyword matching
function determineCourseType(code: string, title: string): string {
  const lowerTitle = title.toLowerCase()
  const lowerCode = code.toLowerCase()
  
  // Check for lab courses - highest priority
  if (lowerTitle.includes('lab') || lowerCode.includes('lab')) {
    if (lowerTitle.includes('ged') || lowerCode.includes('ged')) return 'GED Lab'
    return 'Core Lab'
  }
  
  // Check for project/thesis/internship courses
  if (lowerTitle.includes('project') || 
      lowerTitle.includes('thesis') || 
      lowerTitle.includes('fyp') || 
      lowerTitle.includes('fydp') ||
      lowerTitle.includes('defence') ||
      lowerTitle.includes('defense') ||
      lowerTitle.includes('internship') ||
      lowerTitle.includes('practicum') ||
      lowerTitle.includes('capstone') ||
      lowerCode.includes('499') || 
      lowerCode.includes('498') ||
      lowerCode.includes('497') ||
      lowerCode.includes('496')) {
    return 'Project/Thesis/Internship'
  }
  
  // Check for general education courses
  if (lowerTitle.includes('general') || 
      lowerTitle.includes('ged') ||
      lowerCode.includes('ged') ||
      lowerCode.includes('gen') ||
      lowerTitle.includes('english') ||
      lowerTitle.includes('bangladesh') ||
      lowerTitle.includes('philosophy') ||
      lowerTitle.includes('sociology') ||
      lowerTitle.includes('psychology')) {
    return 'General Course'
  }
  
  // Check for non-core courses
  if (lowerTitle.includes('non core') || 
      lowerTitle.includes('noncore') ||
      lowerTitle.includes('elective') ||
      lowerTitle.includes('optional')) {
    return 'Non Core'
  }
  
  // Default to Core for regular theory courses
  return 'Core'
}
