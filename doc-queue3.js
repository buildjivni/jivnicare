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
    const docLogin = await request('http://localhost:3000/api/auth/doctor-login', 'POST', { phone: '8888888882', password: 'AuditPassword123!' });
    const patVerify = await request('http://localhost:3000/api/auth/verify-otp', 'POST', { phone: '9999999999', otp: '123456', sessionId: 'test_session_9999999999' });

    const book = await request('http://localhost:3000/api/patient/book-appointment', 'POST', {
        doctorId: docLogin.data.user.doctorId,
        isEmergency: true,
        location: 'Patna'
    }, patVerify.setCookie);
    console.log('Book response:', book.status, book.data);
}
runAudit();
