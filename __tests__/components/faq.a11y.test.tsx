/**
 * FAQ Accessibility Tests
 * 
 * Validates WCAG 2.2 AA compliance for FAQ accordion component:
 * - ARIA roles and properties
 * - Keyboard navigation (Enter, Space, Arrow keys)
 * - Focus management
 * - Color contrast
 * - Screen reader announcements
 */

import { describe, expect, it } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { assertNoViolations } from '../utils/a11y-helpers';

import { FAQ, type FAQItem } from '@/components/FAQ';

describe('FAQ - Accessibility', () => {
  const mockItems: FAQItem[] = [
    {
      question: 'What is the Governance & Ethics Program (GEP)?',
      answer: 'The GEP is our framework for responsible AI development and deployment.',
    },
    {
      question: 'How do we ensure AI safety?',
      answer: 'We implement multiple layers of safety measures including testing, monitoring, and human oversight.',
    },
    {
      question: 'Where can I learn more about our ethics policies?',
      answer: 'Visit our dedicated ethics page for comprehensive information about our ethical guidelines.',
    },
  ];

  describe('ARIA Roles and Properties', () => {
    it('should have proper button roles with aria-expanded', () => {
      render(<FAQ items={mockItems} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);

      buttons.forEach((button) => {
        expect(button).toHaveAttribute('aria-expanded');
        expect(button).toHaveAttribute('aria-controls');
      });
    });

    it('should update aria-expanded when toggled', async () => {
      const user = userEvent.setup();
      render(<FAQ items={mockItems} />);

      const button = screen.getByRole('button', { name: /what is the governance/i });

      // Initially collapsed
      expect(button).toHaveAttribute('aria-expanded', 'false');

      // Expand
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');

      // Collapse
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have region role for answer panels', async () => {
      const user = userEvent.setup();
      render(<FAQ items={mockItems} />);

      const button = screen.getByRole('button', { name: /what is the governance/i });
      await user.click(button);

      const region = screen.getByRole('region', { name: /what is the governance/i });
      expect(region).toBeInTheDocument();
      expect(region).toHaveAttribute('aria-labelledby');
    });

    it('should connect buttons to panels via aria-controls', () => {
      render(<FAQ items={mockItems} />);

      const buttons = screen.getAllByRole('button');

      buttons.forEach((button) => {
        const controlsId = button.getAttribute('aria-controls');
        expect(controlsId).toBeTruthy();

        const panel = document.getElementById(controlsId!);
        expect(panel).toBeInTheDocument();
        expect(panel).toHaveAttribute('role', 'region');
      });
    });

    it('should have proper section labeling', () => {
      render(<FAQ items={mockItems} />);

      const section = screen.getByRole('region', { name: /frequently asked questions/i });
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-labelledby');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should toggle on Enter key', () => {
      render(<FAQ items={mockItems} />);

      const button = screen.getByRole('button', { name: /what is the governance/i });
      
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should toggle on Space key', () => {
      render(<FAQ items={mockItems} />);

      const button = screen.getByRole('button', { name: /how do we ensure/i });
      
      button.focus();
      fireEvent.keyDown(button, { key: ' ' });

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should navigate to next item with ArrowDown', () => {
      render(<FAQ items={mockItems} />);

      const buttons = screen.getAllByRole('button');
      const firstButton = buttons[0];
      const secondButton = buttons[1];

      firstButton.focus();
      expect(firstButton).toHaveFocus();

      fireEvent.keyDown(firstButton, { key: 'ArrowDown' });
      expect(secondButton).toHaveFocus();
    });

    it('should navigate to previous item with ArrowUp', () => {
      render(<FAQ items={mockItems} />);

      const buttons = screen.getAllByRole('button');
      const firstButton = buttons[0];
      const secondButton = buttons[1];

      secondButton.focus();
      expect(secondButton).toHaveFocus();

      fireEvent.keyDown(secondButton, { key: 'ArrowUp' });
      expect(firstButton).toHaveFocus();
    });

    it('should wrap around when navigating past last item', () => {
      render(<FAQ items={mockItems} />);

      const buttons = screen.getAllByRole('button');
      const firstButton = buttons[0];
      const lastButton = buttons[buttons.length - 1];

      lastButton.focus();
      fireEvent.keyDown(lastButton, { key: 'ArrowDown' });

      expect(firstButton).toHaveFocus();
    });

    it('should wrap around when navigating before first item', () => {
      render(<FAQ items={mockItems} />);

      const buttons = screen.getAllByRole('button');
      const firstButton = buttons[0];
      const lastButton = buttons[buttons.length - 1];

      firstButton.focus();
      fireEvent.keyDown(firstButton, { key: 'ArrowUp' });

      expect(lastButton).toHaveFocus();
    });

    it('should navigate to first item with Home key', () => {
      render(<FAQ items={mockItems} />);

      const buttons = screen.getAllByRole('button');
      const lastButton = buttons[buttons.length - 1];
      const firstButton = buttons[0];

      lastButton.focus();
      fireEvent.keyDown(lastButton, { key: 'Home' });

      expect(firstButton).toHaveFocus();
    });

    it('should navigate to last item with End key', () => {
      render(<FAQ items={mockItems} />);

      const buttons = screen.getAllByRole('button');
      const firstButton = buttons[0];
      const lastButton = buttons[buttons.length - 1];

      firstButton.focus();
      fireEvent.keyDown(firstButton, { key: 'End' });

      expect(lastButton).toHaveFocus();
    });
  });

  describe('Focus Management', () => {
    it('should be keyboard focusable', () => {
      render(<FAQ items={mockItems} />);

      const buttons = screen.getAllByRole('button');

      buttons.forEach((button) => {
        button.focus();
        expect(button).toHaveFocus();
      });
    });

    it('should maintain focus after toggling', async () => {
      const user = userEvent.setup();
      render(<FAQ items={mockItems} />);

      const button = screen.getByRole('button', { name: /what is the governance/i });

      button.focus();
      await user.click(button);

      expect(button).toHaveFocus();
    });

    it('should have visible focus indicators', () => {
      const { container } = render(<FAQ items={mockItems} />);

      const buttons = container.querySelectorAll('button');

      buttons.forEach((button) => {
        // Check for focus styling classes
        expect(button.className).toMatch(/focus:(outline|ring)/);
      });
    });
  });

  describe('Heading Structure', () => {
    it('should use proper heading hierarchy', () => {
      const { container } = render(<FAQ items={mockItems} />);

      // Section heading should be H2
      const sectionHeading = screen.getByText('Frequently Asked Questions');
      expect(sectionHeading.tagName.toLowerCase()).toBe('h2');

      // Question buttons should be within H3 elements
      const h3Elements = container.querySelectorAll('h3');
      expect(h3Elements.length).toBe(mockItems.length);

      h3Elements.forEach((h3, index) => {
        const button = h3.querySelector('button');
        expect(button).toBeInTheDocument();
        expect(button?.textContent).toBe(mockItems[index].question);
      });
    });

    it('should have custom heading when provided', () => {
      render(<FAQ items={mockItems} heading="Common Questions" />);

      const heading = screen.getByText('Common Questions');
      expect(heading).toBeInTheDocument();
      expect(heading.tagName.toLowerCase()).toBe('h2');
    });
  });

  describe('Hidden Content Accessibility', () => {
    it('should use hidden attribute when collapsed', () => {
      render(<FAQ items={mockItems} />);

      const buttons = screen.getAllByRole('button');

      buttons.forEach((button) => {
        const controlsId = button.getAttribute('aria-controls');
        const panel = document.getElementById(controlsId!);

        expect(panel).toHaveAttribute('hidden');
      });
    });

    it('should remove hidden attribute when expanded', async () => {
      const user = userEvent.setup();
      render(<FAQ items={mockItems} />);

      const button = screen.getByRole('button', { name: /what is the governance/i });
      await user.click(button);

      const controlsId = button.getAttribute('aria-controls');
      const panel = document.getElementById(controlsId!);

      expect(panel).not.toHaveAttribute('hidden');
    });
  });

  describe('WCAG Compliance - Automated Scans', () => {
    it('should have no axe violations in default state', async () => {
      const { container } = render(<FAQ items={mockItems} />);

      await assertNoViolations(container);
    });

    it('should have no axe violations with expanded items', async () => {
      const user = userEvent.setup();
      const { container } = render(<FAQ items={mockItems} />);

      // Expand all items
      const buttons = screen.getAllByRole('button');
      for (const button of buttons) {
        await user.click(button);
      }

      await assertNoViolations(container);
    });

    it('should have no axe violations with custom heading', async () => {
      const { container } = render(
        <FAQ items={mockItems} heading="Custom FAQ Heading" />
      );

      await assertNoViolations(container);
    });

    it('should have no axe violations with defaultOpenIndices', async () => {
      const { container } = render(
        <FAQ items={mockItems} defaultOpenIndices={[0, 2]} />
      );

      await assertNoViolations(container);
    });

    it('should pass WCAG compliance with controlled component', async () => {
      const { container } = render(
        <FAQ items={mockItems} openIndices={[0]} onToggle={jest.fn()} />
      );

      // Color contrast is validated in E2E tests and Lighthouse
      // JSDOM doesn't support canvas for color checks
      await assertNoViolations(container);
    });
  });

  describe('Screen Reader Experience', () => {
    it('should have descriptive button text (questions)', () => {
      render(<FAQ items={mockItems} />);

      mockItems.forEach((item) => {
        const button = screen.getByRole('button', { name: new RegExp(item.question, 'i') });
        expect(button).toBeInTheDocument();
      });
    });

    it('should announce expanded state changes', async () => {
      const user = userEvent.setup();
      render(<FAQ items={mockItems} />);

      const button = screen.getByRole('button', { name: /what is the governance/i });

      // Check aria-expanded changes (screen readers announce this)
      expect(button).toHaveAttribute('aria-expanded', 'false');

      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have unique IDs for proper associations', () => {
      render(<FAQ items={mockItems} />);

      const buttons = screen.getAllByRole('button');
      const ids = new Set();

      buttons.forEach((button) => {
        const buttonId = button.id;
        const controlsId = button.getAttribute('aria-controls');

        expect(buttonId).toBeTruthy();
        expect(controlsId).toBeTruthy();

        // IDs should be unique
        expect(ids.has(buttonId)).toBe(false);
        expect(ids.has(controlsId)).toBe(false);

        ids.add(buttonId);
        ids.add(controlsId);
      });
    });
  });

  describe('Interactive Elements', () => {
    it('should only have button type for controls', () => {
      const { container } = render(<FAQ items={mockItems} />);

      const buttons = container.querySelectorAll('button');

      buttons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('should not interfere with form submission', () => {
      const { container } = render(<FAQ items={mockItems} />);

      const buttons = container.querySelectorAll('button');

      buttons.forEach((button) => {
        // Buttons should have type="button" to prevent form submission
        expect(button.getAttribute('type')).toBe('button');
      });
    });
  });

  describe('JSON-LD Structured Data', () => {
    it('should have valid JSON-LD script tag', () => {
      const { container } = render(<FAQ items={mockItems} />);

      const scriptTag = container.querySelector('script[type="application/ld+json"]');
      expect(scriptTag).toBeInTheDocument();

      const jsonLD = JSON.parse(scriptTag!.textContent || '{}');
      expect(jsonLD['@context']).toBe('https://schema.org');
      expect(jsonLD['@type']).toBe('FAQPage');
      expect(jsonLD.mainEntity).toHaveLength(mockItems.length);
    });
  });
});

