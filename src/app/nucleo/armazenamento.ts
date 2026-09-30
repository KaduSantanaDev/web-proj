export function ler<T>(chave: string, padrao: T, valida: (valor: unknown) => valor is T): T {
  try {
    const bruto = localStorage.getItem(chave);
    if (bruto === null) return padrao;
    const valor: unknown = JSON.parse(bruto);
    return valida(valor) ? valor : padrao;
  } catch {
    return padrao;
  }
}

export function gravar(chave: string, valor: unknown): void {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {}
}

export function remover(chave: string): void {
  try {
    localStorage.removeItem(chave);
  } catch {}
}

export function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}
