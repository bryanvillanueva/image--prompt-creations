import * as React from "react";

export function MasonryGrid({ children }: { children: React.ReactNode }) {
  return <div className="masonry">{children}</div>;
}
