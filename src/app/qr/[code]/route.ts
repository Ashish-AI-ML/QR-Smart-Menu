import { NextRequest, NextResponse } from "next/server";
import { createPocketBase } from "@/lib/pocketbase";
import type { QrCode, Restaurant } from "@/lib/pocketbase";

/**
 * QR Code Dynamic Redirect
 *
 * GET /qr/[code]
 *
 * 1. Looks up the QR code in PocketBase
 * 2. Increments scan count
 * 3. Redirects to the restaurant's menu page
 * 4. Optionally appends ?table=N if the QR has a table number
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ code: string }> }
) {
  const { code } = await props.params;
  const pb = createPocketBase();

  try {
    // Find the QR code record
    const qrCode = await pb
      .collection("qr_codes")
      .getFirstListItem<QrCode>(`code="${code}" && isActive=true`);

    // Increment scan count (fire and forget)
    pb.collection("qr_codes")
      .update(qrCode.id, { scanCount: qrCode.scanCount + 1 })
      .catch(() => {}); // Don't block redirect if update fails

    // Get the restaurant's slug
    const restaurant = await pb
      .collection("restaurants")
      .getOne<Restaurant>(qrCode.restaurant);

    // Build redirect URL
    let redirectUrl = `/menu/${restaurant.slug}`;
    if (qrCode.tableNumber) {
      redirectUrl += `?table=${encodeURIComponent(qrCode.tableNumber)}`;
    }

    // 302 (temporary) redirect so we can change destination without reprinting QR
    return NextResponse.redirect(new URL(redirectUrl, request.url), 302);
  } catch {
    // QR code not found or inactive — show a friendly error page
    return NextResponse.redirect(
      new URL(`/qr-error?code=${encodeURIComponent(code)}`, request.url),
      302
    );
  }
}
