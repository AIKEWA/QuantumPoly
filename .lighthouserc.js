// Detect mode from environment
const mode = process.env.LHCI_MODE || 'local_server';
const previewUrl = process.env.PREVIEW_URL;

// Validate external_url mode has required URL
if (mode === 'external_url' && !previewUrl) {
  throw new Error('LHCI_MODE=external_url requires PREVIEW_URL to be set');
}

// Normalize URL (remove trailing slash for consistency)
const normalizeUrl = (url) => url?.replace(/\/+$/, '');

module.exports = {
  ci: {
    collect: {
      numberOfRuns: 2,
      // Only start server in local mode
      ...(mode === 'local_server' && {
        startServerCommand: 'next start -p 3000',
      }),
      // URL source depends on mode
      url: mode === 'external_url'
        ? [normalizeUrl(previewUrl)]
        : ['http://localhost:3000'],
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
