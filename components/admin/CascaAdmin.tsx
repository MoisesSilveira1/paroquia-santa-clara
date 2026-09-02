"use client";

import { useState } from "react";
import { usePreferenciaLocal } from "@/lib/preferencias";
import BarraLateral from "./BarraLateral";
import CabecalhoAdmin, { type UsuarioDaSessao } from "./CabecalhoAdmin";
import { menuDoPapel } from "./navegacao";

const CHAVE_RECOLHIDA = "paroquia:menu-recolhido";

/**
 * Moldura de todas as telas do painel: menu lateral, cabeçalho e a área de
 * conteúdo. Guarda o estado de "menu recolhido" e do menu deslizante do
 * celular — por isso é Client Component; tudo que ela envolve continua
 * podendo ser renderizado no servidor.
 */
export default function CascaAdmin({
  usuario,
  aoSair,
  children,
}: {
  usuario: UsuarioDaSessao;
  aoSair?: () => void;
  children: React.ReactNode;
}) {
  const itens = menuDoPapel(usuario.papel);

  const [preferencia, definirPreferencia] = usePreferenciaLocal(
    CHAVE_RECOLHIDA,
    "nao"
  );
  const recolhida = preferencia === "sim";

  // Estado só desta aba e deste momento: não faz sentido guardar que o menu
  // do celular ficou aberto.
  const [gavetaAberta, setGavetaAberta] = useState(false);

  function alternarRecolher() {
    definirPreferencia(recolhida ? "nao" : "sim");
  }

  return (
    <div className="min-h-dvh bg-fundo">
      <BarraLateral
        itens={itens}
        recolhida={recolhida}
        aoAlternarRecolher={alternarRecolher}
        gavetaAberta={gavetaAberta}
        aoFecharGaveta={() => setGavetaAberta(false)}
      />

      <div
        className={
          recolhida
            ? "transition-[padding] duration-200 ease-out lg:pl-16"
            : "transition-[padding] duration-200 ease-out lg:pl-64"
        }
      >
        <CabecalhoAdmin
          itens={itens}
          usuario={usuario}
          aoAbrirGaveta={() => setGavetaAberta(true)}
          aoSair={aoSair}
        />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
