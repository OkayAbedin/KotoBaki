'use client'

import { useState } from 'react'
import { Upload, Calculator, FileText, Edit3, DollarSign, Check } from 'lucide-react'
import DirectEntry from '@/components/DirectEntry'
import PaymentCalculator from '@/components/PaymentCalculator'
import CourseEditor from '@/components/CourseEditor'
import { CourseData, PaymentResult } from '@/types'
import Image from 'next/image'

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg shadow-gray-200/50 border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/25">
                <Image 
                  src="/KotoBaki.png" 
                  alt="KotoBaki Logo" 
                  width={40} 
                  height={40}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KotoBaki?</h1>
                <p className="text-sm text-gray-600">Calculate your semester fees with ease</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Navigation */}
      <div className="bg-white/70 backdrop-blur-md border-b border-gray-200/50 shadow-md shadow-gray-200/30">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex justify-center">
            <div className="flex items-center space-x-8">
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
                      className={`relative w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                        step === stepInfo.number
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/30'
                          : completedSteps.includes(stepInfo.number)
                          ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-green-500/30'
                          : canNavigateToStep(stepInfo.number)
                          ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-gray-300/40'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-gray-200/30'
                      }`}
                    >
                      {completedSteps.includes(stepInfo.number) ? (
                        <Check size={20} />
                      ) : (
                        stepInfo.number
                      )}
                    </button>
                    <div className="mt-3 text-center">
                      <div className="text-sm font-semibold text-gray-800">{stepInfo.title}</div>
                      <div className="text-xs text-gray-600">{stepInfo.desc}</div>
                    </div>
                  </div>
                  {stepInfo.number < 5 && (
                    <div
                      className={`w-12 h-1 mx-4 rounded-full transition-all duration-300 ${
                        completedSteps.includes(stepInfo.number) 
                          ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-md shadow-green-500/30' 
                          : step > stepInfo.number 
                          ? 'bg-gradient-to-r from-blue-400 to-blue-500 shadow-md shadow-blue-500/30' 
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
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 p-8">
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
              </div>
              {/* Modern continue button */}
              {paymentSchemeData.length > 0 && (
                <div className="text-center">
                  <button
                    onClick={() => handlePaymentSchemeExtracted(paymentSchemeData)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl shadow-blue-500/30 inline-flex items-center"
                  >
                    Continue to Course Registration
                    <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 p-8">
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
                      return
                    }
                    
                    handleCoursesExtracted(courseData)
                  }}
                  title="Step 2: Import Course Registration"
                  tableType="courses"
                  existingData={courseData.length > 0 ? courseData : undefined}
                  preserveTextOnSuccess={true}
                />
              </div>
              
              {/* Modern continue button */}
              {courseData.length > 0 && (
                <div className="text-center">
                  <button
                    onClick={() => handleCoursesExtracted(courseData)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl shadow-blue-500/30 inline-flex items-center"
                  >
                    Continue to Review Courses
                    <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 p-8">
                <CourseEditor
                  initialCourses={courseData}
                  availableCourseTypes={Array.from(new Set(paymentSchemeData
                    .filter(item => item.paymentName === 'Tuition Fee')
                    .map(item => item.courseCategory)
                  ))}
                  onCoursesUpdated={handleCoursesUpdated}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200/50">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-blue-500/30">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Payment Tracking</h2>
                      <p className="text-sm text-gray-600">Track any payments you&apos;ve already made (optional)</p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="max-w-md mx-auto">
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Amount Already Paid (৳)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        placeholder="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg font-medium"
                        onChange={(e) => setAmountAlreadyPaid(parseInt(e.target.value) || 0)}
                        value={amountAlreadyPaid > 0 ? amountAlreadyPaid : ''}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Leave as 0 if you haven&apos;t paid anything yet
                      </p>
                    </div>

                    {/* Success state */}
                    {amountAlreadyPaid > 0 && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 mb-6 shadow-lg shadow-green-100/50">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-green-500/30">
                            <DollarSign className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-green-800">Payment Recorded</h3>
                            <p className="text-sm text-green-700">
                              Amount: <span className="font-bold">৳{amountAlreadyPaid.toLocaleString()}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-4">
                      <button
                        onClick={handlePaymentInfoComplete}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl shadow-blue-500/30 flex items-center justify-center"
                      >
                        <Calculator className="w-5 h-5 mr-2" />
                        Calculate Payment
                      </button>
                      <button
                        onClick={() => {
                          setAmountAlreadyPaid(0)
                          handlePaymentInfoComplete()
                        }}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-gray-500/30"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                </div>
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
