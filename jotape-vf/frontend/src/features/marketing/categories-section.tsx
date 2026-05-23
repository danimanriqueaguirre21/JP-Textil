import { CategoryCarousel } from "@/features/marketing/category-carousel";
import { getCategoryCarouselItems } from "@/features/marketing/category-carousel-data";

export function CategoriesSection() {
  const items = getCategoryCarouselItems();
  return <CategoryCarousel items={items} />;
}
