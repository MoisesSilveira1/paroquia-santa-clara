"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Church, Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Início" },
  { href: "/horarios", label: "Horários" },
  { href: "/sobre", label: "A Paróquia" },
  { href: "/pastorais", label: "Pastorais" },
  { href: "/noticias", label: "Notícias" },
  { href: "/dizimo", label: "Dízimo" },
  { href: "/contato", label: "Contato" },
];

export default function Header() {
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-marrom text-creme shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3" onClick={() => setAberto(false)}>
          <Church className="h-8 w-8 text-dourado" aria-hidden />
          <span className="font-serif text-lg leading-tight sm:text-xl">
            Paróquia Santa Clara e<br className="sm:hidden" /> São Francisco de Assis
          </span>
        </Link>

        <nav className="hidden lg:block" aria-label="Navegação principal">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-marrom-claro hover:text-white ${
                    pathname === link.href ? "bg-terracota text-white" : ""
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
          className="rounded-md p-2 hover:bg-marrom-claro lg:hidden"
          aria-expanded={aberto}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          onClick={() => setAberto(!aberto)}
        >
          {aberto ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>

      {aberto && (
        <nav className="border-t border-marrom-claro lg:hidden" aria-label="Navegação móvel">
          <ul className="flex flex-col px-4 py-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setAberto(false)}
                  className={`block rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-marrom-claro ${
                    pathname === link.href ? "bg-terracota text-white" : ""
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
