import Link from "next/link";
import { Lock } from "lucide-react";
import Cartao from "@/components/ui/Cartao";
import EstadoVazio from "@/components/ui/EstadoVazio";

/**
 * Tela mostrada a quem abre uma área acima do seu nível de acesso.
 *
 * Existe porque simplesmente barrar deixava a pessoa diante do erro genérico
 * do servidor — o que parece defeito do site, e não uma regra. Aqui ela lê o
 * que aconteceu e tem para onde ir.
 */
export default function SemPermissaoAviso({
  descricao = "Esta área é restrita aos administradores da paróquia. Se você precisa de acesso, peça a quem administra o site.",
}: {
  descricao?: string;
}) {
  return (
    <Cartao>
      <EstadoVazio
        icone={Lock}
        titulo="Área restrita"
        descricao={descricao}
        acao={
          <Link
            href="/admin"
            className="inline-flex items-center rounded-lg bg-principal px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-principal-escuro"
          >
            Voltar ao painel
          </Link>
        }
      />
    </Cartao>
  );
}
