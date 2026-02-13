module.exports = {
  ci: {
    collect: {
      numberOfRuns: 2,
      startServerCommand: 'next start -p 3000',
      url: ['http://localhost:3000'],
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
