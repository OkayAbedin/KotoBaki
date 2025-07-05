'use client'

import { useState } from 'react'
import { Upload, Calculator, FileText, Edit3, DollarSign } from 'lucide-react'
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

  const handlePaymentSchemeExtracted = (data: any[]) => {
    setPaymentSchemeData(data)
    setStep(2)
  }

  const handleCoursesExtracted = (courses: CourseData[]) => {
    setCourseData(courses)
    setStep(3)
  }

  const handleCoursesUpdated = (courses: CourseData[]) => {
    setCourseData(courses)
    setStep(4)
  }

  const handlePaymentInfoComplete = () => {
    setStep(5)
  }

  const handleCalculationComplete = (result: PaymentResult) => {
    setPaymentResult(result)
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
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold transition-colors ${
                    step >= stepInfo.number
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                  }`}
                  title={stepInfo.title}
                >
                  <stepInfo.icon size={20} />
                </div>
                {stepInfo.number < 5 && (
                  <div
                    className={`w-16 h-1 transition-colors ${
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
            <DirectEntry
              onDataExtracted={(data: any[]) => {
                console.log('Payment scheme data extracted:', data)
                handlePaymentSchemeExtracted(data)
              }}
              title="Step 1: Import Payment Scheme"
              tableType="payment"
            />
          )}

          {step === 2 && (
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
            />
          )}

          {step === 3 && (
            <CourseEditor
              initialCourses={courseData}
              availableCourseTypes={paymentSchemeData
                .filter(item => item.paymentName === 'Tuition Fee')
                .map(item => item.courseCategory)
              }
              onCoursesUpdated={handleCoursesUpdated}
            />
          )}

          {step === 4 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <DollarSign className="w-6 h-6 mr-2 text-green-600" />
                Payment Tracking (Optional)
              </h2>
              <p className="text-gray-600 mb-6">
                If you've already made any payments for this semester, enter the amount below to track your remaining balance.
              </p>
              
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
                    value={amountAlreadyPaid || ''}
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
          )}

          {step === 5 && (
            <PaymentCalculator
              courseData={courseData}
              paymentSchemeData={paymentSchemeData}
              amountAlreadyPaid={amountAlreadyPaid}
              onCalculationComplete={handleCalculationComplete}
            />
          )}
        </div>
      </div>
    </div>
  )
}
