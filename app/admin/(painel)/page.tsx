import type { Metadata } from "next";
import PainelAdmin from "@/components/admin/PainelAdmin";

export const metadata: Metadata = {
  title: "Administração",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <PainelAdmin />;
}
