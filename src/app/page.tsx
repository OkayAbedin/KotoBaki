'use client'

import { useState } from 'react'
import { Upload, Calculator, FileText, Edit3, DollarSign, Check } from 'lucide-react'
import DirectEntry from '@/components/DirectEntry'
import PaymentCalculator from '@/components/PaymentCalculator'
import CourseEditor from '@/components/CourseEditor'
import { CourseData, PaymentResult } from '@/types'

export default function Home() {
  const [step, setStep] = useState(1)
  const [paymentSchemeData, setPaymentSchemeData] = useState<any[]>([])
  const [courseData, setCourseData] = useState<CourseData[]>([])
  const [amountAlreadyPaid, setAmountAlreadyPaid] = useState(0)
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)
  
  // Track which steps are completed
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const markStepCompleted = (stepNumber: number) => {
    setCompletedSteps(prev => {
      if (!prev.includes(stepNumber)) {
        return [...prev, stepNumber].sort()
      }
      return prev
    })
  }

  const canNavigateToStep = (stepNumber: number): boolean => {
    if (stepNumber === 1) return true
    if (stepNumber === 2) return completedSteps.includes(1)
    if (stepNumber === 3) return completedSteps.includes(2)
    if (stepNumber === 4) return completedSteps.includes(3)
    if (stepNumber === 5) return completedSteps.includes(4)
    return false
  }

  const navigateToStep = (stepNumber: number) => {
    if (canNavigateToStep(stepNumber)) {
      setStep(stepNumber)
    }
  }

  const handlePaymentSchemeExtracted = (data: any[]) => {
    setPaymentSchemeData(data)
    markStepCompleted(1)
    setStep(2)
  }

  const handleCoursesExtracted = (courses: CourseData[]) => {
    setCourseData(courses)
    markStepCompleted(2)
    setStep(3)
  }

  const handleCoursesUpdated = (courses: CourseData[]) => {
    setCourseData(courses)
    markStepCompleted(3)
    setStep(4)
  }

  const handlePaymentInfoComplete = () => {
    markStepCompleted(4)
    setStep(5)
  }

  const handleCalculationComplete = (result: PaymentResult) => {
    setPaymentResult(result)
    markStepCompleted(5)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">DIU CSE Fee Calculator</h1>
                <p className="text-sm text-gray-500">Calculate your semester fees</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex justify-center">
            <div className="flex items-center space-x-6">
              {[
                { number: 1, icon: Upload, title: "Payment Scheme", desc: "Import payment data" },
                { number: 2, icon: FileText, title: "Course Data", desc: "Import courses" },
                { number: 3, icon: Edit3, title: "Review", desc: "Edit details" },
                { number: 4, icon: DollarSign, title: "Payment", desc: "Track payments" },
                { number: 5, icon: Calculator, title: "Calculate", desc: "Get results" }
              ].map((stepInfo) => (
                <div key={stepInfo.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => navigateToStep(stepInfo.number)}
                      disabled={!canNavigateToStep(stepInfo.number)}
                      className={`relative w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                        step === stepInfo.number
                          ? 'bg-blue-600 text-white'
                          : completedSteps.includes(stepInfo.number)
                          ? 'bg-green-500 text-white'
                          : canNavigateToStep(stepInfo.number)
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {completedSteps.includes(stepInfo.number) ? (
                        <Check size={14} />
                      ) : (
                        stepInfo.number
                      )}
                    </button>
                    <div className="mt-2 text-center">
                      <div className="text-xs font-medium text-gray-700">{stepInfo.title}</div>
                      <div className="text-xs text-gray-500">{stepInfo.desc}</div>
                    </div>
                  </div>
                  {stepInfo.number < 5 && (
                    <div
                      className={`w-8 h-px mx-3 transition-colors ${
                        completedSteps.includes(stepInfo.number) 
                          ? 'bg-green-500' 
                          : step > stepInfo.number 
                          ? 'bg-blue-600' 
                          : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {step === 1 && (
            <div className="space-y-4">
              <DirectEntry
                onDataExtracted={(data: any[]) => {
                  console.log('Payment scheme data extracted:', data)
                  handlePaymentSchemeExtracted(data)
                }}
                title="Step 1: Import Payment Scheme"
                tableType="payment"
                existingData={paymentSchemeData}
                preserveTextOnSuccess={true}
              />
              {/* Facebook-style continue button */}
              {paymentSchemeData.length > 0 && (
                <div className="text-center">
                  <button
                    onClick={() => handlePaymentSchemeExtracted(paymentSchemeData)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors inline-flex items-center"
                  >
                    Continue to Course Registration
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <DirectEntry
                onDataExtracted={(courses: any[]) => {
                  console.log('Course data extracted:', courses)
                  
                  // Convert to CourseData format
                  const courseData: CourseData[] = courses.map((course: any) => ({
                    code: course.code,
                    title: course.title,
                    credits: course.credits,
                    type: course.type as CourseData['type'],
                    waiverPercentage: course.waiverPercentage || 0
                  }))
                  
                  if (courseData.length === 0) {
                    alert('No courses found. Please try again.')
                    return
                  }
                  
                  handleCoursesExtracted(courseData)
                }}
                title="Step 2: Import Course Registration"
                tableType="courses"
                existingData={courseData.length > 0 ? courseData : undefined}
                preserveTextOnSuccess={true}
              />
              
              {/* Facebook-style continue button */}
              {courseData.length > 0 && (
                <div className="text-center">
                  <button
                    onClick={() => handleCoursesExtracted(courseData)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors inline-flex items-center"
                  >
                    Continue to Review Courses
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Facebook-style navigation */}
              <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
                <button
                  onClick={() => navigateToStep(1)}
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Payment Scheme
                </button>
                <span className="text-sm text-gray-500">Step 2 of 5</span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <CourseEditor
                initialCourses={courseData}
                availableCourseTypes={paymentSchemeData
                  .filter(item => item.paymentName === 'Tuition Fee')
                  .map(item => item.courseCategory)
                }
                onCoursesUpdated={handleCoursesUpdated}
              />
              
              {/* Facebook-style navigation */}
              <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
                <button
                  onClick={() => navigateToStep(2)}
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Course Registration
                </button>
                <span className="text-sm text-gray-500">Step 3 of 5</span>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200">
                {/* Facebook-style header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Payment Tracking</h2>
                      <p className="text-sm text-gray-500">Track any payments you&apos;ve already made (optional)</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Success state */}
                  {amountAlreadyPaid > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <DollarSign className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-green-800">Payment Recorded</h3>
                            <p className="text-sm text-green-700">
                              Amount already paid: <span className="font-semibold">৳{amountAlreadyPaid.toLocaleString()}</span>
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handlePaymentInfoComplete}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          Continue to Calculation
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="max-w-md">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount Already Paid (৳)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => setAmountAlreadyPaid(parseInt(e.target.value) || 0)}
                        value={amountAlreadyPaid > 0 ? amountAlreadyPaid : ''}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave as 0 if you haven&apos;t paid anything yet
                      </p>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={handlePaymentInfoComplete}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center"
                      >
                        <Calculator className="w-4 h-4 mr-2" />
                        Calculate Payment
                      </button>
                      <button
                        onClick={() => {
                          setAmountAlreadyPaid(0)
                          handlePaymentInfoComplete()
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Facebook-style navigation */}
              <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
                <button
                  onClick={() => navigateToStep(3)}
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Review Courses
                </button>
                <span className="text-sm text-gray-500">Step 4 of 5</span>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <PaymentCalculator
                courseData={courseData}
                paymentSchemeData={paymentSchemeData}
                amountAlreadyPaid={amountAlreadyPaid}
                onCalculationComplete={handleCalculationComplete}
              />
              
              {/* Facebook-style final navigation */}
              <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigateToStep(4)}
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Payment Tracking
                  </button>
                  <button
                    onClick={() => navigateToStep(3)}
                    className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    Edit Courses & Waivers
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">Step 5 of 5 - Complete!</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
