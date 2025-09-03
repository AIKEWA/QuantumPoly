export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Common prop interface providing optional className passthrough for root elements.
 */
export interface WithClassName {
  /** Additional Tailwind or CSS classes to apply to the component’s root element. */
  className?: string;
}
