"use client";

import { useCallback, useEffect, useState } from "react";
import { Megaphone, Plus, Trash2, Eye, EyeOff, Pencil } from "lucide-react";
import { repositorio, type Aviso } from "@/lib/conteudo";
import {
  BOTAO_ICONE,
  BOTAO_ICONE_PERIGO,
  BOTAO_PRIMARIO,
  BOTAO_SECUNDARIO,
  CAMPO,
  TEXTO_ERRO,
} from "@/components/ui/estilos";

export default function SecaoAvisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [novoTexto, setNovoTexto] = useState("");
  const [erro, setErro] = useState("");

  const recarregar = useCallback(async () => {
    try {
      setAvisos(await repositorio.listarAvisos());
    } catch {
      setErro("Não foi possível carregar os avisos.");
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  /** Executa uma alteração e recarrega a lista, mostrando o erro se houver. */
  async function aplicar(alteracao: Promise<{ erro?: string }>) {
    const { erro: falha } = await alteracao;
    setErro(falha ?? "");
    if (!falha) await recarregar();
  }

  async function adicionar(evento: React.FormEvent) {
    evento.preventDefault();
    const texto = novoTexto.trim();
    if (!texto) return;
    await aplicar(repositorio.criarAviso(texto));
    setNovoTexto("");
  }

  return (
    <section className="mt-10" aria-labelledby="titulo-avisos">
      <h2 id="titulo-avisos" className="flex items-center gap-2 text-2xl text-texto">
        <Megaphone className="h-6 w-6 text-destaque" aria-hidden />
        Avisos da semana
      </h2>
      <p className="mt-1 text-sm text-texto-suave">
        Os avisos ativos aparecem na página inicial do site, do mais recente para
        o mais antigo.
      </p>

      <form className="mt-4 flex gap-2" onSubmit={adicionar}>
        <label htmlFor="novo-aviso" className="sr-only">
          Novo aviso
        </label>
        <input
          id="novo-aviso"
          type="text"
          placeholder="Escreva um novo aviso…"
          className={CAMPO}
          value={novoTexto}
          onChange={(e) => setNovoTexto(e.target.value)}
        />
        <button type="submit" className={BOTAO_PRIMARIO}>
          <Plus className="h-5 w-5" aria-hidden />
          Adicionar
        </button>
      </form>

      {erro && (
        <p role="alert" className={`mt-2 ${TEXTO_ERRO}`}>
          {erro}
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {avisos.map((aviso) => (
          <ItemAviso
            key={aviso.id}
            aviso={aviso}
            aoSalvar={(texto) => aplicar(repositorio.editarAviso(aviso.id, texto))}
            aoAlternar={() =>
              aplicar(repositorio.alternarAviso(aviso.id, !aviso.ativo))
            }
            aoExcluir={() => aplicar(repositorio.excluirAviso(aviso.id))}
          />
        ))}
        {avisos.length === 0 && (
          <li className="text-sm text-texto-suave">Nenhum aviso cadastrado ainda.</li>
        )}
      </ul>
    </section>
  );
}

type ItemAvisoProps = {
  aviso: Aviso;
  aoSalvar: (texto: string) => void;
  aoAlternar: () => void;
  aoExcluir: () => void;
};

function ItemAviso({ aviso, aoSalvar, aoAlternar, aoExcluir }: ItemAvisoProps) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(aviso.texto);

  const classes = `flex items-center gap-2 rounded-lg border border-destaque-claro bg-white p-3 ${
    aviso.ativo ? "" : "opacity-60"
  }`;

  if (editando) {
    return (
      <li className={classes}>
        <label htmlFor={`aviso-${aviso.id}`} className="sr-only">
          Editar aviso
        </label>
        <input
          id={`aviso-${aviso.id}`}
          className={CAMPO}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button
          type="button"
          className={BOTAO_PRIMARIO}
          onClick={() => {
            aoSalvar(texto.trim());
            setEditando(false);
          }}
        >
          Salvar
        </button>
        <button
          type="button"
          className={BOTAO_SECUNDARIO}
          onClick={() => {
            setTexto(aviso.texto);
            setEditando(false);
          }}
        >
          Cancelar
        </button>
      </li>
    );
  }

  return (
    <li className={classes}>
      <span className="flex-1 text-sm">{aviso.texto}</span>

      <button
        type="button"
        title={aviso.ativo ? "Ocultar do site" : "Mostrar no site"}
        aria-label={aviso.ativo ? "Ocultar aviso do site" : "Mostrar aviso no site"}
        className={BOTAO_ICONE}
        onClick={aoAlternar}
      >
        {aviso.ativo ? (
          <Eye className="h-4 w-4" aria-hidden />
        ) : (
          <EyeOff className="h-4 w-4" aria-hidden />
        )}
      </button>

      <button
        type="button"
        title="Editar"
        aria-label="Editar aviso"
        className={BOTAO_ICONE}
        onClick={() => setEditando(true)}
      >
        <Pencil className="h-4 w-4" aria-hidden />
      </button>

      <button
        type="button"
        title="Excluir"
        aria-label="Excluir aviso"
        className={BOTAO_ICONE_PERIGO}
        onClick={() => {
          if (window.confirm("Excluir este aviso?")) aoExcluir();
        }}
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>
    </li>
  );
}
