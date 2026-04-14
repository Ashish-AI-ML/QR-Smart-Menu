/**
 * Generate a URL-safe slug from a restaurant name.
 * Rules: lowercase, hyphen-separated, no special characters.
 * Example: "Spice Garden - Mumbai" → "spice-garden-mumbai"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, ""); // Trim hyphens from edges
}

/**
 * Generate a unique short code for QR codes.
 * Format: 8 alphanumeric characters.
 */
export function generateQrCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
