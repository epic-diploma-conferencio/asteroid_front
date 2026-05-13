const encode = (obj: unknown) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(obj))));

const decode = (s: string): unknown => {
  const bin = atob(s);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
};

interface Payload {
  sub: string;
  login: string;
  iat: number;
  exp: number;
}

export const createAccessToken = (userId: string, login: string, ttlSeconds = 60 * 60) => {
  const header = encode({ alg: 'none', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const payload: Payload = { sub: userId, login, iat: now, exp: now + ttlSeconds };
  return `${header}.${encode(payload)}.mock`;
};

export const readAccessToken = (token: string | null | undefined): Payload | null => {
  if (!token) {
    return null;
  }
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }
  try {
    const payload = decode(parts[1]) as Payload;
    if (typeof payload !== 'object' || !payload) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};
