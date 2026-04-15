/**
 * Combined auto-seed script for PocketBase on Render Free Tier
 * Runs inside the Docker container on every startup to restore data
 */

const PB_URL = "http://127.0.0.1:8080";
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
  if (!res.ok) throw new Error(`${res.status} ${path}: ${text}`);
  try { return JSON.parse(text); } catch { return text; }
}

async function waitForServer() {
  console.log("⏳ Waiting for PocketBase to be ready...");
  for (let i = 0; i < 30; i++) {
    try {
      await fetch(`${PB_URL}/api/health`);
      console.log("✅ PocketBase is ready!\n");
      return true;
    } catch {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  console.log("❌ PocketBase did not start in time");
  return false;
}

async function main() {
  if (!(await waitForServer())) return;

  // --- Authenticate ---
  console.log("🔐 Authenticating...");
  const auth = await api("/api/collections/_superusers/auth-with-password", {
    method: "POST",
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  AUTH_TOKEN = auth.token;
  console.log("✅ Authenticated!\n");

  // --- Check if already seeded ---
  try {
    const test = await api("/api/collections/restaurants/records");
    if ((test.items || []).length > 0) {
      console.log("✅ Data already exists, skipping seed.");
      return;
    }
  } catch { /* collection doesn't exist yet, continue */ }

  // --- Get existing collections ---
  let existing = [];
  try {
    const res = await api("/api/collections");
    existing = (res.items || res || []).map(c => c.name);
  } catch { /* ignore */ }

  // --- Create Collections ---
  const colIds = {};

  const collections = [
    {
      name: "restaurants",
      type: "base",
      listRule: "", viewRule: "", createRule: "@request.auth.id != ''", updateRule: "@request.auth.id != ''", deleteRule: "@request.auth.id != ''",
      fields: [
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
        { name: "owner", type: "relation", collectionId: "_pb_users_auth_", maxSelect: 1 }
      ]
    },
    {
      name: "categories",
      type: "base",
      listRule: "", viewRule: "", createRule: "@request.auth.id != ''", updateRule: "@request.auth.id != ''", deleteRule: "@request.auth.id != ''",
      fields: [
        { name: "restaurant", type: "relation", required: true, maxSelect: 1 },
        { name: "name", type: "text", required: true },
        { name: "icon", type: "text" },
        { name: "displayOrder", type: "number" },
        { name: "isActive", type: "bool" }
      ]
    },
    {
      name: "menu_items",
      type: "base",
      listRule: "", viewRule: "", createRule: "@request.auth.id != ''", updateRule: "@request.auth.id != ''", deleteRule: "@request.auth.id != ''",
      fields: [
        { name: "category", type: "relation", required: true, maxSelect: 1 },
        { name: "restaurant", type: "relation", required: true, maxSelect: 1 },
        { name: "name", type: "text", required: true },
        { name: "description", type: "text" },
        { name: "price", type: "number", required: true },
        { name: "discountPrice", type: "number" },
        { name: "image", type: "text" },
        { name: "dietaryTags", type: "json" },
        { name: "spiceLevel", type: "number", min: 0, max: 5 },
        { name: "isAvailable", type: "bool" },
        { name: "isFeatured", type: "bool" },
        { name: "displayOrder", type: "number" }
      ]
    },
    {
      name: "qr_codes",
      type: "base",
      listRule: "", viewRule: "", createRule: "@request.auth.id != ''", updateRule: "", deleteRule: "@request.auth.id != ''",
      fields: [
        { name: "restaurant", type: "relation", required: true, maxSelect: 1 },
        { name: "code", type: "text", required: true },
        { name: "tableNumber", type: "text" },
        { name: "scanCount", type: "number" },
        { name: "isActive", type: "bool" }
      ]
    }
  ];

  for (const col of collections) {
    if (existing.includes(col.name)) { console.log(`⏭️  ${col.name} exists`); continue; }
    console.log(`📦 Creating ${col.name}...`);

    // Inject relationship collectionIds
    if (col.name === "categories") col.fields[0].collectionId = colIds.restaurants;
    if (col.name === "menu_items") {
      col.fields[0].collectionId = colIds.categories;
      col.fields[1].collectionId = colIds.restaurants;
    }
    if (col.name === "qr_codes") col.fields[0].collectionId = colIds.restaurants;

    try {
      const res = await api("/api/collections", { method: "POST", body: JSON.stringify(col) });
      colIds[col.name] = res.id;
      console.log(`✅ ${col.name} created (${res.id})`);
    } catch (e) { console.log(`❌ ${col.name}: ${e.message.slice(0, 100)}`); return; }
  }

  // --- SEED DATA ---
  console.log("\n🌱 Seeding Spice Garden...\n");

  // Create user
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
    console.log("✅ User created");
  } catch {
    try {
      const r = await api(`/api/collections/users/records?filter=(email='owner@spicegarden.com')`);
      userId = (r.items || r)[0]?.id;
    } catch { console.log("❌ Could not create/find user"); }
  }

  // Create restaurant
  let restId;
  try {
    const r = await api("/api/collections/restaurants/records", {
      method: "POST",
      body: JSON.stringify({
        name: "Spice Garden", slug: "spice-garden",
        description: "Authentic Indian cuisine crafted with love. From aromatic biryanis to sizzling tandoori, every dish tells a story of spice and flavor.",
        address: "42, MG Road, Koramangala, Bangalore 560034",
        phone: "+91 98765 43210", themeColor: "#f59e0b", isActive: true, owner: userId,
        operatingHours: { mon: "11:00-22:30", tue: "11:00-22:30", wed: "11:00-22:30", thu: "11:00-22:30", fri: "11:00-23:00", sat: "11:00-23:00", sun: "12:00-22:00" },
      }),
    });
    restId = r.id;
    console.log("✅ Restaurant: Spice Garden");
  } catch { console.log("❌ Restaurant failed"); return; }

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
        body: JSON.stringify({ ...cat, restaurant: restId, isActive: true }),
      });
      catIds[cat.name] = r.id;
      console.log(`✅ ${cat.icon} ${cat.name}`);
    } catch (e) { console.log(`⚠️ ${cat.name}: ${e.message.slice(0, 60)}`); }
  }

  // Menu Items with images
  const foodImages = {
    curry: "https://images.unsplash.com/photo-1565557623262-b51c2513a641",
    fried: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91",
    samosa: "https://images.unsplash.com/photo-1601050690597-df0568f70950",
    biryani: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8",
    bread: "https://images.unsplash.com/photo-1509440159596-0249088772ff",
    drink: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd",
    dessert: "https://images.unsplash.com/photo-1551024601-bec78aea704b",
    default: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
  };

  function getImage(name, catName) {
    const n = (name || "").toLowerCase();
    const c = (catName || "").toLowerCase();
    if (n.includes("samosa") || n.includes("roll")) return foodImages.samosa;
    if (n.includes("chicken 65") || n.includes("tikka")) return foodImages.fried;
    if (c.includes("biryani") || n.includes("rice")) return foodImages.biryani;
    if (c.includes("dessert") || n.includes("sweet")) return foodImages.dessert;
    if (c.includes("beverage") || n.includes("drink") || n.includes("chai") || n.includes("soda") || n.includes("lassi") || n.includes("chaas") || n.includes("lime")) return foodImages.drink;
    if (c.includes("bread") || n.includes("naan") || n.includes("roti") || n.includes("paratha") || n.includes("bhature")) return foodImages.bread;
    if (c.includes("main") || n.includes("curry") || n.includes("masala") || n.includes("makhani") || n.includes("paneer") || n.includes("dal") || n.includes("chole") || n.includes("rogan") || n.includes("egg")) return foodImages.curry;
    return foodImages.default;
  }

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
          category: catId, restaurant: restId,
          name: item.name, description: item.desc, price: item.price,
          image: getImage(item.name, item.cat),
          dietaryTags: item.tags, spiceLevel: item.spice,
          isAvailable: true, isFeatured: item.feat, displayOrder: i,
        }),
      });
      count++;
    } catch (e) { console.log(`⚠️ ${item.name}: ${e.message.slice(0, 50)}`); }
  }
  console.log(`\n✅ Created ${count}/${items.length} menu items`);

  // QR code
  try {
    await api("/api/collections/qr_codes/records", {
      method: "POST",
      body: JSON.stringify({ restaurant: restId, code: "spicegdn1", tableNumber: "1", scanCount: 0, isActive: true }),
    });
    console.log("✅ QR code: spicegdn1");
  } catch {}

  console.log("\n🎉 AUTO-SEED COMPLETE!");
}

main().catch(console.error);
