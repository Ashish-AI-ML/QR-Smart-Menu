import { imagePresets } from "@/lib/cloudinary";
import styles from "./menu.module.css";

interface RestaurantHeaderProps {
  name: string;
  description?: string;
  banner?: string;
  logo?: string;
  address?: string;
  phone?: string;
  operatingHours?: Record<string, string>;
}

export function RestaurantHeader({
  name,
  description,
  banner,
  logo,
  address,
}: RestaurantHeaderProps) {
  const bannerUrl = banner ? imagePresets.banner(banner) : "";
  const logoUrl = logo ? imagePresets.logo(logo) : "";

  return (
    <header className={styles.restaurantHeader}>
      {/* Banner */}
      <div className={styles.bannerContainer}>
        {bannerUrl ? (
          <img src={bannerUrl} alt={`${name} banner`} className={styles.bannerImage} loading="eager" />
        ) : (
          <div className={styles.bannerFallback}>
            <span>🍽️</span>
          </div>
        )}
        <div className={styles.bannerOverlay} />
      </div>

      {/* Restaurant info */}
      <div className={styles.restaurantInfo}>
        {logoUrl ? (
          <img src={logoUrl} alt={`${name} logo`} className={styles.logo} loading="eager" />
        ) : (
          <div className={styles.logoFallback}>
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className={styles.restaurantText}>
          <h1 className={styles.restaurantName}>{name}</h1>
          {description && (
            <p className={styles.restaurantDescription}>{description}</p>
          )}
          {address && (
            <p className={styles.restaurantAddress}>📍 {address}</p>
          )}
        </div>
      </div>
    </header>
  );
}
