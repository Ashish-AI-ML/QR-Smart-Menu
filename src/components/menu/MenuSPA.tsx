"use client";

import { useState, useEffect } from "react";
import type { Restaurant, Category, MenuItem } from "@/lib/pocketbase";
import styles from "./menu-spa.module.css";
import { imagePresets } from "@/lib/cloudinary";
import { ItemDetailModal } from "./ItemDetailModal";

export function MenuSPA({
  restaurant,
  categories,
  items,
}: {
  restaurant: Restaurant;
  categories: Category[];
  items: MenuItem[];
}) {
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id || "");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Phase 4 States
  const [searchQuery, setSearchQuery] = useState("");
  const [showConcierge, setShowConcierge] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "specials" | "veg">("all");

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch

  // Dynamic Filtering Logic
  let filteredItems = items;
  
  if (searchQuery.trim().length > 0) {
    // If searching, ignore categories and filter globally
    const q = searchQuery.toLowerCase();
    filteredItems = items.filter(
      (i) => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
    );
  } else {
    // Standard filtering based on Category and Concierge Filters
    filteredItems = items.filter((i) => i.category === activeCategoryId);
    
    if (activeFilter === "specials") {
      filteredItems = items.filter(i => i.isFeatured); // Global specials
    } else if (activeFilter === "veg") {
      filteredItems = filteredItems.filter(i => i.dietaryTags?.includes("veg"));
    }
  }

  const handleConciergeAction = (action: string) => {
    if (window.navigator.vibrate) window.navigator.vibrate(50);
    if (action === "specials") setActiveFilter("specials");
    if (action === "veg") setActiveFilter("veg");
    if (action === "all") setActiveFilter("all");
    if (action === "waiter") alert("🔔 Waiter has been notified for your table.");
    setShowConcierge(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.ambientCandle} />

      {/* Top Bar */}
      <header className={styles.topBar}>
        <div className={styles.brandLabel}>4D SMART MENU</div>
      </header>

      {/* Hero Section */}
      <section className={`${styles.hero} ${isScrolled ? styles.heroShrink : ""}`}>
        <div className={styles.greeting}>Good Evening</div>
        <div className={styles.restaurantNameContainer}>
          <svg className={`${styles.floralSvg} ${styles.floralSvgLeft}`} viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
          </svg>
          <h1 className={styles.restaurantName}>{restaurant.name}</h1>
          <svg className={styles.floralSvg} viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
          </svg>
        </div>
      </section>

      {/* Categories Horizontal Scroll - Hide if searching or showing specials */}
      {!searchQuery && activeFilter !== "specials" && (
        <div className={styles.categoriesWrapper}>
          <div className={styles.categoriesList}>
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  if (window.navigator.vibrate) window.navigator.vibrate(20);
                  setActiveCategoryId(cat.id);
                  setActiveFilter("all");
                }}
                className={`${styles.categoryPill} ${
                  activeCategoryId === cat.id && activeFilter === "all" ? styles.categoryPillActive : ""
                }`}
              >
                <span className={styles.categoryIcon}>
                  {cat.icon ? (
                    cat.icon.length <= 4 ? ( // If it is 1-2 characters, it's just an emoji!
                      cat.icon
                    ) : ( // Otherwise it's a Cloudinary ID
                      <img src={imagePresets.categoryIcon(cat.icon)} alt="" style={{width: 20, height: 20, borderRadius: '50%'}} />
                    )
                  ) : "🍽️"}
                </span>
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Header for Active Filters */}
      {activeFilter === "specials" && !searchQuery && (
         <div style={{padding: "0 1.25rem", marginBottom: "1rem"}}>
           <h2 style={{fontFamily: "var(--font-cormorant)", color: "var(--color-primary)"}}>🌟 Chef's Recommendations</h2>
           <button onClick={() => setActiveFilter("all")} style={{color: "#888", fontSize: "0.8rem", textDecoration: "underline"}}>← Back to Menu</button>
         </div>
      )}

      {/* Search Bar */}
      <div className={styles.searchWrapper}>
        <div className={styles.searchBar}>
          <span>🔍</span>
          <input 
            type="text" 
            placeholder="Search dishes..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Vertical Menu Items */}
      <div className={styles.menuList}>
        {filteredItems.map((item, index) => {
          const isVeg = item.dietaryTags?.includes("veg");
          const discountPrice = item.discountPrice ? item.discountPrice / 100 : null;
          const price = item.price / 100;
          const imageSrc = item.image ? imagePresets.thumbnail(item.image) : "";

          // Calculate stagger delay based on index for the lively animation
          const staggerStyle = { animationDelay: `${index * 0.05}s` } as React.CSSProperties;

          return (
            <div 
              key={item.id} 
              className={styles.menuItem} 
              onClick={() => setSelectedItem(item)}
              style={staggerStyle}
            >
              <div className={styles.itemImageWrapper}>
                {imageSrc ? (
                   <img src={imageSrc} alt={item.name} className={styles.itemImage} />
                ) : (
                  <div className={styles.itemImageFallback}>{item.name[0]}</div>
                )}
                {item.isFeatured && <span className={styles.newBadge}>⭐ NEW</span>}
              </div>
              
              <div className={styles.itemDetails}>
                <div className={styles.headerRow}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <span style={{ fontSize: "0.6rem" }}>{isVeg ? "🟢" : "🔴"}</span>
                </div>
                <p className={styles.itemDesc}>{item.description}</p>
                
                <div className={styles.priceRow}>
                  <span className={styles.priceSale}>₹{discountPrice || price}</span>
                  {discountPrice && (
                    <span className={styles.priceOriginal}>₹{price}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filteredItems.length === 0 && (
          <p style={{textAlign: "center", color: "#888", padding: "2rem"}}>No items in this category.</p>
        )}
      </div>

      {/* FAB - Ask Chef */}
      <div className={styles.fab} onClick={() => {
        if (window.navigator.vibrate) window.navigator.vibrate(100);
        setShowConcierge(true);
      }}>
        <span className={styles.fabIcon}>👨‍🍳</span>
        <span className={styles.fabText}>Ask</span>
      </div>

      {/* The Digital Concierge Bottom Sheet */}
      {showConcierge && (
        <div className={styles.conciergeOverlay} onClick={() => setShowConcierge(false)}>
          <div className={styles.conciergeSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.conciergeHeader}>
              <h3>Digital Concierge</h3>
              <button onClick={() => setShowConcierge(false)}>✕</button>
            </div>
            <p className={styles.conciergeSub}>How can the chef assist you today?</p>
            
            <div className={styles.conciergeOptions}>
              <button onClick={() => handleConciergeAction("specials")} className={styles.conciergeBtn}>
                🌟 Show me Chef's Specials
              </button>
              <button onClick={() => handleConciergeAction("veg")} className={styles.conciergeBtn}>
                🥗 Filter Vegetarian Only
              </button>
              {activeFilter !== "all" && (
                <button onClick={() => handleConciergeAction("all")} className={styles.conciergeBtn}>
                  🍽️ Show Full Menu
                </button>
              )}
              <button onClick={() => handleConciergeAction("waiter")} className={`${styles.conciergeBtn} ${styles.conciergeBtnOutline}`}>
                🔔 Request Human Waiter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AR Modal Detail overlay */}
      {selectedItem && (
        <ItemDetailModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  );
}
