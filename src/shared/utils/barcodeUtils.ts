export function generateBarcode(value: string): string {
  // Simple barcode generation - in production, you might want to use a proper barcode library
  // For now, we'll just return the value as-is since react-barcode will handle the actual generation
  return value
}

export function validateBarcode(barcode: string): boolean {
  // Basic validation - check if it's a valid string and not empty
  return typeof barcode === "string" && barcode.trim().length > 0
}

export function formatBarcodeNumber(productId: string): string {
  // Generate a simple barcode number from product ID
  // In production, this might follow a specific format (EAN, UPC, etc.)
  const cleanId = productId.replace(/[^0-9]/g, "")
  const paddedId = cleanId.padStart(12, "0").slice(0, 12) // Ensure 12 digits for EAN-13 compatibility
  return paddedId
}
