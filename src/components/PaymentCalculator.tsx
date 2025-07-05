'use client'

import { useEffect, useState } from 'react'
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
  const processPaymentScheme = () => {
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
  }

  const calculatePayment = () => {
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
  }

  if (!result) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Calculating fees...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          <Calculator className="w-6 h-6 mr-3 text-blue-600" />
          Payment Calculation Results
        </h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-sm text-blue-600 mb-1">Registration Fee</div>
            <div className="text-xl font-bold text-blue-800">৳{result.registrationFeeTotal.toLocaleString()}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-sm text-green-600 mb-1">Tuition (After Waiver)</div>
            <div className="text-xl font-bold text-green-800">৳{result.tuitionFeeTotalAfterWaiver.toLocaleString()}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-sm text-purple-600 mb-1">Total Waiver</div>
            <div className="text-xl font-bold text-purple-800">৳{result.totalWaiverAmount.toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">Total Due</div>
            <div className="text-xl font-bold text-gray-800">৳{result.totalFeeWithWaiver.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Registration Fee Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
            Registration Fee Breakdown
          </h3>
          <div className="space-y-3">
            {result.registrationFeeBreakdown.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>{item.name}:</span>
                <span className="font-semibold">৳{item.amount.toLocaleString()}</span>
              </div>
            ))}
            <hr className="my-2" />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Registration Fee:</span>
              <span>৳{result.registrationFeeTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Tuition Fee Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-green-600" />
            Tuition Fee Breakdown
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {result.tuitionFeeBreakdown.map((course, index) => (
              <div key={index} className="border-b pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{course.code}</div>
                    <div className="text-sm text-gray-600">{course.title}</div>
                    <div className="text-xs text-gray-500">
                      {course.credits} credits × ৳{course.ratePerCredit.toLocaleString()} ({course.type})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">৳{course.feeAfterWaiver.toLocaleString()}</div>
                    {course.waiverPercentage > 0 && (
                      <div className="text-xs text-green-600">
                        {course.waiverPercentage}% waiver: -৳{course.waiverAmount.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-between font-semibold text-lg pt-2">
              <span>Total Tuition:</span>
              <span>৳{result.tuitionFeeTotalAfterWaiver.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      {amountAlreadyPaid > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
            Your Payment Status
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-1">Total Amount Due</div>
              <div className="text-xl font-bold text-gray-800">
                ৳{result.totalFeeWithWaiver.toLocaleString()}
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-1">Amount Already Paid</div>
              <div className="text-xl font-bold text-green-600">
                ৳{amountAlreadyPaid.toLocaleString()}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg text-center ${
              result.remainingAmount! > 0 ? 'bg-red-50' : result.overpaid! > 0 ? 'bg-blue-50' : 'bg-green-50'
            }`}>
              <div className="text-sm text-gray-600 mb-1">
                {result.remainingAmount! > 0 ? 'Still Owed' : result.overpaid! > 0 ? 'Overpaid' : 'Fully Paid'}
              </div>
              <div className={`text-xl font-bold ${
                result.remainingAmount! > 0 ? 'text-red-600' : result.overpaid! > 0 ? 'text-blue-600' : 'text-green-600'
              }`}>
                ৳{(result.remainingAmount! || result.overpaid! || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {result.remainingAmount! > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">💡 Next Steps:</h4>
              <p className="text-sm text-yellow-700">
                You still need to pay <strong>৳{result.remainingAmount!.toLocaleString()}</strong> to complete your registration. 
                Contact the accounts office or make the payment through the student portal.
              </p>
            </div>
          )}

          {result.overpaid! > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">ℹ️ Overpayment Notice:</h4>
              <p className="text-sm text-blue-700">
                You have paid <strong>৳{result.overpaid!.toLocaleString()}</strong> more than required. 
                This amount will be adjusted in your next semester or you can request a refund from the accounts office.
              </p>
            </div>
          )}

          {result.remainingAmount === 0 && result.overpaid === 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">✅ Payment Complete:</h4>
              <p className="text-sm text-green-700">
                Congratulations! You have paid the exact amount required for this semester.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FileText className="w-5 h-5 mr-2" />
          Print Summary
        </button>
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  )
}
