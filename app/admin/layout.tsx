import type { Metadata } from "next";
import { SCRIPT_TEMA_INICIAL } from "@/components/admin/AlternarTema";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s · Painel" },
  // Área de trabalho da secretaria: não deve aparecer em buscador nenhum.
  robots: { index: false, follow: false },
};

/**
 * Camada mais externa da área administrativa.
 *
 * Não desenha nada: existe para valer tanto na tela de entrada quanto no
 * painel logado. A moldura visual (menu e cabeçalho) fica em `(painel)`,
 * que a tela de entrada propositalmente não usa.
 */
export default function LayoutAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA_INICIAL }} />
      {children}
    </>
  );
}
