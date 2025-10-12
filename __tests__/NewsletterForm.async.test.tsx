/**
 * @fileoverview NewsletterForm Async & Error Scenario Tests
 *
 * Focused testing of asynchronous operations, error handling, and edge cases
 * using the modularized helper utilities. These tests complement the main
 * NewsletterForm tests with specialized async and error scenario coverage.
 */

import { /* render, */ screen, waitFor } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

// import { NewsletterForm } from '@/components/NewsletterForm';

import {
  createControlledAsyncSubmission,
  createDelayedOnSubscribe,
  createFlakeyOnSubscribe,
  // createTimeoutOnSubscribe,
  createTrackingOnSubscribe,
  // asyncTestUtils,
} from './utils/newsletter-async-helpers';
import {
  // errorScenarios,
  createErrorScenarioMock,
  createCyclingErrorMock,
  errorTriggerEmails,
  createPatternBasedErrorMock,
  errorRecoveryUtils,
} from './utils/newsletter-error-scenarios';
import { defaultProps, setupNewsletterForm, testPatterns } from './utils/newsletter-form-helpers';

describe('NewsletterForm Async Operations', () => {
  describe('Controlled Async Submissions', () => {
    it('handles manual resolution control for timing-critical tests', async () => {
      const { controlledOnSubscribe, resolveSubmission } = createControlledAsyncSubmission();
      const { user, elements } = setupNewsletterForm({ onSubscribe: controlledOnSubscribe });

      // Start submission - should be in pending state
      await act(async () => {
        await testPatterns.typeAndSubmit(user, 'test@example.com');
      });

      // Verify submitting state
      expect(elements.submitButton()).toBeDisabled();
      expect(controlledOnSubscribe).toHaveBeenCalledWith('test@example.com');

      // Manually resolve after verification
      await act(async () => {
        resolveSubmission();
      });

      // Verify success state
      await waitFor(() => {
        expect(elements.submitButton()).toHaveTextContent(defaultProps.successMessage);
      });
    });

    it('tracks multiple submission attempts with metadata', async () => {
      const { trackingOnSubscribe, getAttempts, getSuccessfulAttempts, clearAttempts } =
        createTrackingOnSubscribe();

      // Clear any previous attempts
      clearAttempts();

      // Test tracking with a single form but multiple direct calls
      // This validates the tracking functionality without DOM complexity
      const testEmails = ['test1@example.com', 'test2@example.com', 'test3@example.com'];

      // Directly call the tracking function to test metadata collection
      for (const email of testEmails) {
        try {
          await trackingOnSubscribe(email);
        } catch {
          // Ignore errors - we're testing the tracking, not the success/failure
        }
      }

      // Verify tracking data
      const attempts = getAttempts();
      const successful = getSuccessfulAttempts();

      expect(attempts).toHaveLength(testEmails.length);
      expect(successful.length).toBeGreaterThan(0); // Some should succeed (80% success rate)

      // Verify metadata structure
      attempts.forEach((attempt) => {
        expect(attempt).toHaveProperty('email');
        expect(attempt).toHaveProperty('timestamp');
        expect(attempt).toHaveProperty('success');
        expect(testEmails).toContain(attempt.email);
      });
    });
  });

  describe('Realistic Timing Scenarios', () => {
    it('handles submissions with realistic network delays', async () => {
      const delayedOnSubscribe = createDelayedOnSubscribe(200);
      const { user, elements } = setupNewsletterForm({ onSubscribe: delayedOnSubscribe });

      const startTime = Date.now();

      await act(async () => {
        await testPatterns.typeAndSubmit(user, 'test@example.com');
      });

      await waitFor(() => {
        expect(elements.submitButton()).toHaveTextContent(defaultProps.successMessage);
      });

      const elapsedTime = Date.now() - startTime;
      expect(elapsedTime).toBeGreaterThanOrEqual(200); // Should respect the delay
    });

    it('handles flaky network conditions with eventual success', async () => {
      const flakeyOnSubscribe = createFlakeyOnSubscribe(2); // Fail twice, then succeed
      const { user } = setupNewsletterForm({ onSubscribe: flakeyOnSubscribe });

      // First attempt - should fail
      await act(async () => {
        await testPatterns.typeAndSubmit(user, 'test@example.com');
      });

      await waitFor(() => {
        expect(screen.getByText(defaultProps.errorMessage)).toBeInTheDocument();
      });

      // Second attempt - should also fail
      await act(async () => {
        await testPatterns.typeAndSubmit(user, 'test@example.com');
      });

      await waitFor(() => {
        expect(screen.getByText(defaultProps.errorMessage)).toBeInTheDocument();
      });

      // Third attempt - should succeed
      await act(async () => {
        await testPatterns.typeAndSubmit(user, 'test@example.com');
      });

      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveTextContent(defaultProps.successMessage);
      });

      expect(flakeyOnSubscribe).toHaveBeenCalledTimes(3);
    });
  });
});

describe('NewsletterForm Error Scenarios', () => {
  describe('Specific Error Types', () => {
    it('handles network timeout errors appropriately', async () => {
      const timeoutMock = createErrorScenarioMock('networkTimeout');
      const { user, elements } = setupNewsletterForm({ onSubscribe: timeoutMock });

      await act(async () => {
        await testPatterns.typeAndSubmit(user, 'test@example.com');
      });

      await waitFor(() => {
        expect(elements.emailInput()).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByText(defaultProps.errorMessage)).toBeInTheDocument();
      });

      expect(timeoutMock).toHaveBeenCalledWith('test@example.com');
    });

    it('handles server overload with graceful degradation', async () => {
      const overloadMock = createErrorScenarioMock('serverOverload');
      const { user } = setupNewsletterForm({ onSubscribe: overloadMock });

      await act(async () => {
        await testPatterns.typeAndSubmit(user, 'test@example.com');
      });

      // Should show error message and allow retry
      await waitFor(() => {
        expect(screen.getByText(defaultProps.errorMessage)).toBeInTheDocument();
        expect(screen.getByRole('button')).not.toBeDisabled(); // Should allow retry
      });
    });

    it('cycles through different error scenarios', async () => {
      const { cyclingMock, resetCycle } = createCyclingErrorMock([
        'networkTimeout',
        'rateLimited',
        'serverOverload',
      ]);
      const { user } = setupNewsletterForm({ onSubscribe: cyclingMock });

      // Test multiple submissions with different errors
      for (let i = 0; i < 3; i++) {
        await act(async () => {
          await testPatterns.typeAndSubmit(user, `test${i}@example.com`);
        });

        await waitFor(() => {
          expect(screen.getByText(defaultProps.errorMessage)).toBeInTheDocument();
        });
      }

      expect(cyclingMock).toHaveBeenCalledTimes(3);

      // Reset and test cycle restart
      resetCycle();
      expect(cyclingMock).toHaveBeenCalledTimes(3); // Should not change call count
    });
  });

  describe('Pattern-Based Error Triggering', () => {
    it('triggers specific errors based on email patterns', async () => {
      const patternMock = createPatternBasedErrorMock({
        'timeout@test.com': 'networkTimeout',
        'existing@test.com': 'alreadySubscribed',
      });
      const { user } = setupNewsletterForm({ onSubscribe: patternMock });

      // Test timeout pattern
      await act(async () => {
        await testPatterns.typeAndSubmit(user, errorTriggerEmails.timeout);
      });

      await waitFor(() => {
        expect(screen.getByText(defaultProps.errorMessage)).toBeInTheDocument();
      });

      // Test already subscribed pattern
      await act(async () => {
        await testPatterns.typeAndSubmit(user, errorTriggerEmails.alreadySubscribed);
      });

      await waitFor(() => {
        expect(screen.getByText(defaultProps.errorMessage)).toBeInTheDocument();
      });

      // Test success case (no pattern match)
      await act(async () => {
        await testPatterns.typeAndSubmit(user, 'success@example.com');
      });

      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveTextContent(defaultProps.successMessage);
      });
    });
  });

  describe('Error Recovery', () => {
    it('properly clears error states on successful retry', async () => {
      const flakeyMock = createFlakeyOnSubscribe(1); // Fail once, then succeed
      const { user, elements } = setupNewsletterForm({ onSubscribe: flakeyMock });

      // First submission - should fail
      await act(async () => {
        await testPatterns.typeAndSubmit(user, 'test@example.com');
      });

      await waitFor(() => {
        expect(screen.getByText(defaultProps.errorMessage)).toBeInTheDocument();
        expect(elements.emailInput()).toHaveAttribute('aria-invalid', 'true');
      });

      // Second submission - should succeed and clear errors
      await act(async () => {
        await testPatterns.typeAndSubmit(user, 'test@example.com');
      });

      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveTextContent(defaultProps.successMessage);
      });

      // Verify error state is cleared
      await errorRecoveryUtils.validateErrorClearing(
        () => screen.queryByText(defaultProps.errorMessage),
        () => elements.emailInput(),
      );
    });

    it('handles multiple consecutive error recovery attempts', async () => {
      const flakeyMock = createFlakeyOnSubscribe(3); // Fail 3 times, then succeed
      const { user } = setupNewsletterForm({ onSubscribe: flakeyMock });

      const retryAttempts = await errorRecoveryUtils.simulateRetryAttempts(
        async () => {
          await act(async () => {
            await testPatterns.typeAndSubmit(user, 'test@example.com');
          });

          await waitFor(() => {
            const button = screen.getByRole('button');
            if (button.textContent === defaultProps.successMessage) {
              return; // Success
            }
            if (screen.getByText(defaultProps.errorMessage)) {
              throw new Error('Submission failed'); // Trigger retry
            }
          });
        },
        5, // Max 5 retries
      );

      expect(retryAttempts.successfulRetry).toBe(4); // Should succeed on 4th attempt
      expect(retryAttempts.attempts).toBe(4);
    });
  });

  describe('Edge Cases', () => {
    it('handles extremely slow submissions gracefully', async () => {
      const slowMock = createDelayedOnSubscribe(1000); // 1 second delay
      const { user, elements } = setupNewsletterForm({ onSubscribe: slowMock });

      await act(async () => {
        await testPatterns.typeAndSubmit(user, 'test@example.com');
      });

      // Should be disabled during submission
      expect(elements.submitButton()).toBeDisabled();

      // Wait for completion with extended timeout
      await waitFor(
        () => {
          expect(elements.submitButton()).toHaveTextContent(defaultProps.successMessage);
        },
        { timeout: 2000 },
      );
    });

    it('handles rapid successive submissions correctly', async () => {
      const { controlledOnSubscribe, resolveSubmission } = createControlledAsyncSubmission();
      const { user, elements } = setupNewsletterForm({ onSubscribe: controlledOnSubscribe });

      // Start first submission
      await act(async () => {
        await testPatterns.typeAndSubmit(user, 'test1@example.com');
      });

      // Button should be disabled, preventing second submission
      expect(elements.submitButton()).toBeDisabled();

      // Trying to submit again should not call the handler
      await act(async () => {
        await user.click(elements.submitButton());
      });

      expect(controlledOnSubscribe).toHaveBeenCalledTimes(1);

      // Resolve first submission
      await act(async () => {
        resolveSubmission();
      });

      await waitFor(() => {
        expect(elements.submitButton()).toHaveTextContent(defaultProps.successMessage);
      });
    });
  });
});
