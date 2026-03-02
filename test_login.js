/**
 * Test script: kiểm tra API /auth/login và /integrations từ local.
 * Backend URL: https://vaiclaw.vaimix.com/api
 * 
 * NOT_SECURED=true → frontend đọc token từ cookie `auth=<token>`
 * Sau khi login, set cookie và thử gọi /integrations với cả 2 cách:
 *   1. Header Authorization: Bearer <token>
 *   2. Header auth: <token> (non-secured cookie mode)
 */

const BASE = 'https://vaiclaw.vaimix.com/api';

// === CẬP NHẬT credentials của bạn tại đây ===
const email = 'vaimix@gmail.com';
const password = '12345678';
// =============================================

async function testApi() {
    console.log('=== 1. Login ===');
    const loginRes = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:4200'
        },
        body: JSON.stringify({ email, password })
    });

    const loginData = await loginRes.json();
    console.log('Status:', loginRes.status);
    console.log('Response:', JSON.stringify(loginData, null, 2));

    // Extract token từ response body hoặc response headers
    const token = loginData.access_token || loginData.token;
    const authHeader = loginRes.headers.get('auth') || loginRes.headers.get('Auth');
    const setCookieHeader = loginRes.headers.get('set-cookie');

    console.log('\n--- Response Headers ---');
    console.log('auth header:', authHeader);
    console.log('set-cookie:', setCookieHeader);

    const cookieToken = setCookieHeader
        ? (setCookieHeader.match(/auth=([^;]+)/) || [])[1]
        : null;

    const effectiveToken = token || authHeader || cookieToken;

    if (!effectiveToken) {
        console.log('\n❌ Không lấy được token. Dừng test.');
        console.log('Tip: Kiểm tra lại email/password hoặc thử đăng ký tài khoản mới.');
        return;
    }

    console.log(`\n✅ Token: ${effectiveToken.substring(0, 40)}...`);

    // === 2. Test /integrations (danh sách tích hợp có thể kết nối) ===
    console.log('\n=== 2. GET /integrations (loại kênh khả dụng) ===');
    const integrationsRes = await fetch(`${BASE}/integrations`, {
        headers: {
            'Authorization': `Bearer ${effectiveToken}`,
            'auth': effectiveToken,
            'Origin': 'http://localhost:4200'
        }
    });
    console.log('Status:', integrationsRes.status);
    const intData = await integrationsRes.json();
    console.log('Response (social count):', (intData.social || []).length, 'platforms');
    console.log('Social platforms:', (intData.social || []).map(s => s.identifier).join(', '));

    // === 3. Test /integrations/list (danh sách kênh đã kết nối) ===
    console.log('\n=== 3. GET /integrations/list (kênh đã kết nối) ===');
    const listRes = await fetch(`${BASE}/integrations/list`, {
        headers: {
            'Authorization': `Bearer ${effectiveToken}`,
            'auth': effectiveToken,
            'Origin': 'http://localhost:4200'
        }
    });
    console.log('Status:', listRes.status);
    const listData = await listRes.json();
    console.log('Response:', JSON.stringify(listData, null, 2));
}

testApi().catch(console.error);
