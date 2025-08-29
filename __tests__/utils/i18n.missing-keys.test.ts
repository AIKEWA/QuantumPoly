import { i18n } from '../../src/i18n/index';

describe('i18n missing keys policy', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  test('development warns on missing key', () => {
    process.env.NODE_ENV = 'development';
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const result = i18n.t('nonexistent.key');
    expect(warn).toHaveBeenCalled();
    expect(result).toBeUndefined();
    warn.mockRestore();
  });

  test('production throws on missing key', () => {
    process.env.NODE_ENV = 'production';
    expect(() => i18n.t('nonexistent.key')).toThrow(/Missing translation key/);
  });
});


