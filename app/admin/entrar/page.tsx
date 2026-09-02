import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { usuarioDaSessao } from "@/lib/auth/sessao";
import FormularioEntrar from "./FormularioEntrar";

export const metadata: Metadata = {
  title: "Entrar",
};

export default async function PaginaEntrar() {
  // Quem já está logado não tem o que fazer aqui.
  if (await usuarioDaSessao()) redirect("/admin");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-fundo px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/fotos/brasao-escudo.webp"
            alt="Brasão da Paróquia Santa Clara e São Francisco de Assis"
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
            priority
          />
          <h1 className="mt-4 text-2xl text-texto">Painel da secretaria</h1>
          <p className="mt-1 text-sm text-texto-suave">
            Área restrita à equipe da paróquia.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-borda bg-superficie p-6 shadow-sm">
          <FormularioEntrar />
        </div>

        <Link
          href="/"
          className="mt-6 inline-flex w-full items-center justify-center gap-1.5 text-sm font-medium text-texto-suave transition-colors hover:text-texto"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Voltar ao site da paróquia
        </Link>
      </div>
    </div>
  );
}
