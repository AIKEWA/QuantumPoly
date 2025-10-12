/**
 * @fileoverview Error Scenario Testing Helpers for NewsletterForm
 * 
 * Comprehensive error case definitions and testing utilities for various
 * failure modes, edge cases, and error recovery scenarios.
 */

/**
 * Predefined error scenarios for consistent testing
 */
export const errorScenarios = {
  // Network-related errors
  networkTimeout: {
    error: new Error('Network timeout'),
    description: 'Request timed out after 30 seconds',
    recoverable: true,
  },
  connectionRefused: {
    error: new Error('Connection refused'),
    description: 'Unable to connect to server',
    recoverable: true,
  },
  serverOverload: {
    error: new Error('Server temporarily unavailable'),
    description: 'Service is experiencing high load',
    recoverable: true,
  },
  
  // Client-side validation errors
  invalidEmail: {
    error: new Error('Invalid email format'),
    description: 'Email address format is invalid',
    recoverable: true,
  },
  bannedDomain: {
    error: new Error('Email domain not allowed'),
    description: 'Email domain is not permitted',
    recoverable: true,
  },
  
  // Server-side business logic errors
  alreadySubscribed: {
    error: new Error('Email already subscribed'),
    description: 'This email is already in our system',
    recoverable: false,
  },
  rateLimited: {
    error: new Error('Too many requests'),
    description: 'Please wait before trying again',
    recoverable: true,
  },
  serviceUnavailable: {
    error: new Error('Service temporarily unavailable'),
    description: 'Newsletter service is down for maintenance',
    recoverable: true,
  },
  
  // Critical system errors
  internalServerError: {
    error: new Error('Internal server error'),
    description: 'An unexpected error occurred',
    recoverable: true,
  },
  databaseError: {
    error: new Error('Database connection failed'),
    description: 'Unable to save subscription',
    recoverable: true,
  },
} as const;

/**
 * Creates a mock function that fails with specific error scenarios
 * @param scenario - Error scenario to simulate
 * @returns Mock function that rejects with the specified error
 */
export function createErrorScenarioMock(scenario: keyof typeof errorScenarios) {
  const { error, description } = errorScenarios[scenario];
  return jest.fn(async () => {
    // Add realistic delay before error
    await new Promise(resolve => setTimeout(resolve, 20));
    throw new Error(`${error.message}: ${description}`);
  });
}

/**
 * Creates a mock that cycles through different error scenarios
 * @param scenarios - Array of scenario keys to cycle through
 * @returns Mock function and cycle control utilities
 */
export function createCyclingErrorMock(scenarios: Array<keyof typeof errorScenarios>) {
  let currentScenarioIndex = 0;
  
  const cyclingMock = jest.fn(async () => {
    const scenario = errorScenarios[scenarios[currentScenarioIndex]];
    currentScenarioIndex = (currentScenarioIndex + 1) % scenarios.length;
    
    await new Promise(resolve => setTimeout(resolve, 25));
    throw new Error(`${scenario.error.message}: ${scenario.description}`);
  });

  return {
    cyclingMock,
    resetCycle: () => { currentScenarioIndex = 0; },
    getCurrentScenario: () => scenarios[currentScenarioIndex],
    getNextScenario: () => scenarios[(currentScenarioIndex + 1) % scenarios.length],
  };
}

/**
 * Test emails that trigger specific error conditions
 */
export const errorTriggerEmails = {
  timeout: 'timeout@test.com',
  serverError: 'server-error@test.com', 
  rateLimited: 'rate-limit@test.com',
  alreadySubscribed: 'existing@test.com',
  invalidDomain: 'test@blocked-domain.com',
  malformed: 'malformed-email-address',
  empty: '',
  onlySpaces: '   ',
  tooLong: 'a'.repeat(250) + '@test.com',
  specialChars: 'test+special.chars@test.com',
  unicodeChars: 'tëst@test.com',
} as const;

/**
 * Creates a mock that responds to specific email patterns with errors
 * @param emailErrorMap - Map of email patterns to error scenarios
 * @returns Mock function that triggers errors based on email content
 */
export function createPatternBasedErrorMock(
  emailErrorMap: Record<string, keyof typeof errorScenarios> = {
    'timeout@test.com': 'networkTimeout',
    'server-error@test.com': 'internalServerError',
    'existing@test.com': 'alreadySubscribed',
    'rate-limit@test.com': 'rateLimited',
  }
) {
  return jest.fn(async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 30));
    
    for (const [pattern, scenarioKey] of Object.entries(emailErrorMap)) {
      if (email.includes(pattern) || email === pattern) {
        const scenario = errorScenarios[scenarioKey];
        throw new Error(`${scenario.error.message}: ${scenario.description}`);
      }
    }
    
    // Success case - no error triggered
  });
}

/**
 * Error recovery testing utilities
 */
export const errorRecoveryUtils = {
  /**
   * Validates that error states are properly cleared on retry
   * @param getErrorElement - Function to get error element from DOM
   * @param getInputElement - Function to get input element from DOM
   */
  async validateErrorClearing(
    getErrorElement: () => HTMLElement | null,
    getInputElement: () => HTMLElement
  ): Promise<void> {
    // Verify error message is no longer visible
    expect(getErrorElement()).not.toBeInTheDocument();
    
    // Verify aria-invalid is reset
    expect(getInputElement()).not.toHaveAttribute('aria-invalid', 'true');
  },

  /**
   * Simulates multiple error recovery attempts
   * @param retryFn - Function to retry the operation
   * @param maxRetries - Maximum number of retries to attempt
   */
  async simulateRetryAttempts(
    retryFn: () => Promise<void>,
    maxRetries: number = 3
  ): Promise<{ successfulRetry: number | null; attempts: number }> {
    let attempts = 0;
    let successfulRetry: number | null = null;

    for (let i = 0; i < maxRetries; i++) {
      attempts++;
      try {
        await retryFn();
        successfulRetry = attempts;
        break;
      } catch {
        // Continue to next retry
      }
    }

    return { successfulRetry, attempts };
  },
} as const;

/**
 * Performance testing helpers for error scenarios
 */
export const errorPerformanceUtils = {
  /**
   * Measures time taken for error to be displayed
   * @param errorTriggerFn - Function that triggers the error
   * @param errorCheckFn - Function that checks if error is displayed
   */
  async measureErrorDisplayTime(
    errorTriggerFn: () => Promise<void>,
    errorCheckFn: () => boolean
  ): Promise<number> {
    const startTime = performance.now();
    await errorTriggerFn();
    
    while (!errorCheckFn()) {
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    
    return performance.now() - startTime;
  },

  /**
   * Validates that error handling doesn't cause memory leaks
   * @param setupFn - Function to set up the test
   * @param cleanupFn - Function to clean up after test
   */
  async validateNoMemoryLeaks(
    setupFn: () => void,
    cleanupFn: () => void
  ): Promise<void> {
    const initialHeap = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Run setup and cleanup multiple times
    for (let i = 0; i < 10; i++) {
      setupFn();
      cleanupFn();
    }
    
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }
    
    const finalHeap = (performance as any).memory?.usedJSHeapSize || 0;
    const heapGrowth = finalHeap - initialHeap;
    
    // Allow for some growth but flag significant increases
    expect(heapGrowth).toBeLessThan(1024 * 1024); // Less than 1MB growth
  },
} as const;
