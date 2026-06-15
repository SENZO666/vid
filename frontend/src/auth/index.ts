// Local-only password auth & session — direct rebuild of the Kotlin
// PasswordHasher / SessionManager pair.
//
// Hashing: SHA-256 with a per-user random salt (16 bytes hex), 10 000 iterations.
// This is what the original Kotlin code calls "PBKDF2-style iterated SHA-256".
// We never persist a plaintext password.

import * as Crypto from "expo-crypto";

import {
  createUser as createUserRow,
  findUserByUsername,
  type User,
} from "../db/queries";
import { storage } from "../utils/storage";

const ITERATIONS = 10000;
const SESSION_USER_ID = "bt.session.userId";
const SESSION_USERNAME = "bt.session.username";

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function randomSalt(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return bytesToHex(bytes);
}

async function hashPassword(password: string, salt: string): Promise<string> {
  let current = `${salt}::${password}`;
  for (let i = 0; i < ITERATIONS; i++) {
    current = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      current,
    );
  }
  return current;
}

export async function register(
  username: string,
  password: string,
): Promise<{ ok: true; userId: number } | { ok: false; error: string }> {
  const u = username.trim();
  if (u.length < 3) return { ok: false, error: "Username must be at least 3 characters." };
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

  const existing = await findUserByUsername(u);
  if (existing) return { ok: false, error: "That username is already taken." };

  const salt = await randomSalt();
  const passwordHash = await hashPassword(password, salt);
  const userId = await createUserRow(u, passwordHash, salt);
  await persistSession(userId, u);
  return { ok: true, userId };
}

export async function login(
  username: string,
  password: string,
): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const u = username.trim();
  if (!u || !password) return { ok: false, error: "Enter your username and password." };
  const user = await findUserByUsername(u);
  if (!user) return { ok: false, error: "Invalid username or password." };
  const candidate = await hashPassword(password, user.salt);
  if (candidate !== user.passwordHash) {
    return { ok: false, error: "Invalid username or password." };
  }
  await persistSession(user.id, user.username);
  return { ok: true, user };
}

export async function logout(): Promise<void> {
  await storage.removeItem(SESSION_USER_ID);
  await storage.removeItem(SESSION_USERNAME);
}

async function persistSession(userId: number, username: string): Promise<void> {
  await storage.setItem(SESSION_USER_ID, userId);
  await storage.setItem(SESSION_USERNAME, username);
}

export async function getSession(): Promise<{ userId: number; username: string } | null> {
  const userId = await storage.getItem<number>(SESSION_USER_ID, 0);
  const username = await storage.getItem<string>(SESSION_USERNAME, "");
  if (!userId || !username) return null;
  return { userId, username };
}
