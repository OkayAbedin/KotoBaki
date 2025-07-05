export interface CourseData {
  code: string
  title: string
  credits: number
  type: string // Will be dynamically populated from payment scheme
  section?: string
  teacher?: string
  waiverPercentage: number // 0-100% in 5% intervals
}

export interface PaymentSchemeItem {
  sl: number
  paymentName: string
  courseType: string
  courseCategory: string
  amount: number
}


// Registration fee breakdown for each semester
export interface RegistrationFeesBreakdown {
  campusDevelopmentFee: number
  labFee: number
  extraCurricularFee: number
  semesterFee: number
  total: number
}


// Tuition fee rates per course type/category (from payment scheme)
export interface TuitionRates {
  [category: string]: number // e.g. 'Core', 'Core Lab', 'General Course', etc.
}


// Calculation result structure for UI
export interface PaymentResult {
  registrationFees: RegistrationFeesBreakdown
  tuitionRates: TuitionRates
  registrationFeeTotal: number
  tuitionFeeTotal: number
  tuitionFeeTotalAfterWaiver: number
  totalWaiverAmount: number
  totalFeeWithoutWaiver: number
  totalFeeWithWaiver: number
  amountAlreadyPaid?: number
  remainingAmount?: number
  overpaid?: number
  registrationFeeBreakdown: {
    name: string
    amount: number
  }[]
  tuitionFeeBreakdown: {
    code: string
    title: string
    credits: number
    type: string
    category: string
    ratePerCredit: number
    feeBeforeWaiver: number
    waiverPercentage: number
    waiverAmount: number
    feeAfterWaiver: number
  }[]
}

export interface FeesStructure {
  registrationFee: number
  fees: {
    [key: string]: number
  }
}
