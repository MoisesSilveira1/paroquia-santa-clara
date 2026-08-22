import CascaAdmin from "@/components/admin/CascaAdmin";

/**
 * Moldura das telas logadas.
 *
 * FASE 2 substitui o usuário fixo abaixo pela sessão real e redireciona quem
 * não estiver autenticado para `/admin/entrar`.
 */
export default function LayoutPainel({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = {
    nome: "Secretaria",
    email: "secretaria@exemplo.org.br",
    papel: "SUPER_ADMIN" as const,
  };

  return <CascaAdmin usuario={usuario}>{children}</CascaAdmin>;
}
