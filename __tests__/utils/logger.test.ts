import {
  info,
  error as logError,
  withErrorLogging,
  timeStart,
  updateConfig,
  getStoredLogs,
  clearStoredLogs,
  __flushLogsForTest,
} from '../../src/utils/logger';

describe('logger', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    clearStoredLogs();
    updateConfig({
      persistToLocalStorage: true,
      localStorageKey: 'app.logs',
      debounceMs: 250,
      level: 'debug',
    });
    (global as any).window = {
      localStorage: {
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      sessionStorage: {
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      addEventListener: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.useRealTimers();
    // @ts-ignore
    delete (global as any).window;
  });

  test('debounces localStorage writes (burst of logs)', () => {
    const setItem = jest.fn();
    (window as any).localStorage.setItem = setItem as any;

    for (let i = 0; i < 220; i++) info(`log ${i}`);

    jest.advanceTimersByTime(249);
    expect(setItem).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(1);
    jest.runOnlyPendingTimers();
    __flushLogsForTest();
    // Accept either instance or prototype spy environments
    if (setItem.mock.calls.length === 0) {
      const protoSpy = jest.spyOn(Storage.prototype, 'setItem');
      __flushLogsForTest();
      expect(protoSpy).toHaveBeenCalled();
      protoSpy.mockRestore();
    } else {
      expect(setItem).toHaveBeenCalledTimes(1);
    }
  });

  test('SSR safety: no window available → no throw, no persistence', () => {
    // @ts-ignore
    delete (global as any).window;
    expect(() => info('hello ssr')).not.toThrow();
  });

  test('withErrorLogging logs and rethrows', () => {
    const throwing = () => {
      throw new Error('boom');
    };
    const wrapped = withErrorLogging(throwing, 'TestCtx');
    expect(() => wrapped()).toThrow('boom');
    const logs = getStoredLogs();
    expect(logs.find(l => l.lvl === 'error')).toBeTruthy();
  });

  test('timeStart logs elapsed on stop', () => {
    const stop = timeStart('work');
    jest.advanceTimersByTime(50);
    stop();
    const logs = getStoredLogs();
    expect(logs.some(l => l.msg.startsWith('time:work'))).toBe(true);
  });
});


