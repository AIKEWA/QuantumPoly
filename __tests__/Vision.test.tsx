import { render, screen } from '@testing-library/react';
import React from 'react';

import { Vision } from '@/components/Vision';

describe('Vision Component', () => {
  const defaultProps = {
    title: 'Our Vision',
    pillars: [
      {
        title: 'Innovation',
        description: 'Driving breakthrough technologies',
        icon: '🚀',
      },
      {
        title: 'Sustainability',
        description: 'Building for the future',
        icon: '🌱',
      },
      {
        title: 'Community',
        description: 'Connecting people worldwide',
        icon: '🤝',
      },
    ],
  };

  it('renders all user-visible text from props', () => {
    render(<Vision {...defaultProps} />);

    expect(screen.getByRole('heading', { name: defaultProps.title })).toBeInTheDocument();

    defaultProps.pillars.forEach((pillar) => {
      expect(screen.getByRole('heading', { name: pillar.title, level: 3 })).toBeInTheDocument();
      expect(screen.getByText(pillar.description)).toBeInTheDocument();
    });
  });

  it('respects headingLevel prop', () => {
    render(<Vision {...defaultProps} headingLevel={1} />);

    const heading = screen.getByRole('heading', { name: defaultProps.title });
    expect(heading.tagName).toBe('H1');
  });

  it('defaults to h2 when headingLevel is not provided', () => {
    render(<Vision {...defaultProps} />);

    const heading = screen.getByRole('heading', { name: defaultProps.title });
    expect(heading.tagName).toBe('H2');
  });

  it('renders pillar titles and descriptions correctly', () => {
    render(<Vision {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Innovation', level: 3 })).toBeInTheDocument();
    expect(screen.getByText('Driving breakthrough technologies')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Sustainability', level: 3 })).toBeInTheDocument();
    expect(screen.getByText('Building for the future')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Community', level: 3 })).toBeInTheDocument();
    expect(screen.getByText('Connecting people worldwide')).toBeInTheDocument();
  });

  it('icons are properly hidden from screen readers', () => {
    render(<Vision {...defaultProps} />);

    // Icons should be rendered but aria-hidden
    const iconElements = document.querySelectorAll('[aria-hidden="true"]');
    expect(iconElements.length).toBeGreaterThan(0);

    // Verify some contain our emoji icons
    const iconTexts = Array.from(iconElements).map((el) => el.textContent);
    expect(iconTexts).toContain('🚀');
    expect(iconTexts).toContain('🌱');
    expect(iconTexts).toContain('🤝');
  });

  it('handles pillars without icons gracefully', () => {
    const propsWithoutIcons = {
      title: 'Simple Vision',
      pillars: [
        {
          title: 'Text Only',
          description: 'This pillar has no icon',
        },
      ],
    };

    render(<Vision {...propsWithoutIcons} />);

    expect(screen.getByRole('heading', { name: 'Text Only', level: 3 })).toBeInTheDocument();
    expect(screen.getByText('This pillar has no icon')).toBeInTheDocument();
  });

  it('uses custom iconRenderer when provided', () => {
    const customIconRenderer = jest.fn((icon, title) => (
      <div role="img" aria-label={title}>
        Custom: {icon}
      </div>
    ));

    render(<Vision {...defaultProps} iconRenderer={customIconRenderer} />);

    expect(customIconRenderer).toHaveBeenCalledTimes(3);
    expect(customIconRenderer).toHaveBeenCalledWith('🚀', 'Innovation');
    expect(customIconRenderer).toHaveBeenCalledWith('🌱', 'Sustainability');
    expect(customIconRenderer).toHaveBeenCalledWith('🤝', 'Community');

    expect(screen.getByRole('img', { name: 'Innovation' })).toBeInTheDocument();
    expect(screen.getByText('Custom: 🚀')).toBeInTheDocument();
  });

  it('supports ReactNode icons', () => {
    const propsWithReactIcons = {
      title: 'React Icons Vision',
      pillars: [
        {
          title: 'Component Icon',
          description: 'Using React component as icon',
          icon: (
            <svg data-testid="custom-icon" aria-label="Custom SVG">
              Custom SVG
            </svg>
          ),
        },
      ],
    };

    render(<Vision {...propsWithReactIcons} />);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Component Icon', level: 3 })).toBeInTheDocument();
  });

  it('applies custom className to root section', () => {
    const customClass = 'custom-vision-class';
    render(<Vision {...defaultProps} className={customClass} />);

    const section = screen.getByRole('region');
    expect(section).toHaveClass(customClass);
  });

  it('has proper semantic structure with section element', () => {
    render(<Vision {...defaultProps} />);

    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('renders correct number of pillar cards', () => {
    render(<Vision {...defaultProps} />);

    const pillarHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(pillarHeadings).toHaveLength(defaultProps.pillars.length);
  });

  it('decorative elements are properly hidden from assistive technology', () => {
    render(<Vision {...defaultProps} />);

    // Check that gradient bars are aria-hidden
    const gradientBars = document.querySelectorAll('[aria-hidden="true"]');
    expect(gradientBars.length).toBeGreaterThan(defaultProps.pillars.length); // Icons + gradient bars
  });
});
