# ITC_13.19 - Runner tong hop ITC_13.19 den ITC_13.34 (Data-Driven)

## Muc tieu
Dung 1 request Reset Password + 1 file CSV de chay toan bo test case ITC_13.19 -> ITC_13.34 trong Collection Runner.

## Pham vi
- Reset password staff/owner/systemadmin target
- Login old/new sau reset
- New password empty/too short/whitespace
- Not found/invalid userId
- Auth khong du quyen + missing/invalid token
- Contract response + response time

---

## Cau hinh request
- Method: PUT
- URL: {{base_url}}/api/users/{{target_user_id}}/reset-password
- Authorization: Bearer {{auth_token_dynamic}}
- Body: raw JSON string (vd: `"NewPassword@123"`)

**Luu y:** Script se tu dong chuyen request sang login khi `action=LOGIN_*`.

---

## File CSV su dung
- ITC_13.19.csv

Cot CSV:
- tc_id
- description
- action
- user_id
- auth_token
- email
- old_password
- new_password
- expected_status
- expected_text_contains
- expected_login_new
- max_response_time_ms

---

## Token dac biet trong CSV

**UserId**
- <STAFF_RESET_ID> -> env: staff_reset_id
- <STAFF_CONTRACT_ID> -> env: staff_contract_id
- <OWNER_ID> -> env: owner_id
- <ADMIN_TARGET_ID> -> env: admin_target_id
- <INVALID_GUID> -> "not-a-guid"
- <NOT_FOUND_ID> -> "00000000-0000-0000-0000-000000000000"
- <EMPTY> -> ""
- <WS> -> chuoi khoang trang

**Auth token**
- <SYSADMIN_TOKEN> -> env: sysadmin_token
- <STAFF_AUTHZ_TOKEN> -> env: staff_authz_token
- <INVALID_TOKEN> -> "invalid.token.value"
- <MISSING> -> bo header Authorization
- <EMPTY> -> header "Bearer "

**Login credential**
- <STAFF_RESET_EMAIL> -> env: staff_reset_email
- <STAFF_RESET_PASSWORD> -> env: staff_reset_password
- <STAFF_CONTRACT_PASSWORD> -> env: staff_contract_password
- <OWNER_EMAIL> -> env: owner_email
- <OWNER_PASSWORD> -> env: owner_password
- <ADMIN_TARGET_EMAIL> -> env: admin_target_email
- <ADMIN_TARGET_PASSWORD> -> env: admin_target_password

**New password**
- <STAFF_RESET_NEW_PASSWORD> -> env: staff_reset_new_password
- <OWNER_NEW_PASSWORD> -> env: owner_new_password
- <ADMIN_TARGET_NEW_PASSWORD> -> env: admin_target_new_password
- <STAFF_CONTRACT_NEW_PASSWORD> -> env: staff_contract_new_password
- <EMPTY> -> ""
- <WS> -> "     "
- <MISSING> -> khong gui body

---

## 00_SETUP (tu dong tao user va set bien) - chay 1 lan truoc Runner

**Muc dich:** Tao SystemAdmin target + Owner + Staff, lay token va set bien:
`sysadmin_token`, `admin_target_*`, `owner_*`, `staff_reset_*`, `staff_contract_*`, `staff_authz_*`, `staff_authz_token`.

**Bat buoc set:**
- `seed_admin_email`
- `seed_admin_password`

**Cach dung:** Tao request `00_SETUP_AutoSeed_ResetPassword` (bat ky method), dan script ben duoi vao **Tests**, chay 1 lan truoc Runner.

```javascript
pm.test('AUTO SETUP (seed users for reset password)', function (done) {
  const baseUrl = pm.environment.get('base_url');
  if (!baseUrl) {
    pm.expect.fail('Missing base_url in environment.');
    done();
    return;
  }

  const seedAdminEmail = pm.environment.get('seed_admin_email');
  const seedAdminPassword = pm.environment.get('seed_admin_password');
  if (!seedAdminEmail || !seedAdminPassword) {
    pm.expect.fail('Missing seed_admin_email/seed_admin_password (khong dung admin cung).');
    done();
    return;
  }

  const now = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

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

  function createSystemAdmin(sysToken, email, password, cb) {
    pm.sendRequest({
      url: baseUrl + '/api/users',
      method: 'POST',
      header: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + sysToken },
      body: { mode: 'raw', raw: JSON.stringify({
        email: email,
        password: password,
        fullName: 'System Admin Auto ' + now,
        role: 'SystemAdmin',
        tenantId: null
      }) }
    }, function (err, res) {
      if (err || !res) return cb('Create SystemAdmin failed: ' + (err ? err.message : 'no response'));
      if (res.code !== 200 && res.code !== 201) return cb('Create SystemAdmin failed. status=' + res.code + ', body=' + res.text());
      let json = null;
      try { json = res.json(); } catch (e) {}
      const adminId = json ? (json.UserId || json.userId || json.id || '') : '';
      if (!adminId) return cb('Create SystemAdmin success but UserId missing.');
      cb(null, adminId);
    });
  }

  function createOwner(sysToken, cb) {
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
      pm.environment.set('owner_new_password', 'OwnerNew123!');

      login(ownerEmail, ownerPassword, function (err2, ownerToken) {
        if (err2) return cb(err2);
        pm.environment.set('owner_token', ownerToken);
        getUsers(sysToken, ownerEmail, function (err3, items) {
          if (err3) return cb(err3);
          const ownerUser = items.find(u => (u.Email || u.email || '').toLowerCase() === ownerEmail.toLowerCase());
          const ownerIdFound = ownerUser ? (ownerUser.Id || ownerUser.id || '') : '';
          if (!ownerIdFound) return cb('Owner user not found after registration.');
          pm.environment.set('owner_id', ownerIdFound);
          cb(null);
        });
      });
    });
  }

  function createStaff(ownerToken, email, password, fullName, cb) {
    pm.sendRequest({
      url: baseUrl + '/api/users',
      method: 'POST',
      header: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + ownerToken },
      body: { mode: 'raw', raw: JSON.stringify({
        email: email,
        password: password,
        fullName: fullName,
        role: 'Staff',
        tenantId: null
      }) }
    }, function (err, res) {
      if (err || !res) return cb('Create staff failed: ' + (err ? err.message : 'no response'));
      if (res.code !== 200 && res.code !== 201) return cb('Create staff failed. status=' + res.code + ', body=' + res.text());
      let json = null;
      try { json = res.json(); } catch (e) {}
      const userId = json ? (json.UserId || json.userId || json.id || '') : '';
      if (!userId) return cb('Create staff success but UserId missing.');
      cb(null, userId);
    });
  }

  function runSteps(steps, cb) {
    let i = 0;
    function next(err) {
      if (err) return cb(err);
      if (i >= steps.length) return cb(null);
      const step = steps[i++];
      step(next);
    }
    next();
  }

  login(seedAdminEmail, seedAdminPassword, function (err, sysToken) {
    if (err) { pm.expect.fail(err); done(); return; }
    pm.environment.set('sysadmin_token', sysToken);

    const adminTargetEmail = `admin.reset.${now}.${random}@test.com`;
    const adminTargetPassword = 'Admin@123';

    runSteps([
      function (cb) {
        createSystemAdmin(sysToken, adminTargetEmail, adminTargetPassword, function (err2, id) {
          if (err2) return cb(err2);
          pm.environment.set('admin_target_id', id);
          pm.environment.set('admin_target_email', adminTargetEmail);
          pm.environment.set('admin_target_password', adminTargetPassword);
          pm.environment.set('admin_target_new_password', 'AdminNew123!');
          cb(null);
        });
      },
      function (cb) { createOwner(sysToken, cb); },
      function (cb) {
        const ownerToken = pm.environment.get('owner_token');
        if (!ownerToken) return cb('Owner token missing.');

        const staffResetEmail = `staff.reset.${now}.${random}@test.com`;
        const staffResetPassword = 'ValidPass123!';
        createStaff(ownerToken, staffResetEmail, staffResetPassword, 'Staff Reset ' + now, function (err2, id) {
          if (err2) return cb(err2);
          pm.environment.set('staff_reset_id', id);
          pm.environment.set('staff_reset_email', staffResetEmail);
          pm.environment.set('staff_reset_password', staffResetPassword);
          pm.environment.set('staff_reset_new_password', 'StaffNew123!');
          cb(null);
        });
      },
      function (cb) {
        const ownerToken = pm.environment.get('owner_token');
        if (!ownerToken) return cb('Owner token missing.');

        const staffContractEmail = `staff.contract.${now}.${random}@test.com`;
        const staffContractPassword = 'ValidPass123!';
        createStaff(ownerToken, staffContractEmail, staffContractPassword, 'Staff Contract ' + now, function (err2, id) {
          if (err2) return cb(err2);
          pm.environment.set('staff_contract_id', id);
          pm.environment.set('staff_contract_email', staffContractEmail);
          pm.environment.set('staff_contract_password', staffContractPassword);
          pm.environment.set('staff_contract_new_password', 'StaffContract123!');
          cb(null);
        });
      },
      function (cb) {
        const ownerToken = pm.environment.get('owner_token');
        if (!ownerToken) return cb('Owner token missing.');

        const staffAuthzEmail = `staff.authz.${now}.${random}@test.com`;
        const staffAuthzPassword = 'ValidPass123!';
        createStaff(ownerToken, staffAuthzEmail, staffAuthzPassword, 'Staff Authz ' + now, function (err2, id) {
          if (err2) return cb(err2);
          pm.environment.set('staff_authz_id', id);
          pm.environment.set('staff_authz_email', staffAuthzEmail);
          pm.environment.set('staff_authz_password', staffAuthzPassword);
          cb(null);
        });
      },
      function (cb) {
        const email = pm.environment.get('staff_authz_email');
        const password = pm.environment.get('staff_authz_password');
        login(email, password, function (err2, token) {
          if (err2) return cb(err2);
          pm.environment.set('staff_authz_token', token);
          cb(null);
        });
      }
    ], function (err2) {
      if (err2) { pm.expect.fail(err2); done(); return; }
      console.log('AUTO SETUP DONE');
      done();
    });
  });
});
```

---

## Pre-request Script

```javascript
function mapToken(raw) {
  const value = raw === undefined || raw === null ? '' : String(raw);

  if (value === '<EMPTY>') return '';
  if (value === '<WS>') return '     ';
  if (value === '<INVALID_GUID>') return 'not-a-guid';
  if (value === '<NOT_FOUND_ID>') return '00000000-0000-0000-0000-000000000000';

  if (value === '<STAFF_RESET_ID>') return pm.environment.get('staff_reset_id') || '';
  if (value === '<STAFF_CONTRACT_ID>') return pm.environment.get('staff_contract_id') || '';
  if (value === '<OWNER_ID>') return pm.environment.get('owner_id') || '';
  if (value === '<ADMIN_TARGET_ID>') return pm.environment.get('admin_target_id') || '';

  if (value === '<SYSADMIN_TOKEN>') return pm.environment.get('sysadmin_token') || '';
  if (value === '<STAFF_AUTHZ_TOKEN>') return pm.environment.get('staff_authz_token') || '';
  if (value === '<INVALID_TOKEN>') return 'invalid.token.value';

  if (value === '<STAFF_RESET_EMAIL>') return pm.environment.get('staff_reset_email') || '';
  if (value === '<STAFF_RESET_PASSWORD>') return pm.environment.get('staff_reset_password') || '';
  if (value === '<STAFF_CONTRACT_PASSWORD>') return pm.environment.get('staff_contract_password') || '';
  if (value === '<OWNER_EMAIL>') return pm.environment.get('owner_email') || '';
  if (value === '<OWNER_PASSWORD>') return pm.environment.get('owner_password') || '';
  if (value === '<ADMIN_TARGET_EMAIL>') return pm.environment.get('admin_target_email') || '';
  if (value === '<ADMIN_TARGET_PASSWORD>') return pm.environment.get('admin_target_password') || '';

  if (value === '<STAFF_RESET_NEW_PASSWORD>') return pm.environment.get('staff_reset_new_password') || '';
  if (value === '<OWNER_NEW_PASSWORD>') return pm.environment.get('owner_new_password') || '';
  if (value === '<ADMIN_TARGET_NEW_PASSWORD>') return pm.environment.get('admin_target_new_password') || '';
  if (value === '<STAFF_CONTRACT_NEW_PASSWORD>') return pm.environment.get('staff_contract_new_password') || '';

  return value;
}

const tcId = pm.iterationData.get('tc_id') || 'UNKNOWN_TC';
const description = pm.iterationData.get('description') || '';
const actionRaw = pm.iterationData.get('action') || '';
const action = String(actionRaw).trim().toLowerCase();
const userIdRaw = pm.iterationData.get('user_id');
const authTokenRaw = pm.iterationData.get('auth_token');
const emailRaw = pm.iterationData.get('email');
const oldPasswordRaw = pm.iterationData.get('old_password');
const newPasswordRaw = pm.iterationData.get('new_password');

const userId = mapToken(userIdRaw);
const authToken = mapToken(authTokenRaw);
const email = mapToken(emailRaw);
const oldPassword = mapToken(oldPasswordRaw);
const newPasswordMissing = String(newPasswordRaw || '') === '<MISSING>';
const newPassword = mapToken(newPasswordRaw);

pm.variables.set('target_user_id', userId);
pm.variables.set('auth_token_dynamic', authToken);

pm.variables.set('itc_tc_id', tcId);
pm.variables.set('itc_description', description);
pm.variables.set('itc_action', action);
pm.variables.set('itc_user_id', userId);
pm.variables.set('itc_auth_token_raw', String(authTokenRaw || ''));
pm.variables.set('itc_email_current', String(email || ''));
pm.variables.set('itc_old_password', String(oldPassword || ''));
pm.variables.set('itc_new_password', String(newPassword || ''));

const baseUrl = pm.environment.get('base_url') || '';
if (!baseUrl) pm.expect.fail('Missing base_url in environment.');

if (action.startsWith('login')) {
  const loginPassword = action === 'login_new' ? newPassword : oldPassword;
  pm.request.method = 'POST';
  pm.request.url = baseUrl + '/api/v1/auth/login';
  pm.request.headers.upsert({ key: 'Content-Type', value: 'application/json' });
  pm.request.headers.remove('Authorization');
  const body = JSON.stringify({ email: email, password: loginPassword });
  if (!pm.request.body) {
    pm.request.body = { mode: 'raw', raw: body };
  } else {
    pm.request.body.update(body);
  }
} else {
  pm.request.method = 'PUT';
  pm.request.url = baseUrl + '/api/users/' + encodeURIComponent(userId) + '/reset-password';

  if (String(authTokenRaw || '') === '<MISSING>') {
    pm.request.headers.remove('Authorization');
  } else {
    pm.request.headers.upsert({ key: 'Authorization', value: `Bearer ${authToken}` });
  }

  if (newPasswordMissing) {
    pm.request.headers.remove('Content-Type');
    if (pm.request.body) pm.request.body.update('');
  } else {
    pm.request.headers.upsert({ key: 'Content-Type', value: 'application/json' });
    const body = JSON.stringify(newPassword);
    if (!pm.request.body) {
      pm.request.body = { mode: 'raw', raw: body };
    } else {
      pm.request.body.update(body);
    }
  }
}

console.log('============================================================');
console.log('PRE-RUN REPORT');
console.log('TC ID          : ' + tcId);
console.log('Description    : ' + description);
console.log('Action         : ' + action);
console.log('User ID        : ' + userId);
console.log('Auth token raw : ' + (authTokenRaw || ''));
console.log('Request URL    : ' + pm.request.url);
console.log('============================================================');
```

---

## Tests Script

```javascript
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
  if (typeof response === 'string') return response.toLowerCase();
  if (response.message) return String(response.message).toLowerCase();
  if (response.error) return String(response.error).toLowerCase();
  if (response.errors) return JSON.stringify(response.errors).toLowerCase();
  return JSON.stringify(response).toLowerCase();
}

function extractToken(json) {
  if (!json || typeof json !== 'object') return '';
  return json.accessToken || json.token || '';
}

const tcId = pm.iterationData.get('tc_id') || 'UNKNOWN_TC';
const description = pm.iterationData.get('description') || '';
const action = (pm.variables.get('itc_action') || '').toLowerCase();

const expectedStatuses = parseExpectedStatus(pm.iterationData.get('expected_status'));
const expectedTextContains = (pm.iterationData.get('expected_text_contains') || '').toLowerCase();
const expectedLoginNew = parseExpectedStatus(pm.iterationData.get('expected_login_new'));
const maxResponseTime = Number(pm.iterationData.get('max_response_time_ms') || 0);

const response = safeParseResponse();
const responseText = pm.response.text();
const errorText = extractErrorText(response);

const statusPass = expectedStatuses.length > 0 ? expectedStatuses.includes(pm.response.code) : true;
const textPass = expectedTextContains
  ? (responseText.toLowerCase().includes(expectedTextContains) || errorText.includes(expectedTextContains))
  : true;
const timePass = maxResponseTime ? pm.response.responseTime < maxResponseTime : true;

pm.test(tcId + ': status code match expected list', function () {
  pm.expect(statusPass, 'Expected statuses: ' + expectedStatuses.join('|') + ', actual: ' + pm.response.code).to.eql(true);
});

pm.test(tcId + ': expected text contains', function () {
  pm.expect(textPass, 'expected_text_contains=' + expectedTextContains + ', actual_text=' + responseText).to.eql(true);
});

if (maxResponseTime) {
  pm.test(tcId + ': response time <= ' + maxResponseTime + 'ms', function () {
    pm.expect(timePass, 'responseTime=' + pm.response.responseTime).to.eql(true);
  });
}

let tokenPass = true;
if (action === 'login_new' && expectedStatuses.includes(200)) {
  const token = extractToken(response);
  tokenPass = token && token.split('.').length === 3;
  pm.test(tcId + ': login new token valid', function () {
    pm.expect(tokenPass, 'accessToken missing or invalid').to.eql(true);
  });
}

function printFinalReport(finalResult, extra) {
  console.log('============================================================');
  console.log('POST-RUN REPORT');
  console.log('TC ID                : ' + tcId);
  console.log('Description          : ' + description);
  console.log('Action               : ' + action);
  console.log('Expected status list : ' + expectedStatuses.join('|'));
  console.log('Actual status        : ' + pm.response.code);
  console.log('Status check         : ' + (statusPass ? 'PASS' : 'FAIL'));
  console.log('Expected text token  : ' + (expectedTextContains || '(none)'));
  console.log('Text check           : ' + (textPass ? 'PASS' : 'FAIL'));
  console.log('Time check           : ' + (timePass ? 'PASS' : 'FAIL'));
  if (action === 'login_new') console.log('Token check          : ' + (tokenPass ? 'PASS' : 'FAIL'));
  console.log('Final case result    : ' + finalResult);
  console.log('Response text        : ' + responseText);
  console.log('Request URL          : ' + pm.request.url);
  console.log('Auth token raw       : ' + (pm.variables.get('itc_auth_token_raw') || '(none)'));
  if (extra) console.log('Integration detail   : ' + extra);
  console.log('Timestamp            : ' + new Date().toISOString());
  console.log('============================================================');
}

if (action === 'login_both') {
  const baseUrl = pm.environment.get('base_url');
  const email = pm.variables.get('itc_email_current');
  const newPassword = pm.variables.get('itc_new_password');

  pm.sendRequest({
    url: baseUrl + '/api/v1/auth/login',
    method: 'POST',
    header: { 'Content-Type': 'application/json' },
    body: { mode: 'raw', raw: JSON.stringify({ email: email, password: newPassword }) }
  }, function (err, res) {
    if (err || !res) {
      pm.expect.fail('Login new call failed: ' + (err ? err.message : 'no response'));
      return;
    }

    const loginNewStatus = res.code;
    const loginNewPass = expectedLoginNew.length > 0 ? expectedLoginNew.includes(loginNewStatus) : true;

    let loginTokenPass = true;
    let json = null;
    try { json = res.json(); } catch (e) {}
    const token = extractToken(json);
    if (expectedLoginNew.includes(200)) {
      loginTokenPass = token && token.split('.').length === 3;
    }

    pm.test(tcId + ': login new status expected', function () {
      pm.expect(loginNewPass, 'expected_login_new=' + expectedLoginNew.join('|') + ', actual=' + loginNewStatus).to.eql(true);
    });
    if (expectedLoginNew.includes(200)) {
      pm.test(tcId + ': login new token valid', function () {
        pm.expect(loginTokenPass, 'accessToken missing or invalid').to.eql(true);
      });
    }

    const finalResult = statusPass && textPass && timePass && loginNewPass && loginTokenPass ? 'PASS' : 'FAIL';
    const extra = 'login_new_status=' + loginNewStatus;
    printFinalReport(finalResult, extra);
  });
} else {
  const finalResult = statusPass && textPass && timePass && tokenPass ? 'PASS' : 'FAIL';
  printFinalReport(finalResult, 'No secondary login.');
}
```

---

## Huong dan chay runner
1. Chay request `00_SETUP_AutoSeed_ResetPassword`.
2. Mo request Reset Password va dat URL = {{base_url}}/api/users/{{target_user_id}}/reset-password.
3. Dat Authorization = Bearer {{auth_token_dynamic}}.
4. Nap file ITC_13.19.csv trong Collection Runner.
5. Chay 1 lan de cover ITC_13.19 -> ITC_13.34.
