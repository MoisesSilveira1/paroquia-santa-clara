import type { Metadata } from "next";
import GaleriaClient from "@/components/GaleriaClient";

export const metadata: Metadata = {
  title: "Galeria de Fotos",
  description: "Fotos dos eventos, festas e celebrações da paróquia.",
};

export default function GaleriaPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl text-principal-escuro">Galeria de Fotos</h1>
      <p className="mt-3 max-w-2xl text-texto-suave">
        Momentos da vida da nossa comunidade: festas dos padroeiros, celebrações
        e encontros.
      </p>
      <GaleriaClient />
    </div>
  );
}
