/**
 * @fileoverview Async Testing Helpers for NewsletterForm
 * 
 * Specialized utilities for testing asynchronous operations, timing control,
 * and various subscription scenarios. Split from main helpers to improve
 * test organization and reduce cognitive load.
 */

/**
 * Creates a controlled async submission mock for timing-sensitive tests
 * @returns Object with mock function and manual resolution control
 */
export function createControlledAsyncSubmission() {
  let resolveSubmission: (value?: void | PromiseLike<void>) => void;
  let rejectSubmission: (reason?: unknown) => void;
  
  const controlledOnSubscribe = jest.fn(
    () =>
      new Promise<void>((resolve, reject) => {
        resolveSubmission = resolve;
        rejectSubmission = reject;
      }),
  );

  return {
    controlledOnSubscribe,
    resolveSubmission: () => resolveSubmission(),
    rejectSubmission: (error: Error) => rejectSubmission(error),
  };
}

/**
 * Creates a mock with configurable delay for realistic async simulation
 * @param delayMs - Delay in milliseconds before resolution
 * @returns Mock function with realistic timing
 */
export function createDelayedOnSubscribe(delayMs: number = 100) {
  return jest.fn(async () => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  });
}

/**
 * Creates a mock that fails after a specified number of attempts
 * @param failuresBeforeSuccess - Number of times to fail before succeeding
 * @returns Mock function with progressive failure/success behavior
 */
export function createFlakeyOnSubscribe(failuresBeforeSuccess: number = 2) {
  let attemptCount = 0;
  
  return jest.fn(async () => {
    attemptCount++;
    if (attemptCount <= failuresBeforeSuccess) {
      throw new Error(`Network error (attempt ${attemptCount})`);
    }
    // Success after specified failures
  });
}

/**
 * Creates a mock that times out after a specified duration
 * @param timeoutMs - Timeout duration in milliseconds
 * @returns Mock function that rejects with timeout error
 */
export function createTimeoutOnSubscribe(timeoutMs: number = 5000) {
  return jest.fn(async () => {
    await new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    });
  });
}

/**
 * Creates a mock that validates submission data and conditionally fails
 * @param validator - Function to validate email and return error if invalid
 * @returns Mock function with custom validation logic
 */
export function createValidatingOnSubscribe(validator?: (email: string) => string | null) {
  return jest.fn(async (email: string) => {
    const error = validator?.(email);
    if (error) {
      throw new Error(error);
    }
    // Simulate realistic network delay on success
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
}

/**
 * Creates a mock that tracks all submission attempts with metadata
 * @returns Mock function and attempt tracking utilities
 */
export function createTrackingOnSubscribe() {
  const attempts: Array<{
    email: string;
    timestamp: number;
    success: boolean;
    error?: string;
  }> = [];

  const trackingOnSubscribe = jest.fn(async (email: string) => {
    const timestamp = Date.now();
    try {
      // Simulate random failures (20% chance)
      if (Math.random() < 0.2) {
        throw new Error('Random network error');
      }
      
      attempts.push({ email, timestamp, success: true });
      await new Promise((resolve) => setTimeout(resolve, 30));
    } catch (error) {
      attempts.push({ 
        email, 
        timestamp, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  });

  return {
    trackingOnSubscribe,
    getAttempts: () => [...attempts],
    getSuccessfulAttempts: () => attempts.filter(a => a.success),
    getFailedAttempts: () => attempts.filter(a => !a.success),
    clearAttempts: () => { attempts.length = 0; },
  };
}

/**
 * Async test timing utilities
 */
export const asyncTestUtils = {
  /**
   * Waits for a specified number of React renders
   * @param renders - Number of renders to wait for
   */
  async waitForRenders(renders: number = 1): Promise<void> {
    for (let i = 0; i < renders; i++) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  },

  /**
   * Waits for async state updates with timeout
   * @param condition - Function that returns true when condition is met
   * @param timeoutMs - Maximum time to wait
   */
  async waitForCondition(
    condition: () => boolean, 
    timeoutMs: number = 1000
  ): Promise<void> {
    const startTime = Date.now();
    while (!condition() && (Date.now() - startTime) < timeoutMs) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    if (!condition()) {
      throw new Error(`Condition not met within ${timeoutMs}ms`);
    }
  },

  /**
   * Creates a promise that resolves after specified time
   * @param ms - Milliseconds to wait
   */
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
} as const;
