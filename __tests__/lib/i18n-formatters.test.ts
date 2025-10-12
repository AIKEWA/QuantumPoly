/**
 * Tests for i18n formatting utilities
 */

import {
  formatDate,
  formatDateTime,
  formatTime,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatCompactNumber,
  formatRelativeTime,
  formatList,
  formatFileSize,
  formatDateRange,
  formatOrdinal,
  formatNumberRange,
} from '@/lib/i18n-formatters';

describe('i18n-formatters', () => {
  describe('formatDate', () => {
    const testDate = new Date('2024-01-15T12:00:00Z');

    it('formats date in English', () => {
      const result = formatDate(testDate, 'en');
      expect(result).toContain('January');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('formats date in German', () => {
      const result = formatDate(testDate, 'de');
      expect(result).toContain('Januar');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('accepts custom options', () => {
      const result = formatDate(testDate, 'en', { dateStyle: 'short' });
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
    });

    it('handles string date input', () => {
      const result = formatDate('2024-01-15', 'en');
      expect(result).toContain('January');
    });

    it('handles number (timestamp) input', () => {
      const result = formatDate(testDate.getTime(), 'en');
      expect(result).toContain('January');
    });
  });

  describe('formatDateTime', () => {
    const testDate = new Date('2024-01-15T14:30:00Z');

    it('formats date and time in English', () => {
      const result = formatDateTime(testDate, 'en');
      expect(result).toContain('January');
      expect(result).toContain('15');
    });

    it('formats date and time in German', () => {
      const result = formatDateTime(testDate, 'de');
      expect(result).toContain('Januar');
    });
  });

  describe('formatTime', () => {
    const testDate = new Date('2024-01-15T14:30:00Z');

    it('formats time in English', () => {
      const result = formatTime(testDate, 'en');
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('formats time in German (24-hour format)', () => {
      const result = formatTime(testDate, 'de');
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('formatNumber', () => {
    it('formats number with thousands separator in English', () => {
      expect(formatNumber(1234.56, 'en')).toBe('1,234.56');
    });

    it('formats number with German separators', () => {
      expect(formatNumber(1234.56, 'de')).toBe('1.234,56');
    });

    it('accepts custom options', () => {
      const result = formatNumber(1234.567, 'en', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      expect(result).toBe('1,234.57');
    });
  });

  describe('formatCurrency', () => {
    it('formats USD in English', () => {
      const result = formatCurrency(99.99, 'en', 'USD');
      expect(result).toContain('99.99');
      expect(result).toContain('$');
    });

    it('formats EUR in German', () => {
      const result = formatCurrency(99.99, 'de', 'EUR');
      expect(result).toContain('99,99');
      expect(result).toContain('€');
    });

    it('uses EUR as default currency', () => {
      const result = formatCurrency(100, 'en');
      expect(result).toContain('€');
    });

    it('handles unsupported currency codes gracefully', () => {
      // Should fall back to EUR
      const result = formatCurrency(100, 'en', 'INVALID');
      expect(result).toContain('€');
    });
  });

  describe('formatPercent', () => {
    it('formats percentage in English', () => {
      expect(formatPercent(0.1556, 'en')).toContain('15.56');
      expect(formatPercent(0.1556, 'en')).toContain('%');
    });

    it('formats percentage in German', () => {
      const result = formatPercent(0.1556, 'de');
      expect(result).toContain('15,56');
      expect(result).toContain('%');
    });

    it('handles zero percent', () => {
      const result = formatPercent(0, 'en');
      expect(result).toContain('0.00');
    });
  });

  describe('formatCompactNumber', () => {
    it('formats thousands', () => {
      const result = formatCompactNumber(1234, 'en');
      expect(result).toMatch(/1(\.\d)?K/);
    });

    it('formats millions', () => {
      const result = formatCompactNumber(1234567, 'en');
      expect(result).toMatch(/1(\.\d)?M/);
    });

    it('formats billions', () => {
      const result = formatCompactNumber(1234567890, 'en');
      expect(result).toMatch(/1(\.\d)?B/);
    });

    it('uses locale-specific notation', () => {
      const result = formatCompactNumber(1234567, 'de');
      expect(result).toContain('Mio');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      // Mock current time to ensure consistent tests
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('formats past time', () => {
      const yesterday = new Date('2024-01-14T12:00:00Z');
      const result = formatRelativeTime(yesterday, 'en');
      expect(result).toContain('yesterday');
    });

    it('formats future time', () => {
      const tomorrow = new Date('2024-01-16T12:00:00Z');
      const result = formatRelativeTime(tomorrow, 'en');
      expect(result).toContain('tomorrow');
    });

    it('formats in German', () => {
      const yesterday = new Date('2024-01-14T12:00:00Z');
      const result = formatRelativeTime(yesterday, 'de');
      expect(result).toContain('gestern');
    });
  });

  describe('formatList', () => {
    it('formats list in English', () => {
      const items = ['apples', 'oranges', 'bananas'];
      const result = formatList(items, 'en');
      expect(result).toContain('apples');
      expect(result).toContain('oranges');
      expect(result).toContain('and bananas');
    });

    it('formats list in German', () => {
      const items = ['Äpfel', 'Orangen', 'Bananen'];
      const result = formatList(items, 'de');
      expect(result).toContain('Äpfel');
      expect(result).toContain('und Bananen');
    });

    it('handles single item', () => {
      const result = formatList(['apple'], 'en');
      expect(result).toBe('apple');
    });

    it('handles empty array', () => {
      const result = formatList([], 'en');
      expect(result).toBe('');
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes', () => {
      expect(formatFileSize(0, 'en')).toBe('0 Bytes');
      expect(formatFileSize(100, 'en')).toContain('100.00 Bytes');
    });

    it('formats kilobytes', () => {
      const result = formatFileSize(1024, 'en');
      expect(result).toContain('1.00 KB');
    });

    it('formats megabytes', () => {
      const result = formatFileSize(1048576, 'en');
      expect(result).toContain('1.00 MB');
    });

    it('formats gigabytes', () => {
      const result = formatFileSize(1073741824, 'en');
      expect(result).toContain('1.00 GB');
    });

    it('respects custom decimal places', () => {
      const result = formatFileSize(1536, 'en', 1);
      expect(result).toContain('1.5 KB');
    });
  });

  describe('formatDateRange', () => {
    const startDate = new Date('2024-01-01T00:00:00Z');
    const endDate = new Date('2024-01-15T00:00:00Z');

    it('formats date range in English', () => {
      const result = formatDateRange(startDate, endDate, 'en');
      expect(result).toContain('Jan');
      expect(result).toContain('1');
      expect(result).toContain('15');
    });

    it('formats date range in German', () => {
      const result = formatDateRange(startDate, endDate, 'de');
      expect(result).toContain('Jan');
    });

    it('accepts custom options', () => {
      const result = formatDateRange(startDate, endDate, 'en', {
        month: 'long',
      });
      expect(result).toContain('January');
    });
  });

  describe('formatOrdinal', () => {
    it('formats 1st', () => {
      expect(formatOrdinal(1, 'en')).toBe('1st');
    });

    it('formats 2nd', () => {
      expect(formatOrdinal(2, 'en')).toBe('2nd');
    });

    it('formats 3rd', () => {
      expect(formatOrdinal(3, 'en')).toBe('3rd');
    });

    it('formats 4th', () => {
      expect(formatOrdinal(4, 'en')).toBe('4th');
    });

    it('formats 21st', () => {
      expect(formatOrdinal(21, 'en')).toBe('21st');
    });

    it('formats 22nd', () => {
      expect(formatOrdinal(22, 'en')).toBe('22nd');
    });

    it('returns plain number for non-English locales', () => {
      expect(formatOrdinal(1, 'de')).toBe('1');
      expect(formatOrdinal(2, 'fr')).toBe('2');
    });
  });

  describe('formatNumberRange', () => {
    it('formats number range in English', () => {
      const result = formatNumberRange(1, 10, 'en');
      expect(result).toContain('1');
      expect(result).toContain('10');
    });

    it('formats number range in German', () => {
      const result = formatNumberRange(1000, 5000, 'de');
      expect(result).toContain('1.000');
      expect(result).toContain('5.000');
    });

    it('accepts custom options', () => {
      const result = formatNumberRange(1.5, 2.5, 'en', {
        minimumFractionDigits: 2,
      });
      expect(result).toContain('1.50');
      expect(result).toContain('2.50');
    });
  });
});

