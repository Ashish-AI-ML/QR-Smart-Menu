"use client";

import { useEffect, useState, useCallback } from "react";
import { getClientPB } from "@/lib/pocketbase";
import { formatPrice, toPaise } from "@/lib/format-price";
import type { Restaurant, Category, MenuItem } from "@/lib/pocketbase";
import { CldUploadWidget } from "next-cloudinary";
import styles from "../dashboard.module.css";

export default function MenuManagementPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadData = useCallback(async () => {
    const pb = getClientPB();
    const userId = pb.authStore.record?.id;
    if (!userId) return;

    try {
      const rest = await pb.collection("restaurants").getFirstListItem<Restaurant>(`owner="${userId}"`);
      setRestaurant(rest);

      const cats = await pb.collection("categories").getFullList<Category>({
        filter: `restaurant="${rest.id}"`,
        sort: "displayOrder",
      });
      setCategories(cats);

      const menuItems = await pb.collection("menu_items").getFullList<MenuItem>({
        filter: `restaurant="${rest.id}"`,
        sort: "displayOrder",
      });
      setItems(menuItems);
    } catch (err) {
      console.error("Failed to load menu data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Toggle item availability
  async function toggleAvailability(item: MenuItem) {
    const pb = getClientPB();
    try {
      await pb.collection("menu_items").update(item.id, { isAvailable: !item.isAvailable });
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i));
      showToast(item.isAvailable ? `${item.name} marked as sold out` : `${item.name} is now available`);
    } catch {
      showToast("Failed to update item", "error");
    }
  }

  // Save category
  async function saveCategory(data: { name: string; displayOrder: number; icon: string }) {
    const pb = getClientPB();
    try {
      if (editingCategory) {
        await pb.collection("categories").update(editingCategory.id, data);
        showToast("Category updated");
      } else {
        await pb.collection("categories").create({ ...data, restaurant: restaurant?.id, isActive: true });
        showToast("Category created");
      }
      setShowCategoryForm(false);
      setEditingCategory(null);
      loadData();
    } catch {
      showToast("Failed to save category", "error");
    }
  }

  // Delete category
  async function deleteCategory(catId: string) {
    if (!confirm("Delete this category and all its items?")) return;
    const pb = getClientPB();
    try {
      const catItems = items.filter((i) => i.category === catId);
      for (const item of catItems) {
        await pb.collection("menu_items").delete(item.id);
      }
      await pb.collection("categories").delete(catId);
      showToast("Category deleted");
      loadData();
    } catch {
      showToast("Failed to delete category", "error");
    }
  }

  // Save menu item
  async function saveItem(data: {
    name: string;
    description: string;
    price: number;
    discountPrice: number;
    category: string;
    dietaryTags: string[];
    spiceLevel: number;
    isFeatured: boolean;
    image: string;
  }) {
    const pb = getClientPB();
    try {
      const payload = {
        ...data,
        price: toPaise(data.price),
        discountPrice: data.discountPrice ? toPaise(data.discountPrice) : null,
        restaurant: restaurant?.id,
        isAvailable: true,
        displayOrder: items.filter((i) => i.category === data.category).length,
      };

      if (editingItem) {
        await pb.collection("menu_items").update(editingItem.id, payload);
        showToast("Item updated");
      } else {
        await pb.collection("menu_items").create(payload);
        showToast("Item created");
      }
      setShowItemForm(false);
      setEditingItem(null);
      loadData();
    } catch {
      showToast("Failed to save item", "error");
    }
  }

  // Delete item
  async function deleteItem(itemId: string) {
    if (!confirm("Delete this menu item?")) return;
    const pb = getClientPB();
    try {
      await pb.collection("menu_items").delete(itemId);
      showToast("Item deleted");
      loadData();
    } catch {
      showToast("Failed to delete item", "error");
    }
  }

  if (loading) {
    return (
      <div className={styles.menuPage}>
        <div className="skeleton" style={{ height: "32px", width: "200px", marginBottom: "var(--space-6)" }} />
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card" style={{ padding: "var(--space-4)", marginBottom: "var(--space-3)" }}>
            <div className="skeleton skeleton-text" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.menuPage}>
      <div className={styles.menuHeader}>
        <h1 className="heading-2">Menu</h1>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => { setEditingCategory(null); setShowCategoryForm(true); }}>
            + Category
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditingItem(null); setSelectedCategoryId(categories[0]?.id || ""); setShowItemForm(true); }}
            disabled={categories.length === 0}>
            + Item
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="glass-card" style={{ padding: "var(--space-8)", textAlign: "center" }}>
          <p style={{ fontSize: "2rem", marginBottom: "var(--space-3)" }}>🍽️</p>
          <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>
            No categories yet. Create one to start adding menu items.
          </p>
          <button className="btn btn-primary" onClick={() => setShowCategoryForm(true)}>
            Create First Category
          </button>
        </div>
      ) : (
        categories.map((cat) => {
          const categoryItems = items.filter((i) => i.category === cat.id);
          return (
            <div key={cat.id} className={styles.categorySection}>
              <div className={styles.categorySectionHeader}>
                <h3 className="heading-4">{cat.name}</h3>
                <div className={styles.categoryActions}>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditingCategory(cat); setShowCategoryForm(true); }}>✏️</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => deleteCategory(cat.id)}>🗑️</button>
                </div>
              </div>
              <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
                {categoryItems.length === 0 ? (
                  <p className="text-muted" style={{ padding: "var(--space-4)", textAlign: "center" }}>
                    No items. Click &quot;+ Item&quot; to add one.
                  </p>
                ) : (
                  categoryItems.map((item) => (
                    <div key={item.id} className={styles.menuItemRow}>
                      <div className={styles.menuItemInfo}>
                        {item.dietaryTags?.includes("veg") && <span className="dietary-dot dietary-dot--veg" />}
                        {item.dietaryTags?.includes("non-veg") && <span className="dietary-dot dietary-dot--non-veg" />}
                        <span className={styles.menuItemName}>{item.name}</span>
                        <span className={styles.menuItemPrice}>{formatPrice(item.price)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                        <button
                          className={`${styles.toggle} ${item.isAvailable ? styles.toggleActive : ""}`}
                          onClick={() => toggleAvailability(item)}
                          title={item.isAvailable ? "Available" : "Sold Out"}
                        >
                          <div className={styles.toggleDot} />
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditingItem(item); setSelectedCategoryId(item.category); setShowItemForm(true); }}>✏️</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => deleteItem(item.id)}>🗑️</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <CategoryFormModal
          category={editingCategory}
          onSave={saveCategory}
          onClose={() => { setShowCategoryForm(false); setEditingCategory(null); }}
        />
      )}

      {/* Item Form Modal */}
      {showItemForm && (
        <ItemFormModal
          item={editingItem}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSave={saveItem}
          onClose={() => { setShowItemForm(false); setEditingItem(null); }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

// --- Category Form Modal ----
function CategoryFormModal({
  category,
  onSave,
  onClose,
}: {
  category: Category | null;
  onSave: (data: { name: string; displayOrder: number; icon: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(category?.name || "");
  const [order, setOrder] = useState(category?.displayOrder || 0);
  const [icon, setIcon] = useState(category?.icon || "");

  return (
    <div className={styles.formModal}>
      <div className={styles.formModalBackdrop} onClick={onClose} />
      <div className={styles.formModalContent}>
        <div className={styles.formModalHeader}>
          <h2 className="heading-3">{category ? "Edit" : "New"} Category</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form
          className={styles.formGrid}
          onSubmit={(e) => { e.preventDefault(); onSave({ name, displayOrder: order, icon }); }}
        >
          <div>
            <label htmlFor="catName" className="label">Name</label>
            <input id="catName" className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={30} placeholder="e.g. Starters" />
          </div>
          <div>
            <label htmlFor="catOrder" className="label">Display Order</label>
            <input id="catOrder" type="number" className="input" value={order} onChange={(e) => setOrder(Number(e.target.value))} min={0} />
          </div>

          <div>
            <label className="label">Category Image / Icon</label>
            <div style={{ marginTop: "var(--space-2)" }}>
              <CldUploadWidget
                uploadPreset="smartmenu_uploads"
                onSuccess={(result: any) => setIcon(result?.info?.public_id || "")}
                options={{ maxFiles: 1, multiple: false }}
              >
                {({ open }) => (
                  <button type="button" className="btn btn-secondary" onClick={() => open()} style={{ width: "100%" }}>
                    {icon ? "📷 Change Category Image" : "📷 Upload Category Image"}
                  </button>
                )}
              </CldUploadWidget>
              {icon && <p className="text-xs text-muted" style={{ marginTop: "var(--space-1)" }}>Image successfully attached!</p>}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            {category ? "Update" : "Create"} Category
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Item Form Modal ----
function ItemFormModal({
  item,
  categories,
  selectedCategoryId,
  onSave,
  onClose,
}: {
  item: MenuItem | null;
  categories: Category[];
  selectedCategoryId: string;
  onSave: (data: { name: string; description: string; price: number; discountPrice: number; category: string; dietaryTags: string[]; spiceLevel: number; isFeatured: boolean; image: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(item?.name || "");
  const [description, setDescription] = useState(item?.description || "");
  const [price, setPrice] = useState(item ? item.price / 100 : 0);
  const [discountPrice, setDiscountPrice] = useState(item?.discountPrice ? item.discountPrice / 100 : 0);
  const [category, setCategory] = useState(selectedCategoryId);
  const [isVeg, setIsVeg] = useState(item?.dietaryTags?.includes("veg") || false);
  const [spiceLevel, setSpiceLevel] = useState(item?.spiceLevel || 0);
  const [isFeatured, setIsFeatured] = useState(item?.isFeatured || false);
  const [image, setImage] = useState(item?.image || "");

  return (
    <div className={styles.formModal}>
      <div className={styles.formModalBackdrop} onClick={onClose} />
      <div className={styles.formModalContent}>
        <div className={styles.formModalHeader}>
          <h2 className="heading-3">{item ? "Edit" : "New"} Item</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form
          className={styles.formGrid}
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              name,
              description,
              price,
              discountPrice,
              category,
              dietaryTags: isVeg ? ["veg"] : ["non-veg"],
              spiceLevel,
              isFeatured,
              image,
            });
          }}
        >
          <div>
            <label htmlFor="itemName" className="label">Name</label>
            <input id="itemName" className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} placeholder="e.g. Paneer Tikka" />
          </div>
          <div>
            <label htmlFor="itemDesc" className="label">Description</label>
            <textarea id="itemDesc" className="input" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} placeholder="Marinated cottage cheese grilled in tandoor" rows={2} style={{ resize: "none" }} />
          </div>
          <div>
            <label htmlFor="itemCategory" className="label">Category</label>
            <select id="itemCategory" className="input" value={category} onChange={(e) => setCategory(e.target.value)} required>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.formRow}>
            <div>
              <label htmlFor="itemPrice" className="label">Price (₹)</label>
              <input id="itemPrice" type="number" className="input" value={price} onChange={(e) => setPrice(Number(e.target.value))} required min={0} step={1} />
            </div>
            <div>
              <label htmlFor="itemDiscount" className="label">Sale Price (₹)</label>
              <input id="itemDiscount" type="number" className="input" value={discountPrice} onChange={(e) => setDiscountPrice(Number(e.target.value))} min={0} step={1} placeholder="Optional" />
            </div>
          </div>
          <div className={styles.formRow}>
            <div>
              <label className="label">Diet</label>
              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <button type="button" className={`btn btn-sm ${isVeg ? "btn-primary" : "btn-secondary"}`} onClick={() => setIsVeg(true)} style={isVeg ? { background: "var(--color-veg)" } : {}}>🟢 Veg</button>
                <button type="button" className={`btn btn-sm ${!isVeg ? "btn-primary" : "btn-secondary"}`} onClick={() => setIsVeg(false)} style={!isVeg ? { background: "var(--color-non-veg)" } : {}}>🔴 Non-Veg</button>
              </div>
            </div>
            <div>
              <label htmlFor="itemSpice" className="label">Spice Level (0-5)</label>
              <input id="itemSpice" type="range" min={0} max={5} value={spiceLevel} onChange={(e) => setSpiceLevel(Number(e.target.value))} style={{ width: "100%", marginTop: "var(--space-2)" }} />
              <span className="text-xs text-muted">{spiceLevel > 0 ? "🌶️".repeat(spiceLevel) : "Not spicy"}</span>
            </div>
          </div>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", cursor: "pointer" }}>
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              <span className="text-sm">⭐ Mark as Chef&apos;s Pick</span>
            </label>
          </div>

          <div>
            <label className="label">Item Image</label>
            <div style={{ marginTop: "var(--space-2)" }}>
              <CldUploadWidget
                uploadPreset="smartmenu_uploads"
                onSuccess={(result: any) => setImage(result?.info?.public_id || "")}
                options={{
                  maxFiles: 1,
                  multiple: false,
                  sources: ["local", "url", "camera"],
                }}
              >
                {({ open }) => (
                  <button type="button" className="btn btn-secondary" onClick={() => open()} style={{ width: "100%" }}>
                    {image ? "📷 Change Image" : "📷 Upload Image"}
                  </button>
                )}
              </CldUploadWidget>
              {image && (
                <p className="text-xs text-muted" style={{ marginTop: "var(--space-1)" }}>
                  Image successfully attached!
                </p>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            {item ? "Update" : "Create"} Item
          </button>
        </form>
      </div>
    </div>
  );
}
