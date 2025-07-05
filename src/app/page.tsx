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
  const [waiverPercentage, setWaiverPercentage] = useState(0)
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

  const handleWaiverSubmit = (waiver: number) => {
    setWaiverPercentage(waiver)
    setStep(4)
  }

  const handleAmountPaidSubmit = (amount: number) => {
    setAmountAlreadyPaid(amount)
    setStep(5)
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
            Calculate your semester fees by copying data from your student portal or entering manually
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4, 5].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    step >= stepNumber
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                  }`}
                >
                  {stepNumber === 1 && <Upload size={20} />}
                  {stepNumber === 2 && <FileText size={20} />}
                  {stepNumber === 3 && <Edit3 size={20} />}
                  {stepNumber === 4 && <DollarSign size={20} />}
                  {stepNumber === 5 && <Calculator size={20} />}
                </div>
                {stepNumber < 5 && (
                  <div
                    className={`w-16 h-1 ${
                      step > stepNumber ? 'bg-blue-600' : 'bg-gray-300'
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
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">Step 1: Import Payment Scheme</h2>
              <p className="text-gray-600 mb-6">
                Copy your payment scheme table from your student portal for accurate fee calculation
              </p>
              
              <DirectEntry
                onDataExtracted={(data: any[]) => {
                  console.log('Payment scheme data extracted:', data)
                  handlePaymentSchemeExtracted(data)
                }}
                title="Payment Scheme Data"
                tableType="payment"
              />
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">Step 2: Import Course Registration</h2>
              <p className="text-gray-600 mb-4">
                Copy course data from your student portal, enter manually, or use sample data
              </p>
              
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
                    alert('No courses found. Please try again or use sample data.')
                  }
                  
                  handleCoursesExtracted(courseData)
                }}
                title="Course Registration Data"
                tableType="courses"
              />
            </div>
          )}

          {step === 3 && (
            <CourseEditor
              initialCourses={courseData}
              availableCourseTypes={paymentSchemeData
                .filter(item => item.paymentName === 'Tuition Fee')
                .map(item => item.courseCategory)
              }
              onCoursesUpdated={(courses: CourseData[]) => {
                setCourseData(courses)
                setStep(4)
              }}
            />
          )}

          {step === 4 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">Step 4: Total Amount Already Paid</h2>
              <p className="text-gray-600 mb-6">
                How much money have you already paid in total? This includes registration fees, tuition payments, or any other amounts you&apos;ve paid for this semester.
              </p>
              
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount Paid So Far (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    placeholder="e.g., 25000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setAmountAlreadyPaid(parseInt(e.target.value) || 0)}
                    value={amountAlreadyPaid || ''}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter 0 if you haven&apos;t paid anything yet
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => handleAmountPaidSubmit(amountAlreadyPaid)}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Continue →
                  </button>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">💡 Common Payment Scenarios:</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <button
                      onClick={() => setAmountAlreadyPaid(0)}
                      className="p-2 bg-white border border-blue-200 rounded hover:bg-blue-100 transition-colors text-left"
                    >
                      ৳0 - Haven&apos;t paid anything yet
                    </button>
                    <button
                      onClick={() => setAmountAlreadyPaid(15000)}
                      className="p-2 bg-white border border-blue-200 rounded hover:bg-blue-100 transition-colors text-left"
                    >
                      ৳15,000 - Paid registration fees only
                    </button>
                    <button
                      onClick={() => setAmountAlreadyPaid(25000)}
                      className="p-2 bg-white border border-blue-200 rounded hover:bg-blue-100 transition-colors text-left"
                    >
                      ৳25,000 - Paid registration + some tuition
                    </button>
                    <button
                      onClick={() => setAmountAlreadyPaid(50000)}
                      className="p-2 bg-white border border-blue-200 rounded hover:bg-blue-100 transition-colors text-left"
                    >
                      ৳50,000 - Paid registration + partial tuition
                    </button>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    💡 Check your payment receipts or bank statements to get the exact amount
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <PaymentCalculator
              courseData={courseData}
              paymentSchemeData={paymentSchemeData}
              amountAlreadyPaid={amountAlreadyPaid}
              onCalculationComplete={setPaymentResult}
            />
          )}
        </div>
      </div>
    </div>
  )
}
