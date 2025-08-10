/**
 * @fileoverview Unit tests for Vision component
 * @module __tests__/components/Vision.test
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import Vision from '../../src/components/Vision';
import { VisionProps, VisionPillar } from '../../src/types/components';

// Mock window.open for external link testing
const mockWindowOpen = jest.fn();
window.open = mockWindowOpen;

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

describe('Vision Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    mockWindowOpen.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Vision />);

      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByText('Our Vision')).toBeInTheDocument();
      expect(screen.getByText('Artificial Intelligence')).toBeInTheDocument();
      expect(screen.getByText('Sustainability')).toBeInTheDocument();
      expect(screen.getByText('Metaverse Integration')).toBeInTheDocument();
    });

    it('renders with custom title', () => {
      render(<Vision title="Custom Vision Title" />);

      expect(screen.getByText('Custom Vision Title')).toBeInTheDocument();
    });

    it('renders custom pillars', () => {
      const customPillars: VisionPillar[] = [
        {
          icon: '🚀',
          title: 'Innovation',
          description: 'Leading edge technology solutions.',
        },
        {
          icon: '🔬',
          title: 'Research',
          description: 'Cutting-edge scientific exploration.',
          href: 'https://example.com/research',
        },
      ];

      render(<Vision pillars={customPillars} />);

      expect(screen.getByText('Innovation')).toBeInTheDocument();
      expect(screen.getByText('Research')).toBeInTheDocument();
      expect(
        screen.getByText('Leading edge technology solutions.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Cutting-edge scientific exploration.')
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<Vision />);

      const section = screen.getByRole('region');
      expect(section).toHaveAttribute(
        'aria-labelledby',
        'vision-section-heading'
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'vision-section-heading');
      expect(heading).toHaveAttribute('tabIndex', '0');
    });

    it('provides proper list semantics', () => {
      render(<Vision />);

      const list = screen.getByRole('list');
      expect(list).toHaveAttribute('aria-label', 'Vision pillars');

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3); // Default pillars
    });

    it('supports keyboard navigation for clickable pillars', () => {
      const pillarsWithLinks: VisionPillar[] = [
        {
          icon: '🔗',
          title: 'Clickable Pillar',
          description: 'This pillar has a link.',
          href: 'https://example.com',
        },
      ];

      render(<Vision pillars={pillarsWithLinks} />);

      const clickablePillar = screen.getByRole('listitem');
      expect(clickablePillar).toHaveAttribute('tabIndex', '0');
      expect(clickablePillar).toHaveClass('cursor-pointer');

      // Test keyboard interaction
      fireEvent.keyDown(clickablePillar, { key: 'Enter' });
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://example.com',
        '_blank',
        'noopener noreferrer'
      );

      mockWindowOpen.mockClear();
      fireEvent.keyDown(clickablePillar, { key: ' ' });
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://example.com',
        '_blank',
        'noopener noreferrer'
      );
    });

    it('has proper ARIA labels for clickable pillars', () => {
      const pillarsWithLinks: VisionPillar[] = [
        {
          icon: '🔗',
          title: 'Test Pillar',
          description: 'Test description.',
          href: 'https://example.com',
        },
      ];

      render(<Vision pillars={pillarsWithLinks} />);

      const pillar = screen.getByRole('listitem');
      expect(pillar).toHaveAttribute(
        'aria-label',
        'Test Pillar: Test description. (clickable)'
      );
    });

    it('provides screen reader guidance for non-clickable pillars', () => {
      const regularPillars: VisionPillar[] = [
        {
          icon: '🔗',
          title: 'Regular Pillar',
          description: 'Not clickable.',
        },
      ];

      render(<Vision pillars={regularPillars} />);

      const pillar = screen.getByRole('listitem');
      expect(pillar).toHaveAttribute('tabIndex', '-1');
      expect(pillar).toHaveAttribute(
        'aria-label',
        'Regular Pillar: Not clickable.'
      );
    });

    it('includes screen reader navigation aid', () => {
      render(<Vision />);

      expect(
        screen.getByText('End of vision pillars section. 3 pillars displayed.')
      ).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles click events on pillars with href', () => {
      const clickablePillars: VisionPillar[] = [
        {
          icon: '🔗',
          title: 'Clickable',
          description: 'Click me!',
          href: 'https://example.com/test',
        },
      ];

      render(<Vision pillars={clickablePillars} />);

      const pillar = screen.getByRole('listitem');
      fireEvent.click(pillar);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://example.com/test',
        '_blank',
        'noopener noreferrer'
      );
    });

    it('does not handle clicks on pillars without href', () => {
      const regularPillars: VisionPillar[] = [
        {
          icon: '🔗',
          title: 'Regular',
          description: 'No link here.',
        },
      ];

      render(<Vision pillars={regularPillars} />);

      const pillar = screen.getByRole('listitem');
      fireEvent.click(pillar);

      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('prevents default behavior for space key', () => {
      const pillarsWithLinks: VisionPillar[] = [
        {
          icon: '🔗',
          title: 'Spacebar Test',
          description: 'Test spacebar.',
          href: 'https://example.com',
        },
      ];

      render(<Vision pillars={pillarsWithLinks} />);

      const pillar = screen.getByRole('listitem');
      const spaceEvent = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
      });
      const preventDefaultSpy = jest.spyOn(spaceEvent, 'preventDefault');

      fireEvent(pillar, spaceEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Visual Design', () => {
    it('applies custom className', () => {
      render(<Vision className="custom-vision-class" />);

      const section = screen.getByRole('region');
      expect(section).toHaveClass('custom-vision-class');
    });

    it('applies custom id', () => {
      render(<Vision id="custom-vision" />);

      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('id', 'custom-vision');

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'custom-vision-heading');
    });

    it('has responsive grid layout', () => {
      render(<Vision />);

      const list = screen.getByRole('list');
      expect(list).toHaveClass('grid', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });

    it('includes theme-aware styling', () => {
      render(<Vision />);

      const section = screen.getByRole('region');
      expect(section.className).toMatch(/dark:/);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading.className).toMatch(/dark:text-cyan-400/);
    });

    it('renders icons and decorative elements', () => {
      render(<Vision />);

      // Check for emoji icons (default pillars)
      expect(screen.getByText('🌐')).toBeInTheDocument();
      expect(screen.getByText('🌱')).toBeInTheDocument();
      expect(screen.getByText('🕶️')).toBeInTheDocument();
    });
  });

  describe('Content Structure', () => {
    it('maintains proper heading hierarchy', () => {
      render(<Vision />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('generates unique IDs for pillar elements', () => {
      render(<Vision />);

      const titles = screen.getAllByText(
        /^(Artificial Intelligence|Sustainability|Metaverse Integration)$/
      );
      titles.forEach((title, index) => {
        expect(title).toHaveAttribute('id', `pillar-${index}-title`);
      });
    });

    it('links descriptions to their titles', () => {
      render(<Vision />);

      const descriptions = screen.getAllByText(
        /neural networks|planetary health|immersive/
      );
      descriptions.forEach((description, index) => {
        expect(description).toHaveAttribute(
          'aria-describedby',
          `pillar-${index}-title`
        );
      });
    });
  });

  describe('Props Validation', () => {
    it('handles empty pillars array', () => {
      render(<Vision pillars={[]} />);

      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByText('Our Vision')).toBeInTheDocument();
      expect(
        screen.getByText('End of vision pillars section. 0 pillars displayed.')
      ).toBeInTheDocument();
    });

    it('spreads additional props to section element', () => {
      render(<Vision data-testid="vision-section" />);

      const section = screen.getByTestId('vision-section');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles pillars with missing properties gracefully', () => {
      const incompletePillars = [
        {
          icon: '❓',
          title: 'Incomplete Pillar',
          description: '', // Empty description
        },
      ] as VisionPillar[];

      expect(() =>
        render(<Vision pillars={incompletePillars} />)
      ).not.toThrow();
      expect(screen.getByText('Incomplete Pillar')).toBeInTheDocument();
    });
  });
});
