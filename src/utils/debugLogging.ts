/**
 * Debug logging utility for internationalization
 */

// Set to true to enable debug logging
const DEBUG_ENABLED = process.env.NODE_ENV === 'development';

export const logDebug = (source: string, message: string, data?: any) => {
  if (!DEBUG_ENABLED) return;
  
  const timestamp = new Date().toISOString();
  const prefix = `[i18n:${source}]`;
  
  if (data) {
    console.log(`${timestamp} ${prefix} ${message}`, data);
  } else {
    console.log(`${timestamp} ${prefix} ${message}`);
  }
};

export const logRedirect = (from: string, to: string, reason: string) => {
  logDebug('redirect', `${from} → ${to} (${reason})`);
};

export const logLocaleDetection = (
  detectedLocale: string, 
  source: 'url' | 'cookie' | 'header' | 'default',
  request?: Request
) => {
  logDebug('detection', `Detected locale: ${detectedLocale} (source: ${source})`, 
    request ? { url: request.url } : undefined
  );
}; 