import Link from "next/link";
import {
  HeartHandshake,
  Users,
  MapPin,
  ArrowRight,
} from "lucide-react";
import Hero from "@/components/Hero";
import MissaCard from "@/components/MissaCard";
import AvisosSemana from "@/components/AvisosSemana";
import { horariosMissas } from "@/lib/dados";

const atalhos = [
  {
    href: "/dizimo",
    titulo: "Dízimo e Doações",
    descricao: "Contribua com a vida da paróquia via Pix ou depósito.",
    Icone: HeartHandshake,
  },
  {
    href: "/pastorais",
    titulo: "Pastorais e Movimentos",
    descricao: "Encontre seu lugar de serviço na comunidade.",
    Icone: Users,
  },
  {
    href: "/contato",
    titulo: "Localização e Contato",
    descricao: "Como chegar, telefone e horários da secretaria.",
    Icone: MapPin,
  },
];

export default function Home() {
  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl text-terracota-escuro">Horários da semana</h2>
          <Link
            href="/horarios"
            className="inline-flex items-center gap-1 text-sm font-semibold text-azul hover:underline"
          >
            Ver todos <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {horariosMissas.slice(0, 3).map((horario) => (
            <MissaCard key={horario.dia} horario={horario} />
          ))}
        </div>
      </section>

      <section className="bg-creme-escuro py-14">
        <div className="mx-auto max-w-6xl px-4">
          <AvisosSemana />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-3xl text-terracota-escuro">Acesso rápido</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {atalhos.map(({ href, titulo, descricao, Icone }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-xl border border-dourado-claro bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <Icone className="h-9 w-9 text-terracota transition-colors group-hover:text-dourado" aria-hidden />
              <h3 className="mt-4 text-lg text-marrom">{titulo}</h3>
              <p className="mt-1 text-sm text-marrom-claro">{descricao}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
