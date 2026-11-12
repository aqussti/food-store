export type Product = {
  id: string;
  name: string;
  detail: string;
  category: 'Bebidas' | 'Almacén' | 'Frescos';
  price: number;
  shape: 'bottle' | 'box' | 'jar';
  color: string;
  promotion?: boolean;
};

// Placeholders de interfaz, solicitados por Agus. No son inventario ni datos de Neon.
export const products: Product[] = [
  { id: 'demo-01', name: 'Bebida de ejemplo', detail: 'Botella · 500 ml', category: 'Bebidas', price: 250000, shape: 'bottle', color: '#e98a62', promotion: true },
  { id: 'demo-02', name: 'Jugo de ejemplo', detail: 'Botella · 1 L', category: 'Bebidas', price: 320000, shape: 'bottle', color: '#b0bb8c', promotion: true },
  { id: 'demo-03', name: 'Galletas de ejemplo', detail: 'Paquete · 250 g', category: 'Almacén', price: 180000, shape: 'box', color: '#d3a87a', promotion: true },
  { id: 'demo-04', name: 'Conserva de ejemplo', detail: 'Frasco · 350 g', category: 'Almacén', price: 290000, shape: 'jar', color: '#e9b36d' },
  { id: 'demo-05', name: 'Leche de ejemplo', detail: 'Envase · 1 L', category: 'Frescos', price: 210000, shape: 'box', color: '#a4bac2' },
  { id: 'demo-06', name: 'Agua de ejemplo', detail: 'Botella · 500 ml', category: 'Bebidas', price: 140000, shape: 'bottle', color: '#98b6bd' },
  { id: 'demo-07', name: 'Cereal de ejemplo', detail: 'Paquete · 300 g', category: 'Almacén', price: 360000, shape: 'box', color: '#c7a878' },
  { id: 'demo-08', name: 'Yogur de ejemplo', detail: 'Frasco · 200 g', category: 'Frescos', price: 170000, shape: 'jar', color: '#d5aaa4' },
];

export const categories = ['Todo', 'Bebidas', 'Almacén', 'Frescos'] as const;
export const money = (cents: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(cents / 100);
export const normalizeSearch = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-AR').trim();
export function filterProducts(query: string, category: string) {
  const search = normalizeSearch(query);
  return products.filter((product) => (category === 'Todo' || product.category === category) && normalizeSearch(product.name).includes(search));
}
