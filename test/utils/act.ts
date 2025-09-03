/**
 * Centralized act utility for React testing
 * 
 * Future-proof note: keep `react-dom/test-utils` for React 18; 
 * when `react` exports `act`, swap imports in this single helper.
 */
export { act } from 'react-dom/test-utils'; // TODO: swap to 'react' when available
