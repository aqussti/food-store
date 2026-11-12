import type { Category, Product } from "@/lib/admin/products";

export function ProductFields({
  categories,
  product,
  idPrefix,
}: {
  categories: Category[];
  product?: Product;
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
            maxLength={160}
            defaultValue={product?.name ?? ""}
          />
        </label>
        <label htmlFor={`${idPrefix}-category`}>
          Categoría
          <select
            id={`${idPrefix}-category`}
            name="categoryId"
            defaultValue={product?.categoryId ?? ""}
          >
            <option value="">Sin categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
                {category.isActive ? "" : " (inactiva)"}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={`${idPrefix}-price`}>
          Precio (ARS)
          <input
            id={`${idPrefix}-price`}
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={
              product ? (product.priceCents / 100).toFixed(2) : "0.00"
            }
          />
        </label>
        <label htmlFor={`${idPrefix}-stock`}>
          Stock actual
          <input
            id={`${idPrefix}-stock`}
            name="stock"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={product?.stock ?? 0}
          />
        </label>
        <label htmlFor={`${idPrefix}-min-stock`}>
          Stock mínimo
          <input
            id={`${idPrefix}-min-stock`}
            name="minStock"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={product?.minStock ?? 0}
          />
        </label>
        <label htmlFor={`${idPrefix}-image`}>
          URL de imagen (opcional)
          <input
            id={`${idPrefix}-image`}
            name="imageUrl"
            type="url"
            defaultValue={product?.imageUrl ?? ""}
          />
        </label>
      </div>
      <label htmlFor={`${idPrefix}-description`}>
        Descripción
        <textarea
          id={`${idPrefix}-description`}
          name="description"
          maxLength={2000}
          defaultValue={product?.description ?? ""}
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
          defaultChecked={product?.isActive ?? true}
        />
        Producto activo
      </label>
    </>
  );
}
