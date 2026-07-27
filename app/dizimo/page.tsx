import type { Metadata } from "next";
import { HeartHandshake, QrCode, Landmark, Copy } from "lucide-react";
import { dizimo, paroquia } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Dízimo e Doações",
  description:
    "Contribua com o dízimo e as obras da paróquia: chave Pix, dados bancários e QR Code.",
};

export default function DizimoPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl text-terracota-escuro">Dízimo e Doações</h1>

      <section className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="flex items-center gap-2 text-2xl text-marrom">
            <HeartHandshake className="h-6 w-6 text-dourado" aria-hidden />
            Por que ser dizimista?
          </h2>
          <div className="mt-4 space-y-4 leading-relaxed">
            <p>
              O dízimo é um gesto de fé e gratidão: devolvemos a Deus uma parte
              do que d&apos;Ele recebemos. Não é taxa nem mensalidade — é
              partilha consciente, livre e proporcional, fruto do coração.
            </p>
            <p>
              Com o dízimo, a paróquia mantém a igreja aberta e acolhedora,
              sustenta as pastorais, a evangelização, a catequese e as ações de
              caridade com as famílias mais necessitadas da nossa região.
            </p>
            <p>
              No espírito de São Francisco e Santa Clara, cada oferta — grande
              ou pequena — é semente de fraternidade. Deus ama quem dá com
              alegria (2Cor 9,7).
            </p>
            <p className="rounded-lg bg-dourado-claro/50 p-4 text-sm">
              Para se cadastrar como dizimista, procure a equipe do Dízimo após
              as missas ou a secretaria: {paroquia.telefone}.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-dourado-claro bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl text-marrom">
              <QrCode className="h-6 w-6 text-dourado" aria-hidden />
              Contribua pelo Pix
            </h2>
            <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
              {/* QR Code de demonstração — substituir pelo QR real gerado pelo banco */}
              <svg
                viewBox="0 0 100 100"
                className="h-40 w-40 shrink-0 rounded-lg border border-creme-escuro p-2"
                role="img"
                aria-label="QR Code de demonstração para pagamento Pix"
              >
                <rect width="100" height="100" fill="#fff" />
                <g fill="#5c4433">
                  <rect x="8" y="8" width="24" height="24" />
                  <rect x="68" y="8" width="24" height="24" />
                  <rect x="8" y="68" width="24" height="24" />
                  <rect x="14" y="14" width="12" height="12" fill="#fff" />
                  <rect x="74" y="14" width="12" height="12" fill="#fff" />
                  <rect x="14" y="74" width="12" height="12" fill="#fff" />
                  <rect x="40" y="8" width="6" height="6" />
                  <rect x="52" y="14" width="6" height="6" />
                  <rect x="40" y="26" width="6" height="6" />
                  <rect x="52" y="32" width="6" height="6" />
                  <rect x="40" y="44" width="6" height="6" />
                  <rect x="52" y="50" width="6" height="6" />
                  <rect x="64" y="44" width="6" height="6" />
                  <rect x="76" y="50" width="6" height="6" />
                  <rect x="88" y="44" width="4" height="6" />
                  <rect x="8" y="44" width="6" height="6" />
                  <rect x="20" y="50" width="6" height="6" />
                  <rect x="32" y="56" width="6" height="6" />
                  <rect x="44" y="62" width="6" height="6" />
                  <rect x="56" y="68" width="6" height="6" />
                  <rect x="68" y="74" width="6" height="6" />
                  <rect x="80" y="80" width="6" height="6" />
                  <rect x="44" y="80" width="6" height="6" />
                  <rect x="56" y="86" width="6" height="6" />
                </g>
              </svg>
              <div className="text-center sm:text-left">
                <p className="text-sm text-marrom-claro">Chave Pix (e-mail):</p>
                <p className="mt-1 flex items-center gap-2 break-all font-mono text-sm font-semibold text-marrom">
                  {dizimo.chavePix}
                  <Copy className="h-4 w-4 shrink-0 text-dourado" aria-hidden />
                </p>
                <p className="mt-3 text-xs text-marrom-claro">
                  Confira sempre o nome do favorecido:{" "}
                  <strong>{dizimo.titular}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dourado-claro bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl text-marrom">
              <Landmark className="h-6 w-6 text-dourado" aria-hidden />
              Depósito ou transferência
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="font-semibold">Banco</dt>
              <dd>{dizimo.banco}</dd>
              <dt className="font-semibold">Agência</dt>
              <dd>{dizimo.agencia}</dd>
              <dt className="font-semibold">Conta corrente</dt>
              <dd>{dizimo.conta}</dd>
              <dt className="font-semibold">Titular</dt>
              <dd>{dizimo.titular}</dd>
              <dt className="font-semibold">CNPJ</dt>
              <dd>{dizimo.cnpj}</dd>
            </dl>
            <p className="mt-4 text-xs text-marrom-claro">
              Dados de demonstração — substituir pelos dados oficiais da
              paróquia antes da publicação.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
