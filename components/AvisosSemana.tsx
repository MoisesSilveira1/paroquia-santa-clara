"use client";

import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { repositorio } from "@/lib/conteudo";
import { paroquia } from "@/lib/dados";

export default function AvisosSemana() {
  const [avisos, setAvisos] = useState<string[]>([]);

  useEffect(() => {
    let ativo = true;
    repositorio
      .listarAvisos({ somenteAtivos: true })
      .then((lista) => {
        if (ativo) setAvisos(lista.map((aviso) => aviso.texto));
      })
      .catch(() => {
        // A página inicial não deve quebrar por causa dos avisos: se a consulta
        // falhar, a seção simplesmente não aparece.
      });
    return () => {
      ativo = false;
    };
  }, []);

  if (avisos.length === 0) return null;

  return (
    <div className="rounded-2xl border-l-4 border-destaque bg-white p-6 shadow-sm sm:p-8">
      <h2 className="flex items-center gap-3 text-2xl text-principal-escuro">
        <Megaphone className="h-7 w-7 text-destaque" aria-hidden />
        Avisos da Semana — Secretaria
      </h2>
      <ul className="mt-4 space-y-3">
        {avisos.map((aviso) => (
          <li key={aviso} className="flex items-start gap-3 text-base">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-principal" aria-hidden />
            {aviso}
          </li>
        ))}
      </ul>
      <p className="mt-5 text-sm text-texto-suave">
        Secretaria: {paroquia.horarioSecretaria} · {paroquia.telefone}
      </p>
    </div>
  );
}
