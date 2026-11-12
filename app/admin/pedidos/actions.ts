"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import {
  advanceOrder,
  cancelOrder,
  ORDER_STATUSES,
  type OrderStatus,
} from "@/lib/admin/orders";
import { ValidationError } from "@/lib/admin/errors";
import { actionError } from "../_lib/action-error";
import type { ActionState } from "../_lib/action-state";
import { formString } from "../_lib/forms";

function parseStatus(value: string): OrderStatus {
  if ((ORDER_STATUSES as readonly string[]).includes(value)) {
    return value as OrderStatus;
  }

  throw new ValidationError("El estado solicitado no es válido.");
}

function revalidateOrders() {
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
}

export async function advanceOrderAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await getCurrentUser();
    const orderId = formString(formData, "id");
    const nextStatus = parseStatus(formString(formData, "nextStatus"));

    await advanceOrder(user, orderId, nextStatus);
    revalidateOrders();

    return { success: "Pedido actualizado." };
  } catch (error) {
    return actionError(error);
  }
}

export async function cancelOrderAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await getCurrentUser();
    const orderId = formString(formData, "id");
    const reason = formString(formData, "reason");

    await cancelOrder(user, orderId, reason);
    revalidateOrders();

    return { success: "Pedido cancelado y stock devuelto." };
  } catch (error) {
    return actionError(error);
  }
}
