"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClientPB } from "@/lib/pocketbase";
import { generateSlug } from "@/lib/generate-slug";
import styles from "../auth.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const pb = getClientPB();

      // 1. Create user
      await pb.collection("users").create({
        email,
        password,
        passwordConfirm: password,
        name,
      });

      // 2. Login immediately
      await pb.collection("users").authWithPassword(email, password);

      // 3. Create restaurant
      const slug = generateSlug(restaurantName);
      await pb.collection("restaurants").create({
        name: restaurantName,
        slug,
        owner: pb.authStore.record?.id,
        isActive: true,
        themeColor: "#f59e0b",
        operatingHours: {
          mon: "10:00-22:00",
          tue: "10:00-22:00",
          wed: "10:00-22:00",
          thu: "10:00-22:00",
          fri: "10:00-23:00",
          sat: "10:00-23:00",
          sun: "10:00-22:00",
        },
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      if (message.includes("unique")) {
        setError("An account with this email already exists.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.authPage}>
      <div className={styles.authContainer}>
        <Link href="/" className={styles.authBrand}>
          <span style={{ fontSize: "2rem" }}>📱</span>
          <span className={styles.authBrandName}>SmartMenu</span>
        </Link>

        <div className={`glass-card ${styles.authCard}`}>
          <h1 className="heading-3" style={{ textAlign: "center", marginBottom: "var(--space-2)" }}>
            Create Your Menu
          </h1>
          <p className="text-sm text-muted" style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
            Set up your digital menu in minutes
          </p>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {error && (
              <div className={styles.authError}>
                {error}
              </div>
            )}

            <div className={styles.fieldGroup}>
              <label htmlFor="name" className="label">Your Name</label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder="Raj Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="restaurantName" className="label">Restaurant Name</label>
              <input
                id="restaurantName"
                type="text"
                className="input"
                placeholder="Spice Garden"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required
                maxLength={100}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "var(--space-2)" }}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="text-sm text-muted" style={{ textAlign: "center", marginTop: "var(--space-5)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--color-accent)" }}>
              Log In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
