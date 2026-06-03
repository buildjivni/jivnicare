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
    // Doctor Login (using the credentials that worked)
    const docLogin = await request('http://localhost:3000/api/auth/doctor-login', 'POST', {
        phone: '8888888882',
        password: 'AuditPassword123!'
    });
    console.log('Doctor Login:', docLogin.status);
    
    if (docLogin.status === 200) {
        const queue = await request('http://localhost:3000/api/doctor/queue', 'GET', null, docLogin.setCookie);
        console.log('Doctor Queue Fetch:', queue.status);
        if (queue.data.queueId) {
            console.log('Calling Next Patient...');
            const nextP = await request('http://localhost:3000/api/doctor/queue/next', 'POST', {
                skipCurrent: false
            }, docLogin.setCookie);
            console.log('Next Patient:', nextP.status, nextP.data.message || nextP.data.error);

            console.log('Undoing...');
            const undo = await request('http://localhost:3000/api/doctor/queue/undo', 'POST', {
                queueId: queue.data.queueId
            }, docLogin.setCookie);
            console.log('Undo Action:', undo.status, undo.data.message || undo.data.error);
        } else {
             console.log('Queue Data:', queue.data);
        }
    }
}
runAudit();
