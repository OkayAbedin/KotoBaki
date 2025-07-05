<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a Next.js TypeScript web application for calculating DIU CSE student payment fees. The application features:

- Modern React with TypeScript and Tailwind CSS
- Image upload and OCR processing using Tesseract.js
- Automated course data extraction from uploaded images
- Payment calculation with waiver support
- Responsive design with step-by-step wizard interface

Key components:
- `ImageUpload`: Handles image upload and OCR text extraction
- `PaymentCalculator`: Calculates and displays payment breakdown
- Course data types defined in `src/types/index.ts`

The app follows DIU CSE fee structure:
- Registration Fee: ৳13,500 (fixed)
- Core Theory: ৳4,900 per credit
- Core Lab/GED Lab: ৳5,000 per credit  
- General Course: ৳3,300 per credit
- Project/Internship: ৳3,200 per credit

Payment structure:
- Upfront: Registration fee + 50% tuition (after waiver)
- Before exam: Remaining 50% tuition
