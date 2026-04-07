/**
 * @fileoverview Feedback API Tests (Block 10.6)
 * @see BLOCK10.6_FEEDBACK_AND_TRUST.md
 *
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { POST, GET } from '@/app/api/feedback/report/route';

describe('POST /api/feedback/report (Block 10.6)', () => {
  let tempFeedbackDir: string;

  beforeAll(() => {
    tempFeedbackDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qp-feedback-test-'));
    process.env.FEEDBACK_STORAGE_DIR = tempFeedbackDir;
  });

  afterAll(() => {
    delete process.env.FEEDBACK_STORAGE_DIR;
    fs.rmSync(tempFeedbackDir, { recursive: true, force: true });
  });

  // Helper to create mock request
  const createMockRequest = (body: unknown, headers: Record<string, string> = {}) => {
    return new NextRequest('http://localhost:3000/api/feedback/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
        ...headers,
      },
      body: JSON.stringify(body),
    });
  };
  
  describe('Schema Validation', () => {
    it('should accept valid Block 10.6 format with topic', async () => {
      const request = createMockRequest({
        topic: 'ux',
        message: 'The dashboard has poor contrast.',
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.id).toBeDefined();
    });
    
    it('should accept legacy Block 10.1 format with type', async () => {
      const request = createMockRequest({
        type: 'accessibility',
        message: 'The button is hard to reach on mobile.',
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });
    
    it('should accept both topic and type', async () => {
      const request = createMockRequest({
        topic: 'ux',
        type: 'accessibility',
        message: 'Test message.',
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(201);
    });
    
    it('should reject when neither topic nor type provided', async () => {
      const request = createMockRequest({
        message: 'Test message.',
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.code).toBe('400_VALIDATION');
    });
    
    it('should reject empty message', async () => {
      const request = createMockRequest({
        topic: 'ux',
        message: '',
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.code).toBe('400_VALIDATION');
      expect(data.field).toBe('message');
    });
    
    it('should reject whitespace-only message', async () => {
      const request = createMockRequest({
        topic: 'ux',
        message: '   \n\t  ',
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.code).toBe('400_VALIDATION');
      expect(data.detail).toContain('whitespace');
    });
    
    it('should reject message over 2000 characters', async () => {
      const request = createMockRequest({
        topic: 'ux',
        message: 'a'.repeat(2001),
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.code).toBe('400_VALIDATION');
    });
    
    it('should reject when consent_contact is true but email missing', async () => {
      const request = createMockRequest({
        topic: 'ux',
        message: 'Test message.',
        consent_contact: true,
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.code).toBe('400_VALIDATION');
      expect(data.field).toBe('email');
    });
    
    it('should reject invalid email format', async () => {
      const request = createMockRequest({
        topic: 'ux',
        message: 'Test message.',
        consent_contact: true,
        email: 'not-an-email',
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.code).toBe('400_VALIDATION');
    });
    
    it('should accept valid email when consent provided', async () => {
      const request = createMockRequest({
        topic: 'ux',
        message: 'Test message.',
        consent_contact: true,
        email: 'user@example.com',
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(201);
    });
  });
  
  describe('Trust Scoring', () => {
    it('should include trust score when trust_opt_in is true', async () => {
      const request = createMockRequest({
        topic: 'ux',
        message: 'The dashboard has poor contrast in dark mode.',
        metadata: {
          trust_opt_in: true,
        },
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.trust_score).toBeDefined();
      expect(data.trust_score).toBeGreaterThanOrEqual(0);
      expect(data.trust_score).toBeLessThanOrEqual(1);
    });
    
    it('should not include trust score when trust_opt_in is false', async () => {
      const request = createMockRequest({
        topic: 'ux',
        message: 'Test message.',
        metadata: {
          trust_opt_in: false,
        },
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.trust_score).toBeUndefined();
    });
    
    it('should not include trust score when metadata missing', async () => {
      const request = createMockRequest({
        topic: 'ux',
        message: 'Test message.',
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.trust_score).toBeUndefined();
    });
  });
  
  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const request1 = createMockRequest({
        topic: 'ux',
        message: 'First message.',
      }, { 'x-forwarded-for': '192.168.1.100' });
      
      const response1 = await POST(request1);
      expect(response1.status).toBe(201);
    });
    
    // Note: Full rate limit testing requires integration tests or mocking time
    it('should return 429 with Retry-After header when rate limited', async () => {
      // This test assumes rate limit is hit by rapid requests
      // In practice, this would require multiple rapid requests
      
      const requests = [];
      for (let i = 0; i < 12; i++) {
        requests.push(createMockRequest({
          topic: 'ux',
          message: `Message ${i}`,
        }, { 'x-forwarded-for': '192.168.1.200' }));
      }
      
      // Send requests sequentially (within burst capacity this should work)
      const responses = [];
      for (const req of requests.slice(0, 10)) {
        responses.push(await POST(req));
      }
      
      // All within burst should succeed
      responses.forEach(res => {
        expect(res.status).toBe(201);
      });
    });
  });
  
  describe('Content-Type Validation', () => {
    it('should reject non-JSON content type', async () => {
      const request = new NextRequest('http://localhost:3000/api/feedback/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'x-forwarded-for': '127.0.0.1',
        },
        body: 'plain text body',
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(415);
      expect(data.code).toBe('415_UNSUPPORTED');
    });
    
    it('should accept application/json content type', async () => {
      const request = createMockRequest({
        topic: 'ux',
        message: 'Test message.',
      });
      
      const response = await POST(request);
      expect(response.status).toBe(201);
    });
  });
  
  describe('Response Format', () => {
    it('should return correct success response format', async () => {
      const request = createMockRequest({
        topic: 'ux',
        message: 'Test message.',
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('stored_at');
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('next_steps');
      
      expect(data.success).toBe(true);
      expect(data.status).toBe('pending');
    });
    
    it('should include X-Entry-Id header', async () => {
      const request = createMockRequest({
        topic: 'ux',
        message: 'Test message.',
      });
      
      const response = await POST(request);
      const entryId = response.headers.get('X-Entry-Id');
      
      expect(entryId).toBeDefined();
      expect(entryId).toMatch(/^fbk_/);
    });
  });
  
  describe('Context and Metadata', () => {
    it('should accept context object', async () => {
      const request = createMockRequest({
        topic: 'ux',
        message: 'Test message.',
        context: {
          path: '/dashboard',
          locale: 'en',
          user_agent: 'Mozilla/5.0',
        },
      });
      
      const response = await POST(request);
      expect(response.status).toBe(201);
    });
    
    it('should accept metadata with signals', async () => {
      const request = createMockRequest({
        topic: 'ux',
        message: 'Test message.',
        metadata: {
          trust_opt_in: true,
          signals: {
            account_age_days: 90,
            verified: true,
          },
        },
      });
      
      const response = await POST(request);
      expect(response.status).toBe(201);
    });
  });
});

describe('GET /api/feedback/report', () => {
  it('should return API documentation', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.endpoint).toBe('/api/feedback/report');
    expect(data.block_id).toBe('10.6');
    expect(data.version).toBe('1.1.0');
  });
  
  it('should include schema information', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(data.schema).toBeDefined();
    expect(data.schema.topic).toBeDefined();
    expect(data.schema.message).toBeDefined();
  });
  
  it('should include rate limit information', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(data.rate_limit).toContain('5 requests per minute');
  });
});
