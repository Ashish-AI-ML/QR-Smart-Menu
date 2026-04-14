/**
 * Script to add seed images to the PocketBase demo data
 */
const PB_URL = "http://127.0.0.1:8090";
const ADMIN_EMAIL = "admin@smartmenu.com";
const ADMIN_PASSWORD = "Admin@12345";

// High quality Unsplash URLs
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

function getImageUrl(name, catName) {
  const n = name.toLowerCase();
  const c = catName.toLowerCase();
  
  if (n.includes("samosa") || n.includes("roll")) return foodImages.samosa;
  if (n.includes("chicken 65") || n.includes("tikka")) return foodImages.fried;
  if (c.includes("biryani") || n.includes("rice")) return foodImages.biryani;
  if (c.includes("dessert") || n.includes("sweet")) return foodImages.dessert;
  if (c.includes("beverage") || n.includes("drink") || n.includes("chai") || n.includes("soda")) return foodImages.drink;
  if (c.includes("bread") || n.includes("naan") || n.includes("roti") || n.includes("paratha")) return foodImages.bread;
  if (c.includes("main") || n.includes("curry") || n.includes("masala") || n.includes("makhani")) return foodImages.curry;
  
  return foodImages.default;
}

async function main() {
  // 1. Authenticate
  const auth = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  }).then(r => r.json());

  const headers = { "Content-Type": "application/json", Authorization: auth.token };

  // 2. Fetch categories to map IDs to category names
  const catsRes = await fetch(`${PB_URL}/api/collections/categories/records?perPage=100`, { headers }).then(r => r.json());
  const categories = {};
  for (const c of catsRes.items) categories[c.id] = c.name;

  // 3. Fetch all menu items
  const itemsRes = await fetch(`${PB_URL}/api/collections/menu_items/records?perPage=100`, { headers }).then(r => r.json());
  const items = itemsRes.items;

  console.log(`Found ${items.length} items. Updating with images...`);

  let count = 0;
  for (const item of items) {
    const catName = categories[item.category] || "";
    const imageUrl = getImageUrl(item.name, catName);
    
    // Update the item
    const updateRes = await fetch(`${PB_URL}/api/collections/menu_items/records/${item.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ image: imageUrl })
    });

    if (updateRes.ok) {
      count++;
      console.log(`✅ ${item.name} -> ${imageUrl.split('-')[0]}...`);
    } else {
      console.log(`❌ Failed ${item.name}`);
    }
  }

  console.log(`🎉 Updated ${count} items with images!`);
}

main().catch(console.error);
