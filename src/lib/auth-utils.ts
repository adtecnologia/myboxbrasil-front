// Utilitários para autenticação por CPF/CNPJ.
// O Supabase Auth exige e-mail; mapeamos documento → e-mail sintético interno.

const AUTH_EMAIL_DOMAIN = "auth.mybox.local";

export function onlyDigits(value: string): string {
  return (value ?? "").replace(/\D/g, "");
}

export function documentoToEmail(documento: string): string {
  const digits = onlyDigits(documento);
  return `${digits}@${AUTH_EMAIL_DOMAIN}`;
}

export function isAuthEmail(email: string | null | undefined): boolean {
  return !!email && email.endsWith(`@${AUTH_EMAIL_DOMAIN}`);
}

export function detectarTipoDocumento(documento: string): "cpf" | "cnpj" {
  return onlyDigits(documento).length > 11 ? "cnpj" : "cpf";
}

export function validarDocumento(documento: string): boolean {
  const d = onlyDigits(documento);
  return d.length === 11 || d.length === 14;
}

export function formatCPF(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function formatCNPJ(value: string): string {
  const d = onlyDigits(value).slice(0, 14);
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function formatCelular(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

export function formatTelefone(value: string): string {
  const d = onlyDigits(value).slice(0, 10);
  return d
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
}

export function formatCEP(value: string): string {
  const d = onlyDigits(value).slice(0, 8);
  return d.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
}
