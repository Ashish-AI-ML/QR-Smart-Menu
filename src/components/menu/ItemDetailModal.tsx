"use client";

import { useEffect, useRef, useState } from "react";
import { imagePresets } from "@/lib/cloudinary";
import type { MenuItem } from "@/lib/pocketbase";
import styles from "./item-modal-4d.module.css";

interface ItemDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
  const modelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Parallax Tilt System
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!modelRef.current) return;
    const rect = modelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const tiltX = (clientY - centerY) / 8;
    const tiltY = -(clientX - centerX) / 8;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  // Algorithmic Steam System (Canvas)
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    
    // Auto-adjust canvas size
    canvasRef.current.width = 300;
    canvasRef.current.height = 300;

    let particles: any[] = [];
    let animationFrameId: number;

    const renderSteam = () => {
      ctx.clearRect(0, 0, 300, 300);
      
      // Randomly inject steam particles
      if (Math.random() < 0.1) {
        particles.push({
          x: 150 + (Math.random() * 80 - 40),
          y: 280,
          size: Math.random() * 15 + 10,
          life: 0,
          maxLife: Math.random() * 60 + 40,
          dx: (Math.random() - 0.5) * 1,
          dy: -Math.random() * 1.5 - 0.5,
        });
      }

      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.life++;
        p.x += p.dx;
        p.y += p.dy;
        p.size += 0.2; // Expand steam as it rises

        // Calculate opacity (fade in, then fade out)
        let opacity = 0;
        if (p.life < 10) opacity = p.life / 10;
        else opacity = 1 - (p.life - 10) / (p.maxLife - 10);
        
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.15})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          i--;
        }
      }

      animationFrameId = requestAnimationFrame(renderSteam);
    };
    renderSteam();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Handle Escape Key
  useEffect(() => {
    if (!item) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  if (!item) return null;

  const imageUrl = item.image ? imagePresets.detail(item.image) : "";
  const isVeg = item.dietaryTags?.includes("veg");
  const price = item.price / 100;
  const discountPrice = item.discountPrice ? item.discountPrice / 100 : null;

  return (
    <>
      <svg style={{ display: 'none' }}>
        <filter id="liquidGlass">
          <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="1" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 15 -5" in="noise" result="coloredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="coloredNoise" scale="15" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className={styles.modalContent}>
          
          <div className={styles.headerControls}>
            <button className={styles.closeButton} onClick={onClose}>✕</button>
          </div>

          <div 
            className={styles.imageShowcase} 
            onMouseMove={handleMouseMove} 
            onTouchMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchEnd={handleMouseLeave}
          >
            {imageUrl ? (
              <div 
                className={styles.modelWrapper} 
                ref={modelRef}
                style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
              >
                <div className={styles.glowRing} />
                <img src={imageUrl} alt={item.name} className={styles.foodImage} />
                <div className={styles.imageShine} />
                
                {/* Algorithmic Steam Canvas */}
                <canvas ref={canvasRef} className={styles.steamCanvas} />
              </div>
            ) : (
              <div className={styles.modelWrapper} style={{ backgroundColor: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                 No Image
              </div>
            )}
          </div>

          <div className={styles.detailsContainer}>
            <div className={styles.titleRow}>
              <h2 className={styles.dishName}>{item.name}</h2>
              <div className={styles.priceBlock}>
                <span className={styles.currentPrice}>₹{discountPrice || price}</span>
                {discountPrice && <span className={styles.oldPrice}>₹{price}</span>}
              </div>
            </div>

            <div className={styles.badges}>
              {isVeg ? (
                <span className={`${styles.badge} ${styles.badgeVeg}`}>Pure Veg</span>
              ) : (
                <span className={`${styles.badge} ${styles.badgeNonVeg}`}>Non-Veg</span>
              )}
              <span className={styles.badgeHeat}>♨️ Fresh & Hot</span>
            </div>

            <p className={styles.description}>
              {item.description || "A delicious signature dish perfected by our head chef."}
            </p>

            <button className={styles.addToOrderBtn} onClick={() => alert("Added to mock cart!")}>
              Add to Order
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
