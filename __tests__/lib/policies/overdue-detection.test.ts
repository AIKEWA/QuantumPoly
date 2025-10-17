/**
 * @jest-environment node
 */

import { daysBetween, isOverdue } from '../../../scripts/validate-policy-reviews';

describe('Policy Overdue Detection', () => {
  describe('daysBetween', () => {
    it('should calculate days between two dates correctly', () => {
      const date1 = new Date('2025-01-01');
      const date2 = new Date('2025-01-10');
      expect(daysBetween(date1, date2)).toBe(9);
    });

    it('should handle negative differences (date2 before date1)', () => {
      const date1 = new Date('2025-01-10');
      const date2 = new Date('2025-01-01');
      expect(daysBetween(date1, date2)).toBe(-9);
    });

    it('should return 0 for same dates', () => {
      const date1 = new Date('2025-01-01');
      const date2 = new Date('2025-01-01');
      expect(daysBetween(date1, date2)).toBe(0);
    });

    it('should handle leap year correctly', () => {
      const date1 = new Date('2024-02-28');
      const date2 = new Date('2024-03-01');
      expect(daysBetween(date1, date2)).toBe(2); // 2024 is a leap year
    });

    it('should handle non-leap year correctly', () => {
      const date1 = new Date('2025-02-28');
      const date2 = new Date('2025-03-01');
      expect(daysBetween(date1, date2)).toBe(1); // 2025 is not a leap year
    });

    it('should handle year boundaries', () => {
      const date1 = new Date('2024-12-31');
      const date2 = new Date('2025-01-01');
      expect(daysBetween(date1, date2)).toBe(1);
    });
  });

  describe('isOverdue', () => {
    // Mock current date for consistent testing
    const mockToday = new Date('2025-10-17');

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockToday);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should detect overdue when nextReviewDue has passed', () => {
      const lastReviewed = '2025-09-01';
      const nextReviewDue = '2025-10-01'; // 16 days ago
      const result = isOverdue(lastReviewed, nextReviewDue);

      expect(result.isOverdue).toBe(true);
      expect(result.daysOverdue).toBeGreaterThan(0);
    });

    it('should not be overdue when nextReviewDue is in the future', () => {
      const lastReviewed = '2025-10-01';
      const nextReviewDue = '2025-12-01'; // Future date
      const result = isOverdue(lastReviewed, nextReviewDue);

      expect(result.isOverdue).toBe(false);
      expect(result.daysOverdue).toBe(0);
    });

    it('should detect overdue when lastReviewed is more than 180 days ago', () => {
      const lastReviewed = '2025-03-01'; // More than 180 days ago
      const nextReviewDue = '2026-03-01'; // Future date
      const result = isOverdue(lastReviewed, nextReviewDue);

      expect(result.isOverdue).toBe(true);
      expect(result.daysSinceReview).toBeGreaterThan(180);
    });

    it('should not be overdue when lastReviewed is within 180 days and nextReviewDue is in future', () => {
      const lastReviewed = '2025-10-01'; // 16 days ago
      const nextReviewDue = '2026-01-01'; // Future date
      const result = isOverdue(lastReviewed, nextReviewDue);

      expect(result.isOverdue).toBe(false);
      expect(result.daysSinceReview).toBeLessThan(180);
    });

    it('should calculate daysOverdue correctly', () => {
      const lastReviewed = '2025-09-01';
      const nextReviewDue = '2025-10-01'; // Should be 16 days overdue from mock date
      const result = isOverdue(lastReviewed, nextReviewDue);

      expect(result.daysOverdue).toBe(16);
    });

    it('should handle edge case of exactly 180 days since review', () => {
      const lastReviewed = '2025-04-20'; // Exactly 180 days ago from 2025-10-17
      const nextReviewDue = '2026-01-01'; // Future date
      const result = isOverdue(lastReviewed, nextReviewDue);

      expect(result.isOverdue).toBe(false);
      expect(result.daysSinceReview).toBe(180);
    });

    it('should handle edge case of exactly 181 days since review', () => {
      const lastReviewed = '2025-04-19'; // 181 days ago from 2025-10-17
      const nextReviewDue = '2026-01-01'; // Future date
      const result = isOverdue(lastReviewed, nextReviewDue);

      expect(result.isOverdue).toBe(true);
      expect(result.daysSinceReview).toBe(181);
    });

    it('should handle today as nextReviewDue (not overdue yet)', () => {
      const lastReviewed = '2025-10-01';
      const nextReviewDue = '2025-10-17'; // Today
      const result = isOverdue(lastReviewed, nextReviewDue);

      expect(result.isOverdue).toBe(false);
      expect(result.daysOverdue).toBe(0);
    });

    it('should handle both conditions being true', () => {
      const lastReviewed = '2025-01-01'; // More than 180 days ago
      const nextReviewDue = '2025-09-01'; // Also past due
      const result = isOverdue(lastReviewed, nextReviewDue);

      expect(result.isOverdue).toBe(true);
      expect(result.daysOverdue).toBeGreaterThan(0);
      expect(result.daysSinceReview).toBeGreaterThan(180);
    });
  });

  describe('Edge Cases and Date Formats', () => {
    it('should handle ISO date strings', () => {
      const date1 = new Date('2025-01-01T00:00:00Z');
      const date2 = new Date('2025-01-10T00:00:00Z');
      expect(daysBetween(date1, date2)).toBe(9);
    });

    it('should handle dates with different times (should only consider date portion)', () => {
      const date1 = new Date('2025-01-01T08:30:00Z');
      const date2 = new Date('2025-01-10T18:45:00Z');
      // Should only consider dates, not times
      expect(daysBetween(date1, date2)).toBe(9);
    });

    it('should handle timezone differences correctly', () => {
      // UTC calculation should normalize timezone differences
      const date1 = new Date('2025-01-01T23:00:00+05:00');
      const date2 = new Date('2025-01-02T02:00:00-05:00');
      // Both should be treated as their UTC date
      const days = daysBetween(date1, date2);
      expect(days).toBeGreaterThanOrEqual(0);
    });
  });
});
