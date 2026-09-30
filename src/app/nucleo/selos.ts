const PADRAO: Record<string, string> = { 'background-color': 'var(--manteiga)' };

const ESTILOS: Record<string, Record<string, string>> = {
  'Mais pedida': PADRAO,
  Novidade: { 'background-color': 'var(--menta-fundo)' },
  'Saiu do forno': { 'background-color': '#ffd3cb' },
};

export function estiloDoSelo(destaque: string): Record<string, string> {
  return ESTILOS[destaque] ?? PADRAO;
}
