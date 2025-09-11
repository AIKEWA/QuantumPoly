import { render, screen } from '@testing-library/react';
import React from 'react';

import { About } from '@/components/About';

describe('About Component', () => {
  const defaultProps = {
    title: 'About QuantumPoly',
    body: <p>We are leading the future of quantum computing and decentralized technologies.</p>,
  };

  it('renders all user-visible text from props', () => {
    render(<About {...defaultProps} />);

    expect(screen.getByRole('heading', { name: defaultProps.title })).toBeInTheDocument();
    expect(
      screen.getByText(
        'We are leading the future of quantum computing and decentralized technologies.',
      ),
    ).toBeInTheDocument();
  });

  it('respects headingLevel prop', () => {
    render(<About {...defaultProps} headingLevel={3} />);

    const heading = screen.getByRole('heading', { name: defaultProps.title });
    expect(heading.tagName).toBe('H3');
  });

  it('defaults to h2 when headingLevel is not provided', () => {
    render(<About {...defaultProps} />);

    const heading = screen.getByRole('heading', { name: defaultProps.title });
    expect(heading.tagName).toBe('H2');
  });

  it('body is rendered via ReactNode (no dangerouslySetInnerHTML)', () => {
    const complexBody = (
      <div>
        <p>First paragraph</p>
        <ul>
          <li>Point one</li>
          <li>Point two</li>
        </ul>
      </div>
    );

    render(<About title={defaultProps.title} body={complexBody} />);

    expect(screen.getByText('First paragraph')).toBeInTheDocument();
    expect(screen.getByText('Point one')).toBeInTheDocument();
    expect(screen.getByText('Point two')).toBeInTheDocument();
  });

  it('links body content via aria-describedby', () => {
    render(<About {...defaultProps} />);

    const heading = screen.getByRole('heading', { name: defaultProps.title });
    expect(heading).toHaveAttribute('aria-describedby');

    const bodyId = heading.getAttribute('aria-describedby');
    expect(bodyId).toBeTruthy();

    const bodyElement = document.getElementById(bodyId!);
    expect(bodyElement).toBeInTheDocument();
    expect(bodyElement).toHaveTextContent(
      'We are leading the future of quantum computing and decentralized technologies.',
    );
  });

  it('generates consistent body ID based on title', () => {
    const { rerender } = render(<About title="Test Title" body="Test body" />);

    const heading1 = screen.getByRole('heading', { name: 'Test Title' });
    const bodyId1 = heading1.getAttribute('aria-describedby');

    rerender(<About title="Test Title" body="Different body" />);

    const heading2 = screen.getByRole('heading', { name: 'Test Title' });
    const bodyId2 = heading2.getAttribute('aria-describedby');

    expect(bodyId1).toBe(bodyId2);
    expect(bodyId1).toContain('test-title');
  });

  it('applies custom className to root section', () => {
    const customClass = 'custom-about-class';
    render(<About {...defaultProps} className={customClass} />);

    const section = screen.getByRole('region');
    expect(section).toHaveClass(customClass);
  });

  it('has proper semantic structure with section element', () => {
    render(<About {...defaultProps} />);

    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('handles string body content properly', () => {
    const stringBody = 'Simple string body content';
    render(<About title={defaultProps.title} body={stringBody} />);

    expect(screen.getByText(stringBody)).toBeInTheDocument();
  });

  it('maintains accessibility with complex ReactNode body', () => {
    const complexBody = (
      <div>
        <h4>Subsection</h4>
        <p>Description text</p>
        <button>Interactive element</button>
      </div>
    );

    render(<About title={defaultProps.title} body={complexBody} />);

    expect(screen.getByRole('heading', { name: 'Subsection', level: 4 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Interactive element' })).toBeInTheDocument();
  });
});
