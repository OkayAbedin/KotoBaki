# Table OCR Guide for DIU Payment Calculator

## Overview

This application now features advanced table OCR (Optical Character Recognition) capabilities specifically designed to handle tabular images like payment schemes and course registration tables. The system uses multiple parsing strategies to extract structured data from table images.

## How It Works

### 1. Advanced Table Parsing Pipeline

The application uses a multi-step approach:

1. **OCR Extraction**: Tesseract.js extracts raw text and word-level data with bounding boxes
2. **Intelligent Table Parsing**: Custom algorithms detect table structure using:
   - Bounding box coordinates (spatial positioning)
   - Line-based parsing (text patterns)
   - Pattern recognition (course codes, amounts, etc.)
3. **Data Cleaning**: Validates and standardizes extracted data
4. **Fallback Mechanisms**: Multiple parsing strategies ensure data extraction even with imperfect OCR

### 2. Table Structure Detection

The system can handle various table formats:

#### Payment Scheme Tables
- Detects payment names and amounts
- Categorizes payment types (tuition, registration, lab fees, etc.)
- Example: "Tuition Fee | 45000"

#### Course Registration Tables
- Extracts course codes, titles, and credits
- Determines course types (Core Theory, Lab, General, etc.)
- Example: "CSE110 | Computer Programming | 3"

## Using the Table OCR Features

### Method 1: Image Upload
1. Navigate to the payment scheme or course upload step
2. Follow the image quality tips provided
3. Upload a clear image of your table
4. The system will automatically process and extract data

### Method 2: Manual Entry (Fallback)
If OCR fails or for better accuracy:
1. Click "Manual Table Entry (Alternative)"
2. Enter data in the specified format:
   - Payment: `Name | Amount`
   - Courses: `Code | Title | Credits`
3. Click "Process Manual Entry"

### Method 3: Sample Data (Testing)
Use the "Load Sample Data" button to test with pre-configured data.

## Image Quality Tips

### For Best OCR Results:

#### Image Quality
- Use high resolution (300 DPI or higher)
- Ensure clear table borders/grid lines
- Avoid shadows, reflections, or glare
- Keep image straight (not skewed or rotated)

#### Table Structure
- Crop to show only the table area
- Include column headers if present
- Ensure text doesn't overlap cell borders
- Remove any background text or watermarks
- Use high contrast (dark text, light background)

### Example of Good vs Poor Images:

✅ **Good Image:**
- Clear table borders
- Well-separated text in cells
- High contrast
- Properly aligned

❌ **Poor Image:**
- Blurry or low resolution
- Skewed or rotated
- Poor lighting/shadows
- Text overlapping borders

## Supported Table Formats

### Payment Scheme Tables
The system recognizes these patterns:
```
SL | Payment Name | Course Type | Course Category | Amount
1  | Admission Fee | Others     | Others         | 15000
2  | Tuition Fee   | Theory     | Core           | 4900
```

### Course Registration Tables
The system recognizes these patterns:
```
SL | Course Code | Course Title | Credit | Type | Section | Teacher
1  | CSE331      | Compiler Design | 3   | REGULAR | 61_E | Mushfiqur Rahman
```

## Technical Implementation

### Key Components

1. **TableParser Class** (`src/utils/tableParser.ts`)
   - Main parsing logic with bounding box analysis
   - Multiple parsing strategies (spatial, line-based, pattern-based)

2. **CourseTableParser** 
   - Specialized for course registration tables
   - Automatic course type detection
   - Credit extraction and validation

3. **PaymentTableParser**
   - Specialized for payment scheme tables
   - Amount detection and categorization
   - Payment type classification

4. **TableOCR Component** (`src/components/TableOCR.tsx`)
   - User interface for table upload and processing
   - Progress tracking and error handling
   - Manual entry fallback option

### Parsing Strategies

1. **Bounding Box Method**: Uses spatial coordinates to group words into rows and columns
2. **Line-Based Method**: Analyzes text patterns and spacing
3. **Pattern Recognition**: Uses regex to identify specific formats (course codes, amounts)

## Troubleshooting

### Common Issues and Solutions

#### OCR Returns No Data
- **Cause**: Poor image quality or complex table structure
- **Solution**: Use manual entry or improve image quality

#### Incorrect Data Extraction
- **Cause**: Unusual table format or OCR misreading
- **Solution**: Review extracted data and use manual editing

#### Missing Course Information
- **Cause**: OCR missed course codes or credits
- **Solution**: Use the course editor to add missing information

### Debug Information

The system logs detailed information to the browser console:
- Raw OCR text output
- Parsed table rows
- Structured data extraction
- Cleaning and validation steps

To view debug info:
1. Open browser Developer Tools (F12)
2. Check the Console tab during OCR processing

## Advanced Features

### Per-Course Waivers
After data extraction, you can set individual waivers for each course using the Course Editor.

### Course Type Detection
The system automatically categorizes courses:
- **Core Theory**: Regular CSE theory courses (₹4,900/credit)
- **Core Lab**: Lab courses (₹5,000/credit)
- **GED Lab**: General education labs (₹5,000/credit)
- **General Course**: Non-core courses (₹3,300/credit)
- **Project/Internship**: Final year projects (₹3,200/credit)

### Payment Categorization
Automatically categorizes payments:
- Registration fees
- Tuition fees (by course type)
- Lab fees
- Other institutional fees

## Future Enhancements

Planned improvements:
- Support for more complex table structures (merged cells, multi-line headers)
- Batch processing for multiple images
- Enhanced preprocessing (auto-rotation, contrast adjustment)
- Export functionality for extracted data

## Support

If you encounter issues:
1. Try improving image quality
2. Use manual entry as fallback
3. Check browser console for debug information
4. Use the sample data feature to test functionality
