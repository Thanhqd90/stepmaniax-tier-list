"use client";

import { usePathname } from "next/navigation";
import { SmxNav } from "smx-tools-nav";

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      {isHome && <SmxNav />}
      {children}
    </>
  );
}
