"use client";

const STORAGE_PREFIX = "ubuntu_session_";

export const SESSION_STORAGE_KEYS = {
  startedAt: `${STORAGE_PREFIX}started_at`,
  lastActivityAt: `${STORAGE_PREFIX}last_activity_at`,
} as const;

function readMinutes(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readHours(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Session policy — override via NEXT_PUBLIC_SESSION_* env vars. */
export const SESSION_POLICY = {
  idleMs: readMinutes("NEXT_PUBLIC_SESSION_IDLE_MINUTES", 30) * 60 * 1000,
  maxSessionMs: readHours("NEXT_PUBLIC_SESSION_MAX_HOURS", 48) * 60 * 60 * 1000,
  promptGraceMs: readMinutes("NEXT_PUBLIC_SESSION_PROMPT_GRACE_MINUTES", 5) * 60 * 1000,
  activityThrottleMs: 30 * 1000,
  checkIntervalMs: 15 * 1000,
} as const;

export type SessionPromptReason = "idle" | "expired";

function now() {
  return Date.now();
}

function readTimestamp(key: string): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function writeTimestamp(key: string, value: number) {
  localStorage.setItem(key, new Date(value).toISOString());
}

export function getSessionStartedAt(): number | null {
  return readTimestamp(SESSION_STORAGE_KEYS.startedAt);
}

export function getLastActivityAt(): number | null {
  return readTimestamp(SESSION_STORAGE_KEYS.lastActivityAt);
}

/** Call after a successful sign-in to start the absolute session clock. */
export function initSession() {
  const ts = now();
  writeTimestamp(SESSION_STORAGE_KEYS.startedAt, ts);
  writeTimestamp(SESSION_STORAGE_KEYS.lastActivityAt, ts);
}

/** Record user activity (throttled by caller). */
export function touchSessionActivity(at = now()) {
  writeTimestamp(SESSION_STORAGE_KEYS.lastActivityAt, at);
}

export function clearSessionStorage() {
  localStorage.removeItem(SESSION_STORAGE_KEYS.startedAt);
  localStorage.removeItem(SESSION_STORAGE_KEYS.lastActivityAt);
}

export function ensureSessionTimestamps() {
  const ts = now();
  if (getSessionStartedAt() == null) {
    writeTimestamp(SESSION_STORAGE_KEYS.startedAt, ts);
  }
  if (getLastActivityAt() == null) {
    writeTimestamp(SESSION_STORAGE_KEYS.lastActivityAt, ts);
  }
}

export function getIdleRemainingMs(at = now()): number {
  const last = getLastActivityAt();
  if (last == null) return SESSION_POLICY.idleMs;
  return Math.max(0, SESSION_POLICY.idleMs - (at - last));
}

export function isIdleExpired(at = now()) {
  return getIdleRemainingMs(at) === 0;
}

export function getMaxSessionRemainingMs(at = now()): number {
  const started = getSessionStartedAt();
  if (started == null) return SESSION_POLICY.maxSessionMs;
  return Math.max(0, SESSION_POLICY.maxSessionMs - (at - started));
}

export function isMaxSessionExpired(at = now()) {
  return getMaxSessionRemainingMs(at) === 0;
}

export function evaluateSessionPrompt(at = now()): SessionPromptReason | null {
  if (isMaxSessionExpired(at)) return "expired";
  if (isIdleExpired(at)) return "idle";
  return null;
}

export function formatCountdown(totalMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(totalMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
