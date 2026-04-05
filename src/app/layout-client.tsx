"use client";

import { SiteNav } from "@/components/client/SiteNav";

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-full">
      <SiteNav />
      <div className="flex-1 w-full pt-16">{children}</div>
    </div>
  );
}
