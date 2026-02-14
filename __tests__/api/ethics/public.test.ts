/**
 * @jest-environment node
 *
 * @fileoverview Tests for Public Ethics API
 * @see BLOCK9.4_PUBLIC_ETHICS_API.md
 */

import { NextRequest } from 'next/server';

import { GET, OPTIONS } from '@/app/api/ethics/public/route';

describe('/api/ethics/public', () => {
  describe('GET', () => {
    it('should return ethics data with correct structure', async () => {
      const request = new NextRequest('http://localhost:3000/api/ethics/public');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('ledger_summary');
      expect(data).toHaveProperty('consent_stats');
      expect(data).toHaveProperty('eii_score');
      expect(data).toHaveProperty('verification_url');
      expect(data).toHaveProperty('version');
    });

    it('should include privacy notice', async () => {
      const request = new NextRequest('http://localhost:3000/api/ethics/public');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('privacy_notice');
      expect(data.privacy_notice).toContain('aggregated');
    });

    it('should include compliance baseline', async () => {
      const request = new NextRequest('http://localhost:3000/api/ethics/public');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('compliance_baseline');
      expect(data.compliance_baseline).toHaveProperty('blocks');
      expect(data.compliance_baseline.blocks).toContain('9.4');
    });

    it('should set correct CORS headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/ethics/public');
      const response = await GET(request);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });

    it('should set cache headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/ethics/public');
      const response = await GET(request);

      expect(response.headers.get('Cache-Control')).toContain('max-age=300');
    });
  });

  describe('OPTIONS', () => {
    it('should handle CORS preflight', async () => {
      const response = await OPTIONS();

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const request = new NextRequest('http://localhost:3000/api/ethics/public', {
        headers: { 'x-forwarded-for': '192.168.1.100' },
      });

      // Make multiple requests
      const responses = [];
      for (let i = 0; i < 65; i++) {
        responses.push(await GET(request));
      }

      // At least one should be rate limited
      const rateLimited = responses.some((r) => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });
});
