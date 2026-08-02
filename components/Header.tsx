"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Início" },
  { href: "/horarios", label: "Horários" },
  { href: "/sobre", label: "A Paróquia" },
  { href: "/pastorais", label: "Pastorais" },
  { href: "/missa-online", label: "Missa Online" },
  { href: "/noticias", label: "Notícias" },
  { href: "/galeria", label: "Galeria" },
  { href: "/dizimo", label: "Dízimo" },
  { href: "/contato", label: "Contato" },
];

export default function Header() {
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-principal text-fundo shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3" onClick={() => setAberto(false)}>
          {/* Escudo do brasão oficial. O nome vem escrito ao lado, então a
              imagem é decorativa (alt vazio) para não repetir no leitor de tela. */}
          <Image
            src="/fotos/brasao-escudo.webp"
            alt=""
            width={443}
            height={562}
            priority
            className="h-11 w-auto drop-shadow-sm sm:h-12"
          />
          <span className="font-serif text-lg leading-tight sm:text-xl">
            Paróquia Santa Clara e<br className="sm:hidden" /> São Francisco de Assis
          </span>
        </Link>

        <nav className="hidden xl:block" aria-label="Navegação principal">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-principal-claro hover:text-white ${
                    pathname === link.href ? "bg-destaque font-semibold text-principal-escuro" : ""
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="rounded-md p-2 hover:bg-principal-claro xl:hidden"
          aria-expanded={aberto}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          onClick={() => setAberto(!aberto)}
        >
          {aberto ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>

      {aberto && (
        <nav className="border-t border-principal-claro xl:hidden" aria-label="Navegação móvel">
          <ul className="flex flex-col px-4 py-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setAberto(false)}
                  className={`block rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-principal-claro ${
                    pathname === link.href ? "bg-destaque font-semibold text-principal-escuro" : ""
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
