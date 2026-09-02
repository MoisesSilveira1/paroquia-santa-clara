"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut, Menu } from "lucide-react";
import Botao, { BotaoIcone } from "@/components/ui/Botao";
import AlternarTema from "./AlternarTema";
import { itemAtivo, NOME_DO_PAPEL, type ItemDeMenu, type Papel } from "./navegacao";

export type UsuarioDaSessao = {
  nome: string;
  email: string;
  papel: Papel;
};

export default function CabecalhoAdmin({
  itens,
  usuario,
  aoAbrirGaveta,
  aoSair,
}: {
  itens: ItemDeMenu[];
  usuario: UsuarioDaSessao;
  aoAbrirGaveta: () => void;
  /** Server Action de encerrar sessão, ligada na Fase 2. */
  aoSair?: () => void;
}) {
  const caminho = usePathname();
  const atual = itemAtivo(caminho, itens);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-borda bg-superficie/95 px-4 backdrop-blur sm:px-6">
      <BotaoIcone
        icone={Menu}
        rotulo="Abrir menu"
        onClick={aoAbrirGaveta}
        className="lg:hidden"
      />

      <h1 className="min-w-0 flex-1 truncate font-serif text-lg text-texto">
        {atual?.rotulo ?? "Painel"}
      </h1>

      <Link
        href="/"
        target="_blank"
        rel="noopener"
        className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-texto-suave transition-colors hover:bg-fundo-suave hover:text-texto sm:inline-flex"
      >
        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        Ver o site
      </Link>

      <AlternarTema />

      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-texto">{usuario.nome}</p>
        <p className="text-xs text-texto-suave">{NOME_DO_PAPEL[usuario.papel]}</p>
      </div>

      {aoSair ? (
        <form action={aoSair}>
          <Botao type="submit" variante="secundario" tamanho="pequeno" icone={LogOut}>
            <span className="hidden sm:inline">Sair</span>
          </Botao>
        </form>
      ) : (
        <Botao variante="secundario" tamanho="pequeno" icone={LogOut} disabled>
          <span className="hidden sm:inline">Sair</span>
        </Botao>
      )}
    </header>
  );
}
