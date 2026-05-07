import Image from "next/image";
import type { ImageItem } from "@/data/images";

export default function ImageCard({ item }: { item: ImageItem }) {
  return (
    <figure className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-6 transition-all duration-300">
      <div className="relative">
        <Image
          src={item.src}
          alt={item.alt}
          width={800}
          height={1000}
          className="h-auto w-full object-cover aspect-[4/5]"
          loading="lazy"
          sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
        />

        {/* Hovercard */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
          <div className="w-full p-4 text-white">
            <h3 className="font-semibold text-lg mb-2">{item.alt}</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Categoría:</span> {item.category}</p>
              {item.styles.length > 0 && (
                <p><span className="font-medium">Estilos:</span> {item.styles.join(", ")}</p>
              )}
              {item.tags && item.tags.length > 0 && (
                <p><span className="font-medium">Tags:</span> {item.tags.join(", ")}</p>
              )}
              {item.author && (
                <p><span className="font-medium">Autor:</span> {item.author}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <figcaption className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
        <span className="truncate font-medium text-gray-900" title={item.alt}>{item.alt}</span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">{item.category}</span>
      </figcaption>
    </figure>
  );
}
