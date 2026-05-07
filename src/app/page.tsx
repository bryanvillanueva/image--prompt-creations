"use client";
import { useMemo, useState } from "react";
import FiltersBar, { type FiltersState } from "@/components/gallery/FiltersBar";
import MasonryGrid from "@/components/gallery/MasonryGrid";
import { IMAGES } from "@/data/images";

export default function Page() {
  const [filters, setFilters] = useState<FiltersState>({ type: "Todos", styles: [], query: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (f: FiltersState) => {
    setLoading(true);
    setFilters(f);
    setTimeout(() => setLoading(false), 300);
  };

  const items = useMemo(() => {
    return IMAGES.filter((img) => {
      const byType = filters.type === "Todos" || img.category === filters.type;
      const byStyles = !filters.styles.length || filters.styles.every((s) => img.styles.includes(s));
      const q = filters.query.trim().toLowerCase();
      const byQuery = !q || [img.alt, img.category, ...(img.styles || []), ...(img.tags || [])].join(" ").toLowerCase().includes(q);
      return byType && byStyles && byQuery;
    });
  }, [filters]);

  return (
    <div className="space-y-6">
      <FiltersBar value={filters} onChange={handleChange} resultsCount={items.length} />
      <MasonryGrid items={items} isLoading={loading} />
    </div>
  );
}