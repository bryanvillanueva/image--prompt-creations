"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check, X } from "lucide-react";

type MultiSearchableDropdownProps = {
  label: string;
  placeholder?: string;
  items: string[];
  values: string[];
  onChange: (values: string[]) => void;
  showSearch?: boolean;
};

export default function MultiSearchableDropdown({
  label,
  placeholder = "Seleccionar...",
  items,
  values,
  onChange,
  showSearch = true
}: MultiSearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredItems = items.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: string) => {
    if (values.includes(item)) {
      onChange(values.filter(v => v !== item));
    } else {
      onChange([...values, item]);
    }
  };

  const removeValue = (item: string) => {
    onChange(values.filter(v => v !== item));
  };

  const displayText = values.length === 0
    ? placeholder
    : `${values.length} seleccionado${values.length > 1 ? 's' : ''}`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <span className={values.length > 0 ? "text-gray-900" : "text-gray-500"}>
          {displayText}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Selected items pills */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {values.map(value => (
            <span
              key={value}
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              {value}
              <button
                onClick={() => removeValue(value)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-hidden">
          {showSearch && (
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Buscar ${label.toLowerCase()}...`}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="max-h-48 overflow-y-auto">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <button
                  key={item}
                  onClick={() => handleSelect(item)}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center justify-between group"
                >
                  <span className={values.includes(item) ? "text-blue-600 font-medium" : "text-gray-900"}>
                    {item}
                  </span>
                  {values.includes(item) && <Check className="h-4 w-4 text-blue-600" />}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}