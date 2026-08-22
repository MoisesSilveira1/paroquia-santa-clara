/**
 * Junta classes CSS ignorando `false`, `null` e `undefined`.
 *
 * Existe para escrever `cx(BASE, ativo && ATIVO, className)` sem espalhar
 * template strings com `? :` por todo componente.
 */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
