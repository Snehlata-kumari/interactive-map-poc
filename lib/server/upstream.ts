import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

const TIMEOUT_MS = 5000;

/** JSON from an upstream API (timed out, optional bearer token), or — when
 *  no URL is configured — from a mock file in data/, so the BFF works
 *  out of the box. */
export async function fetchJson(url: string | undefined, token: string | undefined, mockFile: string): Promise<unknown> {
  if (!url) return JSON.parse(await readFile(path.join(process.cwd(), "data", mockFile), "utf8"));
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.json();
}

/** A value kept for `ttlMs`; on a failed refresh the last good one is
 *  served (stale) instead of an error. One in-flight load at a time. */
export function cached<T>(ttlMs: number, load: () => Promise<T>) {
  let value: T | undefined;
  let at = 0;
  let pending: Promise<T> | null = null;
  return async (): Promise<{ value: T; stale: boolean }> => {
    if (value !== undefined && Date.now() - at < ttlMs) return { value, stale: false };
    pending ??= load().finally(() => (pending = null));
    try {
      value = await pending;
      at = Date.now();
      return { value, stale: false };
    } catch (error) {
      if (value === undefined) throw error;
      console.warn("[bff] refresh failed, serving last good copy:", error);
      return { value, stale: true };
    }
  };
}
