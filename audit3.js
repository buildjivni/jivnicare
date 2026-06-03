const http = require('http');
async function request(url, method = 'GET', body = null, cookie = null) {
    const options = { method, headers: {} };
    if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }
    if (cookie) options.headers['Cookie'] = cookie;
    const res = await fetch(url, options);
    const cookies = res.headers.get('set-cookie');
    const text = await res.text();
    let data; try { data = JSON.parse(text); } catch(e) { data = text; }
    return { status: res.status, data, setCookie: cookies };
}
async function runAudit() {
    console.log('--- STARTING FLOWS AUDIT 2 ---');
    
    // Patient
    const patVerify = await request('http://localhost:3000/api/auth/verify-otp', 'POST', { phone: '9999999999', otp: '123456', sessionId: 'test_session_9999999999' });
    console.log('Patient Login:', patVerify.status === 200 ? 'PASS' : 'FAIL');
    
    // Search Doctor
    const search = await request('http://localhost:3000/api/public/search?q=');
    const doctor = search.data.results[0];
    
    // Book Token
    const book = await request('http://localhost:3000/api/patient/book-appointment', 'POST', {
        doctorId: doctor.id,
        isEmergency: false,
        location: 'Patna'
    }, patVerify.setCookie);
    console.log('Book Token:', book.status === 200 ? 'PASS' : ('FAIL ' + book.status));

    // Doctor Login
    const docLogin = await request('http://localhost:3000/api/auth/doctor-login', 'POST', {
        phone: '8888888882',
        password: 'AuditPassword123!'
    });
    console.log('Doctor Login:', docLogin.status === 200 ? 'PASS' : 'FAIL');

    // Admin Login
    const adminLogin = await request('http://localhost:3000/api/auth/admin-login', 'POST', {
        email: 'admin@jivnicare.com',
        password: 'AdminPassword123!'
    });
    console.log('Admin Login:', adminLogin.status === 200 ? 'PASS' : ('FAIL ' + adminLogin.status));
    
    if (adminLogin.status === 200) {
        const stats = await request('http://localhost:3000/api/admin/stats', 'GET', null, adminLogin.setCookie);
        console.log('Admin Dashboard:', stats.status === 200 ? 'PASS' : ('FAIL ' + stats.status));
    }
}
runAudit();
