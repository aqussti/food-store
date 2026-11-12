import { Catalog } from '@/components/catalog';
import { categories } from '@/lib/catalog';

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string | string[]; categoria?: string | string[] }> }) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q.slice(0, 100).trim() : '';
  const candidate = typeof params.categoria === 'string' ? params.categoria : 'Todo';
  const category = categories.find((item) => item === candidate) || 'Todo';
  return <Catalog query={query} category={category} />;
}
