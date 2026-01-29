import type { ReactNode } from "react";
import Layout from "@/app/prom/components/Layout";
import "./prom.css";

export default function PromLayout({ children }: { children: ReactNode }) {
  return (
    <div className="prom-root">
      <Layout>{children}</Layout>
    </div>
  );
}
