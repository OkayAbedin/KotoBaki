// Image preprocessing utilities for better OCR results on tabular data

export interface ImageProcessingOptions {
  enhanceContrast?: boolean
  denoiseImage?: boolean
  straightenImage?: boolean
  cropToTable?: boolean
}

export class ImageProcessor {
  
  /**
   * Preprocess an image to improve table OCR results
   */
  static async preprocessImage(imageFile: File, options: ImageProcessingOptions = {}): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        
        // Draw original image
        ctx.drawImage(img, 0, 0)
        
        // Apply preprocessing steps
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        
        if (options.enhanceContrast) {
          imageData = this.enhanceContrast(imageData)
        }
        
        if (options.denoiseImage) {
          imageData = this.denoiseImage(imageData)
        }
        
        // Put processed image back
        ctx.putImageData(imageData, 0, 0)
        
        // Convert back to file
        canvas.toBlob((blob) => {
          if (blob) {
            const processedFile = new File([blob], imageFile.name, {
              type: imageFile.type,
              lastModified: Date.now()
            })
            resolve(processedFile)
          } else {
            reject(new Error('Failed to create processed image'))
          }
        }, imageFile.type)
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(imageFile)
    })
  }
  
  /**
   * Enhance contrast for better text recognition
   */
  private static enhanceContrast(imageData: ImageData): ImageData {
    const data = imageData.data
    const factor = 1.5 // Contrast enhancement factor
    
    for (let i = 0; i < data.length; i += 4) {
      // Apply contrast enhancement to RGB channels
      data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128))     // Red
      data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128)) // Green
      data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128)) // Blue
      // Alpha channel (data[i + 3]) remains unchanged
    }
    
    return imageData
  }
  
  /**
   * Apply basic denoising
   */
  private static denoiseImage(imageData: ImageData): ImageData {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    const newData = new Uint8ClampedArray(data.length)
    
    // Simple 3x3 averaging filter for denoising
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4
        
        for (let c = 0; c < 3; c++) { // RGB channels
          let sum = 0
          let count = 0
          
          // Average with surrounding pixels
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const neighborIdx = ((y + dy) * width + (x + dx)) * 4 + c
              sum += data[neighborIdx]
              count++
            }
          }
          
          newData[idx + c] = Math.round(sum / count)
        }
        
        newData[idx + 3] = data[idx + 3] // Preserve alpha
      }
    }
    
    // Copy edges without modification
    for (let i = 0; i < data.length; i += 4) {
      const x = Math.floor(i / 4) % width
      const y = Math.floor(Math.floor(i / 4) / width)
      
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        newData[i] = data[i]
        newData[i + 1] = data[i + 1]
        newData[i + 2] = data[i + 2]
        newData[i + 3] = data[i + 3]
      }
    }
    
    return new ImageData(newData, width, height)
  }
  
  /**
   * Detect and straighten skewed table images
   */
  static detectSkewAngle(imageData: ImageData): number {
    // This is a simplified skew detection algorithm
    // In practice, you might want to use more sophisticated methods
    // like Hough Transform for line detection
    
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    
    // Convert to grayscale for edge detection
    const grayscale = new Uint8Array(width * height)
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
      grayscale[i / 4] = gray
    }
    
    // Simple edge detection (this is a placeholder)
    // Real implementation would use Sobel operator or similar
    let horizontalEdges = 0
    let verticalEdges = 0
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x
        
        // Horizontal gradient
        const hGrad = Math.abs(grayscale[idx - 1] - grayscale[idx + 1])
        // Vertical gradient
        const vGrad = Math.abs(grayscale[idx - width] - grayscale[idx + width])
        
        if (hGrad > 50) horizontalEdges++
        if (vGrad > 50) verticalEdges++
      }
    }
    
    // Return estimated skew angle (placeholder)
    return 0 // No skew detected in this simplified version
  }
  
  /**
   * Get image quality metrics
   */
  static analyzeImageQuality(imageData: ImageData): {
    contrast: number
    sharpness: number
    brightness: number
    recommendation: string
  } {
    const data = imageData.data
    let totalBrightness = 0
    let contrastSum = 0
    let sharpnessSum = 0
    const pixelCount = data.length / 4
    
    // Calculate basic metrics
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
      totalBrightness += brightness
      
      // Simple contrast calculation
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
      contrastSum += Math.abs(gray - 128)
    }
    
    const avgBrightness = totalBrightness / pixelCount
    const avgContrast = contrastSum / pixelCount
    
    // Generate recommendations
    let recommendation = 'Image quality looks good for OCR.'
    
    if (avgBrightness < 80) {
      recommendation = 'Image is too dark. Try increasing brightness or improving lighting.'
    } else if (avgBrightness > 200) {
      recommendation = 'Image is too bright. Try reducing exposure or avoiding overexposure.'
    } else if (avgContrast < 30) {
      recommendation = 'Low contrast detected. Try enhancing contrast or using better lighting.'
    }
    
    return {
      contrast: avgContrast,
      sharpness: sharpnessSum / pixelCount, // Placeholder
      brightness: avgBrightness,
      recommendation
    }
  }
}

// Utility functions for table structure detection
export class TableStructureDetector {
  
  /**
   * Detect if an image likely contains a table
   */
  static detectTableStructure(imageData: ImageData): {
    hasTable: boolean
    confidence: number
    detectedRows: number
    detectedColumns: number
  } {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    
    // Convert to grayscale
    const grayscale = new Uint8Array(width * height)
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
      grayscale[i / 4] = gray < 128 ? 0 : 255 // Binary threshold
    }
    
    // Detect horizontal lines (table rows)
    const horizontalLines = this.detectHorizontalLines(grayscale, width, height)
    
    // Detect vertical lines (table columns)
    const verticalLines = this.detectVerticalLines(grayscale, width, height)
    
    const hasTable = horizontalLines.length >= 2 && verticalLines.length >= 2
    const confidence = Math.min(0.9, (horizontalLines.length + verticalLines.length) / 10)
    
    return {
      hasTable,
      confidence,
      detectedRows: Math.max(0, horizontalLines.length - 1),
      detectedColumns: Math.max(0, verticalLines.length - 1)
    }
  }
  
  private static detectHorizontalLines(grayscale: Uint8Array, width: number, height: number): number[] {
    const lines: number[] = []
    const threshold = width * 0.7 // Line must span at least 70% of width
    
    for (let y = 0; y < height; y++) {
      let lineLength = 0
      
      for (let x = 0; x < width; x++) {
        const idx = y * width + x
        if (grayscale[idx] === 0) { // Dark pixel (line)
          lineLength++
        }
      }
      
      if (lineLength > threshold) {
        lines.push(y)
      }
    }
    
    return lines
  }
  
  private static detectVerticalLines(grayscale: Uint8Array, width: number, height: number): number[] {
    const lines: number[] = []
    const threshold = height * 0.7 // Line must span at least 70% of height
    
    for (let x = 0; x < width; x++) {
      let lineLength = 0
      
      for (let y = 0; y < height; y++) {
        const idx = y * width + x
        if (grayscale[idx] === 0) { // Dark pixel (line)
          lineLength++
        }
      }
      
      if (lineLength > threshold) {
        lines.push(x)
      }
    }
    
    return lines
  }
}
