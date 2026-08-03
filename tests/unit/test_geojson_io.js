const { test, expect } = require('@playwright/test');
const http = require('http');

test.describe('GeoJSON IO API - Malformed Payload Rejection', () => {
  test('rejects missing features property', async ({ request }) => {
    const response = await request.post('/api/contacts', {
      data: {
        type: 'FeatureCollection'
      }
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.status).toBe('error');
    // Ensure an error message exists without coupling to exact wording
    expect(typeof body.message).toBe('string');
    expect(body.message.length).toBeGreaterThan(0);
  });

  test('rejects features not being an array', async ({ request }) => {
    const response = await request.post('/api/contacts', {
      data: {
        type: 'FeatureCollection',
        features: {}
      }
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.status).toBe('error');
    expect(typeof body.message).toBe('string');
    expect(body.message.length).toBeGreaterThan(0);
  });

  test('rejects malformed json', async ({ request }) => {
    const response = await request.post('/api/contacts', {
      data: '{"type": "FeatureCollection", "features": [',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.status).toBe('error');
    expect(typeof body.message).toBe('string');
    expect(body.message.length).toBeGreaterThan(0);
  });

  test('rejects payload larger than 10MB', async ({ baseURL }) => {
    // Playwright's `request.post` masks EPIPE / server close as a generic connection error
    // instead of letting us read the 413 response if the server closes the connection abruptly.
    // By using raw Node `http`, we can send the headers and a huge content length,
    // and wait for the response without fully streaming the body if the server replies early.
    return new Promise((resolve, reject) => {
      const url = new URL(baseURL || 'http://localhost:8000');
      const req = http.request({
        hostname: url.hostname,
        port: url.port,
        path: '/api/contacts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': 10 * 1024 * 1024 + 10,
          // Need to supply auth if the server requires it
          'Authorization': 'Basic ' + Buffer.from('florian:AquaRevier2026').toString('base64')
        }
      }, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
          try {
            expect(res.statusCode).toBe(413);
            const body = JSON.parse(responseBody);
            expect(body.status).toBe('error');
            expect(typeof body.message).toBe('string');
            expect(body.message.length).toBeGreaterThan(0);
            resolve();
          } catch(e) {
            reject(e);
          }
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.write('{"type": "FeatureCollection", "features": [');

      // Wait briefly for early 413 response before trying to blast the rest
      setTimeout(() => {
          try {
              req.end();
          } catch(e) {} // ignore write after close
      }, 100);
    });
  });
});
