import type { Product } from '@/lib/catalog';

export function ProductArt({ product }: { product: Product }) {
  return <svg viewBox="0 0 160 190" className="product-art" role="img" aria-label={`Imagen de ejemplo: ${product.name}`}>
    <ellipse cx="80" cy="176" rx="35" ry="6" fill="#51452b" opacity=".08" />
    {product.shape === 'bottle' ? <>
      <rect x="67" y="17" width="26" height="16" rx="5" fill={product.color} />
      <path d="M68 33h24v20c0 11 23 21 23 40v65c0 11-10 16-35 16s-35-5-35-16V93c0-19 23-29 23-40Z" fill="#f1e6cf" stroke="#ddcfb5" strokeWidth="1.5" />
      <path d="M54 96v57c0 7 6 10 12 11" fill="none" stroke="#fffdf4" strokeWidth="5" strokeLinecap="round" />
      <path d="M45 94h70v49H45Z" fill={product.color} />
      <path d="M51 94h7v49h-7Z" fill="#fff" opacity=".16" />
    </> : product.shape === 'box' ? <>
      <path d="m48 37 50-9 21 16v118l-21 12-50-8Z" fill={product.color} />
      <path d="m98 28 21 16-21 10-50-17Z" fill="#fff" opacity=".3" />
      <path d="m98 54 21-10v118l-21 12Z" fill="#282015" opacity=".12" />
      <path d="M48 87h50v54H48Z" fill="#fff8e6" opacity=".85" />
    </> : <>
      <rect x="43" y="53" width="74" height="119" rx="21" fill="#eadcc2" stroke="#dac8a8" strokeWidth="1.5" />
      <rect x="43" y="45" width="74" height="20" rx="6" fill={product.color} />
      <rect x="43" y="94" width="74" height="49" fill={product.color} />
      <path d="M53 77v10" stroke="#fffaf1" strokeWidth="5" strokeLinecap="round" />
    </>}
    <circle cx={product.shape === 'box' ? 73 : 80} cy="116" r="13" fill="#fff9e9" opacity=".85" />
    <path d={product.shape === 'box' ? 'M68 119v-6h10m-10 0v-4h10' : 'M75 119v-6h10m-10 0v-4h10'} fill="none" stroke={product.color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>;
}
