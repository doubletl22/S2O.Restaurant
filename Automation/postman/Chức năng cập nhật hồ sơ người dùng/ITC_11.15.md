# ITC_11.15 - Runner tong hop cap nhat ho so nguoi dung (Data-Driven)

## Muc tieu
Dung 1 request + 1 file CSV de chay toan bo test case ITC_11.15 -> ITC_11.32 cho:
- Get profile
- Update full name + phone
- Change password + login old/new
- Auth/validation + response time

---

## Cau hinh request
- Method: GET
- URL: `{{base_url}}/api/users/me`
- Authorization: Bearer {{auth_token_dynamic}}

**Luu y:** Script se tu dong chuyen request theo `action` trong CSV.

---

## File CSV su dung
- ITC_11.15.csv

Cot CSV:
- tc_id
- description
- action (GET_PROFILE | UPDATE_PROFILE | CHANGE_PASSWORD | LOGIN_OLD | LOGIN_NEW)
- full_name
- phone_number
- auth_token
- email
- current_password
- new_password
- confirm_password
- expected_status
- expected_error_code
- expected_fields
- max_response_time_ms

---

## Token dac biet trong CSV

**Auth token**
- <ADMIN_TARGET_TOKEN> -> env: admin_target_token
- <INVALID_TOKEN> -> "invalid.token.value"
- <MISSING> -> bo header Authorization
- <EMPTY> -> header "Bearer "

**Email**
- <ADMIN_TARGET_EMAIL> -> env: admin_target_email

**Password**
- <ADMIN_TARGET_PASSWORD> -> env: admin_target_password
- <ADMIN_TARGET_NEW_PASSWORD> -> env: admin_target_new_password
- <ADMIN_TARGET_NEW_PASSWORD_2> -> env: admin_target_new_password_2
- <MISSING> -> khong gui body

**Text**
- <EMPTY> -> ""
- <WS> -> chuoi khoang trang

---

## 00_SETUP (tu dong tao user va set bien) - chay 1 lan truoc Runner

**Muc dich:** Tao SystemAdmin target (khong dung admin seed), login lay token va set bien:
`admin_target_email`, `admin_target_password`, `admin_target_new_password`, `admin_target_new_password_2`, `admin_target_token`, `sysadmin_token`.

**Bat buoc set:**
- `seed_admin_email`
- `seed_admin_password`

**Cach dung:** Tao request `00_SETUP_AutoSeed_UserProfile` (bat ky method), dan script trong `00_SETUP_AutoSeed.md` vao **Tests**, chay 1 lan truoc Runner.

---

## Pre-request Script

```javascript
function mapToken(raw) {
  const value = raw === undefined || raw === null ? '' : String(raw);

  if (value === '<EMPTY>') return '';
  if (value === '<WS>') return '     ';

  if (value === '<ADMIN_TARGET_TOKEN>') return pm.environment.get('admin_target_token') || '';
  if (value === '<INVALID_TOKEN>') return 'invalid.token.value';

  if (value === '<ADMIN_TARGET_EMAIL>') return pm.environment.get('admin_target_email') || '';
  if (value === '<ADMIN_TARGET_PASSWORD>') return pm.environment.get('admin_target_password') || '';
  if (value === '<ADMIN_TARGET_NEW_PASSWORD>') return pm.environment.get('admin_target_new_password') || '';
  if (value === '<ADMIN_TARGET_NEW_PASSWORD_2>') return pm.environment.get('admin_target_new_password_2') || '';

  return value;
}

const tcId = pm.iterationData.get('tc_id') || 'UNKNOWN_TC';
const description = pm.iterationData.get('description') || '';
const actionRaw = pm.iterationData.get('action') || '';
const action = String(actionRaw).trim().toLowerCase();

const fullNameRaw = pm.iterationData.get('full_name');
const phoneRaw = pm.iterationData.get('phone_number');
const authTokenRaw = pm.iterationData.get('auth_token');
const emailRaw = pm.iterationData.get('email');
const currentPasswordRaw = pm.iterationData.get('current_password');
const newPasswordRaw = pm.iterationData.get('new_password');
const confirmPasswordRaw = pm.iterationData.get('confirm_password');

const fullName = mapToken(fullNameRaw);
const phoneNumber = mapToken(phoneRaw);
const authToken = mapToken(authTokenRaw);
const email = mapToken(emailRaw);
const currentPassword = mapToken(currentPasswordRaw);
const newPasswordMissing = String(newPasswordRaw || '') === '<MISSING>';
const newPassword = mapToken(newPasswordRaw);
const confirmPassword = mapToken(confirmPasswordRaw);

pm.variables.set('itc_tc_id', tcId);
pm.variables.set('itc_description', description);
pm.variables.set('itc_action', action);
pm.variables.set('itc_auth_token_raw', String(authTokenRaw || ''));

const baseUrl = pm.environment.get('base_url') || '';
if (!baseUrl) pm.expect.fail('Missing base_url in environment.');

if (action.startsWith('login')) {
  pm.request.method = 'POST';
  pm.request.url = baseUrl + '/api/v1/auth/login';
  pm.request.headers.upsert({ key: 'Content-Type', value: 'application/json' });
  pm.request.headers.remove('Authorization');
  const body = JSON.stringify({ email: email, password: currentPassword });
  if (!pm.request.body) {
    pm.request.body = { mode: 'raw', raw: body };
  } else {
    pm.request.body.update(body);
  }
} else if (action === 'update_profile') {
  pm.request.method = 'PUT';
  pm.request.url = baseUrl + '/api/users/me';
  if (String(authTokenRaw || '') === '<MISSING>') {
    pm.request.headers.remove('Authorization');
  } else {
    pm.request.headers.upsert({ key: 'Authorization', value: `Bearer ${authToken}` });
  }
  pm.request.headers.upsert({ key: 'Content-Type', value: 'application/json' });
  const body = JSON.stringify({ fullName: fullName, phoneNumber: phoneNumber });
  if (!pm.request.body) {
    pm.request.body = { mode: 'raw', raw: body };
  } else {
    pm.request.body.update(body);
  }
} else if (action === 'change_password') {
  pm.request.method = 'POST';
  pm.request.url = baseUrl + '/api/users/me/change-password';
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
    const body = JSON.stringify({
      currentPassword: currentPassword,
      newPassword: newPassword,
      confirmPassword: confirmPassword
    });
    if (!pm.request.body) {
      pm.request.body = { mode: 'raw', raw: body };
    } else {
      pm.request.body.update(body);
    }
  }
} else {
  pm.request.method = 'GET';
  pm.request.url = baseUrl + '/api/users/me';
  if (String(authTokenRaw || '') === '<MISSING>') {
    pm.request.headers.remove('Authorization');
  } else {
    pm.request.headers.upsert({ key: 'Authorization', value: `Bearer ${authToken}` });
  }
}

console.log('============================================================');
console.log('PRE-RUN REPORT');
console.log('TC ID          : ' + tcId);
console.log('Description    : ' + description);
console.log('Action         : ' + action);
console.log('Request URL    : ' + pm.request.url);
console.log('Auth token raw : ' + (authTokenRaw || ''));
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

function extractErrorCode(json) {
  if (!json || typeof json !== 'object') return '';
  return json.errorCode
    || json.code
    || (json.Error && (json.Error.Code || json.Error.code))
    || (json.error && (json.error.code || json.error.Code))
    || '';
}

function getValuePayload(json) {
  if (!json || typeof json !== 'object') return json;
  return json.value || json.Value || json;
}

function getFieldCaseInsensitive(obj, fieldName) {
  if (!obj || typeof obj !== 'object') return undefined;
  const target = fieldName.toLowerCase();
  const key = Object.keys(obj).find(k => k.toLowerCase() === target);
  return key ? obj[key] : undefined;
}

function extractToken(json) {
  if (!json || typeof json !== 'object') return '';
  return json.accessToken || json.token || '';
}

const tcId = pm.iterationData.get('tc_id') || 'UNKNOWN_TC';
const description = pm.iterationData.get('description') || '';
const action = (pm.variables.get('itc_action') || '').toLowerCase();

const expectedStatuses = parseExpectedStatus(pm.iterationData.get('expected_status'));
const expectedErrorCode = String(pm.iterationData.get('expected_error_code') || '').trim();
const expectedFields = String(pm.iterationData.get('expected_fields') || '').split('|').map(s => s.trim()).filter(Boolean);
const maxResponseTime = Number(pm.iterationData.get('max_response_time_ms') || 0);

const responseJson = safeParseResponse();
const payload = getValuePayload(responseJson);
const responseText = pm.response.text();

const statusPass = expectedStatuses.length > 0 ? expectedStatuses.includes(pm.response.code) : true;
const timePass = maxResponseTime ? pm.response.responseTime < maxResponseTime : true;

pm.test(tcId + ': status code match expected list', function () {
  pm.expect(statusPass, 'Expected statuses: ' + expectedStatuses.join('|') + ', actual: ' + pm.response.code).to.eql(true);
});

if (maxResponseTime) {
  pm.test(tcId + ': response time <= ' + maxResponseTime + 'ms', function () {
    pm.expect(timePass, 'responseTime=' + pm.response.responseTime).to.eql(true);
  });
}

if (expectedErrorCode && pm.response.code >= 400) {
  pm.test(tcId + ': error code matches', function () {
    pm.expect(extractErrorCode(responseJson)).to.eql(expectedErrorCode);
  });
}

if (expectedFields.length > 0 && pm.response.code >= 200 && pm.response.code < 300) {
  pm.test(tcId + ': expected fields exist', function () {
    expectedFields.forEach(field => {
      const val = getFieldCaseInsensitive(payload, field);
      pm.expect(val, 'Missing field: ' + field).to.not.equal(undefined);
    });
  });
}

let tokenPass = true;
if (action.startsWith('login') && expectedStatuses.includes(200)) {
  const token = extractToken(responseJson);
  tokenPass = token && token.split('.').length === 3;
  pm.test(tcId + ': login token valid', function () {
    pm.expect(tokenPass, 'accessToken missing or invalid').to.eql(true);
  });
}

function printFinalReport(finalResult) {
  console.log('============================================================');
  console.log('POST-RUN REPORT');
  console.log('TC ID                : ' + tcId);
  console.log('Description          : ' + description);
  console.log('Action               : ' + action);
  console.log('Expected status list : ' + expectedStatuses.join('|'));
  console.log('Actual status        : ' + pm.response.code);
  console.log('Status check         : ' + (statusPass ? 'PASS' : 'FAIL'));
  console.log('Final case result    : ' + finalResult);
  console.log('Response text        : ' + responseText);
  console.log('Request URL          : ' + pm.request.url);
  console.log('Auth token raw       : ' + (pm.variables.get('itc_auth_token_raw') || '(none)'));
  console.log('Timestamp            : ' + new Date().toISOString());
  console.log('============================================================');
}

const finalResult = statusPass && timePass && tokenPass ? 'PASS' : 'FAIL';
printFinalReport(finalResult);
```

---

## Huong dan chay runner
1. Chay request `00_SETUP_AutoSeed_UserProfile`.
2. Mo request bat ky (GET /api/users/me) va dat URL = {{base_url}}/api/users/me.
3. Dat Authorization = Bearer {{auth_token_dynamic}}.
4. Nap file ITC_11.15.csv trong Collection Runner.
5. Chay 1 lan de cover ITC_11.15 -> ITC_11.32.
