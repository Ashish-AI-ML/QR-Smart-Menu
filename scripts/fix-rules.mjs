/**
 * Fix PocketBase API rules — set public read access
 * Run: node scripts/fix-rules.mjs
 */
const PB_URL = "http://127.0.0.1:8090";

async function main() {
  // Auth
  const auth = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: "admin@smartmenu.com", password: "Admin@12345" }),
  }).then(r => r.json());
  
  const headers = {
    "Content-Type": "application/json",
    Authorization: auth.token,
  };

  // Get all collections
  const cols = await fetch(`${PB_URL}/api/collections`, { headers }).then(r => r.json());
  const items = cols.items || cols;

  const rules = {
    restaurants: {
      listRule: "",      // public
      viewRule: "",      // public
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
    },
    categories: {
      listRule: "",
      viewRule: "",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
    },
    menu_items: {
      listRule: "",
      viewRule: "",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
    },
    qr_codes: {
      listRule: "",
      viewRule: "",
      createRule: "@request.auth.id != ''",
      updateRule: "",    // public — for scan count increment
      deleteRule: "@request.auth.id != ''",
    },
  };

  for (const [name, ruleSet] of Object.entries(rules)) {
    const col = items.find(c => c.name === name);
    if (!col) { console.log(`⚠️  ${name} not found`); continue; }

    const res = await fetch(`${PB_URL}/api/collections/${col.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(ruleSet),
    });
    
    if (res.ok) {
      console.log(`✅ ${name} — public read enabled`);
    } else {
      const err = await res.text();
      console.log(`❌ ${name}: ${err.slice(0, 100)}`);
    }
  }

  // Verify: try public access to restaurants
  console.log("\n🔍 Testing public access...");
  const test = await fetch(`${PB_URL}/api/collections/restaurants/records`);
  const data = await test.json();
  console.log(`   restaurants: ${test.status} — ${(data.items || data).length} records`);

  const test2 = await fetch(`${PB_URL}/api/collections/menu_items/records`);
  const data2 = await test2.json();
  console.log(`   menu_items: ${test2.status} — ${(data2.items || data2).length} records`);

  console.log("\n✅ Done! Try http://localhost:3000/menu/spice-garden now");
}

main().catch(console.error);
