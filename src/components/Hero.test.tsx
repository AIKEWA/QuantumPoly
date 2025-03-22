import { render, screen } from '@testing-library/react';
import Hero from './Hero';

// Mock the next-intl hook
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations = {
      'title': 'QuantumPoly',
      'subtitle': 'Merging Artificial Intelligence with Sustainable Innovation and Metaverse Futures',
      'button': 'Join the Future',
    };
    return translations[key] || key;
  },
}));

describe('Hero component', () => {
  it('renders the hero section with correct content', () => {
    render(<Hero />);
    
    expect(screen.getByText('QuantumPoly')).toBeInTheDocument();
    expect(screen.getByText('Merging Artificial Intelligence with Sustainable Innovation and Metaverse Futures')).toBeInTheDocument();
    expect(screen.getByText('Join the Future')).toBeInTheDocument();
  });
}); 