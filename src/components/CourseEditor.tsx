'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit3, Check } from 'lucide-react'
import { CourseData } from '@/types'

interface CourseEditorProps {
  initialCourses: CourseData[]
  availableCourseTypes: string[] // Dynamic course types from payment scheme
  onCoursesUpdated: (courses: CourseData[]) => void
}

// Generate waiver percentage options (0-100% in 5% intervals)
const waiverOptions = Array.from({ length: 21 }, (_, i) => i * 5)

export default function CourseEditor({ initialCourses, availableCourseTypes, onCoursesUpdated }: CourseEditorProps) {
  const [courses, setCourses] = useState<CourseData[]>(
    initialCourses.length > 0 
      ? initialCourses.map(course => ({ ...course, waiverPercentage: 0 }))
      : []
  )

  const addNewCourse = () => {
    const newCourse: CourseData = {
      code: '',
      title: '',
      credits: 3,
      type: availableCourseTypes[0] || 'Core',
      waiverPercentage: 0
    }
    setCourses([...courses, newCourse])
  }

  const updateCourse = (index: number, field: keyof CourseData, value: string | number) => {
    const updatedCourses = courses.map((course, i) => 
      i === index ? { ...course, [field]: value } : course
    )
    setCourses(updatedCourses)
  }

  const removeCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    // Validate courses
    const validCourses = courses.filter(course => 
      course.code.trim() !== '' && course.credits > 0
    )
    
    if (validCourses.length === 0) {
      alert('Please add at least one valid course')
      return
    }
    
    onCoursesUpdated(validCourses)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <Edit3 className="w-6 h-6 mr-2 text-blue-600" />
        Step 3: Review & Edit Courses
      </h2>
      <p className="text-gray-600 mb-6">
        Review extracted courses, edit details, and set individual waiver percentages
      </p>

      <div className="space-y-4 mb-6">
        {courses.map((course, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
              {/* Course Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  placeholder="CSE331"
                  value={course.code}
                  onChange={(e) => updateCourse(index, 'code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Course Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  placeholder="Course Name"
                  value={course.title}
                  onChange={(e) => updateCourse(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Credits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credits
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={course.credits}
                  onChange={(e) => updateCourse(index, 'credits', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Course Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Type
                </label>
                <select
                  value={course.type}
                  onChange={(e) => updateCourse(index, 'type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {availableCourseTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Waiver Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Waiver %
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    value={course.waiverPercentage}
                    onChange={(e) => updateCourse(index, 'waiverPercentage', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {waiverOptions.map(percentage => (
                      <option key={percentage} value={percentage}>{percentage}%</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeCourse(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Remove course"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Course Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={addNewCourse}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Course
        </button>
      </div>

      {/* Course Summary */}
      {courses.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Course Summary:</h3>
          <div className="text-sm text-gray-600">
            <p>Total Courses: {courses.length}</p>
            <p>Total Credits: {courses.reduce((sum, course) => sum + course.credits, 0)}</p>
            <p>Courses with Waiver: {courses.filter(course => course.waiverPercentage > 0).length}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={courses.length === 0}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Check size={20} className="mr-2" />
          Continue to Payment Calculation
        </button>
      </div>
    </div>
  )
}
