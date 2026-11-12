"use client";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="admin-shell">
      <main className="admin-main">
        <section className="card" style={{ maxWidth: 640, margin: "48px auto" }}>
          <h2>Ocurrió un error en el panel</h2>
          <p>
            No se pudo completar la operación. Revisá los datos e intentá
            nuevamente.
          </p>
          <button type="button" className="button" onClick={() => reset()}>
            Reintentar
          </button>
        </section>
      </main>
    </div>
  );
}
