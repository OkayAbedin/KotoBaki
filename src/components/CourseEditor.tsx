'use client'

import { useState, useEffect } from 'react'
import { Check, Eye, EyeOff } from 'lucide-react'
import { CourseData } from '@/types'

interface CourseEditorProps {
  initialCourses: CourseData[]
  availableCourseTypes: string[]
  onCoursesUpdated: (courses: CourseData[]) => void
}

// Generate waiver percentage options (0-100% in 5% intervals)
const waiverOptions = Array.from({ length: 21 }, (_, i) => i * 5)

export default function CourseEditor({ initialCourses, availableCourseTypes, onCoursesUpdated }: CourseEditorProps) {
  const [courses, setCourses] = useState<CourseData[]>([])
  const [showDetails, setShowDetails] = useState(false)
  const [defaultWaiver, setDefaultWaiver] = useState(0)

  useEffect(() => {
    // Initialize courses from initialCourses, preserving any existing edits
    if (initialCourses.length > 0) {
      const processedCourses = initialCourses.map(course => {
        // Check if we already have this course with existing data
        const existingCourse = courses.find(c => c.code === course.code)
        if (existingCourse) {
          // Preserve all existing changes
          return existingCourse
        } else {
          // New course, auto-detect type and set defaults
          return {
            ...course,
            type: getAutomaticCourseType(course, availableCourseTypes),
            waiverPercentage: course.waiverPercentage || 0
          }
        }
      })
      
      // Only update if the courses have actually changed
      const currentCodesStr = courses.map(c => `${c.code}-${c.type}-${c.waiverPercentage}-${c.credits}`).sort().join(',')
      const newCodesStr = processedCourses.map(c => `${c.code}-${c.type}-${c.waiverPercentage}-${c.credits}`).sort().join(',')
      
      if (currentCodesStr !== newCodesStr) {
        setCourses(processedCourses)
      }
    }
  }, [initialCourses, availableCourseTypes])

  const updateCourseWaiver = (index: number, waiverPercentage: number) => {
    const updatedCourses = courses.map((course, i) => 
      i === index ? { ...course, waiverPercentage } : course
    )
    setCourses(updatedCourses)
  }

  const updateCourseType = (index: number, type: string) => {
    const updatedCourses = courses.map((course, i) => 
      i === index ? { ...course, type } : course
    )
    setCourses(updatedCourses)
  }

  const updateCourseCredits = (index: number, credits: number) => {
    // Validate credits range (1-6 is typical for university courses)
    const validCredits = Math.max(1, Math.min(6, credits))
    const updatedCourses = courses.map((course, i) => 
      i === index ? { ...course, credits: validCredits } : course
    )
    setCourses(updatedCourses)
  }

  const handleSubmit = () => {
    onCoursesUpdated(courses)
  }

  const applyDefaultWaiverToAll = () => {
    const updatedCourses = courses.map(course => ({
      ...course,
      waiverPercentage: defaultWaiver
    }))
    setCourses(updatedCourses)
  }

  const getAutomaticCourseType = (course: CourseData, availableTypes: string[]): string => {
    const title = course.title.toLowerCase()
    const code = course.code.toLowerCase()
    
    // Check for lab courses - highest priority
    if (title.includes('lab') || code.includes('lab')) {
      if (title.includes('ged') || code.includes('ged')) return findClosestType(availableTypes, 'GED Lab')
      return findClosestType(availableTypes, 'Core Lab')
    }
    
    // Check for project/thesis/internship courses
    if (title.includes('project') || 
        title.includes('thesis') || 
        title.includes('fyp') || 
        title.includes('fydp') ||
        title.includes('defence') ||
        title.includes('defense') ||
        title.includes('internship') ||
        title.includes('practicum') ||
        title.includes('capstone') ||
        code.includes('499') || 
        code.includes('498') ||
        code.includes('497') ||
        code.includes('496')) {
      return findClosestType(availableTypes, 'Project/Thesis/Internship')
    }
    
    // Check for general education courses
    if (title.includes('general') || 
        title.includes('ged') ||
        code.includes('ged') ||
        code.includes('gen') ||
        title.includes('english') ||
        title.includes('bangladesh') ||
        title.includes('philosophy') ||
        title.includes('sociology') ||
        title.includes('psychology')) {
      return findClosestType(availableTypes, 'General Course')
    }
    
    // Check for non-core courses
    if (title.includes('non core') || 
        title.includes('noncore') ||
        title.includes('elective') ||
        title.includes('optional')) {
      return findClosestType(availableTypes, 'Non Core')
    }
    
    // Default to Core
    return findClosestType(availableTypes, 'Core')
  }

  const findClosestType = (availableTypes: string[], preferredType: string): string => {
    // First try exact match
    if (availableTypes.includes(preferredType)) return preferredType
    
    // Try case-insensitive match
    const exactMatch = availableTypes.find(type => 
      type.toLowerCase() === preferredType.toLowerCase()
    )
    if (exactMatch) return exactMatch
    
    // Try partial match
    const partialMatch = availableTypes.find(type => 
      type.toLowerCase().includes(preferredType.toLowerCase()) ||
      preferredType.toLowerCase().includes(type.toLowerCase())
    )
    if (partialMatch) return partialMatch
    
    // Default to first available type
    return availableTypes[0] || 'Core'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold mb-4 flex items-center justify-between">
        <span className="flex items-center">
          <Check className="w-6 h-6 mr-2 text-green-600" />
          Review Your Courses
        </span>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-800"
        >
          {showDetails ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </h2>
      
      <p className="text-gray-600 mb-6">
        Review your courses and make any necessary adjustments. You can edit credits, course types, and set waiver percentages if you have any scholarships or discounts.
      </p>

      {/* Default Waiver Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-3">Set Default Waiver</h3>
        <p className="text-sm text-blue-700 mb-3">
          If you have a scholarship or waiver that applies to all courses, set it here and apply to all courses at once.
          You can also edit individual course credits and types below if needed.
        </p>
        <div className="flex items-center space-x-3">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-blue-700 mb-1">
              Default Waiver Percentage
            </label>
            <select
              value={defaultWaiver}
              onChange={(e) => setDefaultWaiver(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {waiverOptions.map(percentage => (
                <option key={percentage} value={percentage}>
                  {percentage}%
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={applyDefaultWaiverToAll}
            disabled={defaultWaiver === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Apply to All
          </button>
        </div>
      </div>

      {/* Course Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-2">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Courses:</span>
            <span className="font-semibold ml-2">{courses.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Credits:</span>
            <span className="font-semibold ml-2">{courses.reduce((sum, course) => sum + course.credits, 0)}</span>
          </div>
          <div>
            <span className="text-gray-600">With Waiver:</span>
            <span className="font-semibold ml-2">{courses.filter(course => course.waiverPercentage > 0).length}</span>
          </div>
          <div>
            <span className="text-gray-600">Default Waiver:</span>
            <span className="font-semibold ml-2">{defaultWaiver}%</span>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-3 mb-6">
        {courses.map((course, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-gray-800">{course.code}</div>
                    <div className="text-gray-700 mt-1">{course.title}</div>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {course.type}
                      </span>
                    </div>
                  </div>
                </div>
                {showDetails && (
                  <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
                    {course.section && <div>Section: {course.section}</div>}
                    {course.teacher && <div>Teacher: {course.teacher}</div>}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4 ml-4">
                {/* Credits Input */}
                <div className="min-w-[80px]">
                  <label className="block text-xs text-gray-600 mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={course.credits}
                    onChange={(e) => updateCourseCredits(index, parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                  />
                </div>

                {/* Course Type Dropdown */}
                <div className="min-w-[140px]">
                  <label className="block text-xs text-gray-600 mb-1">Course Type</label>
                  <select
                    value={course.type}
                    onChange={(e) => updateCourseType(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {availableCourseTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                {/* Waiver Percentage Dropdown */}
                <div className="min-w-[100px]">
                  <label className="block text-xs text-gray-600 mb-1">Waiver %</label>
                  <select
                    value={course.waiverPercentage}
                    onChange={(e) => updateCourseWaiver(index, parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      course.waiverPercentage === defaultWaiver && defaultWaiver > 0
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-300'
                    }`}
                  >
                    {waiverOptions.map(percentage => (
                      <option key={percentage} value={percentage}>
                        {percentage}%
                      </option>
                    ))}
                  </select>
                  {course.waiverPercentage === defaultWaiver && defaultWaiver > 0 && (
                    <div className="text-xs text-blue-600 mt-1">Default applied</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center text-lg"
        >
          <Check className="w-5 h-5 mr-2" />
          Calculate Payment
        </button>
      </div>
    </div>
  )
}
