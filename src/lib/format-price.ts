/**
 * Price formatting utility.
 *
 * Prices are stored as integers in paise (smallest INR unit).
 * ₹150.00 is stored as 15000.
 * ₹99 is stored as 9900.
 *
 * This module handles conversion from paise to display format.
 */

/**
 * Format price from paise to INR display string.
 *
 * @param paise - Price in paise (e.g., 15000 = ₹150)
 * @param showDecimals - Whether to show .00 for whole numbers
 * @returns Formatted price string (e.g., "₹150" or "₹150.00")
 */
export function formatPrice(paise: number, showDecimals = false): string {
  const rupees = paise / 100;

  if (showDecimals || rupees % 1 !== 0) {
    return `₹${rupees.toFixed(2)}`;
  }

  return `₹${Math.floor(rupees)}`;
}

/**
 * Format a discount percentage.
 *
 * @param originalPaise - Original price in paise
 * @param discountPaise - Discounted price in paise
 * @returns Discount percentage string (e.g., "20% off")
 */
export function formatDiscount(originalPaise: number, discountPaise: number): string {
  if (!discountPaise || discountPaise >= originalPaise) return "";
  const percent = Math.round(((originalPaise - discountPaise) / originalPaise) * 100);
  return `${percent}% off`;
}

/**
 * Convert rupees to paise for storage.
 *
 * @param rupees - Price in rupees (e.g., 150)
 * @returns Price in paise (e.g., 15000)
 */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Convert paise to rupees for display/editing.
 *
 * @param paise - Price in paise (e.g., 15000)
 * @returns Price in rupees (e.g., 150)
 */
export function toRupees(paise: number): number {
  return paise / 100;
}
