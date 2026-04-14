"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./scratchpad.module.css";

const DUMMY_CATEGORIES = [
  { id: "c1", name: "Starters", icon: "🍽️" },
  { id: "c2", name: "Main Course", icon: "🍛" },
  { id: "c3", name: "Breads", icon: "🥖" },
  { id: "c4", name: "Desserts", icon: "🍨" },
  { id: "c5", name: "Beverages", icon: "🍹" },
];

const DUMMY_ITEMS = [
  {
    id: "1",
    name: "Paneer Tikka",
    desc: "Marinated cottage cheese cubes grilled in tandoor with bell peppers and onions.",
    price: 249,
    discountPrice: null,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&h=200&fit=crop",
    category: "c1",
    isNew: false,
    diet: "veg",
  },
  {
    id: "2",
    name: "Chicken 65",
    desc: "Crispy deep-fried chicken with curry leaves and red chilies.",
    price: 320,
    discountPrice: 279,
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=200&h=200&fit=crop",
    category: "c1",
    isNew: true,
    diet: "non-veg",
  },
  {
    id: "3",
    name: "Butter Chicken",
    desc: "Tender chicken cooked in a rich, creamy tomato and butter gravy.",
    price: 450,
    discountPrice: 399,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&h=200&fit=crop",
    category: "c2",
    isNew: false,
    diet: "non-veg",
  },
];

export default function Scratchpad() {
  const [activeCategory, setActiveCategory] = useState("c1");

  const filteredItems = DUMMY_ITEMS.filter((i) => i.category === activeCategory);

  return (
    <div className={styles.container}>
      {/* Top Bar */}
      <header className={styles.topBar}>
        <div className={styles.brandLabel}>4D SMART MENU</div>
        <div className={styles.topBarIcons}>
          <span>🔍</span>
          <span>🌍</span>
          <span>🛒</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.greeting}>Good Evening</div>
        <div className={styles.restaurantNameContainer}>
          <svg className={`${styles.floralSvg} ${styles.floralSvgLeft}`} viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
          </svg>
          <h1 className={styles.restaurantName}>THE GOLDEN OAK</h1>
          <svg className={styles.floralSvg} viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
          </svg>
        </div>
      </section>

      {/* Categories Horizontal Scroll */}
      <div className={styles.categoriesWrapper}>
        <div className={styles.categoriesList}>
          {DUMMY_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`${styles.categoryPill} ${
                activeCategory === cat.id ? styles.categoryPillActive : ""
              }`}
            >
              <span className={styles.categoryIcon}>{cat.icon}</span>
              <span>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className={styles.searchWrapper}>
        <div className={styles.searchBar}>
          <span>🔍</span>
          <span>Search dishes...</span>
        </div>
      </div>

      {/* Vertical Menu Items */}
      <div className={styles.menuList}>
        {filteredItems.map((item) => (
          <div key={item.id} className={styles.menuItem}>
            <div className={styles.itemImageWrapper}>
              <img src={item.image} alt={item.name} className={styles.itemImage} />
              {item.isNew && <span className={styles.newBadge}>NEW</span>}
            </div>
            
            <div className={styles.itemDetails}>
              <div className={styles.headerRow}>
                <h3 className={styles.itemName}>{item.name}</h3>
                <span style={{ fontSize: "0.6rem" }}>{item.diet === "veg" ? "🟢" : "🔴"}</span>
              </div>
              <p className={styles.itemDesc}>{item.desc}</p>
              
              <div className={styles.priceRow}>
                <span className={styles.priceSale}>₹{item.discountPrice || item.price}</span>
                {item.discountPrice && (
                  <span className={styles.priceOriginal}>₹{item.price}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <div className={styles.fab}>
        <span className={styles.fabIcon}>👨‍🍳</span>
        <span className={styles.fabText}>Ask</span>
      </div>
    </div>
  );
}
