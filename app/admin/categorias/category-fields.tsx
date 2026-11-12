import type { Category } from "@/lib/admin/products";

export function CategoryFields({
  category,
  idPrefix,
}: {
  category?: Category;
  idPrefix: string;
}) {
  return (
    <>
      <div className="form-grid">
        <label htmlFor={`${idPrefix}-name`}>
          Nombre
          <input
            id={`${idPrefix}-name`}
            name="name"
            type="text"
            required
            maxLength={120}
            defaultValue={category?.name ?? ""}
          />
        </label>
        <label htmlFor={`${idPrefix}-slug`}>
          Slug (opcional)
          <input
            id={`${idPrefix}-slug`}
            name="slug"
            type="text"
            maxLength={80}
            defaultValue={category?.slug ?? ""}
            placeholder="Se genera desde el nombre"
          />
        </label>
      </div>
      <label htmlFor={`${idPrefix}-description`}>
        Descripción
        <textarea
          id={`${idPrefix}-description`}
          name="description"
          maxLength={2000}
          defaultValue={category?.description ?? ""}
        />
      </label>
      <label
        htmlFor={`${idPrefix}-active`}
        style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
      >
        <input
          id={`${idPrefix}-active`}
          name="isActive"
          type="checkbox"
          defaultChecked={category?.isActive ?? true}
        />
        Categoría activa
      </label>
    </>
  );
}
