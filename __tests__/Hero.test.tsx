import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Hero from '@/components/Hero';

describe('Hero Component', () => {
  const defaultProps = {
    title: 'Welcome to QuantumPoly',
    subtitle: 'Leading the future of technology',
    ctaLabel: 'Get Started',
  };

  it('renders all user-visible text from props', () => {
    render(<Hero {...defaultProps} />);
    
    expect(screen.getByRole('heading', { name: defaultProps.title })).toBeInTheDocument();
    expect(screen.getByText(defaultProps.subtitle)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: defaultProps.ctaLabel })).toBeInTheDocument();
  });

  it('respects headingLevel prop', () => {
    render(<Hero {...defaultProps} headingLevel={1} />);
    
    const heading = screen.getByRole('heading', { name: defaultProps.title });
    expect(heading.tagName).toBe('H1');
  });

  it('defaults to h2 when headingLevel is not provided', () => {
    render(<Hero {...defaultProps} />);
    
    const heading = screen.getByRole('heading', { name: defaultProps.title });
    expect(heading.tagName).toBe('H2');
  });

  it('links subtitle via aria-describedby when present', () => {
    render(<Hero {...defaultProps} />);
    
    const heading = screen.getByRole('heading', { name: defaultProps.title });
    const subtitle = screen.getByText(defaultProps.subtitle);
    
    expect(heading).toHaveAttribute('aria-describedby');
    expect(subtitle).toHaveAttribute('id');
    expect(heading.getAttribute('aria-describedby')).toBe(subtitle.getAttribute('id'));
  });

  it('does not link subtitle when not provided', () => {
    render(<Hero title={defaultProps.title} ctaLabel={defaultProps.ctaLabel} />);
    
    const heading = screen.getByRole('heading', { name: defaultProps.title });
    expect(heading).not.toHaveAttribute('aria-describedby');
  });

  it('CTA button announces correct accessible name', () => {
    const handleCtaClick = jest.fn();
    render(<Hero {...defaultProps} onCtaClick={handleCtaClick} />);
    
    const button = screen.getByRole('button', { name: defaultProps.ctaLabel });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAccessibleName(defaultProps.ctaLabel);
  });

  it('CTA button is focusable and has visible focus styles', () => {
    render(<Hero {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: defaultProps.ctaLabel });
    expect(button).toHaveClass('focus-visible:ring');
    expect(button).not.toHaveAttribute('tabindex', '-1');
  });

  it('calls onCtaClick when CTA button is clicked', async () => {
    const user = userEvent.setup();
    const handleCtaClick = jest.fn();
    render(<Hero {...defaultProps} onCtaClick={handleCtaClick} />);
    
    const button = screen.getByRole('button', { name: defaultProps.ctaLabel });
    await user.click(button);
    
    expect(handleCtaClick).toHaveBeenCalledTimes(1);
  });

  it('does not render CTA button when ctaLabel is not provided', () => {
    render(<Hero title={defaultProps.title} subtitle={defaultProps.subtitle} />);
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders media content when provided', () => {
    const media = <img src="/test.jpg" alt="Test media" />;
    render(<Hero {...defaultProps} media={media} />);
    
    expect(screen.getByRole('img', { name: 'Test media' })).toBeInTheDocument();
  });

  it('applies custom className to root section', () => {
    const customClass = 'custom-hero-class';
    render(<Hero {...defaultProps} className={customClass} />);
    
    const section = screen.getByRole('region');
    expect(section).toHaveClass(customClass);
  });

  it('has proper semantic structure with section element', () => {
    render(<Hero {...defaultProps} />);
    
    expect(screen.getByRole('region')).toBeInTheDocument();
  });
});
