/**
 * Password Hashing Utilities
 * 
 * Secure password hashing using bcrypt.
 * Uses industry-standard bcrypt with cost factor 12 (4096 rounds).
 */

import bcrypt from "bcrypt";

// Cost factor for bcrypt (2^12 = 4096 rounds)
// Increase this value over time as hardware improves
const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param hashedPassword - Stored bcrypt hash
 * @returns True if password matches
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Development-only: Simple password check for testing
 * In dev mode, accepts any password for demo@example.com
 */
export function verifyPasswordDev(email: string, password: string): boolean {
  // Dev mode: Accept specific test credentials
  if (process.env.NODE_ENV === "development") {
    return email === "demo@example.com" && password === "password";
  }
  return false;
}
