"use client";

import { imagePresets } from "@/lib/cloudinary";
import { formatPrice, formatDiscount } from "@/lib/format-price";
import type { MenuItem } from "@/lib/pocketbase";
import styles from "./menu.module.css";

interface MenuItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onSelect }: MenuItemCardProps) {
  const thumbnailUrl = item.image ? imagePresets.thumbnail(item.image) : "";
  const isVeg = item.dietaryTags?.includes("veg");
  const isNonVeg = item.dietaryTags?.includes("non-veg");
  const discount = item.discountPrice
    ? formatDiscount(item.price, item.discountPrice)
    : "";

  return (
    <button
      className={`glass-card glass-card--interactive ${styles.menuItemCard} ${
        !item.isAvailable ? "sold-out" : ""
      } ${item.isFeatured ? "featured-glow" : ""}`}
      onClick={() => item.isAvailable && onSelect(item)}
      id={`item-${item.id}`}
      aria-label={`${item.name} - ${formatPrice(item.discountPrice || item.price)}`}
    >
      {/* Image */}
      <div className="image-placeholder">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={item.name}
            className={styles.itemImage}
            loading="lazy"
          />
        ) : (
          <div className="image-fallback">
            <span>{item.name}</span>
          </div>
        )}
        {!item.isAvailable && (
          <div className={styles.soldOutOverlay}>
            <span className="badge badge-sold-out">Sold Out</span>
          </div>
        )}
        {item.isFeatured && item.isAvailable && (
          <div className={styles.featuredBadge}>
            <span className="badge badge-featured">⭐ Chef&apos;s Pick</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className={styles.itemInfo}>
        <div className={styles.itemNameRow}>
          {(isVeg || isNonVeg) && (
            <span
              className={`dietary-dot ${isVeg ? "dietary-dot--veg" : "dietary-dot--non-veg"}`}
              title={isVeg ? "Vegetarian" : "Non-Vegetarian"}
            />
          )}
          <h3 className={styles.itemName}>{item.name}</h3>
        </div>

        {item.description && (
          <p className={styles.itemDescription}>{item.description}</p>
        )}

        <div className={styles.itemPriceRow}>
          <span className="price">
            {formatPrice(item.discountPrice || item.price)}
          </span>
          {!!item.discountPrice && (
            <>
              <span className="price-original">{formatPrice(item.price)}</span>
              {discount && <span className="badge badge-featured">{discount}</span>}
            </>
          )}
        </div>

        {/* Spice level */}
        {item.spiceLevel > 0 && (
          <div className="spice-dots" title={`Spice level: ${item.spiceLevel}/5`}>
            {[1, 2, 3, 4, 5].map((level) => (
              <span
                key={level}
                className={`spice-dot ${level <= item.spiceLevel ? "spice-dot--active" : ""}`}
              >
                🌶️
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
