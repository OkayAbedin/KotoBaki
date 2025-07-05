// Advanced table parsing utilities
export interface TableCell {
  text: string
  confidence: number
  row: number
  col: number
}

export interface TableRow {
  cells: string[]
  confidence: number
}

export class TableParser {
  static parseTable(ocrResult: any): TableRow[] {
    // If we have word-level data with bounding boxes
    if (ocrResult.words && ocrResult.words.length > 0) {
      return this.parseWithBoundingBoxes(ocrResult.words)
    }
    
    // Fallback to line-based parsing
    return this.parseWithLines(ocrResult.text)
  }

  private static parseWithBoundingBoxes(words: any[]): TableRow[] {
    const rows: TableRow[] = []
    
    // Group words by approximate Y coordinate (rows)
    const rowGroups = this.groupWordsByRow(words)
    
    for (const rowWords of rowGroups) {
      // Sort words in each row by X coordinate (left to right)
      rowWords.sort((a, b) => a.bbox.x0 - b.bbox.x0)
      
      // Group words into columns based on X positioning
      const cells = this.groupWordsIntoColumns(rowWords)
      
      if (cells.length > 0) {
        rows.push({
          cells: cells.map(cell => cell.join(' ')),
          confidence: this.calculateRowConfidence(rowWords)
        })
      }
    }
    
    return rows
  }

  private static groupWordsByRow(words: any[]): any[][] {
    const rowTolerance = 10 // pixels
    const rows: any[][] = []
    
    for (const word of words) {
      const wordY = word.bbox.y0
      let addedToRow = false
      
      // Try to add to existing row
      for (const row of rows) {
        const rowY = row[0].bbox.y0
        if (Math.abs(wordY - rowY) <= rowTolerance) {
          row.push(word)
          addedToRow = true
          break
        }
      }
      
      // Create new row if needed
      if (!addedToRow) {
        rows.push([word])
      }
    }
    
    // Sort rows by Y coordinate (top to bottom)
    rows.sort((a, b) => a[0].bbox.y0 - b[0].bbox.y0)
    
    return rows
  }

  private static groupWordsIntoColumns(rowWords: any[]): string[][] {
    const columnTolerance = 50 // pixels
    const columns: string[][] = []
    
    for (const word of rowWords) {
      const wordX = word.bbox.x0
      let addedToColumn = false
      
      // Try to add to existing column
      for (let i = 0; i < columns.length; i++) {
        // Estimate column position from first word
        const estimatedColumnX = this.estimateColumnPosition(columns[i], rowWords)
        if (Math.abs(wordX - estimatedColumnX) <= columnTolerance) {
          columns[i].push(word.text)
          addedToColumn = true
          break
        }
      }
      
      // Create new column if needed
      if (!addedToColumn) {
        columns.push([word.text])
      }
    }
    
    return columns
  }

  private static estimateColumnPosition(column: string[], allWords: any[]): number {
    // Find the first word in this column from allWords to get its X position
    if (column.length === 0 || allWords.length === 0) return 0
    
    const firstWordInColumn = column[0]
    const matchingWord = allWords.find(word => word.text === firstWordInColumn)
    
    return matchingWord ? matchingWord.bbox.x0 : 0
  }

  private static calculateRowConfidence(words: any[]): number {
    if (words.length === 0) return 0
    return words.reduce((sum, word) => sum + word.confidence, 0) / words.length
  }

  private static parseWithLines(text: string): TableRow[] {
    const rows: TableRow[] = []
    const lines = text.split('\n').filter(line => line.trim())
    
    for (const line of lines) {
      // Detect table-like patterns
      const cells = this.extractCellsFromLine(line)
      
      if (cells.length > 1) { // At least 2 columns to be considered a table row
        rows.push({
          cells: cells,
          confidence: 0.8 // Default confidence for line-based parsing
        })
      }
    }
    
    return rows
  }

  private static extractCellsFromLine(line: string): string[] {
    // Method 1: Split by multiple spaces (common in tables)
    let cells = line.split(/\s{2,}/).filter(cell => cell.trim())
    
    if (cells.length < 2) {
      // Method 2: Split by tabs
      cells = line.split('\t').filter(cell => cell.trim())
    }
    
    if (cells.length < 2) {
      // Method 3: Pattern-based splitting for specific formats
      cells = this.patternBasedSplit(line)
    }
    
    return cells.map(cell => cell.trim())
  }

  private static patternBasedSplit(line: string): string[] {
    const cells = []
    
    // Pattern for course table: Course Code | Course Title | Credits
    const coursePattern = /^(\w+\d+)\s+(.+?)\s+(\d+)\s*(?:Credit|CR)?/i
    const courseMatch = line.match(coursePattern)
    
    if (courseMatch) {
      return [courseMatch[1], courseMatch[2], courseMatch[3]]
    }
    
    // Pattern for payment table: Name | Amount
    const paymentPattern = /^(.+?)\s+(\d{4,6})$/
    const paymentMatch = line.match(paymentPattern)
    
    if (paymentMatch) {
      return [paymentMatch[1], paymentMatch[2]]
    }
    
    // Fallback: split by significant gaps
    return line.split(/\s{3,}/).filter(cell => cell.trim())
  }
}

// Specialized parsers for different table types
export class CourseTableParser {
  static parse(tableRows: TableRow[]): any[] {
    const courses = []
    
    for (const row of tableRows) {
      if (row.cells.length >= 3) { // Need at least code, title, credits
        const course = this.parseRowToCourse(row.cells)
        if (course) {
          courses.push(course)
        }
      }
    }
    
    return courses
  }

  private static parseRowToCourse(cells: string[]): any | null {
    const [code, title, ...rest] = cells
    
    // Find course code
    const codeMatch = code.match(/\b([A-Z]{2,4}\d{3})\b/)
    if (!codeMatch) return null
    
    // Find credits
    let credits = 3 // default
    for (const cell of rest) {
      const creditMatch = cell.match(/\b([1-6])\b/)
      if (creditMatch) {
        credits = parseInt(creditMatch[1])
        break
      }
    }
    
    return {
      code: codeMatch[1],
      title: title || 'Unknown Course',
      credits: credits,
      type: this.determineCourseType(codeMatch[1], title)
    }
  }

  private static determineCourseType(code: string, title: string): string {
    const lowerTitle = title.toLowerCase()
    const lowerCode = code.toLowerCase()
    
    if (lowerTitle.includes('lab') || lowerCode.includes('lab')) {
      if (lowerTitle.includes('ged')) return 'GED Lab'
      return 'Core Lab'
    }
    
    if (lowerTitle.includes('project') || lowerTitle.includes('thesis') || 
        lowerTitle.includes('fyp') || code.includes('499')) {
      return 'Project/Internship'
    }
    
    if (lowerTitle.includes('general') || lowerTitle.includes('ged')) {
      return 'General Course'
    }
    
    return 'Core Theory'
  }
}

export class PaymentTableParser {
  static parse(tableRows: TableRow[]): any[] {
    const payments = []
    
    for (const row of tableRows) {
      if (row.cells.length >= 2) { // Need at least name and amount
        const payment = this.parseRowToPayment(row.cells)
        if (payment) {
          payments.push(payment)
        }
      }
    }
    
    return payments
  }

  private static parseRowToPayment(cells: string[]): any | null {
    // Find amount (usually the last numeric cell)
    let amount = 0
    let name = ''
    
    for (let i = cells.length - 1; i >= 0; i--) {
      const cell = cells[i]
      const amountMatch = cell.match(/\b(\d{3,6})\b/)
      
      if (amountMatch && amount === 0) {
        amount = parseInt(amountMatch[1])
        name = cells.slice(0, i).join(' ').trim()
        break
      }
    }
    
    if (amount > 0 && name.length > 2) {
      return {
        name: name,
        amount: amount,
        type: this.categorizePaymentType(name)
      }
    }
    
    return null
  }

  private static categorizePaymentType(name: string): string {
    const lower = name.toLowerCase()
    if (lower.includes('tuition')) return 'tuition'
    if (lower.includes('admission')) return 'registration'
    if (lower.includes('lab')) return 'lab'
    if (lower.includes('semester')) return 'semester'
    return 'other'
  }
}
