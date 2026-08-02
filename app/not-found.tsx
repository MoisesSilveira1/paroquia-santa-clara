import Link from "next/link";
import { Church, ArrowLeft, Clock, MapPin } from "lucide-react";

export default function NaoEncontrada() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <Church className="h-16 w-16 text-destaque" aria-hidden />

      <h1 className="mt-6 text-4xl text-principal-escuro">Página não encontrada</h1>
      <p className="mt-4 text-lg text-texto-suave">
        A página que você procura pode ter sido movida ou não existe mais. Mas a
        porta da igreja continua aberta!
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-principal px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-principal-escuro"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
          Voltar ao início
        </Link>
        <Link
          href="/horarios"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-principal px-6 py-3 text-base font-semibold text-principal transition-colors hover:bg-fundo-suave"
        >
          <Clock className="h-5 w-5" aria-hidden />
          Horários de Missas
        </Link>
        <Link
          href="/contato"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-principal px-6 py-3 text-base font-semibold text-principal transition-colors hover:bg-fundo-suave"
        >
          <MapPin className="h-5 w-5" aria-hidden />
          Contato
        </Link>
      </div>
    </div>
  );
}
