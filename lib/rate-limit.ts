interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000; // 1 minute

function cleanup(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter(
      (ts) => now - ts < WINDOW_MS
    );
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

export function rateLimit(
  identifier: string,
  limit: number = 30
): { success: boolean; remaining: number } {
  cleanup();

  const now = Date.now();

  if (!store.has(identifier)) {
    store.set(identifier, { timestamps: [] });
  }

  const entry = store.get(identifier)!;

  // Filter to only timestamps within the current window
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < WINDOW_MS);

  if (entry.timestamps.length >= limit) {
    return {
      success: false,
      remaining: 0,
    };
  }

  entry.timestamps.push(now);

  return {
    success: true,
    remaining: limit - entry.timestamps.length,
  };
}
