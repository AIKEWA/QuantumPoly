/**
 * Centralized logging utility for QuantumPoly
 *
 * Provides structured logging with different levels, error tracking,
 * and performance monitoring capabilities. Integrates with external
 * services in production while maintaining developer-friendly output.
 *
 * @module logger
 * @version 1.0.0
 * @author QuantumPoly Development Team
 */

import { DEV_CONFIG, ERROR_CONFIG } from './constants';

/**
 * Log levels in order of severity
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

/**
 * Log entry structure for consistent formatting
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  sessionId?: string;
  component?: string;
}

/**
 * Logger configuration options
 */
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
}

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
  enableConsole: DEV_CONFIG.enableDevTools,
  enableRemote: ERROR_CONFIG.enableErrorTracking,
  enableStorage: ERROR_CONFIG.enableLocalStorage,
  maxStorageEntries: 1000,
};

/**
 * Centralized logger class with multiple output targets
 */
class Logger {
  private config: LoggerConfig;
  private storage: LogEntry[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Log a debug message
   *
   * @param message - Debug message
   * @param context - Additional context data
   * @param component - Component or module name
   */
  debug(
    message: string,
    context?: Record<string, any>,
    component?: string
  ): void {
    this.log(LogLevel.DEBUG, message, context, undefined, component);
  }

  /**
   * Log an info message
   *
   * @param message - Info message
   * @param context - Additional context data
   * @param component - Component or module name
   */
  info(
    message: string,
    context?: Record<string, any>,
    component?: string
  ): void {
    this.log(LogLevel.INFO, message, context, undefined, component);
  }

  /**
   * Log a warning message
   *
   * @param message - Warning message
   * @param context - Additional context data
   * @param component - Component or module name
   */
  warn(
    message: string,
    context?: Record<string, any>,
    component?: string
  ): void {
    this.log(LogLevel.WARN, message, context, undefined, component);
  }

  /**
   * Log an error message
   *
   * @param message - Error message
   * @param error - Error object
   * @param context - Additional context data
   * @param component - Component or module name
   */
  error(
    message: string,
    error?: Error,
    context?: Record<string, any>,
    component?: string
  ): void {
    this.log(LogLevel.ERROR, message, context, error, component);
  }

  /**
   * Log a fatal error message
   *
   * @param message - Fatal error message
   * @param error - Error object
   * @param context - Additional context data
   * @param component - Component or module name
   */
  fatal(
    message: string,
    error?: Error,
    context?: Record<string, any>,
    component?: string
  ): void {
    this.log(LogLevel.FATAL, message, context, error, component);
  }

  /**
   * Core logging method
   *
   * @private
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error,
    component?: string
  ): void {
    // Skip if below configured level
    if (level < this.config.level) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
      component,
      // Add session/user context if available
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
    };

    // Output to console
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Store locally
    if (this.config.enableStorage) {
      this.logToStorage(entry);
    }

    // Send to remote service
    if (this.config.enableRemote && level >= LogLevel.ERROR) {
      this.logToRemote(entry);
    }
  }

  /**
   * Output log entry to browser console
   *
   * @private
   */
  private logToConsole(entry: LogEntry): void {
    const { level, message, context, error, component, timestamp } = entry;
    const prefix = component ? `[${component}]` : '';
    const timeString = timestamp.toISOString();

    const logMessage = `${timeString} ${prefix} ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, context);
        break;
      case LogLevel.INFO:
        console.info(logMessage, context);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, context);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(logMessage, error || context);
        if (error) {
          console.error(error.stack);
        }
        break;
    }
  }

  /**
   * Store log entry in local storage
   *
   * @private
   */
  private logToStorage(entry: LogEntry): void {
    try {
      this.storage.push(entry);

      // Maintain max storage size
      if (this.storage.length > this.config.maxStorageEntries) {
        this.storage.shift();
      }

      // Persist to localStorage (optional)
      if (typeof window !== 'undefined' && window.localStorage) {
        const serialized = JSON.stringify(this.storage.slice(-100)); // Keep last 100
        localStorage.setItem('quantumpoly_logs', serialized);
      }
    } catch (error) {
      // Silently fail storage operations
      console.warn('Failed to store log entry:', error);
    }
  }

  /**
   * Send log entry to remote logging service
   *
   * @private
   */
  private logToRemote(entry: LogEntry): void {
    try {
      // REVIEW: Implement actual remote logging service integration
      if (typeof window !== 'undefined' && ERROR_CONFIG.sentryDsn) {
        // Example Sentry integration
        // Sentry.captureException(entry.error || new Error(entry.message), {
        //   level: this.mapLevelToSentry(entry.level),
        //   tags: { component: entry.component },
        //   extra: entry.context,
        // });
      }

      // Example custom endpoint
      // fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry),
      // });
    } catch (error) {
      // Don't throw errors from logging
      console.warn('Failed to send log to remote service:', error);
    }
  }

  /**
   * Get current user ID from context
   *
   * @private
   */
  private getUserId(): string | undefined {
    // FEEDBACK: Implement user ID retrieval from auth context
    try {
      if (typeof window !== 'undefined') {
        // Example: return window.user?.id;
      }
    } catch {
      // Ignore errors
    }
    return undefined;
  }

  /**
   * Get current session ID
   *
   * @private
   */
  private getSessionId(): string | undefined {
    try {
      if (typeof window !== 'undefined') {
        // Generate or retrieve session ID
        let sessionId = sessionStorage.getItem('quantumpoly_session_id');
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem('quantumpoly_session_id', sessionId);
        }
        return sessionId;
      }
    } catch {
      // Ignore errors
    }
    return undefined;
  }

  /**
   * Get stored log entries
   *
   * @returns Array of stored log entries
   */
  getStoredLogs(): LogEntry[] {
    return [...this.storage];
  }

  /**
   * Clear stored log entries
   */
  clearStoredLogs(): void {
    this.storage = [];
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('quantumpoly_logs');
    }
  }

  /**
   * Update logger configuration
   *
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();

/**
 * Performance timing utility
 *
 * @param label - Performance label
 * @returns Function to end timing measurement
 */
export function timeStart(label: string): () => void {
  const startTime = performance.now();
  logger.debug(`Performance: ${label} started`);

  return () => {
    const duration = performance.now() - startTime;
    logger.info(`Performance: ${label} completed in ${duration.toFixed(2)}ms`, {
      duration,
      label,
    });
  };
}

/**
 * Async function wrapper with error logging
 *
 * @param fn - Async function to wrap
 * @param component - Component name for context
 * @returns Wrapped function with error handling
 */
export function withErrorLogging<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  component?: string
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error(
        `Async operation failed: ${fn.name}`,
        error as Error,
        { args },
        component
      );
      throw error;
    }
  }) as T;
}

/**
 * React component error boundary logger
 *
 * @param error - Error object
 * @param errorInfo - React error info
 * @param component - Component name
 */
export function logComponentError(
  error: Error,
  errorInfo: { componentStack: string },
  component?: string
): void {
  logger.error(
    'React component error',
    error,
    {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    },
    component
  );
}

// DISCUSS: Should we add structured error tracking for user actions?
// FEEDBACK: Monitor logger performance impact in production
