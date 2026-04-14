"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClientPB } from "@/lib/pocketbase";
import styles from "../auth.module.css";

export default function LoginPage() {
  const router = useRouter();
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
      await pb.collection("users").authWithPassword(email, password);
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password. Please try again.");
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
            Welcome Back
          </h1>
          <p className="text-sm text-muted" style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
            Log in to manage your restaurant menu
          </p>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {error && (
              <div className={styles.authError}>
                {error}
              </div>
            )}

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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "var(--space-2)" }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="text-sm text-muted" style={{ textAlign: "center", marginTop: "var(--space-5)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "var(--color-accent)" }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
