import Link from "next/link";
import {
  CalendarDays,
  Images,
  Mail,
  Megaphone,
  Newspaper,
  Users,
} from "lucide-react";
import Cartao, { CartaoCabecalho, CartaoMetrica } from "@/components/ui/Cartao";
import EstadoVazio from "@/components/ui/EstadoVazio";
import Selo from "@/components/ui/Selo";
import { exigirSessao } from "@/lib/auth/guardas";
import { resumoDoPainel } from "@/lib/servicos/painel";
import {
  ROTULO_STATUS_NOTICIA,
  type StatusNoticia,
} from "@/lib/validacao/esquemas";
import { TOM_DO_STATUS_NOTICIA } from "./tons";

export default async function PaginaPainel() {
  const usuario = await exigirSessao();
  const resumo = await resumoDoPainel();

  const primeiroNome = usuario.nome.split(" ")[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-texto">
          Paz e bem, {primeiroNome}!
        </h2>
        <p className="mt-1 text-sm text-texto-suave">
          Um resumo do que está no ar e do que espera resposta.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CartaoMetrica
          rotulo="Mensagens novas"
          valor={resumo.mensagensNovas}
          icone={Mail}
          tom={resumo.mensagensNovas > 0 ? "atencao" : "sucesso"}
          detalhe={
            resumo.mensagensNovas > 0
              ? "Aguardando resposta da secretaria"
              : "Nenhuma pendente"
          }
        />
        <CartaoMetrica
          rotulo="Avisos no site"
          valor={resumo.avisosAtivos}
          icone={Megaphone}
          detalhe="Exibidos na página inicial"
        />
        <CartaoMetrica
          rotulo="Notícias publicadas"
          valor={resumo.noticias.publicadas}
          icone={Newspaper}
          tom="sucesso"
          detalhe={
            resumo.noticias.rascunhos > 0
              ? `${resumo.noticias.rascunhos} em rascunho`
              : "Nenhum rascunho aberto"
          }
        />
        <CartaoMetrica
          rotulo="Horários ativos"
          valor={resumo.celebracoes}
          icone={CalendarDays}
          detalhe="Missas, confissões e adoração"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao>
          <CartaoCabecalho
            titulo="Mensagens a responder"
            descricao="Recebidas pelo formulário de contato"
            acoes={
              <Link
                href="/admin/mensagens"
                className="text-sm font-semibold text-principal hover:underline"
              >
                Ver todas
              </Link>
            }
          />
          {resumo.ultimasMensagens.length === 0 ? (
            <EstadoVazio
              icone={Mail}
              titulo="Nenhuma mensagem nova"
              descricao="Tudo o que chegou já foi lido ou respondido."
            />
          ) : (
            <ul className="divide-y divide-borda">
              {resumo.ultimasMensagens.map((mensagem) => (
                <li key={mensagem.id}>
                  <Link
                    href="/admin/mensagens"
                    className="flex items-start justify-between gap-3 px-5 py-3 transition-colors hover:bg-superficie-suave"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-texto">
                        {mensagem.assunto}
                      </p>
                      <p className="truncate text-xs text-texto-suave">
                        {mensagem.nome}
                      </p>
                    </div>
                    <time
                      dateTime={mensagem.criadoEm.toISOString()}
                      className="shrink-0 text-xs text-texto-suave"
                    >
                      {formatarData(mensagem.criadoEm)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Cartao>

        <Cartao>
          <CartaoCabecalho
            titulo="Mexido recentemente"
            descricao="Últimas notícias criadas ou editadas"
            acoes={
              <Link
                href="/admin/noticias"
                className="text-sm font-semibold text-principal hover:underline"
              >
                Ver todas
              </Link>
            }
          />
          {resumo.ultimasNoticias.length === 0 ? (
            <EstadoVazio
              icone={Newspaper}
              titulo="Nenhuma notícia ainda"
              descricao="O mural do site aparece vazio até a primeira publicação."
            />
          ) : (
            <ul className="divide-y divide-borda">
              {resumo.ultimasNoticias.map((noticia) => {
                const status = noticia.status as StatusNoticia;
                return (
                  <li key={noticia.id}>
                    <Link
                      href="/admin/noticias"
                      className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-superficie-suave"
                    >
                      <p className="min-w-0 truncate text-sm font-medium text-texto">
                        {noticia.titulo}
                      </p>
                      <Selo tom={TOM_DO_STATUS_NOTICIA[status]}>
                        {ROTULO_STATUS_NOTICIA[status]}
                      </Selo>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Cartao>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CartaoMetrica
          rotulo="Pastorais ativas"
          valor={resumo.pastorais}
          icone={Users}
          tom="info"
          detalhe="Listadas na página de pastorais"
        />
        <CartaoMetrica
          rotulo="Fotos na galeria"
          valor={resumo.fotos}
          icone={Images}
          tom="info"
          detalhe="Somando todos os álbuns"
        />
      </div>
    </div>
  );
}

const FORMATO = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});

function formatarData(data: Date) {
  return FORMATO.format(data);
}
