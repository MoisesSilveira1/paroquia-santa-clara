import { MessageCircle } from "lucide-react";
import { paroquia } from "@/lib/dados";

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${paroquia.whatsapp}?text=${encodeURIComponent(
        "Olá! Gostaria de falar com a secretaria paroquial."
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a secretaria pelo WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-xl transition-transform hover:scale-110"
    >
      <MessageCircle className="h-7 w-7" aria-hidden />
    </a>
  );
}
