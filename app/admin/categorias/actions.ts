"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import type { CategoryInput } from "@/lib/admin/products";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/admin/products";
import { actionError } from "../_lib/action-error";
import type { ActionState } from "../_lib/action-state";
import {
  formBoolean,
  formOptionalString,
  formString,
} from "../_lib/forms";

function categoryInputFromForm(formData: FormData): CategoryInput {
  return {
    name: formString(formData, "name"),
    slug: formOptionalString(formData, "slug"),
    description: formOptionalString(formData, "description"),
    isActive: formBoolean(formData, "isActive"),
  };
}

function revalidateCategories() {
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  revalidatePath("/admin");
}

export async function createCategoryAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await getCurrentUser();
    await createCategory(user, categoryInputFromForm(formData));
    revalidateCategories();

    return { success: "Categoría creada." };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateCategoryAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await getCurrentUser();
    await updateCategory(
      user,
      formString(formData, "id"),
      categoryInputFromForm(formData),
    );
    revalidateCategories();

    return { success: "Categoría actualizada." };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteCategoryAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await getCurrentUser();
    await deleteCategory(user, formString(formData, "id"));
    revalidateCategories();

    return { success: "Categoría desactivada." };
  } catch (error) {
    return actionError(error);
  }
}
