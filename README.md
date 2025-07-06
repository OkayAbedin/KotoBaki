# KotoBaki - DIU Payment Calculator

<div align="center">
  <img src="./public/KotoBaki.png" alt="KotoBaki Logo" width="200" height="200" style="border-radius: 20px; margin-bottom: 20px;">
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-Educational-green?style=for-the-badge)](LICENSE)
  
  <p align="center">
    <strong>A modern, intuitive payment calculator for DIU students</strong>
  </p>
  
  <p align="center">
    Import your payment scheme data and get instant, accurate fee calculations with smart course recognition
  </p>
  
  [🚀 Live Demo](#) • [📖 Documentation](#how-to-use) • [🐛 Report Bug](https://github.com/OkayAbedin/KotoBaki/issues) • [✨ Request Feature](https://github.com/OkayAbedin/KotoBaki/issues)
</div>

## ✨ Features

### 🔥 Core Features
- **📋 Direct Portal Integration** - Copy and paste data directly from DIU student portal
- **🧠 Smart Data Parsing** - Automatically parse tabular payment scheme and course data
- **🎯 Dynamic Course Recognition** - Intelligent course type detection from your specific data
- **💰 Individual Waivers** - Set custom waiver percentages (0-100% in 5% steps) per course
- **📊 Flexible Calculations** - Uses your actual payment scheme data for accurate results
- **📈 Detailed Breakdowns** - Comprehensive summaries based on your imported fee structure
- **💳 Payment Tracking** - Track paid amounts and remaining balances
- **📱 Responsive Design** - Modern, mobile-first UI with step-by-step wizard

### 🎨 UI/UX Highlights
- **✨ Glassmorphism Design** - Modern glass-effect cards with backdrop blur
- **🌈 Gradient Backgrounds** - Beautiful color gradients throughout the interface
- **🎭 Smooth Animations** - Fluid transitions and hover effects
- **📐 Adaptive Layout** - Responsive design that works on all devices
- **🔄 Step Tracker** - Visual progress indicator for the calculation process

## 🏗️ Technology Stack

### Frontend
- **⚡ Next.js 15** - React framework with App Router
- **🔷 TypeScript** - Type-safe development
- **🎨 Tailwind CSS** - Utility-first CSS framework
- **🎯 Lucide React** - Beautiful icon library

### Development
- **📦 npm/yarn/pnpm** - Package management
- **🔍 ESLint** - Code linting
- **💅 Prettier** - Code formatting

## 💰 How Fee Calculation Works

### 📋 Dynamic Fee Structure
The application doesn't use a fixed fee structure. Instead, it:
- **📊 Imports Your Data** - Uses the payment scheme data you copy from your DIU student portal
- **🧠 Smart Recognition** - Automatically categorizes courses based on their names and codes
- **� Flexible Calculations** - Calculates fees based on your specific semester's payment structure

### 📚 Course Type Detection
The app automatically detects course types from your data:
- **Core Theory** - Regular theory courses from your department
- **Core Lab** - Laboratory courses (detected by "Lab" in title/code)
- **GED Lab** - General Education lab courses
- **General Course** - Non-departmental courses (English, Bangladesh Studies, etc.)
- **Project/Internship** - Final year projects, thesis, internships

### 💳 Payment Calculation Features
- **📅 Registration Fees** - Extracted from your payment scheme data
- **📝 Tuition Fees** - Calculated per credit based on course types from your data
- **🎯 Individual Waivers** - Apply custom waiver percentages to each course
- **📊 Automatic Breakdown** - Shows detailed payment schedule and amounts

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.0 or higher
- **npm**, **yarn**, or **pnpm**

### 📥 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/OkayAbedin/KotoBaki.git
   cd KotoBaki
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application running.

## 📖 How to Use

### Step 1: Import Payment Scheme Data
1. Go to your DIU student portal
2. Navigate to the payment scheme section
3. Copy the payment scheme table data
4. Paste it into the application's data input field

### Step 2: Import Course Registration Data
1. Copy your registered courses data from the portal
2. Paste it into the course registration field
3. The application will automatically parse and categorize your courses

### Step 3: Configure Waivers
1. Set individual waiver percentages for each course (0-100% in 5% increments)
2. The system automatically calculates waiver amounts

### Step 4: View Results
1. Review your detailed payment breakdown
2. See registration fees, tuition fees, and waiver applications
3. Track payment due dates and amounts

## 📁 Project Structure

```
KotoBaki/
├── 📁 src/
│   ├── 📁 app/                 # Next.js App Router
│   │   ├── 🎨 globals.css     # Global styles and Tailwind
│   │   ├── 📄 layout.tsx      # Root layout component
│   │   └── 🏠 page.tsx        # Main dashboard page
│   ├── 📁 components/         # Reusable React components
│   │   ├── 📝 CourseEditor.tsx    # Course editing interface
│   │   ├── 📊 DirectEntry.tsx     # Data import interface
│   │   └── 💰 PaymentCalculator.tsx # Payment calculation display
│   └── 📁 types/             # TypeScript definitions
│       └── 📋 index.ts       # Shared type definitions
├── 📁 public/                # Static assets
│   ├── 🖼️ KotoBaki.png       # Application logo
│   └── 🔍 favicon.ico        # Browser favicon
├── ⚙️ next.config.js         # Next.js configuration
├── 🎨 tailwind.config.js     # Tailwind CSS configuration
├── 📦 package.json           # Dependencies and scripts
└── 📖 README.md              # You are here!
```

## 🖼️ Screenshots

### 🏠 Dashboard
The main interface featuring the modern glassmorphism design with step tracker.

### 📊 Payment Calculator
Detailed breakdown of fees, waivers, and payment schedule.

### 📝 Course Editor
Interactive course management with drag-and-drop functionality.

*Screenshots coming soon...*

## 🤝 Contributing

We welcome contributions from the DIU community! Here's how you can help:

### 🔧 Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### 🐛 Reporting Issues
- Use the [GitHub Issues](https://github.com/OkayAbedin/KotoBaki/issues) page
- Provide detailed reproduction steps
- Include screenshots when applicable

### 💡 Feature Requests
- Check existing issues first
- Provide clear use cases
- Explain the benefit to DIU students

## 📊 Roadmap

- [ ] 🔐 User authentication and profile management
- [ ] 💾 Save calculation history
- [ ] 📱 Progressive Web App (PWA) support
- [ ] 🌐 Multi-language support (Bengali/English)
- [ ] 📈 Payment analytics and insights
- [ ] 🔄 Real-time fee structure updates
- [ ] 📧 Email/SMS payment reminders

## 🛠️ Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## 📄 License

This project is created for educational purposes for DIU students. Please refer to the [LICENSE](LICENSE) file for more information.

## 🙏 Acknowledgments

- **Daffodil International University** - For providing the educational framework
- **DIU Academic Departments** - For the diverse fee structures and academic guidance
- **Open Source Community** - For the amazing tools and libraries
- **Contributors** - For making this project better

## 📞 Support

- **📧 Email**: Create an issue on GitHub
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/OkayAbedin/KotoBaki/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/OkayAbedin/KotoBaki/discussions)

## ⚠️ Disclaimer

This application uses the payment scheme data that you import from your DIU student portal. It does not store or assume any fixed fee structure. Fee amounts, course types, and payment schedules are based entirely on your imported data and may vary by batch, semester, and university policies. Always verify calculations with official university sources.

---

<div align="center">
  <p><strong>Made with ❤️ by Minhaz for the DIU Community</strong></p>
  
  ⭐ **Star this repository if it helped you!** ⭐
  
  [🔝 Back to Top](#kotobaki---diu-payment-calculator)
</div>
