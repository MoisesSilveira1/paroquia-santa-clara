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
              width={443}
              height={562}
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
            <li><Link className="hover:text-destaque" href="/horarios">Horários de Missas</Link></li>
            <li><Link className="hover:text-destaque" href="/sobre">A Paróquia</Link></li>
            <li><Link className="hover:text-destaque" href="/pastorais">Pastorais</Link></li>
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
      </div>
    </footer>
  );
}
