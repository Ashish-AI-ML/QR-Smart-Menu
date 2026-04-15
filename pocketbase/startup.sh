#!/bin/sh
echo "🚀 Starting PocketBase with auto-seed..."

# Step 1: Create the superuser via CLI (works without server running)
/pb/pocketbase superuser upsert admin@smartmenu.com Admin@12345

# Step 2: Start PocketBase in the background
/pb/pocketbase serve --http=0.0.0.0:8080 &
PB_PID=$!

# Step 3: Wait for server to be ready
echo "⏳ Waiting for PocketBase server..."
for i in $(seq 1 30); do
  if wget -q --spider http://127.0.0.1:8080/api/health 2>/dev/null; then
    echo "✅ PocketBase is ready!"
    break
  fi
  sleep 1
done

# Step 4: Run the auto-seed script
echo "🌱 Running auto-seed..."
node /pb/seed.mjs

# Step 5: Keep PocketBase running in the foreground
echo "✅ PocketBase is serving on port 8080"
wait $PB_PID
