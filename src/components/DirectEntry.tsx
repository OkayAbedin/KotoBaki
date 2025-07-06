'use client'

import { useState, useEffect } from 'react'
import { Copy, CheckCircle, Check } from 'lucide-react'

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
      }
    } catch (error) {
      console.error('Parsing error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mr-4 shadow-xl shadow-blue-500/30">
            <Copy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600">Copy and paste data from your student portal</p>
          </div>
        </div>
      </div>
        {/* Success message */}
        {hasData && existingData && existingData.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-6 mb-8 shadow-xl shadow-green-200/50">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mr-4 shadow-lg shadow-green-500/30">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-green-800 text-lg">Data Successfully Imported</h3>
                <p className="text-sm text-green-700 mt-2 leading-relaxed">
                  You have imported <span className="font-bold">{existingData.length}</span> {tableType === 'courses' ? 'courses' : 'payment items'}. 
                  You can re-import below if you need to update the data.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border border-blue-200 shadow-xl shadow-blue-200/50 p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-6 text-lg flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-3 shadow-lg shadow-blue-500/30">
              <span className="text-white text-lg">📋</span>
            </div>
            How to Import Data
          </h3>
          <div className="space-y-4">
            {[
              "Go to your DIU student portal",
              `Find the ${tableType === 'payment' ? 'payment scheme' : 'course registration'} table from the Student Profile Section`,
              "Select the entire table (drag from top-left to bottom-right)",
              "Copy the table (Ctrl+C or Cmd+C)",
              "Paste below and click Import Data"
            ].map((instruction, index) => (
              <div key={index} className="flex items-center text-sm text-gray-700 bg-white rounded-2xl p-4 shadow-md shadow-gray-200/50">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-sm font-bold mr-4 flex-shrink-0 shadow-lg shadow-blue-500/30">
                  {index + 1}
                </div>
                <span className="font-medium leading-relaxed">{instruction}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modern Input Area */}
        <div className="space-y-6">
          <label className="block text-lg font-semibold text-gray-900">
            Paste your {tableType === 'payment' ? 'payment scheme' : 'course registration'} data here:
          </label>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={tableType === 'payment' 
              ? "Example:\nSL\tPayment name\tCourse Type\tCourse Category\tAmount\n1\tAdmission Fee\tOthers\tOthers\t15000\n2\tTuition Fee\tCourse Fee\tCore\t4900"
              : "Example:\nSL\tCourse Code\tCourse Title\tCredit\tType\tSection\tTeacher\n1\tCSE110\tComputer Programming\t3\tREGULAR\t61_A\tTeacher Name\n2\tCSE111\tComputer Programming Lab\t1\tREGULAR\t61_A\tTeacher Name"
            }
            className="w-full h-48 p-6 border border-gray-300 rounded-3xl font-mono text-sm resize-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-xl shadow-gray-200/50"
            disabled={isProcessing}
          />
          
          <div className="flex gap-4">
            <button
              onClick={handlePortalPaste}
              disabled={!pasteText.trim() || isProcessing}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-4 rounded-2xl font-semibold text-lg disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-xl shadow-blue-500/30 disabled:shadow-gray-300/30 flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6 mr-3" />
                  Import Data
                </>
              )}
            </button>
            <button
              onClick={() => setPasteText('')}
              disabled={isProcessing}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-gray-500/30"
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
