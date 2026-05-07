"use client";
import { useMemo, useState } from "react";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import MultiSearchableDropdown from "@/components/ui/MultiSearchableDropdown";
import { IMAGE_TYPES, IMAGE_STYLES } from "@/data/filters";
import { X } from "lucide-react";

export type FiltersState = {
  type: string;       // valor actual del tab (ES)
  styles: string[];   // estilos seleccionados (ES)
  query: string;      // búsqueda por texto
};

export default function FiltersBar({ value, onChange, resultsCount }: { value: FiltersState; onChange: (f: FiltersState) => void; resultsCount: number; }) {
  const categoryItems = useMemo(() => ["Todos", ...IMAGE_TYPES.map((t) => t.es)], []);
  const styleItems = useMemo(() => IMAGE_STYLES.map((s) => s.es), []);

  const hasActiveFilters = value.type !== "Todos" || value.styles.length > 0 || value.query.trim() !== "";
  const clear = () => onChange({ type: "Todos", styles: [], query: "" });

  const removeCategory = () => onChange({ ...value, type: "Todos" });
  const removeStyle = (style: string) => onChange({ ...value, styles: value.styles.filter(s => s !== style) });
  const removeQuery = () => onChange({ ...value, query: "" });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-6 sticky top-4 z-30">
      <div className="p-4">
        {/* Header compact */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900">Explorar</h1>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {resultsCount}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            value={value.query}
            onChange={(e) => onChange({ ...value, query: e.target.value })}
            placeholder="Buscar imágenes..."
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors"
          />
          {value.query && (
            <button
              onClick={removeQuery}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Categoría</label>
            <SearchableDropdown
              label="categorías"
              placeholder="Todas las categorías"
              items={categoryItems}
              value={value.type}
              onChange={(type) => onChange({ ...value, type })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Estilos</label>
            <MultiSearchableDropdown
              label="estilos"
              placeholder="Todos los estilos"
              items={styleItems}
              values={value.styles}
              onChange={(styles) => onChange({ ...value, styles })}
            />
          </div>
        </div>

        {/* Active Filters Pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {value.type !== "Todos" && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {value.type}
                <button onClick={removeCategory} className="text-blue-600 hover:text-blue-800">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {value.styles.map(style => (
              <span key={style} className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {style}
                <button onClick={() => removeStyle(style)} className="text-green-600 hover:text-green-800">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Clear all button */}
        {hasActiveFilters && (
          <button
            onClick={clear}
            className="w-full text-xs text-red-600 hover:text-red-700 font-medium py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Limpiar todos los filtros
          </button>
        )}
      </div>
    </div>
  );
}