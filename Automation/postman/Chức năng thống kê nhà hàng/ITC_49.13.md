# ITC_49.13 - Runner tong hop thong ke nha hang (Data-Driven)

## Muc tieu
Dung 1 request Admin Stats + 1 file CSV de chay toan bo test case ITC_49.13 -> ITC_49.24 tap trung vao **thong ke nha hang** (TotalTenants, ActiveTenants, TotalRevenue, PlanTenantCounts, RevenueTrend) theo **API hien tai**.

## Pham vi
- Thong ke nha hang mac dinh + schema (TotalTenants, ActiveTenants, TotalRevenue, PlanTenantCounts, RevenueTrend)
- Kiem tra PlanTenantCounts/RevenueTrend
- Filter from/to
- Validation (date range, format)
- Auth (token thieu/khong du quyen)
- So sanh truoc/sau tao/lock nha hang
- Response time

---

## Cau hinh request
- Method: GET
- URL: `{{base_url}}{{stats_restaurant_endpoint}}` (mac dinh `/api/v1/admin/stats`)
- Authorization: Bearer {{auth_token_dynamic}}

**Luu y:** API hien tai chi nhan `from` va `to` (yyyy-MM-dd). Plan/status query se bi bo qua. API tra ca thong ke nguoi dung; test nay chi assert cac truong lien quan nha hang.

---

## File CSV su dung
- ITC_49.13.csv

Cot CSV:
- tc_id
- description
- action (STATS | COMPARE_CREATE | COMPARE_LOCK)
- from_date
- to_date
- plan_type
- status
- auth_token
- expected_status
- expected_error_code
- expected_fields
- expected_total_delta
- expected_active_delta
- expected_locked_delta
- max_response_time_ms

---

## Token dac biet trong CSV

**Auth token**
- <SYSADMIN_TOKEN> -> env: sysadmin_token
- <STAFF_AUTHZ_TOKEN> -> env: staff_authz_token
- <INVALID_TOKEN> -> "invalid.token.value"
- <MISSING> -> bo header Authorization
- <EMPTY> -> header "Bearer "

**Date**
- <TODAY>, <TODAY-7>, <TODAY+7> -> format yyyy-MM-dd

---

## Bien tuy chinh endpoint/param (optional)
Neu API khac endpoint/param, set environment:
- `stats_restaurant_endpoint` (vd: `/api/v1/admin/stats`)
- `stats_from_param` (mac dinh: `from`)
- `stats_to_param` (mac dinh: `to`)
- `stats_plan_param` (mac dinh: `planType`)
- `stats_status_param` (mac dinh: `status`)

---

## 00_SETUP (tu dong tao data) - chay 1 lan truoc Runner

**Muc dich:** Lay sysadmin token + tao staff token khong du quyen + tao tenant de lock.

**Bat buoc set:**
- `seed_admin_email`
- `seed_admin_password`

**Cach dung:** Tao request `00_SETUP_AutoSeed_RestaurantStats` (bat ky method), dan script ben duoi vao **Tests**, chay 1 lan truoc Runner.

```javascript
pm.test('AUTO SETUP (seed data for restaurant stats)', function (done) {
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

  console.log('============================================================');
  console.log('AUTO SETUP START');
  console.log('Base URL       : ' + baseUrl);
  console.log('Seed Admin     : ' + seedAdminEmail);
  console.log('Timestamp      : ' + new Date().toISOString());
  console.log('============================================================');

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

  function createOwner(cb) {
    const ownerEmail = `owner.stats.${now}.${random}@test.com`;
    const ownerPassword = 'ValidPass123!';
    const ownerName = 'Owner Stats ' + now;
    const restaurantName = 'Stats Restaurant ' + now;

    pm.environment.set('tenant_lock_name', restaurantName);

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
        cb(null);
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

  function getTenantIdByName(sysToken, name, cb) {
    const url = baseUrl + '/api/v1/tenants?page=1&pageSize=50&keyword=' + encodeURIComponent(name);
    pm.sendRequest({
      url: url,
      method: 'GET',
      header: { Authorization: 'Bearer ' + sysToken }
    }, function (err, res) {
      if (err || !res) return cb('Get tenants failed: ' + (err ? err.message : 'no response'));
      let json = null;
      try { json = res.json(); } catch (e) {}
      const value = json && (json.value || json.Value) ? (json.value || json.Value) : null;
      const list = Array.isArray(value)
        ? value
        : Array.isArray(value && value.data) ? value.data
          : Array.isArray(value && value.Data) ? value.Data
            : [];
      const found = list.find(t => String(t.Name || t.name || '').toLowerCase() === name.toLowerCase());
      const id = found ? (found.Id || found.id || '') : '';
      if (!id) return cb('Tenant not found by keyword: ' + name);
      cb(null, id);
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

    runSteps([
      function (cb) { createOwner(cb); },
      function (cb) {
        const tenantName = pm.environment.get('tenant_lock_name');
        getTenantIdByName(sysToken, tenantName, function (err2, id) {
          if (err2) return cb(err2);
          pm.environment.set('tenant_lock_id', id);
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
      console.log('============================================================');
      console.log('AUTO SETUP DONE');
      console.log('Tenant lock   : ' + (pm.environment.get('tenant_lock_name') || '') + ' | ' + (pm.environment.get('tenant_lock_id') || ''));
      console.log('Staff authz   : ' + (pm.environment.get('staff_authz_email') || '') + ' | ' + (pm.environment.get('staff_authz_id') || ''));
      console.log('Timestamp     : ' + new Date().toISOString());
      console.log('============================================================');
      done();
    });
  });
});
```

---

## Pre-request Script

```javascript
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function resolveDateToken(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw === '<TODAY>') return formatDate(new Date());
  if (raw.startsWith('<TODAY-')) {
    const days = parseInt(raw.replace('<TODAY-', '').replace('>', ''), 10);
    const d = new Date();
    d.setDate(d.getDate() - days);
    return formatDate(d);
  }
  if (raw.startsWith('<TODAY+')) {
    const days = parseInt(raw.replace('<TODAY+', '').replace('>', ''), 10);
    const d = new Date();
    d.setDate(d.getDate() + days);
    return formatDate(d);
  }
  return raw;
}

function mapToken(raw) {
  const value = raw === undefined || raw === null ? '' : String(raw);
  if (value === '<SYSADMIN_TOKEN>') return pm.environment.get('sysadmin_token') || '';
  if (value === '<STAFF_AUTHZ_TOKEN>') return pm.environment.get('staff_authz_token') || '';
  if (value === '<INVALID_TOKEN>') return 'invalid.token.value';
  return value;
}

const tcId = pm.iterationData.get('tc_id') || 'UNKNOWN_TC';
const description = pm.iterationData.get('description') || '';
const actionRaw = pm.iterationData.get('action') || '';
const action = String(actionRaw).trim().toLowerCase();

const fromDate = resolveDateToken(pm.iterationData.get('from_date'));
const toDate = resolveDateToken(pm.iterationData.get('to_date'));
const planType = String(pm.iterationData.get('plan_type') || '').trim();
const status = String(pm.iterationData.get('status') || '').trim();
const authTokenRaw = pm.iterationData.get('auth_token');
const authToken = mapToken(authTokenRaw);

pm.variables.set('itc_tc_id', tcId);
pm.variables.set('itc_description', description);
pm.variables.set('itc_action', action);
pm.variables.set('itc_auth_token_raw', String(authTokenRaw || ''));

const baseUrl = pm.environment.get('base_url') || pm.environment.get('baseUrl') || '';
if (!baseUrl) pm.expect.fail('Missing base_url in environment.');

const statsEndpoint = pm.environment.get('stats_restaurant_endpoint') || '/api/v1/admin/stats';
const fromParam = pm.environment.get('stats_from_param') || 'from';
const toParam = pm.environment.get('stats_to_param') || 'to';
const planParam = pm.environment.get('stats_plan_param') || 'planType';
const statusParam = pm.environment.get('stats_status_param') || 'status';

const params = [];
if (fromDate) params.push(`${fromParam}=${encodeURIComponent(fromDate)}`);
if (toDate) params.push(`${toParam}=${encodeURIComponent(toDate)}`);
if (planType) params.push(`${planParam}=${encodeURIComponent(planType)}`);
if (status) params.push(`${statusParam}=${encodeURIComponent(status)}`);

pm.request.method = 'GET';
pm.request.url = baseUrl + statsEndpoint + (params.length ? '?' + params.join('&') : '');

if (String(authTokenRaw || '') === '<MISSING>') {
  // Force no auth to avoid inherited bearer token from request-level auth settings.
  pm.request.auth = { type: 'noauth' };
  pm.request.headers.remove('Authorization');
  pm.variables.unset('auth_token_dynamic');
} else {
  const tokenToUse = authToken || pm.environment.get('sysadmin_token') || '';
  pm.request.auth = {
    type: 'bearer',
    bearer: [{ key: 'token', value: tokenToUse, type: 'string' }]
  };
  pm.request.headers.upsert({ key: 'Authorization', value: `Bearer ${tokenToUse}` });
  pm.variables.set('auth_token_dynamic', tokenToUse);
}

console.log('============================================================');
console.log('PRE-RUN REPORT');
console.log('TC ID          : ' + tcId);
console.log('Description    : ' + description);
console.log('Action         : ' + action);
console.log('FromDate       : ' + (fromDate || '(none)'));
console.log('ToDate         : ' + (toDate || '(none)'));
console.log('PlanType       : ' + (planType || '(none)'));
console.log('Status         : ' + (status || '(none)'));
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

function safeParseResponse(res) {
  const text = res.text();
  if (!text || !text.trim()) return null;
  try {
    return res.json();
  } catch (e) {
    return text;
  }
}

function extractErrorCode(json) {
  if (!json || typeof json !== 'object') return '';
  return json.errorCode || json.code || (json.Error && (json.Error.Code || json.Error.code)) || (json.error && (json.error.code || json.error.Code)) || '';
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

function getNumberField(obj, fieldName) {
  const val = getFieldCaseInsensitive(obj, fieldName);
  if (val === undefined || val === null) return null;
  const num = Number(val);
  return Number.isNaN(num) ? null : num;
}

function fetchStats(url, token, cb) {
  const headers = token ? { Authorization: 'Bearer ' + token } : {};
  pm.sendRequest({ url: url, method: 'GET', header: headers }, function (err, res) {
    if (err || !res) return cb('Stats request failed: ' + (err ? err.message : 'no response'));
    cb(null, res);
  });
}

const tcId = pm.iterationData.get('tc_id') || 'UNKNOWN_TC';
const description = pm.iterationData.get('description') || '';
const action = (pm.variables.get('itc_action') || '').toLowerCase();

const expectedStatuses = parseExpectedStatus(pm.iterationData.get('expected_status'));
const expectedErrorCode = String(pm.iterationData.get('expected_error_code') || '').trim();
const expectedFields = String(pm.iterationData.get('expected_fields') || '').split('|').map(s => s.trim()).filter(Boolean);
const expectedTotalDeltaRaw = String(pm.iterationData.get('expected_total_delta') || '').trim();
const expectedActiveDeltaRaw = String(pm.iterationData.get('expected_active_delta') || '').trim();
const expectedLockedDeltaRaw = String(pm.iterationData.get('expected_locked_delta') || '').trim();
const maxResponseTime = Number(pm.iterationData.get('max_response_time_ms') || 0);

const responseJson = safeParseResponse(pm.response);
const payload = getValuePayload(responseJson);
const responseText = pm.response.text();

const statusPass = expectedStatuses.length > 0 ? expectedStatuses.includes(pm.response.code) : true;
let fieldsPass = true;

pm.test(tcId + ': status code match expected list', function () {
  pm.expect(statusPass, 'Expected statuses: ' + expectedStatuses.join('|') + ', actual: ' + pm.response.code).to.eql(true);
});

if (maxResponseTime) {
  pm.test(tcId + ': response time <= ' + maxResponseTime + 'ms', function () {
    pm.expect(pm.response.responseTime).to.be.below(maxResponseTime);
  });
}

if (pm.response.code >= 400 && expectedErrorCode) {
  pm.test(tcId + ': error code matches', function () {
    pm.expect(extractErrorCode(responseJson)).to.eql(expectedErrorCode);
  });
}

if (pm.response.code >= 200 && pm.response.code < 300 && expectedFields.length > 0) {
  pm.test(tcId + ': expected fields exist', function () {
    expectedFields.forEach(field => {
      const val = getFieldCaseInsensitive(payload, field);
      pm.expect(val, 'Missing field: ' + field).to.not.equal(undefined);
    });
  });
  fieldsPass = expectedFields.every(field => getFieldCaseInsensitive(payload, field) !== undefined);
}

if (pm.response.code >= 200 && pm.response.code < 300 && payload && typeof payload === 'object') {
  const totalTenants = getNumberField(payload, 'TotalTenants');
  const activeTenants = getNumberField(payload, 'ActiveTenants');
  const totalRevenue = getNumberField(payload, 'TotalRevenue');
  const planTenantCounts = getFieldCaseInsensitive(payload, 'PlanTenantCounts');
  const revenueTrend = getFieldCaseInsensitive(payload, 'RevenueTrend');

  if (totalTenants !== null && activeTenants !== null) {
    pm.test(tcId + ': ActiveTenants <= TotalTenants', function () {
      pm.expect(activeTenants).to.be.at.most(totalTenants);
    });
  }

  if (totalRevenue !== null) {
    pm.test(tcId + ': TotalRevenue >= 0', function () {
      pm.expect(totalRevenue).to.be.at.least(0);
    });
  }

  if (Array.isArray(planTenantCounts) && totalTenants !== null) {
    const sum = planTenantCounts.reduce((acc, item) => acc + (Number(item.TenantCount ?? item.tenantCount ?? 0)), 0);
    pm.test(tcId + ': PlanTenantCounts sum equals TotalTenants', function () {
      pm.expect(sum).to.eql(totalTenants);
    });

    pm.test(tcId + ': PlanTenantCounts includes Free/Premium/Enterprise', function () {
      const plans = planTenantCounts.map(p => String(p.Plan ?? p.plan ?? '').toLowerCase());
      pm.expect(plans).to.include('free');
      pm.expect(plans).to.include('premium');
      pm.expect(plans).to.include('enterprise');
    });
  }

  if (Array.isArray(revenueTrend)) {
    pm.test(tcId + ': RevenueTrend items have Month and Revenue', function () {
      revenueTrend.forEach(item => {
        pm.expect(item.Month ?? item.month).to.not.equal(undefined);
        pm.expect(item.Revenue ?? item.revenue).to.not.equal(undefined);
      });
    });
  }
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
  console.log('Expected fields      : ' + (expectedFields.join(', ') || '(none)'));
  console.log('Fields check         : ' + (fieldsPass ? 'PASS' : 'FAIL'));
  console.log('Final case result    : ' + finalResult);
  console.log('Response text        : ' + responseText);
  console.log('Request URL          : ' + pm.request.url);
  console.log('Auth token raw       : ' + (pm.variables.get('itc_auth_token_raw') || '(none)'));
  if (extra) console.log('Integration detail   : ' + extra);
  console.log('Timestamp            : ' + new Date().toISOString());
  console.log('============================================================');
}

if (action === 'compare_create' || action === 'compare_lock') {
  const statsUrl = pm.request.url.toString();
  const sysToken = pm.environment.get('sysadmin_token') || '';
  const baseUrl = pm.environment.get('base_url') || '';
  const beforeTotal = getNumberField(payload, 'TotalTenants');
  const beforeActive = getNumberField(payload, 'ActiveTenants');
  const beforeLocked = (beforeTotal !== null && beforeActive !== null) ? (beforeTotal - beforeActive) : null;

  function compareAfter(res, extra) {
    const afterJson = safeParseResponse(res);
    const afterPayload = getValuePayload(afterJson);
    const afterTotal = getNumberField(afterPayload, 'TotalTenants');
    const afterActive = getNumberField(afterPayload, 'ActiveTenants');
    const afterLocked = (afterTotal !== null && afterActive !== null) ? (afterTotal - afterActive) : null;

    let totalDeltaPass = true;
    if (expectedTotalDeltaRaw && beforeTotal !== null && afterTotal !== null) {
      totalDeltaPass = (afterTotal - beforeTotal) === Number(expectedTotalDeltaRaw);
    }

    let activeDeltaPass = true;
    if (expectedActiveDeltaRaw && beforeActive !== null && afterActive !== null) {
      activeDeltaPass = (afterActive - beforeActive) === Number(expectedActiveDeltaRaw);
    }

    let lockedDeltaPass = true;
    if (expectedLockedDeltaRaw && beforeLocked !== null && afterLocked !== null) {
      lockedDeltaPass = (afterLocked - beforeLocked) === Number(expectedLockedDeltaRaw);
    }

    if (expectedTotalDeltaRaw && beforeTotal !== null && afterTotal !== null) {
      pm.test(tcId + ': totalTenants delta check', function () {
        pm.expect(totalDeltaPass, 'expected delta=' + expectedTotalDeltaRaw + ', actual=' + (afterTotal - beforeTotal)).to.eql(true);
      });
    }

    if (expectedActiveDeltaRaw && beforeActive !== null && afterActive !== null) {
      pm.test(tcId + ': activeTenants delta check', function () {
        pm.expect(activeDeltaPass, 'expected delta=' + expectedActiveDeltaRaw + ', actual=' + (afterActive - beforeActive)).to.eql(true);
      });
    }

    if (expectedLockedDeltaRaw && beforeLocked !== null && afterLocked !== null) {
      pm.test(tcId + ': lockedTenants delta check', function () {
        pm.expect(lockedDeltaPass, 'expected delta=' + expectedLockedDeltaRaw + ', actual=' + (afterLocked - beforeLocked)).to.eql(true);
      });
    }

    const finalResult = statusPass && fieldsPass && totalDeltaPass && activeDeltaPass && lockedDeltaPass ? 'PASS' : 'FAIL';
    printFinalReport(finalResult, extra);
  }

  if (action === 'compare_create') {
    const email = 'owner.stats.' + Date.now() + '@test.com';
    const body = JSON.stringify({
      restaurantName: 'Auto Restaurant ' + Date.now(),
      ownerName: 'Owner ' + Date.now(),
      email: email,
      password: 'ValidPass123!',
      address: '123 Auto Street',
      phoneNumber: '0901234567',
      planType: 'Free'
    });

    pm.sendRequest({
      url: baseUrl + '/api/v1/tenants/registration',
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      body: { mode: 'raw', raw: body }
    }, function (err, res) {
      if (err || !res) {
        pm.expect.fail('Create tenant failed: ' + (err ? err.message : 'no response'));
        return;
      }
      fetchStats(statsUrl, sysToken, function (err2, res2) {
        if (err2) { pm.expect.fail(err2); return; }
        compareAfter(res2, 'compare_create done');
      });
    });
    return;
  }

  if (action === 'compare_lock') {
    const tenantId = pm.environment.get('tenant_lock_id') || '';
    if (!tenantId) {
      pm.expect.fail('Missing tenant_lock_id in environment.');
      return;
    }
    pm.sendRequest({
      url: baseUrl + '/api/v1/tenants/' + encodeURIComponent(tenantId) + '/lock',
      method: 'POST',
      header: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + sysToken },
      body: { mode: 'raw', raw: JSON.stringify({ reason: 'Auto lock for stats', lockDurationDays: 7, isPermanent: false }) }
    }, function (err, res) {
      if (err || !res) {
        pm.expect.fail('Lock tenant failed: ' + (err ? err.message : 'no response'));
        return;
      }
      fetchStats(statsUrl, sysToken, function (err2, res2) {
        if (err2) { pm.expect.fail(err2); return; }
        compareAfter(res2, 'compare_lock done');
      });
    });
    return;
  }
}

printFinalReport((statusPass && fieldsPass) ? 'PASS' : 'FAIL', 'No compare action.');
```

---

## Huong dan chay runner
1. Chay request `00_SETUP_AutoSeed_RestaurantStats`.
2. Mo request Admin Stats va dat URL = {{base_url}}{{stats_restaurant_endpoint}}.
3. Dat Authorization = Bearer {{auth_token_dynamic}}.
4. Nap file ITC_49.13.csv trong Collection Runner.
5. Chay 1 lan de cover ITC_49.13 -> ITC_49.24.
