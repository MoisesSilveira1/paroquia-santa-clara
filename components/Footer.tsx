import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { paroquia } from "@/lib/dados";

export default function Footer() {
  return (
    <footer className="bg-principal text-fundo">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/fotos/brasao-escudo.webp"
              alt=""
              width={480}
              height={600}
              className="h-12 w-auto"
            />
            <h2 className="font-serif text-lg">{paroquia.nome}</h2>
          </div>
          <p className="mt-3 flex items-start gap-2 text-sm text-fundo-suave">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-destaque" aria-hidden />
            {paroquia.endereco}
          </p>
          <p className="mt-4 text-sm italic text-destaque-claro">
            “Senhor, fazei-me instrumento de vossa paz.”
          </p>
        </div>

        <div>
          <h2 className="font-serif text-lg">Secretaria</h2>
          <ul className="mt-3 space-y-2 text-sm text-fundo-suave">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-destaque" aria-hidden />
              {paroquia.telefone}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-destaque" aria-hidden />
              {paroquia.email}
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-destaque" aria-hidden />
              {paroquia.horarioSecretaria}
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-lg">Acesso rápido</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <li><Link className="hover:text-destaque" href="/aviso-paroquial">Aviso Paroquial</Link></li>
            <li><Link className="hover:text-destaque" href="/horarios">Horários de Missas</Link></li>
            <li><Link className="hover:text-destaque" href="/povo-de-deus">Folheto O Povo de Deus</Link></li>
            <li><Link className="hover:text-destaque" href="/sobre">A Paróquia</Link></li>
            <li><Link className="hover:text-destaque" href="/pastorais">Pastorais</Link></li>
            <li><Link className="hover:text-destaque" href="/catequese">Catequese</Link></li>
            <li><Link className="hover:text-destaque" href="/missa-online">Missa Online</Link></li>
            <li><Link className="hover:text-destaque" href="/noticias">Notícias</Link></li>
            <li><Link className="hover:text-destaque" href="/galeria">Galeria de Fotos</Link></li>
            <li><Link className="hover:text-destaque" href="/dizimo">Dízimo e Doações</Link></li>
            <li><Link className="hover:text-destaque" href="/contato">Contato</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-principal-claro py-4 text-center text-xs text-fundo-suave">
        © {new Date().getFullYear()} {paroquia.nome} · Arquidiocese de Brasília
        {/* Entrada da secretaria. Discreta de propósito: quem visita o site não
            precisa dela. Discreta não é escondida — quem trabalha aqui tem de
            achar sem decorar endereço. O robots.txt já mantém /admin fora das
            buscas, e o rel="nofollow" evita que os buscadores a sigam daqui. */}
        <span aria-hidden className="mx-2 opacity-50">·</span>
        <Link
          href="/admin"
          rel="nofollow"
          className="underline decoration-dotted underline-offset-2 opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100"
        >
          Área da secretaria
        </Link>
      </div>
    </footer>
  );
}
