/**
 * PocketBase Setup Script — v0.36 compatible
 * Creates collections + seeds "Spice Garden" demo
 * 
 * Run: node scripts/setup-pocketbase.mjs
 */

const PB_URL = "http://127.0.0.1:8090";
const ADMIN_EMAIL = "admin@smartmenu.com";
const ADMIN_PASSWORD = "Admin@12345";

let AUTH_TOKEN = "";

async function api(path, options = {}) {
  const res = await fetch(`${PB_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(AUTH_TOKEN ? { Authorization: AUTH_TOKEN } : {}),
      ...options.headers,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status} ${path}: ${text}`);
  }
  try { return JSON.parse(text); } catch { return text; }
}

async function main() {
  // --- Authenticate ---
  console.log("🔐 Authenticating...");
  const auth = await api("/api/collections/_superusers/auth-with-password", {
    method: "POST",
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  AUTH_TOKEN = auth.token;
  console.log("✅ Authenticated!\n");

  // --- Get existing collections ---
  let existing = [];
  try {
    const res = await api("/api/collections");
    existing = (res.items || res || []).map(c => c.name);
  } catch { /* ignore */ }
  console.log("Existing collections:", existing.join(", ") || "none");

  // --- Create Collections ---
  // 1. restaurants
  if (!existing.includes("restaurants")) {
    console.log("\n📦 Creating 'restaurants'...");
    try {
      await api("/api/collections", {
        method: "POST",
        body: JSON.stringify({
          name: "restaurants",
          type: "base",
          schema: [
            { name: "name", type: "text", required: true },
            { name: "slug", type: "text", required: true },
            { name: "description", type: "text" },
            { name: "logo", type: "text" },
            { name: "banner", type: "text" },
            { name: "address", type: "text" },
            { name: "phone", type: "text" },
            { name: "themeColor", type: "text" },
            { name: "operatingHours", type: "json" },
            { name: "isActive", type: "bool" },
            { name: "owner", type: "relation", options: { collectionId: "_pb_users_auth_", maxSelect: 1 } },
          ],
          listRule: null,
          viewRule: null,
          createRule: "@request.auth.id != ''",
          updateRule: "@request.auth.id != ''",
          deleteRule: "@request.auth.id != ''",
        }),
      });
      console.log("✅ restaurants created");
    } catch (e) { console.log("❌ restaurants:", e.message.slice(0, 120)); }
  } else {
    console.log("⏭️  restaurants already exists");
  }

  // Get collection IDs
  let collectionsData;
  try {
    collectionsData = await api("/api/collections");
    collectionsData = collectionsData.items || collectionsData;
  } catch { collectionsData = []; }

  const getColId = (name) => collectionsData.find(c => c.name === name)?.id;
  const restaurantsId = getColId("restaurants");
  console.log("restaurants ID:", restaurantsId);

  // 2. categories
  if (!existing.includes("categories")) {
    console.log("\n📦 Creating 'categories'...");
    try {
      await api("/api/collections", {
        method: "POST",
        body: JSON.stringify({
          name: "categories",
          type: "base",
          schema: [
            { name: "restaurant", type: "relation", required: true, options: { collectionId: restaurantsId, maxSelect: 1 } },
            { name: "name", type: "text", required: true },
            { name: "icon", type: "text" },
            { name: "displayOrder", type: "number" },
            { name: "isActive", type: "bool" },
          ],
          listRule: null,
          viewRule: null,
          createRule: "@request.auth.id != ''",
          updateRule: "@request.auth.id != ''",
          deleteRule: "@request.auth.id != ''",
        }),
      });
      console.log("✅ categories created");
    } catch (e) { console.log("❌ categories:", e.message.slice(0, 120)); }
  }

  // Refresh IDs
  try {
    collectionsData = (await api("/api/collections")).items || await api("/api/collections");
  } catch { /* ignore */ }
  const categoriesId = getColId("categories") || collectionsData?.find(c => c.name === "categories")?.id;

  // 3. menu_items
  if (!existing.includes("menu_items")) {
    console.log("\n📦 Creating 'menu_items'...");
    try {
      await api("/api/collections", {
        method: "POST",
        body: JSON.stringify({
          name: "menu_items",
          type: "base",
          schema: [
            { name: "category", type: "relation", required: true, options: { collectionId: categoriesId, maxSelect: 1 } },
            { name: "restaurant", type: "relation", required: true, options: { collectionId: restaurantsId, maxSelect: 1 } },
            { name: "name", type: "text", required: true },
            { name: "description", type: "text" },
            { name: "price", type: "number", required: true },
            { name: "discountPrice", type: "number" },
            { name: "image", type: "text" },
            { name: "dietaryTags", type: "json" },
            { name: "spiceLevel", type: "number" },
            { name: "isAvailable", type: "bool" },
            { name: "isFeatured", type: "bool" },
            { name: "displayOrder", type: "number" },
          ],
          listRule: null,
          viewRule: null,
          createRule: "@request.auth.id != ''",
          updateRule: "@request.auth.id != ''",
          deleteRule: "@request.auth.id != ''",
        }),
      });
      console.log("✅ menu_items created");
    } catch (e) { console.log("❌ menu_items:", e.message.slice(0, 120)); }
  }

  // 4. qr_codes
  if (!existing.includes("qr_codes")) {
    console.log("\n📦 Creating 'qr_codes'...");
    try {
      await api("/api/collections", {
        method: "POST",
        body: JSON.stringify({
          name: "qr_codes",
          type: "base",
          schema: [
            { name: "restaurant", type: "relation", required: true, options: { collectionId: restaurantsId, maxSelect: 1 } },
            { name: "code", type: "text", required: true },
            { name: "tableNumber", type: "text" },
            { name: "scanCount", type: "number" },
            { name: "isActive", type: "bool" },
          ],
          listRule: null,
          viewRule: null,
          createRule: "@request.auth.id != ''",
          updateRule: null,
          deleteRule: "@request.auth.id != ''",
        }),
      });
      console.log("✅ qr_codes created");
    } catch (e) { console.log("❌ qr_codes:", e.message.slice(0, 120)); }
  }

  console.log("\n✅ All collections ready!\n");

  // --- SEED DEMO DATA ---
  console.log("🌱 Seeding 'Spice Garden'...\n");

  // Create demo user
  let userId;
  try {
    const user = await api("/api/collections/users/records", {
      method: "POST",
      body: JSON.stringify({
        email: "owner@spicegarden.com",
        password: "SpiceGarden@123",
        passwordConfirm: "SpiceGarden@123",
        name: "Raj Kumar",
      }),
    });
    userId = user.id;
    console.log("✅ User: owner@spicegarden.com");
  } catch (e) {
    console.log("⚠️  User exists, fetching...");
    try {
      const r = await api(`/api/collections/users/records?filter=(email='owner@spicegarden.com')`);
      userId = (r.items || r)[0]?.id;
      console.log("✅ Found user:", userId);
    } catch { console.log("❌ Could not find user"); }
  }

  // Create restaurant
  let restaurantRecordId;
  try {
    const r = await api("/api/collections/restaurants/records", {
      method: "POST",
      body: JSON.stringify({
        name: "Spice Garden",
        slug: "spice-garden",
        description: "Authentic Indian cuisine crafted with love. From aromatic biryanis to sizzling tandoori, every dish tells a story of spice and flavor.",
        address: "42, MG Road, Koramangala, Bangalore 560034",
        phone: "+91 98765 43210",
        themeColor: "#f59e0b",
        isActive: true,
        owner: userId,
        operatingHours: { mon: "11:00-22:30", tue: "11:00-22:30", wed: "11:00-22:30", thu: "11:00-22:30", fri: "11:00-23:00", sat: "11:00-23:00", sun: "12:00-22:00" },
      }),
    });
    restaurantRecordId = r.id;
    console.log("✅ Restaurant: Spice Garden");
  } catch (e) {
    console.log("⚠️  Restaurant exists, fetching...");
    try {
      const r = await api(`/api/collections/restaurants/records?filter=(slug='spice-garden')`);
      restaurantRecordId = (r.items || r)[0]?.id;
      console.log("✅ Found restaurant:", restaurantRecordId);
    } catch { console.log("❌ Could not find restaurant"); }
  }

  if (!restaurantRecordId) { console.log("❌ No restaurant ID. Stopping."); return; }

  // Categories
  const cats = [
    { name: "Starters", icon: "🥗", displayOrder: 0 },
    { name: "Mains — Veg", icon: "🥬", displayOrder: 1 },
    { name: "Mains — Non-Veg", icon: "🍗", displayOrder: 2 },
    { name: "Biryani & Rice", icon: "🍚", displayOrder: 3 },
    { name: "Breads", icon: "🫓", displayOrder: 4 },
    { name: "Beverages", icon: "🥤", displayOrder: 5 },
    { name: "Desserts", icon: "🍮", displayOrder: 6 },
  ];

  const catIds = {};
  for (const cat of cats) {
    try {
      const r = await api("/api/collections/categories/records", {
        method: "POST",
        body: JSON.stringify({ ...cat, restaurant: restaurantRecordId, isActive: true }),
      });
      catIds[cat.name] = r.id;
      console.log(`✅ ${cat.icon} ${cat.name}`);
    } catch (e) { console.log(`⚠️  ${cat.name}: ${e.message.slice(0, 60)}`); }
  }

  // Menu Items
  const items = [
    { cat: "Starters", name: "Paneer Tikka", desc: "Marinated cottage cheese cubes grilled in tandoor with bell peppers", price: 24900, tags: ["veg"], spice: 2, feat: false },
    { cat: "Starters", name: "Chicken 65", desc: "Crispy deep-fried chicken with curry leaves and red chilies", price: 27900, tags: ["non-veg"], spice: 4, feat: false },
    { cat: "Starters", name: "Veg Spring Rolls", desc: "Crispy rolls stuffed with mixed vegetables and glass noodles", price: 19900, tags: ["veg"], spice: 1, feat: false },
    { cat: "Starters", name: "Crispy Samosa", desc: "Golden fried pastry filled with spiced potatoes and peas", price: 9900, tags: ["veg"], spice: 2, feat: false },
    { cat: "Mains — Veg", name: "Paneer Butter Masala", desc: "Creamy tomato gravy with soft paneer, finished with butter", price: 29900, tags: ["veg"], spice: 1, feat: true },
    { cat: "Mains — Veg", name: "Dal Makhani", desc: "Slow-cooked black lentils in creamy tomato sauce", price: 24900, tags: ["veg"], spice: 1, feat: false },
    { cat: "Mains — Veg", name: "Palak Paneer", desc: "Fresh spinach puree with soft paneer, lightly spiced", price: 27900, tags: ["veg"], spice: 1, feat: false },
    { cat: "Mains — Veg", name: "Chole Bhature", desc: "Spiced chickpea curry with fluffy fried bread", price: 19900, tags: ["veg"], spice: 2, feat: false },
    { cat: "Mains — Non-Veg", name: "Butter Chicken", desc: "Tender chicken in rich creamy tomato-butter sauce", price: 34900, tags: ["non-veg"], spice: 1, feat: true },
    { cat: "Mains — Non-Veg", name: "Mutton Rogan Josh", desc: "Slow-braised mutton in aromatic Kashmiri spices", price: 39900, tags: ["non-veg"], spice: 3, feat: false },
    { cat: "Mains — Non-Veg", name: "Fish Curry", desc: "Fresh fish in tangy coconut curry with kokum", price: 32900, tags: ["non-veg"], spice: 2, feat: false },
    { cat: "Mains — Non-Veg", name: "Egg Curry", desc: "Boiled eggs in onion-tomato masala gravy", price: 19900, tags: ["non-veg"], spice: 2, feat: false },
    { cat: "Biryani & Rice", name: "Chicken Biryani", desc: "Fragrant basmati layered with spiced chicken, dum style", price: 32900, tags: ["non-veg"], spice: 2, feat: true },
    { cat: "Biryani & Rice", name: "Mutton Biryani", desc: "Royal Hyderabadi biryani with tender mutton", price: 39900, tags: ["non-veg"], spice: 3, feat: false },
    { cat: "Biryani & Rice", name: "Veg Biryani", desc: "Aromatic rice with seasonal vegetables and whole spices", price: 24900, tags: ["veg"], spice: 1, feat: false },
    { cat: "Biryani & Rice", name: "Jeera Rice", desc: "Basmati rice tempered with cumin seeds and ghee", price: 14900, tags: ["veg"], spice: 0, feat: false },
    { cat: "Breads", name: "Butter Naan", desc: "Soft leavened bread brushed with melted butter", price: 4900, tags: ["veg"], spice: 0, feat: false },
    { cat: "Breads", name: "Garlic Naan", desc: "Naan topped with fresh garlic and coriander", price: 5900, tags: ["veg"], spice: 0, feat: false },
    { cat: "Breads", name: "Tandoori Roti", desc: "Whole wheat bread baked in tandoor", price: 3000, tags: ["veg"], spice: 0, feat: false },
    { cat: "Breads", name: "Lachha Paratha", desc: "Flaky layered whole wheat bread", price: 4900, tags: ["veg"], spice: 0, feat: false },
    { cat: "Beverages", name: "Masala Chai", desc: "Traditional tea with cardamom, ginger, and spices", price: 4900, tags: ["veg"], spice: 0, feat: false },
    { cat: "Beverages", name: "Mango Lassi", desc: "Creamy yogurt smoothie with Alphonso mango", price: 9900, tags: ["veg"], spice: 0, feat: false },
    { cat: "Beverages", name: "Fresh Lime Soda", desc: "Refreshing lime juice with soda", price: 7900, tags: ["veg"], spice: 0, feat: false },
    { cat: "Beverages", name: "Chaas", desc: "Chilled spiced buttermilk with cumin and mint", price: 4900, tags: ["veg"], spice: 0, feat: false },
    { cat: "Desserts", name: "Gulab Jamun", desc: "Milk dumplings in rose-scented sugar syrup", price: 9900, tags: ["veg"], spice: 0, feat: false },
    { cat: "Desserts", name: "Rasmalai", desc: "Paneer discs in saffron-cardamom milk", price: 12900, tags: ["veg"], spice: 0, feat: true },
    { cat: "Desserts", name: "Kheer", desc: "Rice pudding with saffron, almonds, and cardamom", price: 9900, tags: ["veg"], spice: 0, feat: false },
  ];

  let count = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const catId = catIds[item.cat];
    if (!catId) continue;
    try {
      await api("/api/collections/menu_items/records", {
        method: "POST",
        body: JSON.stringify({
          category: catId, restaurant: restaurantRecordId,
          name: item.name, description: item.desc, price: item.price,
          dietaryTags: item.tags, spiceLevel: item.spice,
          isAvailable: true, isFeatured: item.feat, displayOrder: i,
        }),
      });
      count++;
    } catch (e) { console.log(`⚠️  ${item.name}: ${e.message.slice(0, 50)}`); }
  }
  console.log(`\n✅ Created ${count}/${items.length} menu items`);

  // QR code
  try {
    await api("/api/collections/qr_codes/records", {
      method: "POST",
      body: JSON.stringify({
        restaurant: restaurantRecordId, code: "spicegdn1",
        tableNumber: "1", scanCount: 0, isActive: true,
      }),
    });
    console.log("✅ QR code: spicegdn1");
  } catch (e) { console.log("⚠️  QR:", e.message.slice(0, 50)); }

  console.log("\n" + "=".repeat(50));
  console.log("🎉 SETUP COMPLETE!");
  console.log("=".repeat(50));
  console.log("\nAdmin:  admin@smartmenu.com / Admin@12345");
  console.log("Owner:  owner@spicegarden.com / SpiceGarden@123");
  console.log("\nMenu:      http://localhost:3000/menu/spice-garden");
  console.log("Dashboard: http://localhost:3000/dashboard");
  console.log("QR test:   http://localhost:3000/qr/spicegdn1");
  console.log("PB Admin:  http://127.0.0.1:8090/_/");
}

main().catch(console.error);
