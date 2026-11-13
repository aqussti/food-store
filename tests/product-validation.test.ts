import { describe, expect, it } from "vitest";

import { ValidationError } from "@/lib/admin/errors";
import {
  booleanValue,
  nonNegativeCents,
  nonNegativeInteger,
  optionalString,
  requiredString,
  slugify,
} from "@/lib/admin/validation";

describe("validación y normalización del catálogo (#12)", () => {
  it("exige texto obligatorio y recorta espacios", () => {
    expect(requiredString("  Milanesa  ", "El nombre", 20)).toBe("Milanesa");
    expect(() => requiredString("", "El nombre")).toThrow(ValidationError);
    expect(() => requiredString("x".repeat(21), "El nombre", 20)).toThrow(
      ValidationError,
    );
  });

  it("acepta descripciones opcionales vacías como null", () => {
    expect(optionalString("", "La descripción")).toBeNull();
    expect(optionalString("  ", "La descripción")).toBeNull();
    expect(optionalString("  Sin TACC  ", "La descripción")).toBe("Sin TACC");
  });

  it("valida importes enteros en centavos", () => {
    expect(nonNegativeCents("1250", "El precio")).toBe(1250);
    expect(nonNegativeCents(0, "El precio")).toBe(0);
    expect(() => nonNegativeCents(-1, "El precio")).toThrow(ValidationError);
    expect(() => nonNegativeCents("12.5", "El precio")).toThrow(ValidationError);
    expect(() => nonNegativeCents("abc", "El precio")).toThrow(ValidationError);
  });

  it("valida stock entero no negativo", () => {
    expect(nonNegativeInteger("8", "El stock")).toBe(8);
    expect(() => nonNegativeInteger("-2", "El stock")).toThrow(ValidationError);
    expect(() => nonNegativeInteger("2.5", "El stock")).toThrow(ValidationError);
  });

  it("genera slugs estables a partir de nombres con acentos", () => {
    expect(slugify("  Empanadas de Carne  ")).toBe("empanadas-de-carne");
    expect(slugify("Bebidas sin azúcar")).toBe("bebidas-sin-azucar");
    expect(slugify("Ñoquis")).toBe("noquis");
    expect(() => slugify("!!!")).toThrow(ValidationError);
  });

  it("interpreta checkboxes de formularios", () => {
    expect(booleanValue("on", false)).toBe(true);
    expect(booleanValue("true", false)).toBe(true);
    expect(booleanValue("false", true)).toBe(false);
    expect(booleanValue(undefined, true)).toBe(true);
  });
});
