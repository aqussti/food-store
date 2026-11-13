"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import type { UserRole } from "@/lib/auth/types";
import { isUserRole } from "@/lib/auth/roles";
import { setUserActive, updateUserRole } from "@/lib/admin/users";
import { ValidationError } from "@/lib/admin/errors";
import { actionError } from "../_lib/action-error";
import type { ActionState } from "../_lib/action-state";
import { formString } from "../_lib/forms";
import { createUser,editUser } from '@/lib/admin/manage-users';

export async function createUserAction(_state:ActionState,form:FormData):Promise<ActionState> {
  try {await createUser(await getCurrentUser(),{name:form.get('name'),email:form.get('email'),password:form.get('password'),role:form.get('role')});revalidateUsers();return {success:'Usuario creado.'};}catch(error){return actionError(error);}
}
export async function editUserAction(_state:ActionState,form:FormData):Promise<ActionState> {
  try {await editUser(await getCurrentUser(),formString(form,'id'),form.get('name'),form.get('phone'),form.get('address'));revalidateUsers();return {success:'Datos actualizados. El correo se conserva.'};}catch(error){return actionError(error);}
}

function parseRole(value: string): UserRole {
  if (isUserRole(value)) {
    return value;
  }

  throw new ValidationError("El rol seleccionado no es válido.");
}

function revalidateUsers() {
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
}

export async function updateUserRoleAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await getCurrentUser();
    await updateUserRole(
      user,
      formString(formData, "id"),
      parseRole(formString(formData, "role")),
    );
    revalidateUsers();

    return { success: "Rol actualizado." };
  } catch (error) {
    return actionError(error);
  }
}

export async function setUserActiveAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await getCurrentUser();
    await setUserActive(
      user,
      formString(formData, "id"),
      formString(formData, "active") === "true",
    );
    revalidateUsers();

    return {
      success:
        formString(formData, "active") === "true"
          ? "Usuario activado."
          : "Usuario desactivado.",
    };
  } catch (error) {
    return actionError(error);
  }
}
