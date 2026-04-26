# ITC_12.19 - Runner tong hop ITC_12.19 den ITC_12.30 (Data-Driven)

## Muc tieu
Dung 1 request Delete User + 1 file CSV de chay toan bo test case ITC_12.19 -> ITC_12.30 trong Collection Runner.

## Pham vi
- Delete staff, owner, systemadmin target
- Login sau khi delete (fail)
- Not found, invalid format
- Delete twice
- Auth khong du quyen
- Delete self
- Contract response + response time

---

## Cau hinh request
- Method: DELETE
- URL: {{base_url}}/api/users/{{target_user_id}}
- Authorization: Bearer {{auth_token_dynamic}}
- Body: none (script tu dong chuyen sang login neu action=LOGIN)

---

## File CSV su dung
- ITC_12.19.csv

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
- expected_status_2
- expected_text_contains_2
- max_response_time_ms

---

## Token dac biet trong CSV

**UserId**
- <STAFF_DELETE_ID> -> env: staff_delete_id
- <STAFF_DOUBLE_ID> -> env: staff_double_id
- <STAFF_CONTRACT_ID> -> env: staff_contract_id
- <OWNER_ID> -> env: owner_id
- <ADMIN_TARGET_ID> -> env: admin_target_id
- <ADMIN_SELF_ID> -> env: admin_self_id
- <INVALID_GUID> -> "not-a-guid"
- <EMPTY> -> ""
- <WS> -> chuoi khoang trang

**Auth token**
- <SYSADMIN_TOKEN> -> env: sysadmin_token
- <STAFF_AUTHZ_TOKEN> -> env: staff_authz_token
- <ADMIN_SELF_TOKEN> -> env: admin_self_token
- <INVALID_TOKEN> -> "invalid.token.value"
- <MISSING> -> bo header Authorization
- <EMPTY> -> header "Bearer "

**Login credential**
- <STAFF_DELETE_EMAIL> -> env: staff_delete_email
- <STAFF_DELETE_PASSWORD> -> env: staff_delete_password
- <OWNER_EMAIL> -> env: owner_email
- <OWNER_PASSWORD> -> env: owner_password
- <ADMIN_TARGET_EMAIL> -> env: admin_target_email
- <ADMIN_TARGET_PASSWORD> -> env: admin_target_password

---

## 00_SETUP (tu dong tao user va set bien) - chay 1 lan truoc Runner

**Muc dich:** Tao SystemAdmin target + SystemAdmin self (khong dung admin seed), tao Owner + Staff, lay token va set bien:
`sysadmin_token`, `admin_target_*`, `admin_self_*`, `owner_*`, `staff_delete_*`, `staff_double_*`, `staff_contract_*`, `staff_authz_*`, `staff_authz_token`.

**Bat buoc set:**
- `seed_admin_email`
- `seed_admin_password`

**Cach dung:** Tao request `00_SETUP_AutoSeed_DeleteUser` (bat ky method), dan script ben duoi vao **Tests**, chay 1 lan truoc Runner.

```javascript
pm.test('AUTO SETUP (seed users for delete user)', function (done) {
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

    const adminTargetEmail = `admin.target.${now}.${random}@test.com`;
    const adminTargetPassword = 'Admin@123';
    const adminSelfEmail = `admin.self.${now}.${random}@test.com`;
    const adminSelfPassword = 'Admin@123';

    runSteps([
      function (cb) {
        createSystemAdmin(sysToken, adminTargetEmail, adminTargetPassword, function (err2, id) {
          if (err2) return cb(err2);
          pm.environment.set('admin_target_id', id);
          pm.environment.set('admin_target_email', adminTargetEmail);
          pm.environment.set('admin_target_password', adminTargetPassword);
          cb(null);
        });
      },
      function (cb) {
        createSystemAdmin(sysToken, adminSelfEmail, adminSelfPassword, function (err2, id) {
          if (err2) return cb(err2);
          pm.environment.set('admin_self_id', id);
          pm.environment.set('admin_self_email', adminSelfEmail);
          pm.environment.set('admin_self_password', adminSelfPassword);
          cb(null);
        });
      },
      function (cb) { createOwner(sysToken, cb); },
      function (cb) {
        const ownerToken = pm.environment.get('owner_token');
        if (!ownerToken) return cb('Owner token missing.');

        const staffDeleteEmail = `staff.delete.${now}.${random}@test.com`;
        const staffDeletePassword = 'ValidPass123!';
        createStaff(ownerToken, staffDeleteEmail, staffDeletePassword, 'Staff Delete ' + now, function (err2, id) {
          if (err2) return cb(err2);
          pm.environment.set('staff_delete_id', id);
          pm.environment.set('staff_delete_email', staffDeleteEmail);
          pm.environment.set('staff_delete_password', staffDeletePassword);
          cb(null);
        });
      },
      function (cb) {
        const ownerToken = pm.environment.get('owner_token');
        if (!ownerToken) return cb('Owner token missing.');

        const staffDoubleEmail = `staff.double.${now}.${random}@test.com`;
        const staffDoublePassword = 'ValidPass123!';
        createStaff(ownerToken, staffDoubleEmail, staffDoublePassword, 'Staff Double ' + now, function (err2, id) {
          if (err2) return cb(err2);
          pm.environment.set('staff_double_id', id);
          pm.environment.set('staff_double_email', staffDoubleEmail);
          pm.environment.set('staff_double_password', staffDoublePassword);
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
      },
      function (cb) {
        login(adminSelfEmail, adminSelfPassword, function (err2, token) {
          if (err2) return cb(err2);
          pm.environment.set('admin_self_token', token);
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

  if (value === '<STAFF_DELETE_ID>') return pm.environment.get('staff_delete_id') || '';
  if (value === '<STAFF_DOUBLE_ID>') return pm.environment.get('staff_double_id') || '';
  if (value === '<STAFF_CONTRACT_ID>') return pm.environment.get('staff_contract_id') || '';
  if (value === '<OWNER_ID>') return pm.environment.get('owner_id') || '';
  if (value === '<ADMIN_TARGET_ID>') return pm.environment.get('admin_target_id') || '';
  if (value === '<ADMIN_SELF_ID>') return pm.environment.get('admin_self_id') || '';

  if (value === '<SYSADMIN_TOKEN>') return pm.environment.get('sysadmin_token') || '';
  if (value === '<STAFF_AUTHZ_TOKEN>') return pm.environment.get('staff_authz_token') || '';
  if (value === '<ADMIN_SELF_TOKEN>') return pm.environment.get('admin_self_token') || '';
  if (value === '<INVALID_TOKEN>') return 'invalid.token.value';

  if (value === '<STAFF_DELETE_EMAIL>') return pm.environment.get('staff_delete_email') || '';
  if (value === '<STAFF_DELETE_PASSWORD>') return pm.environment.get('staff_delete_password') || '';
  if (value === '<OWNER_EMAIL>') return pm.environment.get('owner_email') || '';
  if (value === '<OWNER_PASSWORD>') return pm.environment.get('owner_password') || '';
  if (value === '<ADMIN_TARGET_EMAIL>') return pm.environment.get('admin_target_email') || '';
  if (value === '<ADMIN_TARGET_PASSWORD>') return pm.environment.get('admin_target_password') || '';

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

const userId = mapToken(userIdRaw);
const authToken = mapToken(authTokenRaw);
const email = mapToken(emailRaw);
const password = mapToken(passwordRaw);

pm.variables.set('target_user_id', userId);
pm.variables.set('auth_token_dynamic', authToken);

pm.variables.set('itc_tc_id', tcId);
pm.variables.set('itc_description', description);
pm.variables.set('itc_action', action);
pm.variables.set('itc_user_id', userId);
pm.variables.set('itc_auth_token_raw', String(authTokenRaw || ''));
pm.variables.set('itc_email_current', String(email || ''));

const baseUrl = pm.environment.get('base_url') || '';
if (!baseUrl) pm.expect.fail('Missing base_url in environment.');

if (action === 'login') {
  pm.request.method = 'POST';
  pm.request.url = baseUrl + '/api/v1/auth/login';
  pm.request.headers.upsert({ key: 'Content-Type', value: 'application/json' });
  pm.request.headers.remove('Authorization');
  const body = JSON.stringify({ email: email, password: password });
  if (!pm.request.body) {
    pm.request.body = { mode: 'raw', raw: body };
  } else {
    pm.request.body.update(body);
  }
} else {
  pm.request.method = 'DELETE';
  pm.request.url = baseUrl + '/api/users/' + encodeURIComponent(userId);

  if (String(authTokenRaw || '') === '<MISSING>') {
    pm.request.headers.remove('Authorization');
  } else {
    pm.request.headers.upsert({ key: 'Authorization', value: `Bearer ${authToken}` });
  }
  pm.request.headers.remove('Content-Type');
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

const tcId = pm.iterationData.get('tc_id') || 'UNKNOWN_TC';
const description = pm.iterationData.get('description') || '';
const action = (pm.variables.get('itc_action') || '').toLowerCase();

const expectedStatuses = parseExpectedStatus(pm.iterationData.get('expected_status'));
const expectedTextContains = (pm.iterationData.get('expected_text_contains') || '').toLowerCase();
const expectedStatuses2 = parseExpectedStatus(pm.iterationData.get('expected_status_2'));
const expectedTextContains2 = (pm.iterationData.get('expected_text_contains_2') || '').toLowerCase();
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

if (action !== 'login' && pm.response.code === 204) {
  pm.test(tcId + ': NoContent body is empty', function () {
    pm.expect(pm.response.text()).to.eql('');
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
  console.log('Final case result    : ' + finalResult);
  console.log('Response text        : ' + responseText);
  console.log('Request URL          : ' + pm.request.url);
  console.log('Auth token raw       : ' + (pm.variables.get('itc_auth_token_raw') || '(none)'));
  if (extra) console.log('Integration detail   : ' + extra);
  console.log('Timestamp            : ' + new Date().toISOString());
  console.log('============================================================');
}

if (action === 'delete_twice') {
  const baseUrl = pm.environment.get('base_url');
  const userId = pm.variables.get('itc_user_id');
  const token = pm.variables.get('auth_token_dynamic');
  const authRaw = pm.variables.get('itc_auth_token_raw');
  const headers = (authRaw === '<MISSING>') ? {} : { Authorization: 'Bearer ' + token };

  pm.sendRequest({
    url: baseUrl + '/api/users/' + encodeURIComponent(userId),
    method: 'DELETE',
    header: headers
  }, function (err, res) {
    pm.test(tcId + ': second delete status', function () {
      if (expectedStatuses2.length > 0) {
        pm.expect(expectedStatuses2.includes(res.code), 'expected ' + expectedStatuses2.join('|') + ', actual=' + res.code).to.eql(true);
      }
    });

    let resText = '';
    let resErrText = '';
    try { resText = res.text(); } catch (e) {}
    let resJson = null;
    try { resJson = res.json(); } catch (e) {}
    if (resJson) resErrText = extractErrorText(resJson);

    const text2Pass = expectedTextContains2
      ? (resText.toLowerCase().includes(expectedTextContains2) || resErrText.includes(expectedTextContains2))
      : true;

    pm.test(tcId + ': second delete text contains', function () {
      pm.expect(text2Pass, 'expected_text_contains_2=' + expectedTextContains2).to.eql(true);
    });

    const status2Pass = expectedStatuses2.length > 0 ? expectedStatuses2.includes(res.code) : true;
    const finalResult = statusPass && textPass && timePass && status2Pass && text2Pass ? 'PASS' : 'FAIL';
    const extra = 'second_status=' + res.code;
    printFinalReport(finalResult, extra);
  });
} else {
  const finalResult = statusPass && textPass && timePass ? 'PASS' : 'FAIL';
  printFinalReport(finalResult, 'No second delete.');
}
```

---

## Huong dan chay runner
1. Chay request `00_SETUP_AutoSeed_DeleteUser`.
2. Mo request Delete User va dat URL = {{base_url}}/api/users/{{target_user_id}}.
3. Dat Authorization = Bearer {{auth_token_dynamic}}.
4. Nap file ITC_12.19.csv trong Collection Runner.
5. Chay 1 lan de cover ITC_12.19 -> ITC_12.30.
