"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getClientPB } from "@/lib/pocketbase";
import { generateQrCode } from "@/lib/generate-slug";
import type { Restaurant, QrCode } from "@/lib/pocketbase";
import styles from "../dashboard.module.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function QrCodesPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadData = useCallback(async () => {
    const pb = getClientPB();
    const userId = pb.authStore.record?.id;
    if (!userId) return;

    try {
      const rest = await pb.collection("restaurants").getFirstListItem<Restaurant>(`owner="${userId}"`);
      setRestaurant(rest);

      const codes = await pb.collection("qr_codes").getFullList<QrCode>({
        filter: `restaurant="${rest.id}"`,
        sort: "-created",
      });
      setQrCodes(codes);
    } catch (err) {
      console.error("Failed to load QR codes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function createQrCode() {
    const pb = getClientPB();
    try {
      const code = generateQrCode();
      await pb.collection("qr_codes").create({
        restaurant: restaurant?.id,
        code,
        tableNumber: tableNumber || "",
        scanCount: 0,
        isActive: true,
      });
      setTableNumber("");
      setShowForm(false);
      showToast("QR code created");
      loadData();
    } catch {
      showToast("Failed to create QR code", "error");
    }
  }

  async function deleteQrCode(id: string) {
    if (!confirm("Delete this QR code?")) return;
    const pb = getClientPB();
    try {
      await pb.collection("qr_codes").delete(id);
      showToast("QR code deleted");
      loadData();
    } catch {
      showToast("Failed to delete QR code", "error");
    }
  }

  function downloadQr(code: string, table?: string) {
    const svg = document.querySelector(`#qr-${code} svg`) as SVGElement;
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1024;
    canvas.height = 1024;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.drawImage(img, 112, 112, 800, 800);

      // Add text below
      ctx.fillStyle = "#000000";
      ctx.font = "bold 36px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Scan to view menu", 512, 980);

      if (table) {
        ctx.font = "24px Inter, sans-serif";
        ctx.fillText(`Table ${table}`, 512, 80);
      }

      const link = document.createElement("a");
      link.download = `qr-${table ? `table-${table}` : code}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }

  if (loading) {
    return (
      <div className={styles.qrPage}>
        <div className="skeleton" style={{ height: "32px", width: "200px", marginBottom: "var(--space-6)" }} />
        <div className="glass-card" style={{ padding: "var(--space-8)" }}>
          <div className="skeleton" style={{ width: "200px", height: "200px", margin: "0 auto" }} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.qrPage}>
      <div className={styles.menuHeader}>
        <h1 className="heading-2">QR Codes</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
          + New QR Code
        </button>
      </div>

      {qrCodes.length === 0 ? (
        <div className="glass-card" style={{ padding: "var(--space-8)", textAlign: "center" }}>
          <p style={{ fontSize: "2rem", marginBottom: "var(--space-3)" }}>📱</p>
          <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>
            No QR codes yet. Generate one to share your menu.
          </p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Generate First QR Code
          </button>
        </div>
      ) : (
        <div className={styles.qrList}>
          {qrCodes.map((qr) => (
            <div key={qr.id} className={`glass-card ${styles.qrListItem}`}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                <div id={`qr-${qr.code}`} ref={qrRef}>
                  <QRCodeSVG
                    value={`${APP_URL}/qr/${qr.code}`}
                    size={80}
                    level="M"
                    bgColor="transparent"
                    fgColor="#f1f5f9"
                  />
                </div>
                <div>
                  <p className="text-sm" style={{ fontWeight: "var(--font-weight-semibold)" }}>
                    {qr.tableNumber ? `Table ${qr.tableNumber}` : `Code: ${qr.code}`}
                  </p>
                  <p className="text-xs text-muted">{qr.scanCount} scans</p>
                  <p className="text-xs text-muted" style={{ wordBreak: "break-all" }}>
                    {APP_URL}/qr/{qr.code}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button className="btn btn-secondary btn-sm" onClick={() => downloadQr(qr.code, qr.tableNumber)}>
                  ⬇️ Download
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => deleteQrCode(qr.id)}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create QR Form Modal */}
      {showForm && (
        <div className={styles.formModal}>
          <div className={styles.formModalBackdrop} onClick={() => setShowForm(false)} />
          <div className={styles.formModalContent}>
            <div className={styles.formModalHeader}>
              <h2 className="heading-3">New QR Code</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className={styles.formGrid}>
              <div>
                <label htmlFor="tableNum" className="label">Table Number (optional)</label>
                <input
                  id="tableNum"
                  className="input"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. 1, 2, A1"
                  maxLength={10}
                />
                <p className="text-xs text-muted" style={{ marginTop: "var(--space-1)" }}>
                  Leave blank for a general menu QR code
                </p>
              </div>

              {/* Preview */}
              <div className={styles.qrPreview} style={{ background: "var(--color-glass-bg)", borderRadius: "var(--radius-xl)", padding: "var(--space-6)" }}>
                <QRCodeSVG
                  value={`${APP_URL}/menu/${restaurant?.slug || "demo"}`}
                  size={180}
                  level="M"
                  bgColor="transparent"
                  fgColor="#f1f5f9"
                />
                <p className="text-xs text-muted">Preview</p>
              </div>

              <button className="btn btn-primary" style={{ width: "100%" }} onClick={createQrCode}>
                Generate QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
