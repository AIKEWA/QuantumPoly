import { describe, expect, it } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FAQ, type FAQItem } from '@/components/FAQ';

describe('FAQ', () => {
  const mockItems: FAQItem[] = [
    {
      question: 'What is QuantumPoly?',
      answer: 'QuantumPoly is an AI research and development company.',
    },
    {
      question: 'How do I contact support?',
      answer: 'You can contact us at support@quantumpoly.ai',
    },
    {
      question: 'Where are you located?',
      answer: 'We are a global company with offices worldwide.',
    },
  ];

  it('should render all FAQ items', () => {
    render(<FAQ items={mockItems} />);

    expect(screen.getByText('What is QuantumPoly?')).toBeInTheDocument();
    expect(screen.getByText('How do I contact support?')).toBeInTheDocument();
    expect(screen.getByText('Where are you located?')).toBeInTheDocument();
  });

  it('should render default heading', () => {
    render(<FAQ items={mockItems} />);
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
  });

  it('should render custom heading', () => {
    render(<FAQ items={mockItems} heading="Common Questions" />);
    expect(screen.getByText('Common Questions')).toBeInTheDocument();
  });

  it('should not render when items array is empty', () => {
    const { container } = render(<FAQ items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should initially hide all answers', () => {
    render(<FAQ items={mockItems} />);

    const answer1 = screen.queryByText('QuantumPoly is an AI research and development company.');
    const answer2 = screen.queryByText('You can contact us at support@quantumpoly.ai');
    const answer3 = screen.queryByText('We are a global company with offices worldwide.');

    expect(answer1).not.toBeVisible();
    expect(answer2).not.toBeVisible();
    expect(answer3).not.toBeVisible();
  });

  it('should expand answer on click', async () => {
    const user = userEvent.setup();
    render(<FAQ items={mockItems} />);

    const question = screen.getByText('What is QuantumPoly?');
    await user.click(question);

    const answer = screen.getByText('QuantumPoly is an AI research and development company.');
    expect(answer).toBeVisible();
  });

  it('should collapse answer on second click', async () => {
    const user = userEvent.setup();
    render(<FAQ items={mockItems} />);

    const question = screen.getByText('What is QuantumPoly?');
    
    // Expand
    await user.click(question);
    let answer = screen.getByText('QuantumPoly is an AI research and development company.');
    expect(answer).toBeVisible();

    // Collapse
    await user.click(question);
    answer = screen.getByText('QuantumPoly is an AI research and development company.');
    expect(answer).not.toBeVisible();
  });

  it('should have correct ARIA attributes when collapsed', () => {
    render(<FAQ items={mockItems} />);

    const buttons = screen.getAllByRole('button');
    const firstButton = buttons[0];

    expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    expect(firstButton).toHaveAttribute('aria-controls');
  });

  it('should have correct ARIA attributes when expanded', async () => {
    const user = userEvent.setup();
    render(<FAQ items={mockItems} />);

    const button = screen.getByText('What is QuantumPoly?').closest('button');
    
    await user.click(button!);

    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('should toggle expansion icon', async () => {
    const user = userEvent.setup();
    const { container } = render(<FAQ items={mockItems} />);

    const button = screen.getByText('What is QuantumPoly?').closest('button');
    const icon = button?.querySelector('svg');

    expect(icon).toBeInTheDocument();
    expect(icon).not.toHaveClass('rotate-180');

    await user.click(button!);
    expect(icon).toHaveClass('rotate-180');
  });

  it('should support keyboard navigation with Enter key', () => {
    render(<FAQ items={mockItems} />);

    const button = screen.getByText('What is QuantumPoly?').closest('button');
    
    fireEvent.keyDown(button!, { key: 'Enter' });

    const answer = screen.getByText('QuantumPoly is an AI research and development company.');
    expect(answer).toBeVisible();
  });

  it('should support keyboard navigation with Space key', () => {
    render(<FAQ items={mockItems} />);

    const button = screen.getByText('How do I contact support?').closest('button');
    
    fireEvent.keyDown(button!, { key: ' ' });

    const answer = screen.getByText('You can contact us at support@quantumpoly.ai');
    expect(answer).toBeVisible();
  });

  it('should navigate to next item with ArrowDown', () => {
    render(<FAQ items={mockItems} />);

    const buttons = screen.getAllByRole('button', { hidden: true });
    const firstButton = buttons[0];

    // Focus first button
    firstButton.focus();
    expect(firstButton).toHaveFocus();

    // Press ArrowDown
    fireEvent.keyDown(firstButton, { key: 'ArrowDown' });

    // Second button should be focused
    const secondButton = buttons[1];
    expect(secondButton).toHaveFocus();
  });

  it('should navigate to previous item with ArrowUp', () => {
    render(<FAQ items={mockItems} />);

    const buttons = screen.getAllByRole('button', { hidden: true });
    const secondButton = buttons[1];

    // Focus second button
    secondButton.focus();
    expect(secondButton).toHaveFocus();

    // Press ArrowUp
    fireEvent.keyDown(secondButton, { key: 'ArrowUp' });

    // First button should be focused
    const firstButton = buttons[0];
    expect(firstButton).toHaveFocus();
  });

  it('should navigate to first item with Home key', () => {
    render(<FAQ items={mockItems} />);

    const buttons = screen.getAllByRole('button', { hidden: true });
    const lastButton = buttons[buttons.length - 1];
    const firstButton = buttons[0];

    // Focus last button
    lastButton.focus();

    // Press Home
    fireEvent.keyDown(lastButton, { key: 'Home' });

    // First button should be focused
    expect(firstButton).toHaveFocus();
  });

  it('should navigate to last item with End key', () => {
    render(<FAQ items={mockItems} />);

    const buttons = screen.getAllByRole('button', { hidden: true });
    const firstButton = buttons[0];
    const lastButton = buttons[buttons.length - 1];

    // Focus first button
    firstButton.focus();

    // Press End
    fireEvent.keyDown(firstButton, { key: 'End' });

    // Last button should be focused
    expect(lastButton).toHaveFocus();
  });

  it('should wrap around when navigating past last item', () => {
    render(<FAQ items={mockItems} />);

    const buttons = screen.getAllByRole('button', { hidden: true });
    const lastButton = buttons[buttons.length - 1];
    const firstButton = buttons[0];

    // Focus last button
    lastButton.focus();

    // Press ArrowDown
    fireEvent.keyDown(lastButton, { key: 'ArrowDown' });

    // Should wrap to first button
    expect(firstButton).toHaveFocus();
  });

  it('should wrap around when navigating before first item', () => {
    render(<FAQ items={mockItems} />);

    const buttons = screen.getAllByRole('button', { hidden: true });
    const firstButton = buttons[0];
    const lastButton = buttons[buttons.length - 1];

    // Focus first button
    firstButton.focus();

    // Press ArrowUp
    fireEvent.keyDown(firstButton, { key: 'ArrowUp' });

    // Should wrap to last button
    expect(lastButton).toHaveFocus();
  });

  it('should render JSON-LD structured data', () => {
    const { container } = render(<FAQ items={mockItems} />);

    const scriptTag = container.querySelector('script[type="application/ld+json"]');
    expect(scriptTag).toBeInTheDocument();

    const jsonLD = JSON.parse(scriptTag!.textContent || '{}');
    expect(jsonLD['@context']).toBe('https://schema.org');
    expect(jsonLD['@type']).toBe('FAQPage');
    expect(jsonLD.mainEntity).toHaveLength(3);
    expect(jsonLD.mainEntity[0]['@type']).toBe('Question');
    expect(jsonLD.mainEntity[0].name).toBe('What is QuantumPoly?');
    expect(jsonLD.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
  });

  it('should generate unique IDs for each item', () => {
    render(<FAQ items={mockItems} />);

    const buttons = screen.getAllByRole('button', { hidden: true });
    const ids = buttons.map((button) => button.id);

    // All IDs should be unique
    expect(new Set(ids).size).toBe(ids.length);
    
    // All IDs should be truthy
    ids.forEach((id) => expect(id).toBeTruthy());
  });

  it('should properly associate buttons with panels', () => {
    render(<FAQ items={mockItems} />);

    const buttons = screen.getAllByRole('button', { hidden: true });
    
    buttons.forEach((button) => {
      const controlsId = button.getAttribute('aria-controls');
      expect(controlsId).toBeTruthy();
      
      // Panel should exist
      const panel = document.getElementById(controlsId!);
      expect(panel).toBeInTheDocument();
    });
  });

  it('should handle single item', () => {
    const singleItem = [mockItems[0]];
    render(<FAQ items={singleItem} />);

    expect(screen.getByText('What is QuantumPoly?')).toBeInTheDocument();
    expect(screen.queryByText('How do I contact support?')).not.toBeInTheDocument();
  });

  it('should support multiple items open simultaneously', async () => {
    const user = userEvent.setup();
    render(<FAQ items={mockItems} />);

    const question1 = screen.getByText('What is QuantumPoly?');
    const question2 = screen.getByText('How do I contact support?');
    
    // Expand first item
    await user.click(question1);
    const answer1 = screen.getByText('QuantumPoly is an AI research and development company.');
    expect(answer1).toBeVisible();

    // Expand second item - both should be visible
    await user.click(question2);
    const answer2 = screen.getByText('You can contact us at support@quantumpoly.ai');
    expect(answer2).toBeVisible();
    expect(answer1).toBeVisible(); // First should still be visible
  });

  it('should respect defaultOpenIndices prop', () => {
    render(<FAQ items={mockItems} defaultOpenIndices={[0, 2]} />);

    const answer1 = screen.getByText('QuantumPoly is an AI research and development company.');
    const answer3 = screen.getByText('We are a global company with offices worldwide.');
    const answer2 = screen.queryByText('You can contact us at support@quantumpoly.ai');

    expect(answer1).toBeVisible();
    expect(answer3).toBeVisible();
    expect(answer2).not.toBeVisible();
  });

  it('should work as controlled component with openIndices', async () => {
    const user = userEvent.setup();
    const onToggleMock = jest.fn();
    const { rerender } = render(
      <FAQ items={mockItems} openIndices={[0]} onToggle={onToggleMock} />
    );

    // First item should be open
    const answer1 = screen.getByText('QuantumPoly is an AI research and development company.');
    expect(answer1).toBeVisible();

    // Click second item
    const question2 = screen.getByText('How do I contact support?');
    await user.click(question2);

    // onToggle should be called
    expect(onToggleMock).toHaveBeenCalledWith(1, true);

    // Manually update openIndices (simulating parent state update)
    rerender(<FAQ items={mockItems} openIndices={[0, 1]} onToggle={onToggleMock} />);

    const answer2 = screen.getByText('You can contact us at support@quantumpoly.ai');
    expect(answer2).toBeVisible();
    expect(answer1).toBeVisible();
  });

  it('should call onToggle callback with correct arguments', async () => {
    const user = userEvent.setup();
    const onToggleMock = jest.fn();
    render(<FAQ items={mockItems} onToggle={onToggleMock} />);

    const question = screen.getByText('What is QuantumPoly?');
    
    // Expand
    await user.click(question);
    expect(onToggleMock).toHaveBeenCalledWith(0, true);

    // Collapse
    await user.click(question);
    expect(onToggleMock).toHaveBeenCalledWith(0, false);
  });

  it('should use custom idPrefix for stable IDs', () => {
    render(<FAQ items={mockItems} idPrefix="custom-faq" />);

    const buttons = screen.getAllByRole('button', { hidden: true });
    const firstButton = buttons[0];

    expect(firstButton.id).toBe('custom-faq-button-0');
    expect(firstButton.getAttribute('aria-controls')).toBe('custom-faq-panel-0');
  });

  it('should apply custom className to container', () => {
    const { container } = render(<FAQ items={mockItems} className="custom-class" />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('custom-class');
  });

  it('should have data-qa attributes for testing', () => {
    const { container } = render(<FAQ items={mockItems} />);

    expect(container.querySelector('[data-qa="faq"]')).toBeInTheDocument();
    expect(container.querySelector('[data-qa="faq-item"]')).toBeInTheDocument();
    expect(container.querySelector('[data-qa="faq-toggle"]')).toBeInTheDocument();
    expect(container.querySelector('[data-qa="faq-panel"]')).toBeInTheDocument();
  });
});
