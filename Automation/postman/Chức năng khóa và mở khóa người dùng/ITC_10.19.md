# ITC_10.19 - Runner tong hop ITC_10.19 den ITC_10.36 (Data-Driven)

## Muc tieu
Dung 1 request lock/unlock + 1 file CSV de chay toan bo test case ITC_10.19 -> ITC_10.36 trong Collection Runner.

## Pham vi
- Happy path: lock/unlock staff, owner, systemadmin
- Login check sau lock/unlock
- Negative: invalid userId, not found, auth khong du quyen
- Idempotency + input rong/whitespace

---

## Cau hinh request
- Method: POST
- URL: {{base_url}}/api/users/{{target_user_id}}/{{lock_action}}
- Authorization: Bearer {{auth_token_dynamic}}
- Body: none

Ghi chu quan trong:
- lock_action se la `lock` hoac `unlock` (set tu CSV)
- Authorization duoc script tu dong set theo CSV

---

## File CSV su dung
- ITC_10.19.csv

Cot CSV:
- tc_id
- description
- action
- user_id
- auth_token
- email
- password
- expected_status
- expected_text_contains
- run_login_check
- expected_login_ok
- expected_login_fail

---

## Token dac biet trong CSV

**UserId**
- <STAFF_ID> -> env: staff_id (fallback: staffId)
- <OWNER_ID> -> env: owner_id (fallback: ownerId)
- <ADMIN_ID> -> env: admin_id (fallback: adminId)
- <INVALID_GUID> -> "not-a-guid"
- <EMPTY> -> ""
- <WS> -> chuoi khoang trang

**Auth token**
- <SYSADMIN_TOKEN> -> env: sysadmin_token (fallback: token)
- <OWNER_TOKEN> -> env: owner_token
- <STAFF_TOKEN> -> env: staff_token
- <INVALID_TOKEN> -> "invalid.token.value"
- <MISSING> -> bo header Authorization
- <EMPTY> -> header "Bearer "

**Login credential**
- <STAFF_EMAIL> -> env: staff_email (fallback: staffEmail)
- <OWNER_EMAIL> -> env: owner_email (fallback: ownerEmail)
- <ADMIN_EMAIL> -> env: admin_email (fallback: adminEmail)
- <STAFF_PASSWORD> -> env: staff_password (fallback: staffPassword)
- <OWNER_PASSWORD> -> env: owner_password (fallback: ownerPassword)
- <ADMIN_PASSWORD> -> env: admin_password (fallback: adminPassword)

---

## 00_SETUP (tu dong tao user va set bien) - chay 1 lan truoc Runner

**Muc dich:** Tu dong tao SystemAdmin test (khong dung admin seed), Owner + Staff, lay SystemAdmin token, va tu set cac bien:
`sysadmin_token`, `admin_id`, `owner_id`, `staff_id`, `owner_email`, `owner_password`, `staff_email`, `staff_password`, `admin_email`, `admin_password`.
Admin seed chi dung de login lay token, dung 2 bien:
`seed_admin_email`, `seed_admin_password` (mac dinh: admin@s2o.com / Admin@123).

**Cach dung:** Tao 1 request moi ten `00_SETUP_AutoSeed` (bat ky method), dat Tests script ben duoi. Chay 1 lan truoc khi chay Runner.

```javascript
pm.test('AUTO SETUP (seed users)', function (done) {
  const baseUrl = pm.environment.get('base_url');
  if (!baseUrl) {
    pm.expect.fail('Missing base_url in environment.');
    done();
    return;
  }

  const now = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  const seedAdminEmail = pm.environment.get('seed_admin_email') || 'admin@s2o.com';
  const seedAdminPassword = pm.environment.get('seed_admin_password') || 'Admin@123';
  pm.environment.set('seed_admin_email', seedAdminEmail);
  pm.environment.set('seed_admin_password', seedAdminPassword);

  function login(email, password, cb) {
    pm.sendRequest({
      url: baseUrl + '/api/v1/auth/login',
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      body: { mode: 'raw', raw: JSON.stringify({ email: email, password: password }) }
    }, function (err, res) {
      if (err || !res) return cb('Login failed: ' + (err ? err.message : 'no response'));
      let json = null;
      try { json = res.json(); } catch (e) {}
      const token = json ? (json.accessToken || json.token || '') : '';
      if (!token) return cb('Login token empty for ' + email);
      cb(null, token);
    });
  }

  function getUsers(sysToken, keyword, cb) {
    if (typeof keyword === 'function') {
      cb = keyword;
      keyword = '';
    }
    const query = keyword ? ('&keyword=' + encodeURIComponent(keyword)) : '';
    pm.sendRequest({
      url: baseUrl + '/api/users?page=1&size=200' + query,
      method: 'GET',
      header: { Authorization: 'Bearer ' + sysToken }
    }, function (err, res) {
      if (err || !res) return cb('GetUsers failed: ' + (err ? err.message : 'no response'));
      if (res.code !== 200) return cb('GetUsers failed. status=' + res.code + ', body=' + res.text());
      let json = null;
      try { json = res.json(); } catch (e) {}
      const items = (json && (json.Items || json.items || json.value)) || [];
      cb(null, items);
    });
  }

  function createSystemAdmin(sysToken, adminEmail, adminPassword, cb) {
    pm.sendRequest({
      url: baseUrl + '/api/users',
      method: 'POST',
      header: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + sysToken },
      body: { mode: 'raw', raw: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
        fullName: 'System Admin Auto ' + now,
        role: 'SystemAdmin',
        tenantId: null
      }) }
    }, function (err, res) {
      if (err || !res) return cb('Create SystemAdmin failed: ' + (err ? err.message : 'no response'));
      if (res.code !== 200) return cb('Create SystemAdmin failed. status=' + res.code + ', body=' + res.text());
      let json = null;
      try { json = res.json(); } catch (e) {}
      const adminId = json ? (json.UserId || json.userId || '') : '';
      if (!adminId) return cb('Create SystemAdmin success but UserId missing.');
      pm.environment.set('admin_id', adminId);
      pm.environment.set('admin_email', adminEmail);
      pm.environment.set('admin_password', adminPassword);
      cb(null, adminId);
    });
  }

  function ensureSysAdminToken(cb) {
    login(seedAdminEmail, seedAdminPassword, function (err, token) {
      if (err) return cb(err);
      pm.environment.set('sysadmin_token', token);
      cb(null, token);
    });
  }

  function ensureAdminUser(sysToken, cb) {
    const adminEmailNew = `admin.auto.${now}.${random}@test.com`;
    const adminPasswordNew = 'Admin@123';

    createSystemAdmin(sysToken, adminEmailNew, adminPasswordNew, function (err, newAdminId) {
      if (!err) return cb(null, newAdminId);
      getUsers(sysToken, adminEmailNew, function (err2, items) {
        if (err2) return cb(err + ' | ' + err2);
        const adminUser = items.find(u => (u.Email || u.email || '').toLowerCase() === adminEmailNew.toLowerCase());
        const adminIdFound = adminUser ? (adminUser.Id || adminUser.id || '') : '';
        if (!adminIdFound) return cb(err);
        pm.environment.set('admin_id', adminIdFound);
        pm.environment.set('admin_email', adminEmailNew);
        pm.environment.set('admin_password', adminPasswordNew);
        cb(null, adminIdFound);
      });
    });
  }

  function ensureOwner(sysToken, cb) {
    const ownerEmail = `owner.auto.${now}.${random}@test.com`;
    const ownerPassword = 'ValidPass123!';
    const ownerName = 'Owner Auto ' + now;
    const restaurantName = 'Auto Restaurant ' + now;

    pm.sendRequest({
      url: baseUrl + '/api/v1/tenants/registration',
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      body: { mode: 'raw', raw: JSON.stringify({
        restaurantName: restaurantName,
        ownerName: ownerName,
        email: ownerEmail,
        password: ownerPassword,
        address: '123 Auto Street',
        phoneNumber: '0901234567',
        planType: 'Free'
      }) }
    }, function (err, res) {
      if (err || !res) return cb('Register tenant failed: ' + (err ? err.message : 'no response'));

      pm.environment.set('owner_email', ownerEmail);
      pm.environment.set('owner_password', ownerPassword);

      login(ownerEmail, ownerPassword, function (err2, ownerToken) {
        if (err2) return cb(err2);
        pm.environment.set('owner_token', ownerToken);

        getUsers(sysToken, ownerEmail, function (err3, items) {
          if (err3) return cb(err3);
          const ownerUser = items.find(u => (u.Email || u.email || '').toLowerCase() === ownerEmail.toLowerCase());
          const ownerId = ownerUser ? (ownerUser.Id || ownerUser.id || '') : '';
          if (!ownerUser || !ownerId) return cb('Owner user not found after registration.');
          pm.environment.set('owner_id', ownerId);
          cb(null);
        });
      });
    });
  }

  function ensureStaff(cb) {
    const ownerToken = pm.environment.get('owner_token');
    if (!ownerToken) return cb('Owner token missing; cannot create Staff.');

    const staffEmail = `staff.auto.${now}.${random}@test.com`;
    const staffPassword = 'ValidPass123!';
    const staffName = 'Staff Auto ' + now;

    pm.sendRequest({
      url: baseUrl + '/api/users',
      method: 'POST',
      header: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + ownerToken },
      body: { mode: 'raw', raw: JSON.stringify({
        email: staffEmail,
        password: staffPassword,
        fullName: staffName,
        role: 'Staff',
        tenantId: null
      }) }
    }, function (err, res) {
      if (err || !res) return cb('Create staff failed: ' + (err ? err.message : 'no response'));
      let json = null;
      try { json = res.json(); } catch (e) {}
      const userId = json ? (json.UserId || json.userId) : '';
      if (!userId) return cb('Create staff success but UserId missing.');

      pm.environment.set('staff_id', userId);
      pm.environment.set('staff_email', staffEmail);
      pm.environment.set('staff_password', staffPassword);
      cb(null);
    });
  }

  ensureSysAdminToken(function (err, sysToken) {
    if (err) { pm.expect.fail(err); done(); return; }
    ensureAdminUser(sysToken, function (err2) {
      if (err2) { pm.expect.fail(err2); done(); return; }
      ensureOwner(sysToken, function (err3) {
        if (err3) { pm.expect.fail(err3); done(); return; }
        ensureStaff(function (err4) {
          if (err4) { pm.expect.fail(err4); done(); return; }
          console.log('AUTO SETUP DONE');
          done();
        });
      });
    });
  });
});
```

---

## Pre-request Script

```javascript
function mapToken(raw, type) {
  const value = raw === undefined || raw === null ? '' : String(raw);

  if (value === '<EMPTY>') return '';
  if (value === '<WS>') return '     ';
  if (value === '<INVALID_GUID>') return 'not-a-guid';

  if (value === '<STAFF_ID>') return pm.environment.get('staff_id') || pm.environment.get('staffId') || '';
  if (value === '<OWNER_ID>') return pm.environment.get('owner_id') || pm.environment.get('ownerId') || '';
  if (value === '<ADMIN_ID>') return pm.environment.get('admin_id') || pm.environment.get('adminId') || '';

  if (value === '<SYSADMIN_TOKEN>') return pm.environment.get('sysadmin_token') || pm.environment.get('token') || '';
  if (value === '<OWNER_TOKEN>') return pm.environment.get('owner_token') || '';
  if (value === '<STAFF_TOKEN>') return pm.environment.get('staff_token') || '';
  if (value === '<INVALID_TOKEN>') return 'invalid.token.value';

  if (value === '<STAFF_EMAIL>') return pm.environment.get('staff_email') || pm.environment.get('staffEmail') || '';
  if (value === '<OWNER_EMAIL>') return pm.environment.get('owner_email') || pm.environment.get('ownerEmail') || '';
  if (value === '<ADMIN_EMAIL>') return pm.environment.get('admin_email') || pm.environment.get('adminEmail') || '';
  if (value === '<STAFF_PASSWORD>') return pm.environment.get('staff_password') || pm.environment.get('staffPassword') || '';
  if (value === '<OWNER_PASSWORD>') return pm.environment.get('owner_password') || pm.environment.get('ownerPassword') || '';
  if (value === '<ADMIN_PASSWORD>') return pm.environment.get('admin_password') || pm.environment.get('adminPassword') || '';

  return value;
}

const tcId = pm.iterationData.get('tc_id') || 'UNKNOWN_TC';
const description = pm.iterationData.get('description') || '';
const actionRaw = pm.iterationData.get('action') || '';
const action = String(actionRaw).trim().toLowerCase();
const userIdRaw = pm.iterationData.get('user_id');
const authTokenRaw = pm.iterationData.get('auth_token');
const emailRaw = pm.iterationData.get('email');
const passwordRaw = pm.iterationData.get('password');

const userId = mapToken(userIdRaw, 'user_id');
const authToken = mapToken(authTokenRaw, 'auth_token');
const email = mapToken(emailRaw, 'email');
const password = mapToken(passwordRaw, 'password');

pm.variables.set('target_user_id', userId);
pm.variables.set('lock_action', action);
pm.variables.set('auth_token_dynamic', authToken);

pm.variables.set('itc_tc_id', tcId);
pm.variables.set('itc_description', description);
pm.variables.set('itc_action', action);
pm.variables.set('itc_user_id', userId);
pm.variables.set('itc_auth_token_raw', String(authTokenRaw || ''));
pm.variables.set('itc_email_current', String(email || ''));
pm.variables.set('itc_password_current', String(password || ''));

if (String(authTokenRaw || '') === '<MISSING>') {
  pm.request.headers.remove('Authorization');
} else {
  pm.request.headers.upsert({ key: 'Authorization', value: `Bearer ${authToken}` });
}

console.log('============================================================');
console.log('PRE-RUN REPORT');
console.log('TC ID          : ' + tcId);
console.log('Description    : ' + description);
console.log('Action         : ' + action);
console.log('User ID        : ' + userId);
console.log('Auth token raw : ' + (authTokenRaw || ''));
console.log('Request URL    : ' + (pm.environment.get('base_url') || '') + '/api/users/' + userId + '/' + action);
console.log('============================================================');
```

---

## Tests Script

```javascript
function toBoolean(value) {
  return String(value).toLowerCase() === 'true';
}

function parseExpectedStatus(raw) {
  return String(raw || '')
    .split('|')
    .map((x) => Number(String(x).trim()))
    .filter((x) => !Number.isNaN(x));
}

function safeParseResponse() {
  const text = pm.response.text();
  if (!text || !text.trim()) return null;
  try {
    return pm.response.json();
  } catch (e) {
    return text;
  }
}

function extractErrorText(response) {
  if (response === null || response === undefined) return '';
  if (typeof response === 'string') return response;
  if (response.message) return String(response.message);
  if (response.error) return String(response.error);
  if (response.errors) return JSON.stringify(response.errors);
  return JSON.stringify(response);
}

function normalizeTextForCompare(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();
}

const tcId = pm.iterationData.get('tc_id') || 'UNKNOWN_TC';
const description = pm.iterationData.get('description') || '';
const expectedStatuses = parseExpectedStatus(pm.iterationData.get('expected_status'));
const expectedTextContains = normalizeTextForCompare(pm.iterationData.get('expected_text_contains') || '');
const runLoginCheck = toBoolean(pm.iterationData.get('run_login_check'));
const loginOkStatuses = parseExpectedStatus(pm.iterationData.get('expected_login_ok'));
const loginFailStatuses = parseExpectedStatus(pm.iterationData.get('expected_login_fail'));

const response = safeParseResponse();
const responseText = pm.response.text();
const errorText = extractErrorText(response);
const responseTextNormalized = normalizeTextForCompare(responseText);
const errorTextNormalized = normalizeTextForCompare(errorText);

const statusPass = expectedStatuses.includes(pm.response.code);
const textPass = expectedTextContains
  ? (responseTextNormalized.includes(expectedTextContains) || errorTextNormalized.includes(expectedTextContains))
  : true;

pm.test(tcId + ': status code match expected list', function () {
  pm.expect(statusPass, 'Expected statuses: ' + expectedStatuses.join('|') + ', actual: ' + pm.response.code).to.eql(true);
});

pm.test(tcId + ': expected text contains', function () {
  pm.expect(textPass, 'expected_text_contains=' + expectedTextContains + ', actual_text=' + responseText).to.eql(true);
});

function printFinalReport(finalResult, extra) {
  console.log('============================================================');
  console.log('POST-RUN REPORT');
  console.log('TC ID                : ' + tcId);
  console.log('Description          : ' + description);
  console.log('Expected status list : ' + expectedStatuses.join('|'));
  console.log('Actual status        : ' + pm.response.code);
  console.log('Status check         : ' + (statusPass ? 'PASS' : 'FAIL'));
  console.log('Expected text token  : ' + (expectedTextContains || '(none)'));
  console.log('Text check           : ' + (textPass ? 'PASS' : 'FAIL'));
  console.log('Final case result    : ' + finalResult);
  console.log('Response text        : ' + responseText);
  console.log('Request URL          : ' + (pm.environment.get('base_url') || '') + '/api/users/' + (pm.variables.get('itc_user_id') || '') + '/' + (pm.variables.get('itc_action') || ''));
  console.log('Auth token raw       : ' + (pm.variables.get('itc_auth_token_raw') || '(none)'));
  console.log('Email used           : ' + (pm.variables.get('itc_email_current') || '(none)'));
  if (extra) console.log('Integration detail   : ' + extra);
  console.log('Timestamp            : ' + new Date().toISOString());
  console.log('============================================================');
}

if (!runLoginCheck) {
  const finalResult = statusPass && textPass ? 'PASS' : 'FAIL';
  printFinalReport(finalResult, 'No login check for this case.');
} else {
  const baseUrl = pm.environment.get('base_url');
  const loginUrl = baseUrl + '/api/v1/auth/login';
  const email = pm.variables.get('itc_email_current');
  const correctPassword = pm.variables.get('itc_password_current');
  const wrongPassword = 'WrongPassword123';

  pm.test(tcId + ': login integration (correct and wrong password)', function (done) {
    const reqOk = {
      url: loginUrl,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      body: {
        mode: 'raw',
        raw: JSON.stringify({ email: email, password: correctPassword })
      }
    };

    pm.sendRequest(reqOk, function (err1, resOk) {
      if (err1 || !resOk) {
        pm.expect.fail('Login success call failed: ' + (err1 ? err1.message : 'no response'));
        done();
        return;
      }

      const okStatus = resOk.code;
      let okJson = null;
      try { okJson = resOk.json(); } catch (e) {}
      const token = okJson ? (okJson.accessToken || okJson.token || '') : '';
      const loginOkPass = loginOkStatuses.includes(okStatus) && (loginOkStatuses[0] !== 200 || token.split('.').length === 3);

      const reqFail = {
        url: loginUrl,
        method: 'POST',
        header: { 'Content-Type': 'application/json' },
        body: {
          mode: 'raw',
          raw: JSON.stringify({ email: email, password: wrongPassword })
        }
      };

      pm.sendRequest(reqFail, function (err2, resFail) {
        if (err2 || !resFail) {
          pm.expect.fail('Login fail call failed: ' + (err2 ? err2.message : 'no response'));
          done();
          return;
        }

        const failStatus = resFail.code;
        const loginFailPass = loginFailStatuses.includes(failStatus);

        pm.expect(loginOkPass, 'Login with correct password failed. status=' + okStatus).to.eql(true);
        pm.expect(loginFailPass, 'Login with wrong password did not fail as expected. status=' + failStatus).to.eql(true);

        const finalResult = statusPass && textPass && loginOkPass && loginFailPass ? 'PASS' : 'FAIL';
        const extra = 'login_ok_status=' + okStatus + ', login_fail_status=' + failStatus;
        printFinalReport(finalResult, extra);
        done();
      });
    });
  });
}
```

---

## Huong dan chay runner
1. (Optional) Chay request `00_SETUP_AutoSeed` de tu dong tao user va set bien.
2. Mo request Lock/Unlock User va dat URL = {{base_url}}/api/users/{{target_user_id}}/{{lock_action}}.
3. Dat Authorization = Bearer {{auth_token_dynamic}}.
4. Nap file ITC_10.19.csv trong Collection Runner.
5. Chay 1 lan de cover ITC_10.19 -> ITC_10.36.

