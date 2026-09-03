"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BellRing, Pencil, Plus } from "lucide-react";
import Botao, { BotaoIcone } from "@/components/ui/Botao";
import {
  CampoArea,
  CampoBooleano,
  CampoTexto,
} from "@/components/ui/Campo";
import EstadoVazio from "@/components/ui/EstadoVazio";
import Modal from "@/components/ui/Modal";
import Alerta from "@/components/ui/Alerta";
import Selo from "@/components/ui/Selo";
import {
  Tabela,
  TabelaCabecalho,
  TabelaCelula,
  TabelaCorpo,
  TabelaLinha,
  TabelaLinhaVazia,
  TabelaTitulo,
} from "@/components/ui/Tabela";
import DialogoDeExclusao from "@/components/admin/DialogoDeExclusao";
import { ESTADO_INICIAL } from "@/lib/servicos/resultado";
import type { AvisoParoquial } from "@/lib/servicos/aviso-paroquial";
import { ACEITE, TAMANHO_MAXIMO_POR_ARQUIVO, formatarTamanho } from "@/lib/imagens/limites";
import {
  alternarAvisoParoquialAcao,
  excluirAvisoParoquialAcao,
  salvarAvisoParoquial,
} from "./acoes";

const DATA = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

/** `Date` para o formato que o `<input type="date">` entende. */
function paraCampoDeData(data: Date | null): string {
  if (!data) return "";
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export default function GerenciadorAvisoParoquial({
  itens,
  podeExcluir,
}: {
  itens: AvisoParoquial[];
  podeExcluir: boolean;
}) {
  const [emEdicao, setEmEdicao] = useState<AvisoParoquial | null>(null);
  const [criando, setCriando] = useState(false);
  const [recado, setRecado] = useState<string | null>(null);

  function fechar() {
    setCriando(false);
    setEmEdicao(null);
  }

  const noAr = itens.find((item) => item.ativo && !item.expirado);

  return (
    <>
      <div className="flex justify-end px-5 pt-4">
        <Botao icone={Plus} onClick={() => setCriando(true)}>
          Novo aviso
        </Botao>
      </div>

      {recado && (
        <div className="px-5 pt-3">
          <Alerta tom="sucesso">{recado}</Alerta>
        </div>
      )}

      <div className="px-5 pt-3">
        {/* O estado atual dito em uma frase: esta tela mexe no que TODO
            visitante vê antes de qualquer outra coisa. */}
        {noAr ? (
          <Alerta tom="atencao">
            <strong>“{noAr.titulo}”</strong> está aparecendo para quem entra no
            site.{" "}
            {noAr.expiraEm
              ? `Sai sozinho em ${DATA.format(noAr.expiraEm)}.`
              : "Fica no ar até alguém desligar."}
          </Alerta>
        ) : (
          <Alerta>
            Nenhum aviso está aparecendo. O site abre direto na página inicial.
          </Alerta>
        )}
      </div>

      <div className="mt-4">
        <Tabela rotulo="Avisos paroquiais">
          <TabelaCabecalho>
            <TabelaTitulo>Aviso</TabelaTitulo>
            <TabelaTitulo className="w-32">Tem</TabelaTitulo>
            <TabelaTitulo className="w-32">Validade</TabelaTitulo>
            <TabelaTitulo className="w-28">Situação</TabelaTitulo>
            <TabelaTitulo alinhamento="direita" className="w-36">
              Ações
            </TabelaTitulo>
          </TabelaCabecalho>

          <TabelaCorpo>
            {itens.length === 0 ? (
              <TabelaLinhaVazia colunas={5}>
                <EstadoVazio
                  icone={BellRing}
                  titulo="Nenhum aviso paroquial"
                  descricao="O aviso aparece numa janela assim que alguém entra no site, e precisa ser fechado para continuar navegando. Use para o que ninguém pode deixar de ver."
                  acao={
                    <Botao icone={Plus} onClick={() => setCriando(true)}>
                      Criar o primeiro
                    </Botao>
                  }
                />
              </TabelaLinhaVazia>
            ) : (
              itens.map((aviso) => {
                const { expirado } = aviso;
                return (
                  <TabelaLinha key={aviso.id}>
                    <TabelaCelula>
                      <p className="font-medium text-texto">{aviso.titulo}</p>
                      {aviso.texto && (
                        <p className="mt-0.5 line-clamp-2 max-w-prose text-xs text-texto-suave">
                          {aviso.texto}
                        </p>
                      )}
                    </TabelaCelula>
                    <TabelaCelula className="text-xs text-texto-suave">
                      {[
                        aviso.texto && "texto",
                        aviso.temImagem && "imagem",
                        aviso.videoUrl && "vídeo",
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </TabelaCelula>
                    <TabelaCelula className="text-texto-suave tabular-nums">
                      {aviso.expiraEm ? DATA.format(aviso.expiraEm) : "Sem prazo"}
                    </TabelaCelula>
                    <TabelaCelula>
                      <Selo
                        tom={
                          aviso.ativo && !expirado
                            ? "sucesso"
                            : expirado
                              ? "atencao"
                              : "neutro"
                        }
                      >
                        {aviso.ativo && !expirado
                          ? "No ar"
                          : expirado
                            ? "Vencido"
                            : "Guardado"}
                      </Selo>
                    </TabelaCelula>
                    <TabelaCelula alinhamento="direita">
                      <div className="flex items-center justify-end gap-1">
                        <Botao
                          variante="secundario"
                          onClick={async () => {
                            const r = await alternarAvisoParoquialAcao(aviso.id);
                            if (r.ok) setRecado(r.mensagem ?? "Aviso atualizado.");
                          }}
                        >
                          {aviso.ativo ? "Tirar do ar" : "Pôr no ar"}
                        </Botao>
                        <BotaoIcone
                          icone={Pencil}
                          rotulo={`Editar ${aviso.titulo}`}
                          onClick={() => setEmEdicao(aviso)}
                        />
                        {podeExcluir && (
                          <DialogoDeExclusao
                            nome={aviso.titulo}
                            aoConfirmar={() =>
                              excluirAvisoParoquialAcao(aviso.id)
                            }
                          />
                        )}
                      </div>
                    </TabelaCelula>
                  </TabelaLinha>
                );
              })
            )}
          </TabelaCorpo>
        </Tabela>
      </div>

      {(criando || emEdicao) && (
        <FormularioDeAviso
          aviso={emEdicao}
          aoFechar={fechar}
          aoConcluir={(mensagem) => {
            fechar();
            setRecado(mensagem);
          }}
        />
      )}
    </>
  );
}

function FormularioDeAviso({
  aviso,
  aoFechar,
  aoConcluir,
}: {
  aviso: AvisoParoquial | null;
  aoFechar: () => void;
  aoConcluir: (mensagem: string) => void;
}) {
  const [estado, enviar, pendente] = useActionState(
    salvarAvisoParoquial,
    ESTADO_INICIAL
  );
  const [recusa, setRecusa] = useState<string | null>(null);
  const campoDeImagem = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (estado.ok) aoConcluir(estado.mensagem ?? "Aviso salvo.");
  }, [estado, aoConcluir]);

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo={aviso ? "Editar aviso paroquial" : "Novo aviso paroquial"}
      descricao="Aparece numa janela para quem entra no site."
    >
      <form action={enviar} className="space-y-4" noValidate>
        {aviso && <input type="hidden" name="id" value={aviso.id} />}

        <CampoTexto
          name="titulo"
          rotulo="Título"
          required
          maxLength={160}
          dica="A primeira linha da janela. Ex.: “Missa de Finados — 2 de novembro”."
          defaultValue={estado.valores?.titulo ?? aviso?.titulo ?? ""}
          erro={estado.erros?.titulo?.[0]}
        />

        <CampoArea
          name="texto"
          rotulo="Texto (opcional)"
          rows={5}
          maxLength={4000}
          dica="O recado em si. Pode ficar em branco se a imagem já disser tudo."
          defaultValue={estado.valores?.texto ?? aviso?.texto ?? ""}
          erro={estado.erros?.texto?.[0]}
        />

        <div>
          <label
            htmlFor="imagem-do-aviso"
            className="block text-sm font-medium text-texto"
          >
            Imagem (opcional)
          </label>
          {aviso?.temImagem && (
            <div className="mt-2 flex items-center gap-3">
              <Image
                src={`/imagens/aviso/${aviso.id}?v=${aviso.atualizadoEm.getTime()}`}
                alt=""
                width={96}
                height={96}
                unoptimized
                className="h-16 w-16 rounded border border-borda object-cover"
              />
              <label className="flex items-center gap-2 text-sm text-texto-suave">
                <input type="checkbox" name="removerImagem" className="h-4 w-4" />
                Remover esta imagem
              </label>
            </div>
          )}
          <input
            id="imagem-do-aviso"
            ref={campoDeImagem}
            type="file"
            name="imagem"
            accept={ACEITE}
            onChange={(evento) => {
              // Confere antes de subir: a internet da secretaria não deve
              // gastar minutos com um arquivo que o servidor vai recusar.
              const arquivo = evento.target.files?.[0];
              if (!arquivo) return setRecusa(null);
              setRecusa(
                arquivo.size > TAMANHO_MAXIMO_POR_ARQUIVO
                  ? `A imagem tem ${formatarTamanho(arquivo.size)} e o limite é ${formatarTamanho(TAMANHO_MAXIMO_POR_ARQUIVO)}.`
                  : null
              );
            }}
            className="mt-2 block w-full text-sm text-texto-suave file:mr-3 file:rounded-md file:border-0 file:bg-principal file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-principal-escuro"
          />
          <p className="mt-1 text-xs text-texto-suave">
            JPG, PNG ou WebP. Fotos de iPhone (.HEIC) precisam ser convertidas
            antes. {aviso?.temImagem && "Escolher outra substitui a atual."}
          </p>
          {recusa && (
            <p className="mt-1 text-xs text-perigo">{recusa}</p>
          )}
        </div>

        <CampoTexto
          name="videoUrl"
          rotulo="Vídeo do YouTube (opcional)"
          maxLength={400}
          dica="Cole o endereço do vídeo. Só YouTube — é o canal que a paróquia já usa."
          defaultValue={estado.valores?.videoUrl ?? aviso?.videoUrl ?? ""}
          erro={estado.erros?.videoUrl?.[0]}
        />

        <CampoTexto
          name="expiraEm"
          type="date"
          rotulo="Sai do ar em (opcional)"
          dica="A partir desta data o aviso para de aparecer sozinho. Em branco, fica até alguém desligar."
          defaultValue={
            estado.valores?.expiraEm ?? paraCampoDeData(aviso?.expiraEm ?? null)
          }
          erro={estado.erros?.expiraEm?.[0]}
        />

        <CampoBooleano
          name="ativo"
          rotulo="Pôr no ar agora"
          dica="Só um aviso fica no ar por vez: ligar este desliga o anterior."
          defaultChecked={aviso ? aviso.ativo : false}
        />

        {estado.mensagem && !estado.ok && !estado.erros && (
          <Alerta tom="perigo">{estado.mensagem}</Alerta>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Botao variante="secundario" type="button" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao type="submit" pendente={pendente} disabled={recusa !== null}>
            {aviso ? "Salvar alterações" : "Criar aviso"}
          </Botao>
        </div>
      </form>
    </Modal>
  );
}
