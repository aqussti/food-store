export type CartLine = { productId: string; quantity: number };
export const CART_KEY = 'food-store:cart:v1';
export const MAX_QUANTITY = 20;

export function parseCart(value: string | null, validIds: string[]): CartLine[] {
  try {
    const parsed: unknown = JSON.parse(value || '[]');
    if (!Array.isArray(parsed)) return [];
    const quantities = new Map<string, number>();
    for (const item of parsed) {
      if (!item || typeof item !== 'object' || !validIds.includes(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1) continue;
      quantities.set(item.productId, Math.min(MAX_QUANTITY, (quantities.get(item.productId) || 0) + item.quantity));
    }
    return [...quantities].map(([productId, quantity]) => ({ productId, quantity }));
  } catch { return []; }
}

export function setQuantity(lines: CartLine[], productId: string, quantity: number): CartLine[] {
  if (!Number.isFinite(quantity)) return lines;
  const next = Math.max(0, Math.min(MAX_QUANTITY, Math.trunc(quantity)));
  if (next === 0) return lines.filter((line) => line.productId !== productId);
  if (lines.some((line) => line.productId === productId)) return lines.map((line) => line.productId === productId ? { ...line, quantity: next } : line);
  return [...lines, { productId, quantity: next }];
}
