/**
 * Cloudinary image URL helper.
 *
 * Generates optimized Cloudinary URLs from a public ID.
 * All images are auto-converted to WebP/AVIF and quality-optimized.
 *
 * Usage:
 *   getImageUrl("restaurants/chicken-biryani", { width: 400, height: 300, crop: "fill" })
 *   → "https://res.cloudinary.com/CLOUD/image/upload/f_auto,q_auto,w_400,h_300,c_fill/restaurants/chicken-biryani"
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";

export interface ImageOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "thumb" | "scale";
  quality?: "auto" | number;
  gravity?: "auto" | "face" | "center";
}

/**
 * Generate an optimized Cloudinary image URL from a public ID.
 * Returns empty string if no publicId is provided.
 */
export function getImageUrl(
  publicId: string | null | undefined,
  options: ImageOptions = {}
): string {
  if (!publicId) return "";

  // If it's a direct URL (like Unsplash), just return it to bypass Cloudinary demo limitations
  if (publicId.startsWith("http")) return publicId;

  const transforms = [
    "f_auto", // Auto WebP/AVIF based on browser
    options.quality ? `q_${options.quality}` : "q_auto",
    options.width ? `w_${options.width}` : null,
    options.height ? `h_${options.height}` : null,
    options.crop ? `c_${options.crop}` : null,
    options.gravity ? `g_${options.gravity}` : null,
  ]
    .filter(Boolean)
    .join(",");

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
}

/**
 * Preset transforms for common use cases.
 */
export const imagePresets = {
  /** Menu item thumbnail in card grid (400×300) */
  thumbnail: (publicId: string) =>
    getImageUrl(publicId, { width: 400, height: 300, crop: "fill", gravity: "auto" }),

  /** Item detail view (800×600) */
  detail: (publicId: string) =>
    getImageUrl(publicId, { width: 800, height: 600, crop: "fill", gravity: "auto" }),

  /** Restaurant banner (full width, 1200×400) */
  banner: (publicId: string) =>
    getImageUrl(publicId, { width: 1200, height: 400, crop: "fill", gravity: "auto" }),

  /** Restaurant logo (200×200) */
  logo: (publicId: string) =>
    getImageUrl(publicId, { width: 200, height: 200, crop: "fill", gravity: "face" }),

  /** Category icon (100×100) */
  categoryIcon: (publicId: string) =>
    getImageUrl(publicId, { width: 100, height: 100, crop: "fill" }),
} as const;
