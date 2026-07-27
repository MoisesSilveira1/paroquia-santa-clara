import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import { paroquia } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Contato e Localização",
  description:
    "Fale com a secretaria paroquial: formulário, telefone, WhatsApp, e-mail e mapa de como chegar.",
};

export default function ContatoPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl text-terracota-escuro">Contato e Localização</h1>
      <p className="mt-3 max-w-2xl text-marrom-claro">
        Envie sua dúvida, sugestão ou pedido de oração. A secretaria terá
        alegria em atender você.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section aria-label="Formulário de contato">
          <ContactForm />
        </section>

        <section aria-label="Endereço e canais de atendimento" className="space-y-6">
          <div className="rounded-xl border border-dourado-claro bg-white p-6 shadow-sm">
            <h2 className="text-xl text-marrom">Secretaria paroquial</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-dourado" aria-hidden />
                {paroquia.endereco}
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-dourado" aria-hidden />
                {paroquia.telefone}
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-dourado" aria-hidden />
                {paroquia.email}
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-dourado" aria-hidden />
                {paroquia.horarioSecretaria}
              </li>
            </ul>
            <a
              href={`https://wa.me/${paroquia.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#25d366] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#1eb855]"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              Falar no WhatsApp
            </a>
          </div>

          <div className="overflow-hidden rounded-xl border border-dourado-claro shadow-sm">
            <iframe
              src={paroquia.mapaEmbedUrl}
              title="Mapa — Jardim Botânico, Brasília-DF"
              className="h-80 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </section>
      </div>
    </div>
  );
}
