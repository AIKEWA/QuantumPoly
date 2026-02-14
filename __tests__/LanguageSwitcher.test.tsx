import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// Mock next/navigation
const mockReplace = jest.fn();
const mockUsePathname = jest.fn();
const mockUseRouter = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
  usePathname: () => mockUsePathname(),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useLocale: jest.fn(() => 'en'),
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      switchLanguage: 'Switch language',
      en: 'English',
      de: 'Deutsch',
      tr: 'Türkçe',
      es: 'Español',
      fr: 'Français',
      it: 'Italiano',
    };
    return translations[key] || key;
  }),
}));

describe('LanguageSwitcher Component', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockUsePathname.mockReturnValue('/en');
    mockUseRouter.mockReturnValue({
      replace: mockReplace,
      push: jest.fn(),
      refresh: jest.fn(),
    });
  });

  it('renders locale selector with current locale', () => {
    render(<LanguageSwitcher />);

    const select = screen.getByRole('combobox', { name: /switch language/i });
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('en');
  });

  it('displays all supported locales as options', () => {
    render(<LanguageSwitcher />);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(6);
    expect(options[0]).toHaveTextContent('English');
    expect(options[1]).toHaveTextContent('Deutsch');
    expect(options[2]).toHaveTextContent('Türkçe');
    expect(options[3]).toHaveTextContent('Español');
    expect(options[4]).toHaveTextContent('Français');
    expect(options[5]).toHaveTextContent('Italiano');
  });

  it('has accessible label for screen readers', () => {
    render(<LanguageSwitcher />);

    const label = screen.getByLabelText('Switch language');
    expect(label).toBeInTheDocument();
  });

  it('has visually hidden label for screen readers', () => {
    render(<LanguageSwitcher />);

    const label = document.querySelector('label[for="language-switcher"]');
    expect(label).toHaveClass('sr-only');
  });

  it('calls router.replace when locale is changed', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'de');

    // Wait for transition to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockReplace).toHaveBeenCalled();
  });

  it('preserves URL path when switching locale', async () => {
    const user = userEvent.setup();
    mockUsePathname.mockReturnValue('/en/about');

    render(<LanguageSwitcher />);

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'de');

    // Wait for transition to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockReplace).toHaveBeenCalledWith('/de/about');
  });

  it('handles root path correctly when switching locale', async () => {
    const user = userEvent.setup();
    mockUsePathname.mockReturnValue('/en');

    render(<LanguageSwitcher />);

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'tr');

    // Wait for transition to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockReplace).toHaveBeenCalledWith('/tr/');
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-switcher-class';
    render(<LanguageSwitcher className={customClass} />);

    const container = document.querySelector(`.${customClass}`);
    expect(container).toBeInTheDocument();
  });

  it('has proper focus styles for keyboard navigation', () => {
    render(<LanguageSwitcher />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('focus:outline-none');
    expect(select).toHaveClass('focus:ring-2');
    expect(select).toHaveClass('focus:ring-primary');
  });

  it('is keyboard navigable', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const select = screen.getByRole('combobox');

    // Tab to select
    await user.tab();
    expect(select).toHaveFocus();
  });
});
