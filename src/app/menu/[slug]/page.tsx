import { notFound } from "next/navigation";
import { createPocketBase } from "@/lib/pocketbase";
import type { Restaurant, Category, MenuItem } from "@/lib/pocketbase";
import { MenuSPA } from "@/components/menu/MenuSPA";
import type { Metadata } from "next";

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

// Generate metadata dynamically
export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const pb = createPocketBase();

  try {
    const restaurant = await pb
      .collection("restaurants")
      .getFirstListItem<Restaurant>(`slug="${slug}" && isActive=true`);

    return {
      title: restaurant.name,
      description: restaurant.description || `Browse the menu at ${restaurant.name}`,
    };
  } catch {
    return { title: "Restaurant Not Found" };
  }
}

export default async function RestaurantPage(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;
  const pb = createPocketBase();

  // Fetch restaurant
  let restaurant: Restaurant;
  try {
    restaurant = await pb
      .collection("restaurants")
      .getFirstListItem<Restaurant>(`slug="${slug}" && isActive=true`);
  } catch {
    notFound();
  }

  // Fetch active categories
  const categories = await pb
    .collection("categories")
    .getFullList<Category>({
      filter: `restaurant="${restaurant.id}" && isActive=true`,
      sort: "displayOrder",
    });

  // Fetch all items for the restaurant
  const items = await pb.collection("menu_items").getFullList<MenuItem>({
    filter: `restaurant="${restaurant.id}" && isAvailable=true`,
    sort: "displayOrder",
  });

  return (
    <main>
      <MenuSPA
        restaurant={restaurant}
        categories={categories}
        items={items}
      />
    </main>
  );
}
