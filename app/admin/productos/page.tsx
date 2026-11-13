import { getAdminPageUser } from "../_lib/page-user";
import { formatCents } from "@/lib/admin/format";
import { listCategories, listProducts } from "@/lib/admin/products";
import { ActionForm } from "../_components/action-form";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "./actions";
import { ProductFields } from "./product-fields";

export default async function ProductsPage() {
  const user = await getAdminPageUser(["empleado", "superadmin"]);

  if (!user) {
    return null;
  }

  const [products, categories] = await Promise.all([
    listProducts(user, { includeInactive: true }),
    listCategories(user, { includeInactive: true }),
  ]);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h2>Productos y stock</h2>
          <p className="muted">
            Alta, edición y desactivación. El stock nunca puede ser negativo.
          </p>
        </div>
        <span className="badge badge-warning">
          {products.filter((product) => product.lowStock && product.isActive).length}{" "}
          con stock bajo
        </span>
      </div>

      <section className="card stack">
        <h3>Nuevo producto</h3>
        <ActionForm
          action={createProductAction}
          submitLabel="Crear producto"
          className="stack"
        >
          <ProductFields categories={categories} idPrefix="new-product" />
        </ActionForm>
      </section>

      <section className="card">
        <h3>Listado de productos</h3>
        {products.length === 0 ? (
          <p>Todavía no hay productos cargados.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                      {product.description ? (
                        <div className="muted">{product.description}</div>
                      ) : null}
                    </td>
                    <td>{product.categoryName ?? "Sin categoría"}</td>
                    <td>{formatCents(product.priceCents)}</td>
                    <td>
                      <span
                        className={
                          product.lowStock && product.isActive
                            ? "badge badge-danger"
                            : "badge"
                        }
                      >
                        {product.stock}
                      </span>
                      <div className="muted">Mínimo: {product.minStock}</div>
                    </td>
                    <td>
                      {product.isActive ? (
                        <span className="badge badge-success">Activo</span>
                      ) : (
                        <span className="badge">Inactivo</span>
                      )}
                      {product.lowStock && product.isActive ? (
                        <div className="badge badge-warning">Stock bajo</div>
                      ) : null}
                    </td>
                    <td>
                      <details>
                        <summary>Editar</summary>
                        <ActionForm
                          action={updateProductAction}
                          submitLabel="Guardar cambios"
                          className="stack"
                        >
                          <input type="hidden" name="id" value={product.id} />
                          <ProductFields
                            categories={categories}
                            product={product}
                            idPrefix={`edit-${product.id}`}
                          />
                        </ActionForm>
                      </details>
                      {product.isActive ? (
                        <ActionForm
                          action={deleteProductAction}
                          submitLabel="Desactivar"
                          danger
                        >
                          <input type="hidden" name="id" value={product.id} />
                        </ActionForm>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
