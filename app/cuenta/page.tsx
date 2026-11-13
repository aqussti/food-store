import { AccountView } from '@/components/account-view';
import { getCurrentUser } from '@/lib/auth/current-user';
import { canManageCatalog } from '@/lib/auth/roles';
export const metadata = { title: 'Tu cuenta · Food Store' };
export const dynamic = 'force-dynamic';
export default async function Page() {
  const user = await getCurrentUser();
  return <AccountView showAdmin={canManageCatalog(user)} />;
}
