# DIU CSE Payment Calculator

A modern web application that helps Daffodil International University (DIU) Computer Science & Engineering students calculate their semester payment fees by copying data directly from their student portal.

## Features

- **Direct Portal Integration**: Copy and paste payment schemes and course registration data directly from DIU student portal
- **Smart Data Parsing**: Automatically parse tabular data from clipboard
- **Dynamic Course Types**: Course types loaded from payment scheme data
- **Individual Waivers**: Set waiver percentages (0-100% in 5% steps) per course
- **Accurate Fee Calculation**: Calculate exact fees based on current DIU CSE fee structure
- **Detailed Breakdowns**: Shows registration fees, tuition fees with/without waivers
- **Payment Tracking**: Track amount already paid and remaining balance
- **Modern UI**: Clean, responsive design with step-by-step wizard

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Icons**: Lucide React

## Fee Structure

### Registration Fee: ৳13,500 (Fixed)
- Campus Development Fee
- Lab Fee  
- Extra Curricular Fee
- Semester Fee

### Tuition Fees (Per Credit)
- **Core Theory**: ৳4,900
- **Core Lab**: ৳5,000
- **GED Lab**: ৳5,000
- **General Course**: ৳3,300
- **Project/Internship**: ৳3,200

### Payment Schedule
- **During Registration**: Registration Fee + 50% of Tuition (after waiver)
- **Before Final Exam**: Remaining 50% of Tuition

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd KotoBaki
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. **Upload Payment Scheme**: Upload a clear image of your payment scheme document
2. **Upload Course Registration**: Upload an image of your registered courses
3. **Enter Waiver**: Input your waiver percentage (if any)
4. **View Results**: Get detailed payment breakdown and schedule

## Project Structure

\`\`\`
src/
├── app/                 # Next.js app directory
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main page component
├── components/         # React components
│   ├── ImageUpload.tsx # Image upload and OCR
│   └── PaymentCalculator.tsx # Payment calculations
└── types/             # TypeScript type definitions
    └── index.ts       # Shared types
\`\`\`

## API Routes

This is a client-side application. All processing happens in the browser using Tesseract.js for OCR.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is for educational purposes for DIU CSE students.

## Support

If you encounter any issues or have questions, please create an issue in the repository.

---

**Note**: This application is designed specifically for DIU CSE students and uses the current fee structure. Fee amounts may vary by batch and semester.
