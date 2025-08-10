/**
 * @fileoverview Unit tests for About component
 * @module __tests__/components/About.test
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import About from '../../src/components/About';
import { AboutProps } from '../../src/types/components';

// Mock IntersectionObserver for potential scroll animations
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

describe('About Component', () => {
  beforeEach(() => {
    // Clear any previous DOM state
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<About />);

      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByText('About QuantumPoly')).toBeInTheDocument();
      expect(
        screen.getByText(/QuantumPoly is a visionary AI startup/)
      ).toBeInTheDocument();
    });

    it('renders with custom props', () => {
      const customProps: AboutProps = {
        title: 'Custom About Title',
        content: ['Custom paragraph one.', 'Custom paragraph two.'],
        visualAltText: 'Custom alt text',
        id: 'custom-about',
      };

      render(<About {...customProps} />);

      expect(screen.getByText('Custom About Title')).toBeInTheDocument();
      expect(screen.getByText('Custom paragraph one.')).toBeInTheDocument();
      expect(screen.getByText('Custom paragraph two.')).toBeInTheDocument();
    });

    it('renders multiple content paragraphs', () => {
      const props: AboutProps = {
        content: [
          'First paragraph of content.',
          'Second paragraph of content.',
          'Third paragraph of content.',
        ],
      };

      render(<About {...props} />);

      expect(
        screen.getByText('First paragraph of content.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Second paragraph of content.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Third paragraph of content.')
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<About />);

      const section = screen.getByRole('region');
      expect(section).toHaveAttribute(
        'aria-labelledby',
        'about-section-heading'
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'about-section-heading');
      expect(heading).toHaveAttribute('tabIndex', '0');
    });

    it('provides proper ARIA labels and descriptions', () => {
      render(<About visualAltText="Test alt text" />);

      const visualElement = screen.getByRole('img');
      expect(visualElement).toHaveAttribute('aria-label', 'Test alt text');
    });

    it('supports keyboard navigation', () => {
      render(<About />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('tabIndex', '0');

      // Focus should be manageable
      heading.focus();
      expect(document.activeElement).toBe(heading);
    });

    it('includes screen reader helper text', () => {
      render(<About />);

      expect(
        screen.getByText(
          'Main content about QuantumPoly company mission and values'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'End of about section. Learn more about our vision in the next section.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Visual Content', () => {
    it('renders default visualization when no image provided', () => {
      render(<About />);

      expect(screen.getByText('🧠')).toBeInTheDocument();
      expect(screen.getByText('VISUALIZATION')).toBeInTheDocument();
    });

    it('renders custom image when imageSrc provided', () => {
      const props: AboutProps = {
        imageSrc: 'https://example.com/test-image.jpg',
        visualAltText: 'Test image',
      };

      render(<About {...props} />);

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute(
        'src',
        'https://example.com/test-image.jpg'
      );
      expect(image).toHaveAttribute('alt', 'Test image');
      expect(image).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('Theming and Styling', () => {
    it('applies custom className', () => {
      render(<About className="custom-class" />);

      const section = screen.getByRole('region');
      expect(section).toHaveClass('custom-class');
    });

    it('applies custom id', () => {
      render(<About id="custom-about" />);

      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('id', 'custom-about');

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'custom-about-heading');
    });

    it('has responsive design classes', () => {
      render(<About />);

      const section = screen.getByRole('region');
      expect(section).toHaveClass('py-16', 'sm:py-20', 'px-4', 'md:px-6');
    });

    it('includes dark mode theme classes', () => {
      render(<About />);

      const section = screen.getByRole('region');
      expect(section.className).toMatch(/dark:/);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading.className).toMatch(/dark:text-cyan-400/);
    });
  });

  describe('Content Structure', () => {
    it('maintains proper heading hierarchy', () => {
      render(<About />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('renders content in proper order', () => {
      render(<About />);

      const section = screen.getByRole('region');
      const heading = screen.getByRole('heading', { level: 2 });
      const firstParagraph = screen.getByText(
        /QuantumPoly is a visionary AI startup/
      );

      // Check DOM order
      const children = Array.from(section.querySelectorAll('*'));
      const headingIndex = children.indexOf(heading);
      const paragraphIndex = children.findIndex(el =>
        el.textContent?.includes('QuantumPoly is a visionary AI startup')
      );

      expect(headingIndex).toBeLessThan(paragraphIndex);
    });
  });

  describe('Props Validation', () => {
    it('handles empty content array gracefully', () => {
      render(<About content={[]} />);

      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByText('About QuantumPoly')).toBeInTheDocument();
    });

    it('handles undefined visualAltText', () => {
      render(<About visualAltText={undefined} />);

      const visualElement = screen.getByRole('img');
      expect(visualElement).toHaveAttribute(
        'aria-label',
        'Futuristic brain visualization representing AI and quantum computing integration'
      );
    });

    it('spreads additional props to section element', () => {
      render(<About data-testid="about-section" />);

      const section = screen.getByTestId('about-section');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Error Boundaries', () => {
    it('handles malformed content gracefully', () => {
      // Test with potentially problematic content
      const props: AboutProps = {
        content: ['', '   ', 'Normal content'],
      };

      expect(() => render(<About {...props} />)).not.toThrow();
      expect(screen.getByText('Normal content')).toBeInTheDocument();
    });
  });
});
