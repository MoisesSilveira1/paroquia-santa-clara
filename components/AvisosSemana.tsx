import { Megaphone } from "lucide-react";
import { avisosAtivos } from "@/lib/servicos/avisos";
import { paroquia } from "@/lib/dados";

/**
 * Avisos da secretaria na página inicial.
 *
 * Renderiza no servidor, lendo direto do banco. Antes buscava no navegador
 * depois de a página carregar, o que deixava a seção surgir com atraso e a
 * escondia de quem visse a página sem JavaScript — inclusive dos buscadores.
 */
export default async function AvisosSemana() {
  const avisos = await avisosAtivos();

  // Sem avisos publicados, a seção inteira some em vez de mostrar uma caixa
  // vazia com título.
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
            <span
              className="mt-2 h-2 w-2 shrink-0 rounded-full bg-principal"
              aria-hidden
            />
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
