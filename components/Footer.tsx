import Link from "next/link";
import Image from "next/image";
import { Clock, Mail, MapPin, MessageCircle, MonitorPlay, Phone } from "lucide-react";
import { paroquia, youtube } from "@/lib/dados";

/**
 * Rodapé do site.
 *
 * Os atalhos vêm agrupados por assunto, e não numa lista corrida de doze
 * itens: uma coluna com doze links do mesmo peso vira parede, e quem procura
 * o horário da missa lê tudo até achar. Com os grupos nomeados, o olho pula
 * direto para o bloco certo.
 *
 * Telefone, WhatsApp e e-mail são links de verdade (`tel:`, `wa.me`,
 * `mailto:`) — no celular, que é de onde vem a maior parte das visitas, isso
 * é a diferença entre ligar num toque e copiar o número na mão.
 */

type Grupo = { titulo: string; itens: { href: string; texto: string }[] };

const ATALHOS: Grupo[] = [
  {
    titulo: "Celebrações",
    itens: [
      { href: "/horarios", texto: "Horários de missas" },
      { href: "/calendario-liturgico", texto: "Calendário litúrgico" },
      { href: "/povo-de-deus", texto: "Folheto O Povo de Deus" },
      { href: "/missa-online", texto: "Missa online" },
    ],
  },
  {
    titulo: "Comunidade",
    itens: [
      { href: "/sobre", texto: "A paróquia" },
      { href: "/pastorais", texto: "Pastorais e movimentos" },
      { href: "/catequese", texto: "Catequese" },
      { href: "/galeria", texto: "Galeria de fotos" },
    ],
  },
  {
    titulo: "Participe",
    itens: [
      { href: "/aviso-paroquial", texto: "Aviso paroquial" },
      { href: "/noticias", texto: "Notícias e eventos" },
      { href: "/dizimo", texto: "Dízimo e doações" },
      { href: "/contato", texto: "Fale conosco" },
    ],
  },
];

/** Só os dígitos, que é o que `tel:` entende. */
const TELEFONE_DISCAVEL = paroquia.telefone.replace(/\D/g, "");

export default function Footer() {
  return (
    <footer className="bg-principal text-fundo">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Identidade */}
          <div className="lg:col-span-4">
            {/*
              O brasão COMPLETO — com a cruz em cima e a fita com o nome da
              paróquia —, e não só o escudo. É o emblema oficial, e é assim
              que a paróquia se reconhece.

              Ele fica ACIMA do nome, e não ao lado, porque o completo é mais
              alto que largo e precisa de altura para o desenho não sumir: ao
              lado do nome sobrava a largura de uma coluna, e nela o brasão
              cabia com 64 px — tamanho em que o IHS, a cruz e as estrelas
              viram um borrão marrom e a fita vira um risco cinza. Empilhado,
              ele cabe em 144 px, onde o desenho inteiro se lê.

              A fita continua ilegível neste tamanho, e tudo bem: o nome está
              escrito logo abaixo, em texto de verdade.
            */}
            <Image
              src="/fotos/brasao.webp"
              alt=""
              width={900}
              height={1095}
              sizes="(min-width: 640px) 144px, 128px"
              className="h-32 w-auto drop-shadow-lg sm:h-36"
            />

            {/* "Paróquia" sozinho na primeira linha, como no topo da página
                inicial: o nome é longo, e quebrá-lo onde o sentido quebra lê
                melhor do que deixar a caixa decidir. */}
            <p className="mt-4 font-serif text-lg leading-snug">
              <span className="block">Paróquia</span>
              <span className="block">Santa Clara e São Francisco de Assis</span>
            </p>
            <p className="mt-1.5 text-sm text-fundo-suave">
              Jardim Botânico · Brasília-DF
            </p>

            <p className="mt-5 border-l-2 border-destaque pl-3 text-sm italic leading-relaxed text-destaque-claro">
              “Senhor, fazei-me instrumento de vossa paz.”
            </p>

            {/* O único elemento colorido do rodapé, de propósito: chamariz
                que compete com outros deixa de ser chamariz. A classe `pulsa`
                está em globals.css e explica lá por que a pulsação é lenta. */}
            <a
              href={youtube.canalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pulsa mt-5 inline-flex items-center gap-2 rounded-lg bg-[#c4302b] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#a52722] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <MonitorPlay className="h-4 w-4" aria-hidden />
              Canal no YouTube
            </a>
          </div>

          {/* Secretaria */}
          <div className="lg:col-span-3">
            <h2 className="font-serif text-lg">Secretaria</h2>
            <ul className="mt-4 space-y-3 text-sm text-fundo-suave">
              <li>
                <a
                  href={`tel:+55${TELEFONE_DISCAVEL}`}
                  className="flex items-start gap-2.5 transition-colors hover:text-destaque"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-destaque" aria-hidden />
                  {paroquia.telefone}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${paroquia.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 transition-colors hover:text-destaque"
                >
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-destaque" aria-hidden />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${paroquia.email}`}
                  className="flex items-start gap-2.5 break-all transition-colors hover:text-destaque"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-destaque" aria-hidden />
                  {paroquia.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-destaque" aria-hidden />
                <span>{paroquia.horarioSecretaria}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-destaque" aria-hidden />
                <span>{paroquia.endereco}</span>
              </li>
            </ul>
          </div>

          {/* Atalhos, agrupados por assunto */}
          <nav className="lg:col-span-5" aria-label="Atalhos do rodapé">
            <h2 className="font-serif text-lg">Acesso rápido</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              {ATALHOS.map((grupo) => (
                <div key={grupo.titulo}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-destaque">
                    {grupo.titulo}
                  </h3>
                  <ul className="mt-2.5 space-y-2 text-sm text-fundo-suave">
                    {grupo.itens.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="transition-colors hover:text-destaque"
                        >
                          {item.texto}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>
        </div>
      </div>

      <div className="border-t border-principal-claro">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-fundo-suave sm:flex-row">
          <p>
            © {new Date().getFullYear()} {paroquia.nome} · Arquidiocese de
            Brasília
          </p>
          {/* Entrada da secretaria. Discreta de propósito: quem visita o site
              não precisa dela. Discreta não é escondida — quem trabalha aqui
              tem de achar sem decorar endereço. O robots.txt já mantém /admin
              fora das buscas, e o rel="nofollow" evita que os buscadores a
              sigam daqui. */}
          <Link
            href="/admin"
            rel="nofollow"
            className="underline decoration-dotted underline-offset-4 opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100"
          >
            Área da secretaria
          </Link>
        </div>
      </div>
    </footer>
  );
}
