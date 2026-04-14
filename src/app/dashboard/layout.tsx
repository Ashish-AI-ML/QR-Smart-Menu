"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getClientPB } from "@/lib/pocketbase";
import styles from "./dashboard.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const pb = getClientPB();
    if (!pb.authStore.isValid) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
    setChecking(false);
  }, [router]);

  function handleLogout() {
    const pb = getClientPB();
    pb.authStore.clear();
    localStorage.removeItem("pb_auth");
    router.push("/login");
  }

  if (checking || !isAuthenticated) {
    return (
      <div className={styles.loadingScreen}>
        <div className="skeleton-circle" />
        <p className="text-muted" style={{ marginTop: "var(--space-4)" }}>Loading dashboard...</p>
      </div>
    );
  }

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: "📊" },
    { href: "/dashboard/menu", label: "Menu", icon: "🍽️" },
    { href: "/dashboard/qr-codes", label: "QR Codes", icon: "📱" },
    { href: "/dashboard/profile", label: "Profile", icon: "⚙️" },
  ];

  return (
    <div className={styles.dashboardWrapper}>
      {/* Sidebar — desktop */}
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.sidebarBrand}>
          <span style={{ fontSize: "1.5rem" }}>📱</span>
          <span className={styles.sidebarBrandName}>SmartMenu</span>
        </Link>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.sidebarLink} ${
                pathname === item.href ? styles.sidebarLinkActive : ""
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <button onClick={handleLogout} className={`${styles.sidebarLink} ${styles.logoutBtn}`}>
          <span>🚪</span>
          <span>Log Out</span>
        </button>
      </aside>

      {/* Main content */}
      <div className={styles.mainContent}>
        {/* Mobile bottom nav */}
        <nav className={`glass-nav ${styles.mobileNav}`}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.mobileNavLink} ${
                pathname === item.href ? styles.mobileNavLinkActive : ""
              }`}
            >
              <span>{item.icon}</span>
              <span className={styles.mobileNavLabel}>{item.label}</span>
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </div>
  );
}
