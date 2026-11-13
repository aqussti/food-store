import { AuthorizationError } from "@/lib/auth/roles";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/admin/errors";

export function actionError(error: unknown): { error: string } {
  if (
    error instanceof AuthorizationError ||
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof ConflictError
  ) {
    return { error: error.message };
  }

  console.error("Error inesperado en una acción administrativa:", error);

  return { error: "Ocurrió un error interno. Intentá nuevamente." };
}
