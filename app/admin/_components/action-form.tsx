"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

import type { ActionState } from "../_lib/action-state";

type ActionFormProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  submitLabel: string;
  className?: string;
  danger?: boolean;
};

export function ActionForm({
  action,
  children,
  submitLabel,
  className,
  danger = false,
}: ActionFormProps) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className={className}>
      {children}
      <button
        type="submit"
        className={danger ? "button button-danger" : "button"}
        disabled={pending}
      >
        {pending ? "Procesando..." : submitLabel}
      </button>
      {state?.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.success ? <p className="form-success">{state.success}</p> : null}
    </form>
  );
}
