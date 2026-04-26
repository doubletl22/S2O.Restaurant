# ITC_5.27 - Runner tong hop ITC_5.27 den ITC_5.48 (Data-Driven)

## Muc tieu
Dung 1 request dang ky nha hang + 1 file CSV de chay toan bo test case ITC_5.27 -> ITC_5.48 trong Collection Runner.

## Pham vi
- Happy path: 5.27, 5.28, 5.29
- Missing fields: 5.30 -> 5.35
- Invalid email/password boundary: 5.36 -> 5.40
- Duplicate/business rule: 5.41 -> 5.43
- Format/whitespace/content-type: 5.44 -> 5.47
- Integration login: 5.48

## Cau hinh request
- Method: POST
- URL: {{base_url}}/api/v1/tenants/registration
- Authorization: Bearer {{token}}
- Body type: raw (JSON)

Ghi chu quan trong:
- Request body phai dat la chuoi dong: {{request_body_dynamic}}
- Header Content-Type se duoc script tu dong dat theo CSV

---

## File CSV su dung
- ITC_5.27.csv

Cot CSV:
- tc_id
- description
- raw_mode
- content_type
- restaurantName
- ownerName
- email
- password
- address
- phoneNumber
- planType
- expected_status
- expect_guid
- expected_error_contains
- run_login_check
- expected_login_ok
- expected_login_fail

---

## Body chung de chay BVA/Data-driven

Body chung template:

```json
{
  "restaurantName": "<restaurantName>",
  "ownerName": "<ownerName>",
  "email": "<email>",
  "password": "<password>",
  "address": "<address>",
  "phoneNumber": "<phoneNumber>",
  "planType": "<planType>"
}
```

Cac token dac biet trong CSV:
- <AUTO_RESTAURANT>, <AUTO_OWNER>, <AUTO_EMAIL>: sinh dong theo timestamp
- <VALID_PASSWORD>: ValidPass123!
- <SEED_EMAIL_ITC_5_27>: dung email da tao o ITC_5.27
- <SEED_RESTAURANT_ITC_5_27>: dung restaurantName da tao o ITC_5.27
- <WS>: chuoi toan khoang trang
- <EMPTY>: chuoi rong
- <NULL>: null
- <MISSING>: loai bo field khoi body

---

## Pre-request Script

```javascript
function mapToken(raw, fieldName, context) {
  if (raw === '<MISSING>') return { include: false, value: undefined };
  if (raw === '<NULL>') return { include: true, value: null };
  if (raw === '<EMPTY>') return { include: true, value: '' };
  if (raw === '<WS>') return { include: true, value: '     ' };

  if (raw === '<AUTO_RESTAURANT>') return { include: true, value: `Restaurant ${context.tcId} ${context.timestamp}` };
  if (raw === '<AUTO_OWNER>') return { include: true, value: `Owner ${context.tcId} ${context.timestamp}` };
  if (raw === '<AUTO_EMAIL>') return { include: true, value: `owner.${context.tcId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}.${context.timestamp}${context.randomStr}@test.com` };
  if (raw === '<VALID_PASSWORD>') return { include: true, value: 'ValidPass123!' };

  if (raw === '<SEED_EMAIL_ITC_5_27>') {
    const seed = pm.environment.get('seed_email_itc_5_27') || pm.environment.get('test_email_5_27') || '';
    return { include: true, value: seed };
  }

  if (raw === '<SEED_RESTAURANT_ITC_5_27>') {
    const seed = pm.environment.get('seed_restaurant_itc_5_27') || pm.environment.get('test_restaurant_name_5_27') || '';
    return { include: true, value: seed };
  }

  return { include: true, value: raw };
}

const tcId = pm.iterationData.get('tc_id') || 'UNKNOWN_TC';
const description = pm.iterationData.get('description') || '';
const rawMode = (pm.iterationData.get('raw_mode') || 'NORMAL').toUpperCase();
const contentType = pm.iterationData.get('content_type') || 'application/json';

const timestamp = Date.now();
const randomStr = Math.random().toString(36).substring(2, 8);
const context = { tcId, timestamp, randomStr };

const mapped = {
  restaurantName: mapToken(pm.iterationData.get('restaurantName'), 'restaurantName', context),
  ownerName: mapToken(pm.iterationData.get('ownerName'), 'ownerName', context),
  email: mapToken(pm.iterationData.get('email'), 'email', context),
  password: mapToken(pm.iterationData.get('password'), 'password', context),
  address: mapToken(pm.iterationData.get('address'), 'address', context),
  phoneNumber: mapToken(pm.iterationData.get('phoneNumber'), 'phoneNumber', context),
  planType: mapToken(pm.iterationData.get('planType'), 'planType', context)
};

const payload = {};
Object.keys(mapped).forEach((k) => {
  if (mapped[k].include) {
    payload[k] = mapped[k].value;
  }
});

let rawBody = '';
if (rawMode === 'INVALID_JSON') {
  rawBody = '{"invalid_json": '; // chu y: co y tao sai syntax
} else {
  rawBody = JSON.stringify(payload);
}

pm.variables.set('request_body_dynamic', rawBody);

pm.request.headers.upsert({ key: 'Content-Type', value: contentType });

pm.variables.set('itc_tc_id', tcId);
pm.variables.set('itc_description', description);
pm.variables.set('itc_content_type', contentType);
pm.variables.set('itc_request_payload', rawBody);

if (mapped.email.include) pm.variables.set('itc_email_current', String(mapped.email.value || ''));
if (mapped.password.include) pm.variables.set('itc_password_current', String(mapped.password.value || ''));
if (mapped.restaurantName.include) pm.variables.set('itc_restaurant_current', String(mapped.restaurantName.value || ''));

if (tcId === 'ITC_5.27' && mapped.email.include) {
  pm.environment.set('seed_email_itc_5_27', String(mapped.email.value || ''));
}
if (tcId === 'ITC_5.27' && mapped.restaurantName.include) {
  pm.environment.set('seed_restaurant_itc_5_27', String(mapped.restaurantName.value || ''));
}

console.log('============================================================');
console.log('PRE-RUN REPORT');
console.log('TC ID          : ' + tcId);
console.log('Description    : ' + description);
console.log('Raw mode       : ' + rawMode);
console.log('Content-Type   : ' + contentType);
console.log('Request body   : ' + rawBody);
console.log('============================================================');
```

---

## Request Body (raw)

```json
{{request_body_dynamic}}
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
  if (typeof response === 'string') return response.toLowerCase();
  if (response.message) return String(response.message).toLowerCase();
  if (response.error) return String(response.error).toLowerCase();
  if (response.errors) return JSON.stringify(response.errors).toLowerCase();
  return JSON.stringify(response).toLowerCase();
}

const tcId = pm.iterationData.get('tc_id') || 'UNKNOWN_TC';
const description = pm.iterationData.get('description') || '';
const expectedStatuses = parseExpectedStatus(pm.iterationData.get('expected_status'));
const expectGuid = toBoolean(pm.iterationData.get('expect_guid'));
const expectedErrorContains = (pm.iterationData.get('expected_error_contains') || '').toLowerCase();
const runLoginCheck = toBoolean(pm.iterationData.get('run_login_check'));
const loginOkStatuses = parseExpectedStatus(pm.iterationData.get('expected_login_ok'));
const loginFailStatuses = parseExpectedStatus(pm.iterationData.get('expected_login_fail'));

const response = safeParseResponse();
const responseText = pm.response.text();
const errorText = extractErrorText(response);

const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const actualIsGuid = typeof response === 'string' && guidRegex.test(response);

const statusPass = expectedStatuses.includes(pm.response.code);
const hasSuccessExpected = expectedStatuses.includes(200);
const hasErrorExpected = expectedStatuses.some((x) => x >= 400);

let guidPass = expectGuid ? actualIsGuid : !actualIsGuid;
if (hasSuccessExpected && hasErrorExpected) {
  guidPass = pm.response.code === 200 ? actualIsGuid : true;
}

const shouldCheckErrorToken = expectedErrorContains && (pm.response.code >= 400 || !hasSuccessExpected);
const errorPass = shouldCheckErrorToken ? errorText.includes(expectedErrorContains) : true;

pm.test(tcId + ': status code match expected list', function () {
  pm.expect(statusPass, 'Expected statuses: ' + expectedStatuses.join('|') + ', actual: ' + pm.response.code).to.eql(true);
});

pm.test(tcId + ': response GUID expectation', function () {
  pm.expect(guidPass, 'expect_guid=' + expectGuid + ', actual_is_guid=' + actualIsGuid).to.eql(true);
});

pm.test(tcId + ': expected error token check', function () {
  pm.expect(errorPass, 'expected_error_contains=' + expectedErrorContains + ', actual_error_text=' + errorText).to.eql(true);
});

if (actualIsGuid) {
  pm.environment.set('tenant_id_' + tcId, response);
}

function printFinalReport(finalResult, extra) {
  console.log('============================================================');
  console.log('POST-RUN REPORT');
  console.log('TC ID                : ' + tcId);
  console.log('Description          : ' + description);
  console.log('Expected status list : ' + expectedStatuses.join('|'));
  console.log('Actual status        : ' + pm.response.code);
  console.log('Status check         : ' + (statusPass ? 'PASS' : 'FAIL'));
  console.log('Expected GUID        : ' + expectGuid);
  console.log('Actual is GUID       : ' + actualIsGuid);
  console.log('GUID check           : ' + (guidPass ? 'PASS' : 'FAIL'));
  console.log('Expected error token : ' + (expectedErrorContains || '(none)'));
  console.log('Error check          : ' + (errorPass ? 'PASS' : 'FAIL'));
  console.log('Final case result    : ' + finalResult);
  console.log('Response text        : ' + responseText);
  console.log('Request content-type : ' + pm.variables.get('itc_content_type'));
  console.log('Request body sent    : ' + pm.variables.get('itc_request_payload'));
  console.log('Email used           : ' + (pm.variables.get('itc_email_current') || '(none)'));
  console.log('Restaurant used      : ' + (pm.variables.get('itc_restaurant_current') || '(none)'));
  if (extra) console.log('Integration detail   : ' + extra);
  console.log('Timestamp            : ' + new Date().toISOString());
  console.log('============================================================');
}

if (!runLoginCheck) {
  const finalResult = statusPass && guidPass && errorPass ? 'PASS' : 'FAIL';
  printFinalReport(finalResult, 'No integration login check for this case.');
} else {
  pm.test(tcId + ': precondition for login check is registration success GUID', function () {
    pm.expect(statusPass && actualIsGuid, 'Registration must succeed before login verification.').to.eql(true);
  });

  const baseUrl = pm.environment.get('base_url');
  const loginUrl = baseUrl + '/api/v1/auth/login';
  const email = pm.variables.get('itc_email_current');
  const correctPassword = pm.variables.get('itc_password_current');
  const wrongPassword = 'WrongPassword123';

  pm.test(tcId + ': login integration (correct and wrong password)', function (done) {
    if (!(statusPass && actualIsGuid)) {
      printFinalReport('FAIL', 'Skip login calls because registration failed.');
      done();
      return;
    }

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
      const okText = resOk.text();
      let okJson = null;
      try { okJson = resOk.json(); } catch (e) {}
      const token = okJson ? (okJson.accessToken || okJson.token || '') : '';
      const loginOkPass = loginOkStatuses.includes(okStatus) && typeof token === 'string' && token.split('.').length === 3;

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
        const failText = resFail.text();
        const loginFailPass = loginFailStatuses.includes(failStatus);

        pm.expect(loginOkPass, 'Login with correct password failed. status=' + okStatus + ', body=' + okText).to.eql(true);
        pm.expect(loginFailPass, 'Login with wrong password did not fail as expected. status=' + failStatus + ', body=' + failText).to.eql(true);

        const finalResult = statusPass && guidPass && errorPass && loginOkPass && loginFailPass ? 'PASS' : 'FAIL';
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

1. Chay 00_AUTH_Login de cap nhat token.
2. Mo request ITC_5.27 va dat Body raw = {{request_body_dynamic}}.
3. Nap file ITC_5.27.csv trong Collection Runner.
4. Chay 1 lan de cover toan bo ITC_5.27 -> ITC_5.48.
5. Lay log REPORT moi iteration de dua vao bao cao.

---

## Dinh dang log cho bao cao

Moi iteration se in 2 khoi log:
- PRE-RUN REPORT: input va body gui di
- POST-RUN REPORT: expected, actual, PASS/FAIL tung tieu chi, ket qua cuoi