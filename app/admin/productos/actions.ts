"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import type { ProductInput } from "@/lib/admin/products";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/lib/admin/products";
import { actionError } from "../_lib/action-error";
import type { ActionState } from "../_lib/action-state";
import {
  formBoolean,
  formInteger,
  formOptionalString,
  formPriceCents,
  formString,
} from "../_lib/forms";

function productInputFromForm(formData: FormData): ProductInput {
  return {
    name: formString(formData, "name"),
    categoryId: formOptionalString(formData, "categoryId"),
    description: formOptionalString(formData, "description"),
    priceCents: formPriceCents(formData, "price"),
    stock: formInteger(formData, "stock"),
    minStock: formInteger(formData, "minStock"),
    imageUrl: formOptionalString(formData, "imageUrl"),
    isActive: formBoolean(formData, "isActive"),
  };
}

function revalidateProducts() {
  revalidatePath("/admin/productos");
  revalidatePath("/admin");
}

export async function createProductAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await getCurrentUser();
    await createProduct(user, productInputFromForm(formData));
    revalidateProducts();

    return { success: "Producto creado." };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateProductAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await getCurrentUser();
    const productId = formString(formData, "id");
    await updateProduct(user, productId, productInputFromForm(formData));
    revalidateProducts();

    return { success: "Producto actualizado." };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteProductAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await getCurrentUser();
    await deleteProduct(user, formString(formData, "id"));
    revalidateProducts();

    return { success: "Producto desactivado." };
  } catch (error) {
    return actionError(error);
  }
}
