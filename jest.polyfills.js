const { TextEncoder, TextDecoder } = require('node:util');
const { ReadableStream, TransformStream } = require('node:stream/web');

if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder;
if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder;
if (typeof global.ReadableStream === 'undefined') global.ReadableStream = ReadableStream;
if (typeof global.TransformStream === 'undefined') global.TransformStream = TransformStream;

if (typeof global.fetch === 'undefined' && typeof globalThis.fetch !== 'undefined') {
  global.fetch = globalThis.fetch;
}

if (typeof global.Headers === 'undefined' && typeof globalThis.Headers !== 'undefined') {
  global.Headers = globalThis.Headers;
}

if (typeof global.Request === 'undefined' && typeof globalThis.Request !== 'undefined') {
  global.Request = globalThis.Request;
}

if (typeof global.Response === 'undefined' && typeof globalThis.Response !== 'undefined') {
  global.Response = globalThis.Response;
}

if (typeof global.Request === 'undefined') {
  try {
    const { fetch, Headers, Request, Response } = require('undici');
    global.fetch = fetch;
    global.Headers = Headers;
    global.Request = Request;
    global.Response = Response;
  } catch {
    try {
      const primitives = require('next/dist/compiled/@edge-runtime/primitives');
      global.fetch = primitives.fetch;
      global.Headers = primitives.Headers;
      global.Request = primitives.Request;
      global.Response = primitives.Response;
    } catch {
      // Leave globals as-is when neither source is available.
    }
  }
}
