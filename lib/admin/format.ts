const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function formatCents(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

export function formatDateTime(value: Date | string): string {
  return dateTimeFormatter.format(new Date(value));
}
