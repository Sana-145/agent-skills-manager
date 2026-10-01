import bcrypt from "bcryptjs";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SALT_ROUNDS = 10;
const AUTH_COOKIE_NAME = "auth_token";
const MIN_SECRET_LENGTH = 32;

const parsedExpiry = parseInt(process.env.AUTH_TOKEN_EXPIRY_HOURS || "24");
const TOKEN_EXPIRY_HOURS =
  Number.isFinite(parsedExpiry) && parsedExpiry > 0 ? parsedExpiry : 24;

export interface TokenPayload {
  userId: number;
  email: string;
  name: string;
  exp: number;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * The secret used to sign login tokens. It is read when a token is signed or
 * checked (not when this file is imported), so a missing secret fails loudly
 * at login time instead of breaking the build.
 */
function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `AUTH_SECRET is missing or shorter than ${MIN_SECRET_LENGTH} characters. ` +
        "Set a long random value in .env.local and in your hosting environment variables."
    );
  }
  return secret;
}

function sign(data: string): Buffer {
  return createHmac("sha256", getSecret()).update(data).digest();
}

/**
 * Create a signed token: base64url(payload) + "." + base64url(HMAC-SHA256 signature).
 * Anyone can read the payload, but nobody can change it (or invent a new one)
 * without the secret.
 */
export function generateToken(user: {
  id: number;
  email: string;
  name: string;
}): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    exp: Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
  };

  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(body).toString("base64url");
  return `${body}.${signature}`;
}

/**
 * Verify the signature and expiry, then return the payload.
 * Returns null for anything forged, tampered with, malformed or expired.
 * (A missing AUTH_SECRET throws on purpose, so it can't be mistaken for "logged out".)
 */
export function verifyToken(token: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null; // also rejects the old unsigned tokens

  const [body, signature] = parts;
  const expected = sign(body);
  const provided = Buffer.from(signature, "base64url");

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf-8")
    ) as Partial<TokenPayload>;

    if (
      typeof payload.userId !== "number" ||
      !Number.isInteger(payload.userId) ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp < Date.now()
    ) {
      return null;
    }

    return payload as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Set auth cookie (httpOnly, secure in production)
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_EXPIRY_HOURS * 60 * 60, // in seconds
    path: "/",
  });
}

/**
 * Clear auth cookie
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

/**
 * Get auth token from cookies (for server components/actions)
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

/**
 * Get the signed-in user from the cookie (for server components/actions).
 * This is the only trustworthy answer to "who is calling?".
 */
export async function getCurrentUser(): Promise<TokenPayload | null> {
  const token = await getAuthToken();
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Extract token from cookie in request
 */
export function extractTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    if (trimmed.slice(0, separator) === AUTH_COOKIE_NAME) {
      return trimmed.slice(separator + 1) || null;
    }
  }
  return null;
}