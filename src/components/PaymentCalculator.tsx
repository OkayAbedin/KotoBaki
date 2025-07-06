'use client'

import { useEffect, useState, useCallback } from 'react'
import { Calculator, DollarSign, FileText, CreditCard } from 'lucide-react'
import { CourseData, PaymentResult, RegistrationFeesBreakdown, TuitionRates } from '@/types'

interface PaymentCalculatorProps {
  courseData: CourseData[]
  paymentSchemeData: any[] // Payment scheme data from DirectEntry
  amountAlreadyPaid?: number // Amount already paid during registration
  onCalculationComplete: (result: PaymentResult) => void
}

export default function PaymentCalculator({ 
  courseData, 
  paymentSchemeData,
  amountAlreadyPaid = 0,
  onCalculationComplete 
}: PaymentCalculatorProps) {
  const [result, setResult] = useState<PaymentResult | null>(null)
  const [registrationFees, setRegistrationFees] = useState<RegistrationFeesBreakdown>({
    campusDevelopmentFee: 0,
    labFee: 0,
    extraCurricularFee: 0,
    semesterFee: 0,
    total: 0
  })
  const [tuitionRates, setTuitionRates] = useState<TuitionRates>({})

  useEffect(() => {
    processPaymentScheme()
  }, [paymentSchemeData])

  useEffect(() => {
    if (courseData.length > 0 && Object.keys(tuitionRates).length > 0) {
      calculatePayment()
    }
  }, [courseData, registrationFees, tuitionRates, amountAlreadyPaid])

  // Process payment scheme data to extract registration fees and tuition rates
  const processPaymentScheme = useCallback(() => {
    if (!paymentSchemeData || paymentSchemeData.length === 0) return

    const regFees: RegistrationFeesBreakdown = {
      campusDevelopmentFee: 0,
      labFee: 0,
      extraCurricularFee: 0,
      semesterFee: 0,
      total: 0
    }
    const rates: TuitionRates = {}

    paymentSchemeData.forEach((item: any) => {
      const name = item.paymentName?.toLowerCase() || ''
      
      // Extract registration fees (only these 4 items count as registration)
      if (name.includes('campus development')) {
        regFees.campusDevelopmentFee = item.amount || 0
      } else if (name.includes('lab fee')) {
        regFees.labFee = item.amount || 0
      } else if (name.includes('extra curricular') || name.includes('extra curriculam')) {
        regFees.extraCurricularFee = item.amount || 0
      } else if (name.includes('semester fee')) {
        regFees.semesterFee = item.amount || 0
      }
      
      // Extract tuition rates per course category
      if (name.includes('tuition fee') && item.courseCategory) {
        rates[item.courseCategory] = item.amount || 0
      }
    })

    regFees.total = regFees.campusDevelopmentFee + regFees.labFee + regFees.extraCurricularFee + regFees.semesterFee
    
    setRegistrationFees(regFees)
    setTuitionRates(rates)
  }, [paymentSchemeData])

  const calculatePayment = useCallback(() => {
    let tuitionFeeTotal = 0
    let tuitionFeeTotalAfterWaiver = 0
    let totalWaiverAmount = 0
    
    const tuitionBreakdown: any[] = []
    const registrationBreakdown = [
      { name: 'Campus Development Fee', amount: registrationFees.campusDevelopmentFee },
      { name: 'Lab Fee', amount: registrationFees.labFee },
      { name: 'Extra Curricular Fee', amount: registrationFees.extraCurricularFee },
      { name: 'Semester Fee', amount: registrationFees.semesterFee }
    ]

    // Calculate tuition fee for each course
    courseData.forEach(course => {
      const ratePerCredit = tuitionRates[course.type] || 0
      const feeBeforeWaiver = ratePerCredit * course.credits
      const waiverAmount = (feeBeforeWaiver * course.waiverPercentage) / 100
      const feeAfterWaiver = feeBeforeWaiver - waiverAmount

      tuitionFeeTotal += feeBeforeWaiver
      tuitionFeeTotalAfterWaiver += feeAfterWaiver
      totalWaiverAmount += waiverAmount

      tuitionBreakdown.push({
        code: course.code,
        title: course.title,
        credits: course.credits,
        type: course.type,
        category: course.type, // Same as type for now
        ratePerCredit,
        feeBeforeWaiver,
        waiverPercentage: course.waiverPercentage,
        waiverAmount,
        feeAfterWaiver
      })
    })

    const totalFeeWithoutWaiver = registrationFees.total + tuitionFeeTotal
    const totalFeeWithWaiver = registrationFees.total + tuitionFeeTotalAfterWaiver
    const remainingAmount = Math.max(0, totalFeeWithWaiver - amountAlreadyPaid)
    const overpaid = Math.max(0, amountAlreadyPaid - totalFeeWithWaiver)

    const paymentResult: PaymentResult = {
      registrationFees,
      tuitionRates,
      registrationFeeTotal: registrationFees.total,
      tuitionFeeTotal,
      tuitionFeeTotalAfterWaiver,
      totalWaiverAmount,
      totalFeeWithoutWaiver,
      totalFeeWithWaiver,
      amountAlreadyPaid,
      remainingAmount,
      overpaid,
      registrationFeeBreakdown: registrationBreakdown,
      tuitionFeeBreakdown: tuitionBreakdown
    }

    setResult(paymentResult)
    onCalculationComplete(paymentResult)
  }, [courseData, registrationFees, tuitionRates, amountAlreadyPaid, onCalculationComplete])

  if (!result) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-200/50 shadow-2xl shadow-gray-200/50 p-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent shadow-lg"></div>
          <span className="ml-6 text-gray-700 font-semibold text-lg">Calculating fees...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-200/50 shadow-2xl shadow-gray-200/50 p-8">
        <div className="flex items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mr-6 shadow-xl shadow-green-500/30">
            <Calculator className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Calculation Results</h2>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6 rounded-3xl text-center border border-blue-200 shadow-xl shadow-blue-200/50 hover:shadow-2xl hover:shadow-blue-300/60 transition-all duration-300 transform hover:scale-105">
            <div className="text-sm text-blue-700 mb-3 font-semibold">Registration Fee</div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-900">৳{result.registrationFeeTotal.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 via-green-100 to-green-200 p-6 rounded-3xl text-center border border-green-200 shadow-xl shadow-green-200/50 hover:shadow-2xl hover:shadow-green-300/60 transition-all duration-300 transform hover:scale-105">
            <div className="text-sm text-green-700 mb-3 font-semibold">Tuition (After Waiver)</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-900">৳{result.tuitionFeeTotalAfterWaiver.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 p-6 rounded-3xl text-center border border-purple-200 shadow-xl shadow-purple-200/50 hover:shadow-2xl hover:shadow-purple-300/60 transition-all duration-300 transform hover:scale-105">
            <div className="text-sm text-purple-700 mb-3 font-semibold">Total Waiver</div>
            <div className="text-2xl sm:text-3xl font-bold text-purple-900">৳{result.totalWaiverAmount.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-6 rounded-3xl text-center border border-gray-200 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-300/60 transition-all duration-300 transform hover:scale-105">
            <div className="text-sm text-gray-700 mb-3 font-semibold">Total Due</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">৳{result.totalFeeWithWaiver.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdowns */}
      <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        {/* Registration Fee Breakdown */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-200/50 shadow-2xl shadow-gray-200/50 p-6">
          <h3 className="font-bold mb-6 flex items-center text-gray-900 text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-3 shadow-lg shadow-blue-500/30">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            Registration Fee Breakdown
          </h3>
          <div className="space-y-3">
            {result.registrationFeeBreakdown.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl shadow-md shadow-gray-200/50">
                <span className="text-sm font-medium text-gray-700 truncate mr-2">{item.name}:</span>
                <span className="font-bold text-gray-900 text-sm whitespace-nowrap">৳{item.amount.toLocaleString()}</span>
              </div>
            ))}
            <hr className="my-4 border-gray-200" />
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200 shadow-lg shadow-blue-200/50">
              <span className="font-bold text-blue-800 text-sm">Total Registration Fee:</span>
              <span className="font-bold text-blue-900 text-sm whitespace-nowrap">৳{result.registrationFeeTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Tuition Fee Breakdown */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-200/50 shadow-2xl shadow-gray-200/50 p-6">
          <h3 className="font-bold mb-6 flex items-center text-gray-900 text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mr-3 shadow-lg shadow-green-500/30">
              <FileText className="w-4 h-4 text-white" />
            </div>
            Tuition Fee Breakdown
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {result.tuitionFeeBreakdown.map((course, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-l-4 border-green-500 shadow-md shadow-gray-200/50">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm truncate">{course.code}</div>
                    <div className="text-xs text-gray-600 line-clamp-2">{course.title}</div>
                    <div className="text-xs text-gray-500">
                      {course.credits} credits × ৳{course.ratePerCredit.toLocaleString()} ({course.type})
                    </div>
                  </div>
                  <div className="text-left sm:text-right sm:ml-2 flex-shrink-0">
                    <div className="font-bold text-gray-900 text-sm">৳{course.feeAfterWaiver.toLocaleString()}</div>
                    {course.waiverPercentage > 0 && (
                      <div className="text-xs text-green-600 font-medium">
                        {course.waiverPercentage}% waiver: -৳{course.waiverAmount.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border border-green-200 shadow-lg shadow-green-200/50 mt-4">
              <span className="font-bold text-green-800 text-sm">Total Tuition:</span>
              <span className="font-bold text-green-900 text-sm whitespace-nowrap">৳{result.tuitionFeeTotalAfterWaiver.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      {amountAlreadyPaid > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-200/50 shadow-2xl shadow-gray-200/50 p-6">
          <h3 className="font-bold mb-6 flex items-center text-gray-900 text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-3 shadow-lg shadow-purple-500/30">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            Your Payment Status
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl text-center border border-gray-200 shadow-lg shadow-gray-200/50">
              <div className="text-sm text-gray-600 mb-2 font-medium">Total Amount Due</div>
              <div className="text-lg font-bold text-gray-800">
                ৳{result.totalFeeWithWaiver.toLocaleString()}
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl text-center border border-green-200 shadow-lg shadow-green-200/50">
              <div className="text-sm text-green-600 mb-2 font-medium">Amount Already Paid</div>
              <div className="text-lg font-bold text-green-700">
                ৳{amountAlreadyPaid.toLocaleString()}
              </div>
            </div>
            
            <div className={`p-4 rounded-2xl text-center border shadow-lg ${
              result.remainingAmount! > 0 
                ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 shadow-red-200/50' 
                : result.overpaid! > 0 
                ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-blue-200/50' 
                : 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-green-200/50'
            }`}>
              <div className="text-sm text-gray-600 mb-2 font-medium">
                {result.remainingAmount! > 0 ? 'Still Owed' : result.overpaid! > 0 ? 'Overpaid' : 'Fully Paid'}
              </div>
              <div className={`text-lg font-bold ${
                result.remainingAmount! > 0 ? 'text-red-700' : result.overpaid! > 0 ? 'text-blue-700' : 'text-green-700'
              }`}>
                ৳{(result.remainingAmount! || result.overpaid! || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {result.overpaid! > 0 && (
            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-lg shadow-blue-200/50">
              <h4 className="font-bold text-blue-800 mb-3 flex items-center text-base">
                <span className="mr-2">ℹ️</span>
                Overpayment Notice:
              </h4>
              <p className="text-sm text-blue-700">
                You have paid <strong>৳{result.overpaid!.toLocaleString()}</strong> more than required. 
                This amount will be adjusted in your next semester or you can request a refund from the accounts office.
              </p>
            </div>
          )}

          {result.remainingAmount === 0 && result.overpaid === 0 && (
            <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-2xl shadow-lg shadow-green-200/50">
              <h4 className="font-bold text-green-800 mb-3 flex items-center text-base">
                <span className="mr-2">✅</span>
                Payment Complete:
              </h4>
              <p className="text-sm text-green-700">
                Congratulations! You have paid the exact amount required for this semester.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modern Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-6">
        <button
          onClick={() => window.print()}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl shadow-blue-500/30 flex items-center justify-center"
        >
          <FileText className="w-5 h-5 mr-3" />
          Print Summary
        </button>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl shadow-gray-500/30"
        >
          Start Over
        </button>
      </div>
    </div>
  )
}
