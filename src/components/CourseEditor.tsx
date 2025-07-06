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
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mr-4 shadow-xl shadow-green-500/30">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review Your Courses</h2>
            <p className="text-sm text-gray-600">Edit course details, credits, and set waiver percentages</p>
          </div>
        </div>
      </div>

      {/* Default Waiver Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border border-blue-200 shadow-xl shadow-blue-200/50 p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-3 shadow-lg shadow-blue-500/30">
            <span className="text-white font-bold text-sm">%</span>
          </div>
          Set Default Waiver (Optional)
        </h3>
        <p className="text-gray-700 mb-6 text-sm leading-relaxed">
          If you have a scholarship or waiver that applies to all courses, set it here and apply to all courses at once.
        </p>
        <div className="flex items-end space-x-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Default Waiver Percentage
            </label>
            <select
              value={defaultWaiver}
              onChange={(e) => setDefaultWaiver(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 font-medium shadow-md shadow-gray-200/50"
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
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-2xl text-sm font-semibold disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/30 disabled:shadow-gray-300/30"
          >
            Apply to All
          </button>
        </div>
      </div>

      {/* Course Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/50 p-6 mb-8">
        <h3 className="font-bold mb-6 text-gray-900 text-lg flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mr-3 shadow-lg shadow-gray-500/30">
            <span className="text-white font-bold text-sm">#</span>
          </div>
          Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center bg-white rounded-2xl p-4 shadow-lg shadow-gray-200/50">
            <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
            <div className="text-sm text-gray-600 font-medium">Total Courses</div>
          </div>
          <div className="text-center bg-white rounded-2xl p-4 shadow-lg shadow-gray-200/50">
            <div className="text-2xl font-bold text-gray-900">{courses.reduce((sum, course) => sum + course.credits, 0)}</div>
            <div className="text-sm text-gray-600 font-medium">Total Credits</div>
          </div>
          <div className="text-center bg-white rounded-2xl p-4 shadow-lg shadow-gray-200/50">
            <div className="text-2xl font-bold text-green-600">{courses.filter(course => course.waiverPercentage > 0).length}</div>
            <div className="text-sm text-gray-600 font-medium">With Waiver</div>
          </div>
          <div className="text-center bg-white rounded-2xl p-4 shadow-lg shadow-gray-200/50">
            <div className="text-2xl font-bold text-blue-600">{defaultWaiver}%</div>
            <div className="text-sm text-gray-600 font-medium">Default Waiver</div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-4 mb-8">
        {courses.map((course, index) => (
          <div key={index} className="bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6 hover:shadow-xl hover:shadow-gray-300/60 transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-start space-x-6">
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-lg">{course.code}</div>
                    <div className="text-gray-700 text-sm mt-2 leading-relaxed">{course.title}</div>
                    <div className="flex items-center space-x-3 mt-4">
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-2xl text-sm font-semibold shadow-md shadow-blue-200/50">
                        {course.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 ml-6">
                {/* Credits Input */}
                <div className="min-w-[80px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={course.credits}
                    onChange={(e) => updateCourseCredits(index, parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-center font-semibold transition-all duration-300 shadow-md shadow-gray-200/50"
                  />
                </div>

                {/* Course Type Dropdown */}
                <div className="min-w-[140px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Type</label>
                  <select
                    value={course.type}
                    onChange={(e) => updateCourseType(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all duration-300 shadow-md shadow-gray-200/50"
                  >
                    {availableCourseTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                {/* Waiver Percentage Dropdown */}
                <div className="min-w-[100px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Waiver %</label>
                  <select
                    value={course.waiverPercentage}
                    onChange={(e) => updateCourseWaiver(index, parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 font-semibold transition-all duration-300 shadow-md shadow-gray-200/50 ${
                      course.waiverPercentage === defaultWaiver && defaultWaiver > 0
                        ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800'
                        : 'border-gray-300 bg-white'
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

      {/* Modern Submit Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl shadow-green-500/30 flex items-center"
        >
          <Check className="w-6 h-6 mr-3" />
          Calculate Payment
        </button>
      </div>
    </div>
  )
}
