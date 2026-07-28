const http = require('http');
const { spawn } = require('child_process');
const assert = require('assert');

async function runBatch0Verification() {
    console.log('--- Starting Batch 0 Security Verification ---');

    // 1. Start server.py in background on port 8009 for testing
    const env = Object.assign({}, process.env, { PORT: '8009', EDITOR_USER: 'florian', EDITOR_PASSWORD: 'AquaRevier2026' });
    const serverProc = spawn('python', ['server.py'], {
        cwd: __dirname + '/..',
        env: env
    });

    serverProc.stdout.on('data', data => {});
    serverProc.stderr.on('data', data => {});

    // Wait 1.5s for server to start
    await new Promise(r => setTimeout(r, 1500));

    try {
        // Test 1: Unauthenticated request to /contacts.geojson must return 401
        const res1 = await makeRequest({ host: 'localhost', port: 8009, path: '/contacts.geojson', method: 'GET' });
        assert.strictEqual(res1.statusCode, 401, 'GET /contacts.geojson without auth must return 401');
        assert.ok(res1.headers['www-authenticate'], 'Must include WWW-Authenticate header');
        console.log('✓ Test 1 Passed: GET /contacts.geojson without auth returns 401');

        // Test 2: Unauthenticated POST /api/contacts must return 401
        const res2 = await makeRequest({ host: 'localhost', port: 8009, path: '/api/contacts', method: 'POST' }, JSON.stringify({}));
        assert.strictEqual(res2.statusCode, 401, 'POST /api/contacts without auth must return 401');
        console.log('✓ Test 2 Passed: POST /api/contacts without auth returns 401');

        // Test 3: Authenticated request to /contacts.geojson with valid Basic Auth
        const authHeader = 'Basic ' + Buffer.from('florian:AquaRevier2026').toString('base64');
        const res3 = await makeRequest({ host: 'localhost', port: 8009, path: '/contacts.geojson', method: 'GET', headers: { 'Authorization': authHeader } });
        assert.strictEqual(res3.statusCode, 200, 'GET /contacts.geojson with valid auth must return 200');
        console.log('✓ Test 3 Passed: Authenticated GET /contacts.geojson returns 200');

        // Test 4: Invalid payload to /api/contacts must return 400
        const res4 = await makeRequest({
            host: 'localhost', port: 8009, path: '/api/contacts', method: 'POST',
            headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
        }, JSON.stringify({ invalid: true }));
        assert.strictEqual(res4.statusCode, 400, 'POST /api/contacts with invalid schema must return 400');
        console.log('✓ Test 4 Passed: Invalid GeoJSON schema rejected with 400');

        console.log('\n=========================================');
        console.log('ALL BATCH 0 SECURITY TESTS PASSED PERFECTLY!');
        console.log('=========================================\n');
    } finally {
        serverProc.kill('SIGTERM');
    }
}

function makeRequest(options, body) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

runBatch0Verification().catch(err => {
    console.error('Verification failed:', err);
    process.exit(1);
});
