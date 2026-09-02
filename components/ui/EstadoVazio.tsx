import type { LucideIcon } from "lucide-react";

/**
 * O que aparece quando uma lista não tem nada.
 *
 * Distingue "ainda não existe nada" de "a busca não encontrou nada": são
 * situações diferentes e cada uma pede uma saída diferente para o usuário.
 */
export default function EstadoVazio({
  icone: Icone,
  titulo,
  descricao,
  acao,
}: {
  icone: LucideIcon;
  titulo: string;
  descricao?: string;
  acao?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-fundo-suave text-texto-suave">
        <Icone className="h-6 w-6" aria-hidden />
      </span>
      <div>
        <p className="font-semibold text-texto">{titulo}</p>
        {descricao && (
          <p className="mx-auto mt-1 max-w-sm text-sm text-texto-suave">
            {descricao}
          </p>
        )}
      </div>
      {acao}
    </div>
  );
}
