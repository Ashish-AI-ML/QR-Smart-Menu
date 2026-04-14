import PocketBase from "pocketbase";

// PocketBase instance URL — set via environment variable
const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090";

/**
 * Creates a new PocketBase client instance.
 * Each request should get its own instance to avoid auth state bleeding
 * between different users in server-side rendering.
 */
export function createPocketBase() {
  const pb = new PocketBase(POCKETBASE_URL);
  pb.autoCancellation(false); // Prevent auto-cancel in React StrictMode
  return pb;
}

/**
 * Singleton PocketBase instance for client-side use only.
 * Preserves auth state across page navigations in the browser.
 */
let clientPB: PocketBase | null = null;

export function getClientPB(): PocketBase {
  if (typeof window === "undefined") {
    // Server-side: always create fresh instance
    return createPocketBase();
  }

  // Client-side: reuse instance
  if (!clientPB) {
    clientPB = createPocketBase();

    // Load auth from localStorage if available
    const authData = localStorage.getItem("pb_auth");
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        clientPB.authStore.save(parsed.token, parsed.record);
      } catch {
        // Invalid auth data, ignore
      }
    }

    // Save auth changes to localStorage
    clientPB.authStore.onChange(() => {
      if (clientPB?.authStore.isValid) {
        localStorage.setItem(
          "pb_auth",
          JSON.stringify({
            token: clientPB.authStore.token,
            record: clientPB.authStore.record,
          })
        );
      } else {
        localStorage.removeItem("pb_auth");
      }
    });
  }

  return clientPB;
}

// Type definitions for PocketBase collections
export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string; // Cloudinary public ID
  banner: string; // Cloudinary public ID
  address: string;
  phone: string;
  themeColor: string;
  operatingHours: Record<string, string>;
  isActive: boolean;
  owner: string; // User relation ID
  created: string;
  updated: string;
}

export interface Category {
  id: string;
  restaurant: string; // Restaurant relation ID
  name: string;
  icon: string; // Cloudinary public ID or emoji
  displayOrder: number;
  isActive: boolean;
  created: string;
}

export interface MenuItem {
  id: string;
  category: string; // Category relation ID
  restaurant: string; // Restaurant relation ID
  name: string;
  description: string;
  price: number; // In paise (₹150 = 15000)
  discountPrice: number | null;
  image: string; // Cloudinary public ID
  dietaryTags: string[]; // ["veg", "non-veg", "vegan", "gluten-free", "contains-nuts"]
  spiceLevel: number; // 0-5
  isAvailable: boolean;
  isFeatured: boolean;
  displayOrder: number;
  created: string;
  updated: string;
}

export interface QrCode {
  id: string;
  restaurant: string; // Restaurant relation ID
  code: string;
  tableNumber: string;
  scanCount: number;
  isActive: boolean;
  created: string;
}
