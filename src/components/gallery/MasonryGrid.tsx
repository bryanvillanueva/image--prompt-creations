import ImageCard from "./ImageCard";
import ImageSkeleton from "./ImageSkeleton";
import type { ImageItem } from "@/data/images";

export default function MasonryGrid({ items, isLoading }: { items: ImageItem[]; isLoading?: boolean; }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <ImageSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
      {items.map((it) => (
        <ImageCard key={it.id} item={it} />
      ))}
    </div>
  );
}