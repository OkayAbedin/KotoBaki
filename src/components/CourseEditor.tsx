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

  useEffect(() => {
    // Auto-detect and set course types based on titles
    const processedCourses = initialCourses.map(course => ({
      ...course,
      type: getAutomaticCourseType(course, availableCourseTypes),
      waiverPercentage: 0
    }))
    setCourses(processedCourses)
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

  const handleSubmit = () => {
    onCoursesUpdated(courses)
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

  const isAutoDetectedSpecialType = (course: CourseData): boolean => {
    const title = course.title.toLowerCase()
    const code = course.code.toLowerCase()
    
    return title.includes('lab') || 
           title.includes('project') || 
           title.includes('thesis') || 
           title.includes('defence') || 
           title.includes('fydp') || 
           title.includes('internship') ||
           code.includes('499') || 
           code.includes('498') ||
           code.includes('497') ||
           code.includes('496')
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
        Course types have been automatically detected based on course titles and codes. You can adjust types and set waiver percentages as needed.
      </p>

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
            <span className="text-gray-600">Auto-detected:</span>
            <span className="font-semibold ml-2 text-green-600">
              ✓ {courses.filter(course => {
                const title = course.title.toLowerCase()
                return title.includes('lab') || title.includes('project') || title.includes('thesis') || 
                       title.includes('defence') || title.includes('fydp') || title.includes('internship')
              }).length} special types
            </span>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-3 mb-6">
        {courses.map((course, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className="font-semibold text-lg">{course.code}</div>
                  <div className="text-gray-600">{course.credits} credits</div>
                  <div className={`px-2 py-1 rounded text-sm flex items-center ${
                    isAutoDetectedSpecialType(course) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isAutoDetectedSpecialType(course) && <span className="mr-1">🤖</span>}
                    {course.type}
                  </div>
                </div>
                {showDetails && (
                  <div className="mt-2 text-sm text-gray-600">
                    <div>{course.title}</div>
                    {course.section && <div>Section: {course.section}</div>}
                    {course.teacher && <div>Teacher: {course.teacher}</div>}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Course Type Dropdown */}
                <div className="min-w-[120px]">
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
                  <select
                    value={course.waiverPercentage}
                    onChange={(e) => updateCourseWaiver(index, parseInt(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {waiverOptions.map(percentage => (
                      <option key={percentage} value={percentage}>
                        {percentage}% {percentage > 0 && 'waiver'}
                      </option>
                    ))}
                  </select>
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
