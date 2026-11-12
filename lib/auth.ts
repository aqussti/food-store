import 'server-only';
import { betterAuth } from 'better-auth';
import { getDb } from './db';
import { authOptions } from './auth-options';

let instance: ReturnType<typeof betterAuth> | undefined;
export function getAuth() { return instance ??= betterAuth(authOptions(getDb())); }
