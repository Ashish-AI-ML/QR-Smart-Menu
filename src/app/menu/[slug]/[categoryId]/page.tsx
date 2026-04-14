"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createPocketBase } from "@/lib/pocketbase";
import type { MenuItem, Category } from "@/lib/pocketbase";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { ItemDetailModal } from "@/components/menu/ItemDetailModal";
import styles from "@/components/menu/menu.module.css";

export default function CategoryItemsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const categoryId = params.categoryId as string;

  const [items, setItems] = useState<MenuItem[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const pb = createPocketBase();

      try {
        // Fetch category info
        const cat = await pb
          .collection("categories")
          .getOne<Category>(categoryId);
        setCategory(cat);

        // Fetch items in this category
        const result = await pb
          .collection("menu_items")
          .getFullList<MenuItem>({
            filter: `category="${categoryId}"`,
            sort: "-isFeatured,displayOrder",
          });
        setItems(result);
      } catch (err) {
        console.error("Failed to fetch menu items:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [categoryId]);

  // Skeleton loading state
  if (loading) {
    return (
      <main className="container" style={{ paddingTop: "var(--space-4)", paddingBottom: "var(--space-8)" }}>
        <div className="skeleton" style={{ height: "20px", width: "80px", marginBottom: "var(--space-4)" }} />
        <div className="skeleton" style={{ height: "32px", width: "200px", marginBottom: "var(--space-6)" }} />
        <div className="grid-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="skeleton skeleton-image" />
              <div style={{ padding: "var(--space-3)" }}>
                <div className="skeleton skeleton-text" style={{ marginBottom: "var(--space-2)" }} />
                <div className="skeleton skeleton-text--short" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  const availableItems = items.filter((item) => item.isAvailable);
  const soldOutItems = items.filter((item) => !item.isAvailable);
  const sortedItems = [...availableItems, ...soldOutItems];

  return (
    <main className="container" style={{ paddingTop: "var(--space-4)", paddingBottom: "var(--space-8)" }}>
      {/* Back navigation */}
      <Link href={`/menu/${slug}`} className={styles.backButton}>
        ← Back to Menu
      </Link>

      {/* Category header */}
      <div className={styles.categoryHeader}>
        <h1 className={styles.categoryTitle}>
          {category?.name || "Menu Items"}
        </h1>
        <span className={styles.itemCount}>
          {availableItems.length} {availableItems.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Items grid */}
      {sortedItems.length > 0 ? (
        <div className="grid-2 stagger-children">
          {sortedItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onSelect={setSelectedItem}
            />
          ))}
        </div>
      ) : (
        <div
          className="glass-card"
          style={{ padding: "var(--space-8)", textAlign: "center" }}
        >
          <p style={{ fontSize: "2rem", marginBottom: "var(--space-3)" }}>🍽️</p>
          <p className="text-muted">No items in this category yet.</p>
        </div>
      )}

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </main>
  );
}
