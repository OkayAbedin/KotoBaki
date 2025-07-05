'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
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
  }, [initialCourses, availableCourseTypes, courses])

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
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center mr-3">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Review Your Courses</h2>
            <p className="text-sm text-gray-500">Edit course details, credits, and set waiver percentages</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Default Waiver Section */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Set Default Waiver (Optional)</h3>
          <p className="text-gray-600 mb-3 text-sm">
            If you have a scholarship or waiver that applies to all courses, set it here and apply to all courses at once.
          </p>
          <div className="flex items-end space-x-3">
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Waiver Percentage
              </label>
              <select
                value={defaultWaiver}
                onChange={(e) => setDefaultWaiver(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium disabled:cursor-not-allowed transition-colors"
            >
              Apply to All
            </button>
          </div>
        </div>

      {/* Course Summary */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <h3 className="font-medium mb-3 text-gray-900">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-900">{courses.length}</div>
            <div className="text-xs text-gray-500">Total Courses</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-900">{courses.reduce((sum, course) => sum + course.credits, 0)}</div>
            <div className="text-xs text-gray-500">Total Credits</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-green-600">{courses.filter(course => course.waiverPercentage > 0).length}</div>
            <div className="text-xs text-gray-500">With Waiver</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-blue-600">{defaultWaiver}%</div>
            <div className="text-xs text-gray-500">Default Waiver</div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-3 mb-4">
        {courses.map((course, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{course.code}</div>
                    <div className="text-gray-700 text-sm mt-1">{course.title}</div>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {course.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 ml-4">
                {/* Credits Input */}
                <div className="min-w-[70px]">
                  <label className="block text-xs text-gray-600 mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={course.credits}
                    onChange={(e) => updateCourseCredits(index, parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                  />
                </div>

                {/* Course Type Dropdown */}
                <div className="min-w-[120px]">
                  <label className="block text-xs text-gray-600 mb-1">Course Type</label>
                  <select
                    value={course.type}
                    onChange={(e) => updateCourseType(index, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {availableCourseTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                {/* Waiver Percentage Dropdown */}
                <div className="min-w-[80px]">
                  <label className="block text-xs text-gray-600 mb-1">Waiver %</label>
                  <select
                    value={course.waiverPercentage}
                    onChange={(e) => updateCourseWaiver(index, parseInt(e.target.value))}
                    className={`w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Facebook-style Submit Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors flex items-center font-medium"
        >
          <Check className="w-4 h-4 mr-2" />
          Calculate Payment
        </button>
      </div>
    </div>
  </div>
)
}
