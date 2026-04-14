/**
 * Fix PocketBase setup for v0.36
 * Drops existing collections and recreates them with correct `fields` syntax
 */

const PB_URL = "http://127.0.0.1:8090";
const ADMIN_EMAIL = "admin@smartmenu.com";
const ADMIN_PASSWORD = "Admin@12345";

async function main() {
  console.log("🔐 Authenticating...");
  const authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const auth = await authRes.json();
  const headers = { "Content-Type": "application/json", Authorization: auth.token };

  // Delete all existing menu items, categories, QR codes, restaurants
  const cols = ["qr_codes", "menu_items", "categories", "restaurants"];
  for (const name of cols) {
    try {
      const resp = await fetch(`${PB_URL}/api/collections/${name}`, { method: "DELETE", headers });
      if (resp.ok) console.log(`🗑️ Deleted ${name}`);
    } catch {}
  }

  // Define new structures
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
        { name: "restaurant", type: "relation", required: true, maxSelect: 1 }, // Will patch collectionId later
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

  const colIds = {};

  for (const col of collections) {
    console.log(`\n📦 Creating ${col.name}...`);
    
    // Inject relationship collectionIds
    if (col.name === "categories") col.fields[0].collectionId = colIds.restaurants;
    if (col.name === "menu_items") {
      col.fields[0].collectionId = colIds.categories;
      col.fields[1].collectionId = colIds.restaurants;
    }
    if (col.name === "qr_codes") col.fields[0].collectionId = colIds.restaurants;

    const res = await fetch(`${PB_URL}/api/collections`, {
      method: "POST", headers, body: JSON.stringify(col)
    });
    
    if (res.ok) {
      const data = await res.json();
      colIds[col.name] = data.id;
      console.log(`✅ ${col.name} created! (id: ${data.id})`);
    } else {
      console.log(`❌ Failed: ${await res.text()}`);
      return;
    }
  }

  console.log("\n🌱 Starting SEED step now by running the existing setup code...");
}

main().catch(console.error);
