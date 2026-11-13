import { ValidationError } from "@/lib/admin/errors";

export function formString(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

export function formOptionalString(
  formData: FormData,
  name: string,
): string | null {
  const value = formString(formData, name).trim();

  return value === "" ? null : value;
}

export function formBoolean(formData: FormData, name: string): boolean {
  return formData.get(name) === "on" || formData.get(name) === "true";
}

export function formPriceCents(formData: FormData, name: string): number {
  const raw = formString(formData, name).trim();
  const value = Number(raw);

  if (raw === "" || !Number.isFinite(value) || value < 0) {
    throw new ValidationError(
      "El precio debe ser un número mayor o igual a cero.",
    );
  }

  return Math.round(value * 100);
}

export function formInteger(formData: FormData, name: string): number {
  const raw = formString(formData, name).trim();

  if (!/^\d+$/.test(raw)) {
    throw new ValidationError(
      "El valor debe ser un número entero mayor o igual a cero.",
    );
  }

  return Number(raw);
}
