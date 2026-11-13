import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { Pool } from 'pg';

const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const email = `qa-${randomUUID()}@example.test`;
const password = randomBytes(24).toString('base64url');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
let userId;
let cookie = '';
async function request(path, body, withCookie = true, origin = base) {
  const response = await fetch(`${base}/api/auth/${path}`, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', Origin: origin, ...(withCookie && cookie ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { response, data: await response.json().catch(() => null) };
}
try {
  const anonymous = await request('get-session');
  assert.equal(anonymous.data, null, 'Un visitante no debe tener sesión.');
  const signup = await request('sign-up/email', { email, password, name: 'Prueba automática de Agus', role: 'superadmin' });
  assert.equal(signup.response.status, 200, `Registro rechazado: ${signup.data?.code || signup.response.status}`);
  userId = signup.data.user.id;
  cookie = signup.response.headers.getSetCookie().map((value) => value.split(';')[0]).join('; ');
  assert.ok(cookie.length > 0);
  assert.match(signup.response.headers.get('set-cookie') || '', /HttpOnly/i);
  const stored = await pool.query('SELECT u.role, a.password FROM food_store_users u JOIN food_store_accounts a ON a."userId" = u.id WHERE u.id = $1', [userId]);
  assert.equal(stored.rows[0].role, 'cliente', 'El rol enviado por el navegador debe ignorarse.');
  assert.notEqual(stored.rows[0].password, password, 'La contraseña no puede guardarse en texto plano.');
  const session = await request('get-session');
  assert.equal(session.data.user.id, userId);
  const customerPanel = await fetch(`${base}/admin`, { headers: { Cookie: cookie } });
  assert.match(await customerPanel.text(), /Tu cuenta es de Cliente/);
  // Solo cambia la cuenta efímera creada por este test, nunca usuarios existentes.
  await pool.query("UPDATE food_store_users SET role = 'empleado' WHERE id = $1 AND email = $2", [userId, email]);
  const staffPanel = await fetch(`${base}/admin`, { headers: { Cookie: cookie } });
  assert.match(await staffPanel.text(), /Panel de administraci/);
  const forgedPanel = await fetch(`${base}/admin`, { headers: { 'x-food-store-dev-user-id': userId } });
  assert.match(await forgedPanel.text(), /Necesitás iniciar sesión/);
  await pool.query('UPDATE food_store_users SET is_active = false WHERE id = $1 AND email = $2', [userId, email]);
  const inactivePanel = await fetch(`${base}/admin`, { headers: { Cookie: cookie } });
  assert.match(await inactivePanel.text(), /Tu cuenta está desactivada/);
  const inactiveLogin = await request('sign-in/email', {email,password}, false);
  assert.ok(inactiveLogin.response.status >= 400, 'Una cuenta dada de baja no puede ingresar.');
  await pool.query("UPDATE food_store_users SET role = 'cliente', is_active = true WHERE id = $1 AND email = $2", [userId, email]);
  const duplicate = await request('sign-up/email', { email, password, name: 'Duplicado' }, false);
  assert.ok(duplicate.response.status >= 400, 'No puede duplicarse el correo.');
  const changeEmail = await request('change-email', { newEmail: `changed-${email}` });
  assert.ok(changeEmail.response.status >= 400, 'El correo debe ser inmutable.');
  const crossOrigin = await request('sign-out', {}, true, 'https://origen-no-autorizado.example');
  assert.ok(crossOrigin.response.status >= 400, 'Un origen ajeno no puede cerrar la sesión.');
  const logout = await request('sign-out', {});
  assert.equal(logout.response.status, 200);
  const expired = await request('get-session');
  assert.equal(expired.data, null, 'La sesión debe quedar invalidada en el servidor.');
  cookie = '';
  const wrong = await request('sign-in/email', { email, password: 'incorrecta-123456' });
  assert.ok(wrong.response.status >= 400);
  const signin = await request('sign-in/email', { email, password });
  assert.equal(signin.response.status, 200);
  assert.equal(signin.data.user.id, userId);
  console.log('OK: accesos, sesión real del panel, Cliente rechazado, Empleado admitido, header falso rechazado y cuenta desactivada rechazada.');
} finally {
  // Solo elimina la cuenta efímera creada por esta ejecución, nunca cuentas ajenas.
  await pool.query('DELETE FROM food_store_users WHERE email = $1', [email]);
  await pool.end();
}
