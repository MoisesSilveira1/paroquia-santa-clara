"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import Botao, { BotaoIcone } from "@/components/ui/Botao";
import Modal from "@/components/ui/Modal";
import Alerta from "@/components/ui/Alerta";
import type { EstadoFormulario } from "@/lib/servicos/resultado";

/**
 * Botão de excluir que pergunta antes.
 *
 * Exclusão não tem desfazer nesta aplicação; a confirmação nomeia o item para
 * que ninguém apague a linha errada por ter clicado uma abaixo do que queria.
 */
export default function DialogoDeExclusao({
  nome,
  descricao,
  aoConfirmar,
}: {
  /** O que está sendo apagado, mostrado na pergunta. */
  nome: string;
  /** Consequência que a pessoa talvez não tenha em mente. */
  descricao?: string;
  aoConfirmar: () => Promise<EstadoFormulario>;
}) {
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  function confirmar() {
    setErro(null);
    iniciar(async () => {
      const resultado = await aoConfirmar();
      if (resultado.ok) setAberto(false);
      else setErro(resultado.mensagem ?? "Não foi possível excluir.");
    });
  }

  return (
    <>
      <BotaoIcone
        icone={Trash2}
        rotulo={`Excluir ${nome}`}
        variante="fantasma"
        className="text-perigo hover:bg-perigo-suave"
        onClick={() => {
          setErro(null);
          setAberto(true);
        }}
      />

      <Modal
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo="Excluir definitivamente?"
        rodape={
          <>
            <Botao
              variante="secundario"
              onClick={() => setAberto(false)}
              disabled={pendente}
            >
              Cancelar
            </Botao>
            <Botao variante="perigo" onClick={confirmar} pendente={pendente}>
              Sim, excluir
            </Botao>
          </>
        }
      >
        <p className="text-sm text-texto">
          Você está prestes a excluir <strong>{nome}</strong>. Esta ação não
          pode ser desfeita.
        </p>
        {descricao && (
          <p className="mt-2 text-sm text-texto-suave">{descricao}</p>
        )}
        {erro && (
          <Alerta tom="perigo" className="mt-3">
            {erro}
          </Alerta>
        )}
      </Modal>
    </>
  );
}
