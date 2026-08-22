"use client";

import { useEffect, useState } from "react";
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

  const [recolhida, setRecolhida] = useState(false);
  const [gavetaAberta, setGavetaAberta] = useState(false);

  // A preferência é lida depois da montagem: ler `localStorage` durante a
  // renderização faria o HTML do servidor divergir do que o navegador tem.
  useEffect(() => {
    setRecolhida(localStorage.getItem(CHAVE_RECOLHIDA) === "sim");
  }, []);

  function alternarRecolher() {
    setRecolhida((antes) => {
      const proximo = !antes;
      try {
        localStorage.setItem(CHAVE_RECOLHIDA, proximo ? "sim" : "nao");
      } catch {
        // Armazenamento bloqueado: a escolha vale só nesta sessão.
      }
      return proximo;
    });
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
