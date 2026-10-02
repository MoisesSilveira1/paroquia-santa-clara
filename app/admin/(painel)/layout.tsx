import CascaAdmin from "@/components/admin/CascaAdmin";
import { exigirSessao } from "@/lib/auth/guardas";
import { acaoSair } from "../acoes";

/**
 * Moldura das telas logadas.
 *
 * A checagem de sessão aqui garante que nenhuma página do grupo renderize
 * para quem não entrou. Não substitui a checagem dentro de cada ação: um
 * layout protege o que é *exibido*, não o que pode ser *enviado* ao servidor.
 */
export default async function LayoutPainel({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await exigirSessao();

  // Nenhum item do menu depende de alcance hoje — ver `Alcance` em
  // navegacao.ts. Quando voltar a depender, o cálculo é aqui, no servidor.
  return (
    <CascaAdmin usuario={usuario} aoSair={acaoSair}>
      {children}
    </CascaAdmin>
  );
}
