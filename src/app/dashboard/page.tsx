"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getClientPB } from "@/lib/pocketbase";
import type { Restaurant, Category, MenuItem, QrCode } from "@/lib/pocketbase";
import styles from "./dashboard.module.css";

interface DashboardStats {
  restaurant: Restaurant | null;
  categoriesCount: number;
  itemsCount: number;
  totalScans: number;
}

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats>({
    restaurant: null,
    categoriesCount: 0,
    itemsCount: 0,
    totalScans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const pb = getClientPB();
      const userId = pb.authStore.record?.id;
      if (!userId) return;

      try {
        // Get restaurant
        const restaurant = await pb
          .collection("restaurants")
          .getFirstListItem<Restaurant>(`owner="${userId}"`);

        // Get counts
        const categories = await pb
          .collection("categories")
          .getList<Category>(1, 1, { filter: `restaurant="${restaurant.id}"` });

        const items = await pb
          .collection("menu_items")
          .getList<MenuItem>(1, 1, { filter: `restaurant="${restaurant.id}"` });

        const qrCodes = await pb
          .collection("qr_codes")
          .getFullList<QrCode>({ filter: `restaurant="${restaurant.id}"` });

        const totalScans = qrCodes.reduce((sum, qr) => sum + qr.scanCount, 0);

        setStats({
          restaurant,
          categoriesCount: categories.totalItems,
          itemsCount: items.totalItems,
          totalScans,
        });
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className={styles.dashboardPage}>
        <div className="skeleton" style={{ height: "32px", width: "200px", marginBottom: "var(--space-6)" }} />
        <div className={styles.statsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card" style={{ padding: "var(--space-6)" }}>
              <div className="skeleton skeleton-text--short" style={{ marginBottom: "var(--space-3)" }} />
              <div className="skeleton" style={{ height: "40px", width: "60px" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardPage}>
      <h1 className="heading-2" style={{ marginBottom: "var(--space-2)" }}>
        Dashboard
      </h1>
      <p className="text-muted" style={{ marginBottom: "var(--space-6)" }}>
        {stats.restaurant?.name || "Your Restaurant"}
      </p>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={`glass-card ${styles.statCard}`}>
          <p className="text-sm text-muted">Categories</p>
          <p className={styles.statNumber}>{stats.categoriesCount}</p>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <p className="text-sm text-muted">Menu Items</p>
          <p className={styles.statNumber}>{stats.itemsCount}</p>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <p className="text-sm text-muted">QR Scans</p>
          <p className={styles.statNumber}>{stats.totalScans}</p>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <p className="text-sm text-muted">Status</p>
          <p className={styles.statNumber} style={{ color: "var(--color-success)", fontSize: "var(--font-size-lg)" }}>
            {stats.restaurant?.isActive ? "🟢 Live" : "🔴 Offline"}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="heading-4" style={{ marginTop: "var(--space-8)", marginBottom: "var(--space-4)" }}>
        Quick Actions
      </h2>
      <div className={styles.actionsGrid}>
        <Link href="/dashboard/menu" className={`glass-card glass-card--interactive ${styles.actionCard}`}>
          <span style={{ fontSize: "1.5rem" }}>🍽️</span>
          <span>Manage Menu</span>
        </Link>
        <Link href="/dashboard/qr-codes" className={`glass-card glass-card--interactive ${styles.actionCard}`}>
          <span style={{ fontSize: "1.5rem" }}>📱</span>
          <span>Generate QR</span>
        </Link>
        {stats.restaurant && (
          <Link
            href={`/menu/${stats.restaurant.slug}`}
            target="_blank"
            className={`glass-card glass-card--interactive ${styles.actionCard}`}
          >
            <span style={{ fontSize: "1.5rem" }}>👁️</span>
            <span>Preview Menu</span>
          </Link>
        )}
      </div>
    </div>
  );
}
