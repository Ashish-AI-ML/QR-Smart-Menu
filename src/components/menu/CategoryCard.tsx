import Link from "next/link";
import { imagePresets } from "@/lib/cloudinary";
import styles from "./menu.module.css";

interface CategoryCardProps {
  id: string;
  name: string;
  icon?: string;
  itemCount?: number;
  slug: string;
}

export function CategoryCard({ id, name, icon, itemCount, slug }: CategoryCardProps) {
  const iconUrl = icon ? imagePresets.categoryIcon(icon) : "";

  return (
    <Link
      href={`/menu/${slug}/${id}`}
      className={`glass-card glass-card--interactive ${styles.categoryCard}`}
      id={`category-${id}`}
    >
      <div className={styles.categoryIcon}>
        {iconUrl ? (
          <img src={iconUrl} alt="" className={styles.categoryIconImage} loading="lazy" />
        ) : (
          <span className={styles.categoryEmoji}>
            {getCategoryEmoji(name)}
          </span>
        )}
      </div>
      <h2 className={styles.categoryName}>{name}</h2>
      {typeof itemCount === "number" && (
        <p className={styles.categoryCount}>
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      )}
    </Link>
  );
}

function getCategoryEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("starter") || lower.includes("appetizer")) return "🥗";
  if (lower.includes("main") || lower.includes("entree")) return "🍛";
  if (lower.includes("biryani") || lower.includes("rice")) return "🍚";
  if (lower.includes("bread") || lower.includes("roti") || lower.includes("naan")) return "🫓";
  if (lower.includes("beverage") || lower.includes("drink")) return "🥤";
  if (lower.includes("dessert") || lower.includes("sweet")) return "🍮";
  if (lower.includes("non-veg") || lower.includes("chicken") || lower.includes("mutton")) return "🍗";
  if (lower.includes("veg")) return "🥬";
  if (lower.includes("soup")) return "🍲";
  if (lower.includes("salad")) return "🥗";
  return "🍽️";
}
