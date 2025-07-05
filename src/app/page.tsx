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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            DIU CSE Payment Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Instantly calculate your semester fees by copying data directly from your student portal. No manual entry required - just copy and paste!
          </p>
          {completedSteps.length > 0 && (
            <p className="text-sm text-blue-600 mt-3">
              💡 Tip: Click on the step circles above to navigate between completed steps
            </p>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { number: 1, icon: Upload, title: "Payment Scheme" },
              { number: 2, icon: FileText, title: "Course Registration" },
              { number: 3, icon: Edit3, title: "Review & Waivers" },
              { number: 4, icon: DollarSign, title: "Payment Tracking" },
              { number: 5, icon: Calculator, title: "Calculate Fees" }
            ].map((stepInfo) => (
              <div key={stepInfo.number} className="flex items-center">
                <button
                  onClick={() => navigateToStep(stepInfo.number)}
                  disabled={!canNavigateToStep(stepInfo.number)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold transition-colors ${
                    step === stepInfo.number
                      ? 'bg-blue-600 ring-2 ring-blue-300'
                      : completedSteps.includes(stepInfo.number)
                      ? 'bg-green-600 hover:bg-green-700'
                      : canNavigateToStep(stepInfo.number)
                      ? 'bg-gray-400 hover:bg-gray-500'
                      : 'bg-gray-300 cursor-not-allowed'
                  } ${canNavigateToStep(stepInfo.number) ? 'cursor-pointer' : ''}`}
                  title={`${stepInfo.title}${completedSteps.includes(stepInfo.number) ? ' (Completed)' : canNavigateToStep(stepInfo.number) ? ' (Available)' : ' (Locked)'}`}
                >
                  {completedSteps.includes(stepInfo.number) ? (
                    <Check size={20} />
                  ) : (
                    <stepInfo.icon size={20} />
                  )}
                </button>
                {stepInfo.number < 5 && (
                  <div
                    className={`w-16 h-1 transition-colors ${
                      completedSteps.includes(stepInfo.number) ? 'bg-green-600' : 
                      step > stepInfo.number ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {step === 1 && (
            <div className="space-y-6">
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
              {/* Show proceed button if data already exists */}
              {paymentSchemeData.length > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={() => handlePaymentSchemeExtracted(paymentSchemeData)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    Proceed to Course Registration →
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
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
              
              {/* Show proceed button if data already exists */}
              {courseData.length > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={() => handleCoursesExtracted(courseData)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    Proceed to Course Editor →
                  </button>
                </div>
              )}
              
              {/* Step Navigation */}
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <button
                  onClick={() => navigateToStep(1)}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Back to Payment Scheme
                </button>
                <span className="text-sm text-gray-500">Step 2 of 5</span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <CourseEditor
                initialCourses={courseData}
                availableCourseTypes={paymentSchemeData
                  .filter(item => item.paymentName === 'Tuition Fee')
                  .map(item => item.courseCategory)
                }
                onCoursesUpdated={handleCoursesUpdated}
              />
              
              {/* Step Navigation */}
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <button
                  onClick={() => navigateToStep(2)}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Back to Course Registration
                </button>
                <span className="text-sm text-gray-500">Step 3 of 5</span>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                  <DollarSign className="w-6 h-6 mr-2 text-green-600" />
                  Payment Tracking (Optional)
                </h2>
                <p className="text-gray-600 mb-6">
                  If you've already made any payments for this semester, enter the amount below to track your remaining balance.
                </p>
                
                {/* Show current amount if already set */}
                {amountAlreadyPaid > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-green-800 mb-1">💰 Current Payment Info</h3>
                        <p className="text-sm text-green-700">
                          Amount already paid: <strong>৳{amountAlreadyPaid.toLocaleString()}</strong>
                        </p>
                      </div>
                      <button
                        onClick={handlePaymentInfoComplete}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                      >
                        Proceed to Calculation →
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="max-w-md">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Amount Already Paid (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      placeholder="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => setAmountAlreadyPaid(parseInt(e.target.value) || 0)}
                      value={amountAlreadyPaid > 0 ? amountAlreadyPaid : ''}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Leave as 0 if you haven't paid anything yet
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handlePaymentInfoComplete}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Calculator className="w-5 h-5 mr-2" />
                      Calculate Payment
                    </button>
                    <button
                      onClick={() => {
                        setAmountAlreadyPaid(0)
                        handlePaymentInfoComplete()
                      }}
                      className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Step Navigation */}
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <button
                  onClick={() => navigateToStep(3)}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Back to Review Courses
                </button>
                <span className="text-sm text-gray-500">Step 4 of 5</span>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <PaymentCalculator
                courseData={courseData}
                paymentSchemeData={paymentSchemeData}
                amountAlreadyPaid={amountAlreadyPaid}
                onCalculationComplete={handleCalculationComplete}
              />
              
              {/* Step Navigation */}
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div className="flex space-x-4">
                  <button
                    onClick={() => navigateToStep(4)}
                    className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    ← Back to Payment Tracking
                  </button>
                  <button
                    onClick={() => navigateToStep(3)}
                    className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Edit Courses & Waivers
                  </button>
                </div>
                <span className="text-sm text-gray-500">Step 5 of 5 - Complete!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
