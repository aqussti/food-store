import { getAdminPageUser } from "../_lib/page-user";
import { listCategories } from "@/lib/admin/products";
import { ActionForm } from "../_components/action-form";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "./actions";
import { CategoryFields } from "./category-fields";

export default async function CategoriesPage() {
  const user = await getAdminPageUser(["empleado", "superadmin"]);

  if (!user) {
    return null;
  }

  const categories = await listCategories(user, { includeInactive: true });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h2>Categorías</h2>
          <p className="muted">
            Las categorías se desactivan sin borrar el historial de productos.
          </p>
        </div>
        <span className="badge">{categories.length} en total</span>
      </div>

      <section className="card stack">
        <h3>Nueva categoría</h3>
        <ActionForm
          action={createCategoryAction}
          submitLabel="Crear categoría"
          className="stack"
        >
          <CategoryFields idPrefix="new-category" />
        </ActionForm>
      </section>

      <section className="card">
        <h3>Listado de categorías</h3>
        {categories.length === 0 ? (
          <p>Todavía no hay categorías cargadas.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Slug</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <strong>{category.name}</strong>
                    </td>
                    <td>{category.slug}</td>
                    <td>{category.description ?? "—"}</td>
                    <td>
                      {category.isActive ? (
                        <span className="badge badge-success">Activa</span>
                      ) : (
                        <span className="badge">Inactiva</span>
                      )}
                    </td>
                    <td>
                      <details>
                        <summary>Editar</summary>
                        <ActionForm
                          action={updateCategoryAction}
                          submitLabel="Guardar cambios"
                          className="stack"
                        >
                          <input type="hidden" name="id" value={category.id} />
                          <CategoryFields
                            category={category}
                            idPrefix={`edit-category-${category.id}`}
                          />
                        </ActionForm>
                      </details>
                      {category.isActive ? (
                        <ActionForm
                          action={deleteCategoryAction}
                          submitLabel="Desactivar"
                          danger
                        >
                          <input type="hidden" name="id" value={category.id} />
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
