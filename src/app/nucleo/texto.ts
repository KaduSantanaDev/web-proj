export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export function somenteDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}
