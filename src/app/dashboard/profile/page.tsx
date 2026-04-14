"use client";

import { useEffect, useState, useCallback } from "react";
import { getClientPB } from "@/lib/pocketbase";
import type { Restaurant } from "@/lib/pocketbase";
import styles from "../dashboard.module.css";

export default function ProfilePage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    async function loadRestaurant() {
      const pb = getClientPB();
      const userId = pb.authStore.record?.id;
      if (!userId) return;

      try {
        const rest = await pb.collection("restaurants").getFirstListItem<Restaurant>(`owner="${userId}"`);
        setRestaurant(rest);
        setName(rest.name);
        setDescription(rest.description || "");
        setAddress(rest.address || "");
        setPhone(rest.phone || "");
      } catch (err) {
        console.error("Failed to load restaurant:", err);
      } finally {
        setLoading(false);
      }
    }

    loadRestaurant();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurant) return;

    setSaving(true);
    const pb = getClientPB();

    try {
      await pb.collection("restaurants").update(restaurant.id, {
        name,
        description,
        address,
        phone,
      });
      showToast("Profile updated!");
    } catch {
      showToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.profilePage}>
        <div className="skeleton" style={{ height: "32px", width: "200px", marginBottom: "var(--space-6)" }} />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ marginBottom: "var(--space-4)" }}>
            <div className="skeleton" style={{ height: "16px", width: "80px", marginBottom: "var(--space-2)" }} />
            <div className="skeleton" style={{ height: "44px" }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <h1 className="heading-2" style={{ marginBottom: "var(--space-6)" }}>
        Restaurant Profile
      </h1>

      <form onSubmit={handleSave} className={styles.profileForm}>
        <div className="glass-card" style={{ padding: "var(--space-6)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div>
              <label htmlFor="restName" className="label">Restaurant Name</label>
              <input
                id="restName"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
              />
            </div>
            <div>
              <label htmlFor="restDesc" className="label">Description</label>
              <textarea
                id="restDesc"
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Tell your customers about your restaurant..."
                style={{ resize: "none" }}
              />
            </div>
            <div>
              <label htmlFor="restAddress" className="label">Address</label>
              <input
                id="restAddress"
                className="input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Food Street, Mumbai"
              />
            </div>
            <div>
              <label htmlFor="restPhone" className="label">Phone</label>
              <input
                id="restPhone"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                maxLength={20}
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* Menu URL Info */}
      <div className="glass-card" style={{ padding: "var(--space-5)", marginTop: "var(--space-6)" }}>
        <h3 className="heading-4" style={{ marginBottom: "var(--space-2)" }}>Your Menu URL</h3>
        <p className="text-sm text-muted" style={{ wordBreak: "break-all" }}>
          {process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/menu/{restaurant?.slug}
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
