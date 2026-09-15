import { NextRequest } from 'next/server';
import { TokenPayload, verifyToken } from './jwt';

export function getRequestToken(req: NextRequest) {
  const cookieToken = req.cookies.get('auth_token')?.value;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.get('authorization');
  return authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
}

export function getRequestUser(req: NextRequest): TokenPayload | null {
  const token = getRequestToken(req);
  return token ? verifyToken(token) : null;
}

export function getAdminUser(req: NextRequest): TokenPayload | null {
  const payload = getRequestUser(req);
  return payload?.role === 'ADMIN' ? payload : null;
}
