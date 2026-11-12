import { ValidationError } from "./errors";

export function requiredString(
  value: unknown,
  field: string,
  maxLength = 200,
): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ValidationError(`${field} es obligatorio.`);
  }

  const trimmed = value.trim();

  if (trimmed.length > maxLength) {
    throw new ValidationError(
      `${field} no puede superar los ${maxLength} caracteres.`,
    );
  }

  return trimmed;
}

export function optionalString(
  value: unknown,
  field: string,
  maxLength = 2_000,
): string | null {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new ValidationError(`${field} no es válido.`);
  }

  const trimmed = value.trim();

  if (trimmed === "") {
    return null;
  }

  if (trimmed.length > maxLength) {
    throw new ValidationError(
      `${field} no puede superar los ${maxLength} caracteres.`,
    );
  }

  return trimmed;
}

export function nonNegativeInteger(value: unknown, field: string): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value.trim())
        ? Number(value)
        : Number.NaN;

  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new ValidationError(
      `${field} debe ser un número entero mayor o igual a cero.`,
    );
  }

  return parsed;
}

export function nonNegativeCents(value: unknown, field: string): number {
  return nonNegativeInteger(value, field);
}

export function booleanValue(value: unknown, defaultValue: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (["true", "on", "1"].includes(value.toLowerCase())) {
      return true;
    }

    if (["false", "off", "0"].includes(value.toLowerCase())) {
      return false;
    }
  }

  return defaultValue;
}

export function slugify(value: string): string {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  if (!slug) {
    throw new ValidationError(
      "El nombre no permite generar un identificador válido.",
    );
  }

  return slug;
}
