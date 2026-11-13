import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getSession: vi.fn(), query: vi.fn(), headers: vi.fn() }));
vi.mock('react', () => ({ cache: (fn: unknown) => fn }));
vi.mock('next/headers', () => ({ headers: mocks.headers }));
vi.mock('@/lib/auth', () => ({ getAuth: () => ({ api: { getSession: mocks.getSession } }) }));
vi.mock('@/lib/db', () => ({ getDb: () => ({ query: mocks.query }) }));
import { getCurrentUser } from '@/lib/auth/current-user';
import { requireRole } from '@/lib/auth/roles';

beforeEach(() => { vi.resetAllMocks(); mocks.headers.mockResolvedValue(new Headers({ 'x-food-store-dev-user-id': 'forged-admin' })); });
describe('sesión real compartida entre tienda y panel', () => {
  it('ignora el header de prueba cuando no hay sesión', async () => {
    mocks.getSession.mockResolvedValue(null);
    expect(await getCurrentUser()).toBeNull();
    expect(mocks.query).not.toHaveBeenCalled();
  });
  it('usa el id verificado y consulta el rol y estado en la base', async () => {
    mocks.getSession.mockResolvedValue({ user: { id: 'real-user', role: 'superadmin' } });
    mocks.query.mockResolvedValue({ rows: [{ id: 'real-user', email: 'test@example.test', name: 'Test', role: 'cliente', isActive: true }] });
    const user = await getCurrentUser();
    expect(mocks.query.mock.calls[0][1]).toEqual(['real-user']);
    expect(user?.role).toBe('cliente');
    expect(() => requireRole(user, ['empleado', 'superadmin'])).toThrow();
  });
  it('una cuenta desactivada no puede acceder aunque conserve una sesión', async () => {
    mocks.getSession.mockResolvedValue({ user: { id: 'real-user' } });
    mocks.query.mockResolvedValue({ rows: [{ id: 'real-user', role: 'superadmin', isActive: false }] });
    const awaitUser = await getCurrentUser();
    expect(() => requireRole(awaitUser, ['superadmin'])).toThrow('desactivada');
  });
  it('una cuenta eliminada ya no tiene acceso', async () => {
    mocks.getSession.mockResolvedValue({ user: { id: 'deleted-user' } });
    mocks.query.mockResolvedValue({ rows: [] });
    expect(await getCurrentUser()).toBeNull();
  });
});
