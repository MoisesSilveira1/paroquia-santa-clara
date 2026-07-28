import Link from "next/link";
import { Church, MapPin, Phone, Mail, Clock } from "lucide-react";
import { paroquia } from "@/lib/dados";

export default function Footer() {
  return (
    <footer className="bg-marrom text-creme">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <Church className="h-6 w-6 text-dourado" aria-hidden />
            <h2 className="font-serif text-lg">{paroquia.nome}</h2>
          </div>
          <p className="mt-3 flex items-start gap-2 text-sm text-creme-escuro">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-dourado" aria-hidden />
            {paroquia.endereco}
          </p>
          <p className="mt-4 text-sm italic text-dourado-claro">
            “Senhor, fazei-me instrumento de vossa paz.”
          </p>
        </div>

        <div>
          <h2 className="font-serif text-lg">Secretaria</h2>
          <ul className="mt-3 space-y-2 text-sm text-creme-escuro">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-dourado" aria-hidden />
              {paroquia.telefone}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-dourado" aria-hidden />
              {paroquia.email}
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-dourado" aria-hidden />
              {paroquia.horarioSecretaria}
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-lg">Acesso rápido</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <li><Link className="hover:text-dourado" href="/horarios">Horários de Missas</Link></li>
            <li><Link className="hover:text-dourado" href="/sobre">A Paróquia</Link></li>
            <li><Link className="hover:text-dourado" href="/pastorais">Pastorais</Link></li>
            <li><Link className="hover:text-dourado" href="/noticias">Notícias</Link></li>
            <li><Link className="hover:text-dourado" href="/galeria">Galeria de Fotos</Link></li>
            <li><Link className="hover:text-dourado" href="/dizimo">Dízimo e Doações</Link></li>
            <li><Link className="hover:text-dourado" href="/contato">Contato</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-marrom-claro py-4 text-center text-xs text-creme-escuro">
        © {new Date().getFullYear()} {paroquia.nome} · Arquidiocese de Brasília
      </div>
    </footer>
  );
}
