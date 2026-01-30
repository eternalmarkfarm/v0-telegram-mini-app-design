"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import PromLayout from "@/app/prom/components/Layout";

export default function RouteLayoutSwitch({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const isLegacy = pathname.startsWith("/legacy");

  if (isLegacy) return <>{children}</>;

  return (
    <div className="prom-root">
      <PromLayout>{children}</PromLayout>
    </div>
  );
}
