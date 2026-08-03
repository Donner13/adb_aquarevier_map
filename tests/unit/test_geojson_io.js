const { test, expect } = require('@playwright/test');

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

  test('rejects payload larger than 10MB', async ({ request }) => {
    // Generate a payload just over 10MB to trigger the limit
    const largeData = 'a'.repeat(10 * 1024 * 1024 + 10);

    // Send the large payload without swallowing network errors;
    // node's built-in fetch underlying Playwright API might raise EPIPE
    // if the server simply aborts the connection upon observing Content-Length.
    // The server *should* ideally send a 413 response.
    try {
      const response = await request.post('/api/contacts', {
        data: largeData,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      // If it doesn't throw EPIPE, verify the actual server response
      expect(response.status()).toBe(413);
      const body = await response.json();
      expect(body.status).toBe('error');
      expect(typeof body.message).toBe('string');
      expect(body.message.length).toBeGreaterThan(0);
    } catch (err) {
      // If the server abruptly closes the connection for an oversized payload before we read 413,
      // (a known behavior of python's BaseHTTPRequestHandler on large unread bodies),
      // we can consider the rejection successful.
      const isConnectionClosed = err.message.includes('EPIPE') || err.message.includes('ECONNRESET');
      expect(isConnectionClosed).toBe(true);
    }
  });
});
