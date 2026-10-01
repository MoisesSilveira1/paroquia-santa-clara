import CascaAdmin from "@/components/admin/CascaAdmin";
import type { Alcance } from "@/components/admin/navegacao";
import { exigirSessao } from "@/lib/auth/guardas";
import { alcancaCatequese } from "@/lib/servicos/catequese";
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

  // Os alcances que o papel sozinho não responde. São calculados aqui, no
  // servidor, porque dependem de consulta ao banco — e o menu, que roda no
  // navegador, não pode perguntar isso. Ver `Alcance` em navegacao.ts.
  const alcances: Alcance[] = [];
  if (await alcancaCatequese({ id: usuario.id, papel: usuario.papel })) {
    alcances.push("catequese");
  }

  return (
    <CascaAdmin usuario={usuario} alcances={alcances} aoSair={acaoSair}>
      {children}
    </CascaAdmin>
  );
}
