import Link from "next/link";

export function AccessDenied({ message }: { message: string }) {
  return (
    <section className="card" style={{ maxWidth: 640, margin: "48px auto" }}>
      <h2>Acceso restringido</h2>
      <p>{message}</p>
      <p>
        <Link className="button" href="/ingresar">Ingresar</Link>{" "}
        <Link className="button button-secondary" href="/">
          Volver al inicio
        </Link>
      </p>
    </section>
  );
}
