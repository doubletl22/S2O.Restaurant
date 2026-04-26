# 00_SETUP_AutoSeed

**Muc dich:** Lay sysadmin token + tao staff token khong du quyen + tao tenant de lock cho ITC_49.13.

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
