/**
 * Full VaiClaw Auth + Integrations Test
 * Phát hiện: VPS backend dùng format response khác code local.
 * Test flow: register → login với slug → lấy token → test /integrations
 */

const BASE = 'https://vaiclaw.vaimix.com/api';
const TS = Date.now();
const EMAIL = `debug_${TS}@vaimix.com`;
const PASSWORD = 'Debug@12345';

function log(label, data) {
    console.log(`\n${'═'.repeat(55)}`);
    console.log(`  ${label}`);
    console.log('═'.repeat(55));
    if (typeof data === 'object') {
        console.log(JSON.stringify(data, null, 2));
    } else {
        console.log(data);
    }
}

async function post(url, body, headers = {}) {
    const res = await fetch(BASE + url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:4200', ...headers },
        body: JSON.stringify(body),
    });
    const text = await res.text();
    let json; try { json = JSON.parse(text); } catch { json = text; }
    return { status: res.status, headers: res.headers, body: json };
}

async function get(url, token) {
    const res = await fetch(BASE + url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'auth': token,
            'Origin': 'http://localhost:4200',
        }
    });
    const text = await res.text();
    let json; try { json = JSON.parse(text); } catch { json = text; }
    return { status: res.status, body: json };
}

async function run() {
    console.log('Backend:', BASE);
    console.log('Test email:', EMAIL);

    // ── 1. Register ──
    log('1. POST /auth/register', { email: EMAIL, password: PASSWORD });
    const reg = await post('/auth/register', {
        email: EMAIL, password: PASSWORD,
        company: 'VaiMix Test', name: 'Debug User',
        tenant_name: 'VaiMix Test'
    });
    log('Register Response', reg.body);
    console.log('Status:', reg.status);
    console.log('Header auth:', reg.headers.get('auth'));
    console.log('Header set-cookie:', reg.headers.get('set-cookie'));

    // Extract token từ register (nếu có)
    let token = reg.body?.token
        || reg.body?.access_token
        || reg.body?.data?.token
        || reg.headers.get('auth');

    // ── 2. Login ngay sau register ──
    if (!token) {
        log('2. POST /auth/login', { email: EMAIL });
        const login = await post('/auth/login', { email: EMAIL, password: PASSWORD });
        log('Login Response', login.body);
        console.log('Status:', login.status);
        console.log('Header auth:', login.headers.get('auth'));

        token = login.body?.token
            || login.body?.access_token
            || login.body?.data?.token
            || login.body?.data?.access_token
            || login.headers.get('auth');

        const sc = login.headers.get('set-cookie') || '';
        const cm = sc.match(/auth=([^;]+)/);
        if (cm) token = cm[1];
    }

    // ── 3. Thử login VaiClaw native endpoint ──
    if (!token) {
        log('3. POST /v1/platform/login', {});
        const loginV1 = await post('/v1/platform/login', { email: EMAIL, password: PASSWORD });
        log('Login V1 Response', loginV1.body);
        token = loginV1.body?.data?.access_token || loginV1.body?.data?.token;
    }

    if (!token) {
        log('❌ KHÔNG LẤY ĐƯỢC TOKEN', 'Xem response ở trên để debug thêm');

        // Kiểm tra format /auth/register trên VPS (đọc slug từ trước)
        log('4. Thử login với format slug-based', {});
        const slug = reg.body?.slug || reg.body?.data?.slug;
        if (slug) {
            console.log('Slug từ register:', slug);
            const loginWithSlug = await post('/auth/login', {
                email: EMAIL, password: PASSWORD, slug
            });
            log('Login with slug Response', loginWithSlug.body);
        }
        return;
    }

    log(`✅ Token: ${token.substring(0, 60)}...`, '');

    // ── 4. GET /integrations ──
    log('4. GET /integrations', '');
    const integrations = await get('/integrations', token);
    console.log('Status:', integrations.status);
    log('Integrations Response', integrations.body);

    // ── 5. GET /integrations/list ──
    log('5. GET /integrations/list', '');
    const list = await get('/integrations/list', token);
    console.log('Status:', list.status);
    log('Integrations List Response', list.body);

    // ── 6. GET /user/self ──
    log('6. GET /user/self', '');
    const user = await get('/user/self', token);
    console.log('Status:', user.status);
    log('User Self Response', user.body);
}

run().catch(console.error);
