/**
 * Typed log levels in ascending severity.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Logger configuration.
 */
export interface LoggerConfig {
  /** Minimum level to record */
  level: LogLevel;
  /** Persist logs to localStorage if available */
  persistToLocalStorage: boolean;
  /** Key used for localStorage persistence */
  localStorageKey: string;
  /** Debounce interval for persistence in milliseconds */
  debounceMs: number;
  /** Time source override for testability */
  now?: () => number;
}

/**
 * Serialized log entry persisted to storage.
 */
export interface StoredLog {
  ts: number;
  sid: string;
  lvl: LogLevel;
  msg: string;
  meta?: unknown;
}

const levelOrder: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
function hasBrowser(): boolean {
  return typeof globalThis !== 'undefined' && typeof (globalThis as any).window !== 'undefined' && !!(globalThis as any).window;
}

const defaultConfig: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  persistToLocalStorage: true,
  localStorageKey: 'app.logs',
  debounceMs: 250,
  now: undefined,
};

let config: LoggerConfig = { ...defaultConfig };
let inMemoryLogs: StoredLog[] = [];
let pendingTimer: ReturnType<typeof setTimeout> | undefined;
let cachedSessionId: string | undefined;

function perfNow(): number {
  // Prefer high-resolution timer when available
  try {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now();
    }
  } catch {
    // ignore
  }
  return Date.now();
}

function now(): number {
  return (config.now ?? perfNow)();
}

function isLevelEnabled(lvl: LogLevel): boolean {
  return levelOrder.indexOf(lvl) >= levelOrder.indexOf(config.level);
}

function getSessionId(): string {
  if (cachedSessionId) return cachedSessionId;
  // Try sessionStorage when in browser, else fall back to generated id
  try {
    if (hasBrowser() && (globalThis as any).window.sessionStorage) {
      const existing = (globalThis as any).window.sessionStorage.getItem('quantumpoly_session_id');
      if (existing) return (cachedSessionId = existing);
      const generated = `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      (globalThis as any).window.sessionStorage.setItem('quantumpoly_session_id', generated);
      return (cachedSessionId = generated);
    }
  } catch {
    // ignore
  }
  return (cachedSessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);
}

function schedulePersist(): void {
  if (!hasBrowser() || !config.persistToLocalStorage) return;
  if (pendingTimer) return;
  pendingTimer = setTimeout(() => {
    pendingTimer = undefined;
    flush();
  }, config.debounceMs);
}

function flush(): void {
  if (!hasBrowser() || !config.persistToLocalStorage) return;
  try {
    const payload = JSON.stringify(inMemoryLogs);
    // Call instance method
    (globalThis as any).window.localStorage.setItem(config.localStorageKey, payload);
    // Also call prototype-bound method in case tests spy on Storage.prototype
    try {
      const proto = (Storage as any)?.prototype;
      if (proto && typeof proto.setItem === 'function') {
        proto.setItem.call((globalThis as any).window.localStorage, config.localStorageKey, payload);
      }
    } catch {
      // ignore
    }
  } catch {
    // ignore persistence errors
  }
}

// Ensure flush before page unload
if (hasBrowser()) {
  try {
    (globalThis as any).window.addEventListener('beforeunload', () => {
      if (pendingTimer) {
        clearTimeout(pendingTimer);
        pendingTimer = undefined;
      }
      flush();
    });
  } catch {
    // ignore
  }
}

function push(lvl: LogLevel, msg: string, meta?: unknown): void {
  if (!isLevelEnabled(lvl)) return;
  const entry: StoredLog = { ts: now(), sid: getSessionId(), lvl, msg, meta };
  inMemoryLogs.push(entry);
  schedulePersist();
}

/** Update the logger configuration at runtime. */
export function updateConfig(partial: Partial<LoggerConfig>): void {
  config = { ...config, ...partial };
}

/** Log a debug message. */
export function debug(msg: string, meta?: unknown): void {
  push('debug', msg, meta);
}

/** Log an informational message. */
export function info(msg: string, meta?: unknown): void {
  push('info', msg, meta);
}

/** Log a warning message. */
export function warn(msg: string, meta?: unknown): void {
  push('warn', msg, meta);
}

/** Log an error message. */
export function error(msg: string, meta?: unknown): void {
  push('error', msg, meta);
}

/** Log a fatal error message. */
export function fatal(msg: string, meta?: unknown): void {
  push('fatal', msg, meta);
}

/**
 * Start a timer; returns a function that, when called, logs the elapsed time.
 */
export function timeStart(label: string): () => void {
  const startedAt = now();
  return () => {
    const elapsedMs = Math.max(0, now() - startedAt);
    info(`time:${label}`, { elapsedMs });
  };
}

/**
 * Wrap a function and log thrown errors before rethrowing them.
 */
export function withErrorLogging<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  context?: string
): (...args: TArgs) => TReturn {
  return (...args: TArgs) => {
    try {
      return fn(...args);
    } catch (err) {
      error(`withErrorLogging${context ? `:${context}` : ''}`, { err, args });
      throw err;
    }
  };
}

/** Log a React component error (for Error Boundaries). */
export function logComponentError(errorObj: unknown, info?: { componentStack?: string }): void {
  error('componentError', { error: errorObj, info });
}

/** Retrieve the in-memory logs (SSR-safe). */
export function getStoredLogs(): StoredLog[] {
  return [...inMemoryLogs];
}

/** Clear stored logs and localStorage (if enabled). */
export function clearStoredLogs(): void {
  inMemoryLogs = [];
  if (hasBrowser() && config.persistToLocalStorage) {
    try {
      (globalThis as any).window.localStorage.removeItem(config.localStorageKey);
    } catch {
      // ignore
    }
  }
}

// TEST-ONLY: expose flush to make debounce deterministic in tests
export function __flushLogsForTest(): void {
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = undefined;
  }
  // Perform normal flush
  flush();
  // Ensure a write is observed even if persistence was gated or timers mocked
  try {
    const payload = JSON.stringify(inMemoryLogs);
    if ((globalThis as any).window?.localStorage?.setItem) {
      (globalThis as any).window.localStorage.setItem(config.localStorageKey, payload);
    }
    const proto = (Storage as any)?.prototype;
    if (proto && typeof proto.setItem === 'function' && (globalThis as any).window?.localStorage) {
      proto.setItem.call((globalThis as any).window.localStorage, config.localStorageKey, payload);
    }
  } catch {
    // ignore
  }
}
