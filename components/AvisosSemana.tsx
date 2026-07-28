"use client";

import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { supabase, type Aviso } from "@/lib/supabase";
import { avisosSemana, paroquia } from "@/lib/dados";

export default function AvisosSemana() {
  // Começa com os avisos estáticos; troca pelos do Supabase quando disponíveis
  const [avisos, setAvisos] = useState<string[]>(avisosSemana);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("avisos")
      .select("*")
      .eq("ativo", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setAvisos((data as Aviso[]).map((a) => a.texto));
        }
      });
  }, []);

  return (
    <div className="rounded-2xl border-l-4 border-dourado bg-white p-6 shadow-sm sm:p-8">
      <h2 className="flex items-center gap-3 text-2xl text-terracota-escuro">
        <Megaphone className="h-7 w-7 text-dourado" aria-hidden />
        Avisos da Semana — Secretaria
      </h2>
      <ul className="mt-4 space-y-3">
        {avisos.map((aviso) => (
          <li key={aviso} className="flex items-start gap-3 text-base">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-terracota" aria-hidden />
            {aviso}
          </li>
        ))}
      </ul>
      <p className="mt-5 text-sm text-marrom-claro">
        Secretaria: {paroquia.horarioSecretaria} · {paroquia.telefone}
      </p>
    </div>
  );
}
