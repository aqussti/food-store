import type { BetterAuthOptions } from 'better-auth';
import type { Pool } from 'pg';

// Contrato de #5. No agrega endpoints de administración ni permisos de #6.
export function authOptions(database: Pool): BetterAuthOptions {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error('Falta configurar BETTER_AUTH_SECRET.');
  const baseURL = process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.BETTER_AUTH_URL || 'http://localhost:3000';
  return {
    appName: 'Food Store', database, secret, baseURL,
    trustedOrigins: [baseURL],
    emailAndPassword: { enabled: true, minPasswordLength: 10, maxPasswordLength: 128, autoSignIn: true },
    user: {
      modelName: 'food_store_users',
      changeEmail: { enabled: false },
      additionalFields: { role: { type: ['cliente', 'empleado', 'superadmin'], defaultValue: 'cliente', required: false, input: false } },
    },
    session: { modelName: 'food_store_sessions', expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24, cookieCache: { enabled: false } },
    account: { modelName: 'food_store_accounts' },
    verification: { modelName: 'food_store_verifications' },
    rateLimit: { enabled: true, storage: 'database', modelName: 'food_store_auth_rate_limits', window: 60, max: 60, customRules: { '/sign-in/email': { window: 60, max: 8 }, '/sign-up/email': { window: 60, max: 5 } } },
    advanced: { cookiePrefix: 'food-store' },
  };
}
