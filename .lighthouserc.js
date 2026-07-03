const isCI = !!process.env.CI;
const useExternalUrl = isCI && process.env.LHCI_MODE === 'external_url';

module.exports = {
  ci: {
    collect: {
      numberOfRuns: 2,
      ...(useExternalUrl ? {} : { startServerCommand: 'next start -p 3000' }),
      url: useExternalUrl ? [process.env.PREVIEW_URL] : ['http://localhost:3000'],
      settings: { onlyCategories: ['accessibility'] },
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 1.0 }],
        'color-contrast': 'error', // fail build if any contrast issue
      },
    },
    upload: { target: 'temporary-public-storage' },
  },
};
