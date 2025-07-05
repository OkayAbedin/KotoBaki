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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-700">Calculating fees...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center mb-4">
          <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center mr-3">
            <Calculator className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Payment Calculation Results</h2>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
          <div className="bg-blue-50 p-2 sm:p-3 rounded-lg text-center border border-blue-200">
            <div className="text-xs sm:text-sm text-blue-600 mb-1">Registration Fee</div>
            <div className="text-sm sm:text-base font-semibold text-blue-800">৳{result.registrationFeeTotal.toLocaleString()}</div>
          </div>
          <div className="bg-green-50 p-2 sm:p-3 rounded-lg text-center border border-green-200">
            <div className="text-xs sm:text-sm text-green-600 mb-1">Tuition (After Waiver)</div>
            <div className="text-sm sm:text-base font-semibold text-green-800">৳{result.tuitionFeeTotalAfterWaiver.toLocaleString()}</div>
          </div>
          <div className="bg-purple-50 p-2 sm:p-3 rounded-lg text-center border border-purple-200">
            <div className="text-xs sm:text-sm text-purple-600 mb-1">Total Waiver</div>
            <div className="text-sm sm:text-base font-semibold text-purple-800">৳{result.totalWaiverAmount.toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 p-2 sm:p-3 rounded-lg text-center border border-gray-200">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Due</div>
            <div className="text-sm sm:text-base font-semibold text-gray-800">৳{result.totalFeeWithWaiver.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdowns */}
      <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
        {/* Registration Fee Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <h3 className="font-semibold mb-3 flex items-center text-gray-900 text-sm sm:text-base">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-md flex items-center justify-center mr-2">
              <DollarSign className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
            </div>
            Registration Fee Breakdown
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {result.registrationFeeBreakdown.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-xs sm:text-sm text-gray-700 truncate mr-2">{item.name}:</span>
                <span className="font-medium text-gray-900 text-xs sm:text-sm whitespace-nowrap">৳{item.amount.toLocaleString()}</span>
              </div>
            ))}
            <hr className="my-2 sm:my-3 border-gray-200" />
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded border border-blue-200">
              <span className="font-medium text-blue-800 text-xs sm:text-sm">Total Registration Fee:</span>
              <span className="font-semibold text-blue-800 text-xs sm:text-sm whitespace-nowrap">৳{result.registrationFeeTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Tuition Fee Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <h3 className="font-semibold mb-3 flex items-center text-gray-900 text-sm sm:text-base">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 rounded-md flex items-center justify-center mr-2">
              <FileText className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
            </div>
            Tuition Fee Breakdown
          </h3>
          <div className="space-y-2 sm:space-y-3 max-h-80 overflow-y-auto">
            {result.tuitionFeeBreakdown.map((course, index) => (
              <div key={index} className="p-2 sm:p-3 bg-gray-50 rounded border-l-4 border-green-400">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-1 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{course.code}</div>
                    <div className="text-xs sm:text-sm text-gray-600 line-clamp-2">{course.title}</div>
                    <div className="text-xs text-gray-500">
                      {course.credits} credits × ৳{course.ratePerCredit.toLocaleString()} ({course.type})
                    </div>
                  </div>
                  <div className="text-left sm:text-right sm:ml-2 flex-shrink-0">
                    <div className="font-medium text-gray-900 text-sm sm:text-base">৳{course.feeAfterWaiver.toLocaleString()}</div>
                    {course.waiverPercentage > 0 && (
                      <div className="text-xs text-green-600">
                        {course.waiverPercentage}% waiver: -৳{course.waiverAmount.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200 mt-2 sm:mt-3">
              <span className="font-medium text-green-800 text-xs sm:text-sm">Total Tuition:</span>
              <span className="font-semibold text-green-800 text-xs sm:text-sm whitespace-nowrap">৳{result.tuitionFeeTotalAfterWaiver.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      {amountAlreadyPaid > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <h3 className="font-semibold mb-3 flex items-center text-gray-900 text-sm sm:text-base">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-purple-600 rounded-md flex items-center justify-center mr-2">
              <CreditCard className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
            </div>
            Your Payment Status
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-3">
            <div className="p-2 sm:p-3 bg-gray-50 rounded-lg text-center border border-gray-200">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Amount Due</div>
              <div className="text-sm sm:text-base font-semibold text-gray-800">
                ৳{result.totalFeeWithWaiver.toLocaleString()}
              </div>
            </div>
            
            <div className="p-2 sm:p-3 bg-green-50 rounded-lg text-center border border-green-200">
              <div className="text-xs sm:text-sm text-green-600 mb-1">Amount Already Paid</div>
              <div className="text-sm sm:text-base font-semibold text-green-700">
                ৳{amountAlreadyPaid.toLocaleString()}
              </div>
            </div>
            
            <div className={`p-2 sm:p-3 rounded-lg text-center border ${
              result.remainingAmount! > 0 
                ? 'bg-red-50 border-red-200' 
                : result.overpaid! > 0 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">
                {result.remainingAmount! > 0 ? 'Still Owed' : result.overpaid! > 0 ? 'Overpaid' : 'Fully Paid'}
              </div>
              <div className={`text-sm sm:text-base font-semibold ${
                result.remainingAmount! > 0 ? 'text-red-700' : result.overpaid! > 0 ? 'text-blue-700' : 'text-green-700'
              }`}>
                ৳{(result.remainingAmount! || result.overpaid! || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {result.overpaid! > 0 && (
            <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center text-sm sm:text-base">
                <span className="mr-2">ℹ️</span>
                Overpayment Notice:
              </h4>
              <p className="text-xs sm:text-sm text-blue-700">
                You have paid <strong>৳{result.overpaid!.toLocaleString()}</strong> more than required. 
                This amount will be adjusted in your next semester or you can request a refund from the accounts office.
              </p>
            </div>
          )}

          {result.remainingAmount === 0 && result.overpaid === 0 && (
            <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2 flex items-center text-sm sm:text-base">
                <span className="mr-2">✅</span>
                Payment Complete:
              </h4>
              <p className="text-xs sm:text-sm text-green-700">
                Congratulations! You have paid the exact amount required for this semester.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Facebook-style Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-md font-medium transition-colors flex items-center justify-center text-sm sm:text-base"
        >
          <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Print Summary
        </button>
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-md font-medium transition-colors text-sm sm:text-base"
        >
          Start Over
        </button>
      </div>
    </div>
  )
}
