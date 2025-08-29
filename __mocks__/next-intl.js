const React = require('react');

module.exports = {
  useTranslations: () => (ns) => (key) => `${ns ? ns + '.' : ''}${key}`,
  NextIntlClientProvider: ({ children }) => React.createElement(React.Fragment, null, children),
  // Server helpers mocked minimally
  getTranslations: async () => (key) => key,
  getMessages: async () => ({}),
  getRequestConfig: () => () => ({}),
};


