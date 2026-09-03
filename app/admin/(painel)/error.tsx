"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import Botao from "@/components/ui/Botao";
import Cartao from "@/components/ui/Cartao";
import EstadoVazio from "@/components/ui/EstadoVazio";

/**
 * Rede de segurança do painel.
 *
 * Sem ela, qualquer falha inesperada numa tela mostra a página de erro crua do
 * Next — que, para quem trabalha na secretaria, parece o site inteiro
 * quebrado. Aqui a pessoa entende que foi uma tela só e tem um botão para
 * tentar de novo.
 *
 * A mensagem é genérica de propósito: detalhes de erro interno não ajudam
 * quem está do outro lado e podem revelar o funcionamento do sistema.
 */
export default function ErroDoPainel({
  erro,
  reset,
}: {
  erro: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // O texto completo fica no registro do servidor, para quem cuida do site.
    console.error("Falha em tela do painel:", erro);
  }, [erro]);

  return (
    <Cartao>
      <EstadoVazio
        icone={AlertTriangle}
        titulo="Esta tela não carregou"
        descricao={
          // `erro?` e não `erro.`: esta tela é a última rede de proteção, e
          // uma tela de erro que estoura ao desenhar o erro deixa a secretaria
          // diante do erro cru do navegador. Aconteceu em 03/09/2026, quando
          // o React entregou a falha sem objeto.
          erro?.digest
            ? `Tente novamente. Se continuar, avise quem cuida do site e informe o código ${erro.digest}.`
            : "Tente novamente. Se continuar, avise quem cuida do site."
        }
        acao={
          <Botao icone={RotateCcw} onClick={reset}>
            Tentar de novo
          </Botao>
        }
      />
    </Cartao>
  );
}
