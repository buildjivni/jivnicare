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
    const docLogin = await request('http://localhost:3000/api/auth/doctor-login', 'POST', {
        phone: '8888888882',
        password: 'AuditPassword123!'
    });
    
    // Patient Login
    const patVerify = await request('http://localhost:3000/api/auth/verify-otp', 'POST', { phone: '9999999999', otp: '123456', sessionId: 'test_session_9999999999' });

    // Book as patient for this specific doctor
    const book = await request('http://localhost:3000/api/patient/book-appointment', 'POST', {
        doctorId: docLogin.data.user.doctorId,
        isEmergency: true,
        location: 'Patna'
    }, patVerify.setCookie);
    
    const queue = await request('http://localhost:3000/api/doctor/queue', 'GET', null, docLogin.setCookie);
    console.log('Doctor Queue Tokens:', queue.data.tokens?.length);

    console.log('Calling Next Patient...');
    const nextP = await request('http://localhost:3000/api/doctor/queue/next', 'POST', {
        skipCurrent: false
    }, docLogin.setCookie);
    console.log('Next Patient:', nextP.status, nextP.data.message || nextP.data.error);

    console.log('Undoing...');
    const undo = await request('http://localhost:3000/api/doctor/queue/undo', 'POST', {
        queueId: queue.data.queue.id
    }, docLogin.setCookie);
    console.log('Undo Action:', undo.status, undo.data.message || undo.data.error);
    
    console.log('Marking No-show...');
    const ns = await request('http://localhost:3000/api/doctor/queue/no-show', 'POST', {
        tokenId: nextP.data.queue?.currentActiveToken ? queue.data.tokens[0].id : null,
        queueId: queue.data.queue.id
    }, docLogin.setCookie);
    console.log('No-show Action:', ns.status, ns.data.message || ns.data.error);
}
runAudit();
