# 00_SETUP_AutoSeed

**Muc dich:** Tu dong tao SystemAdmin test (khong dung admin seed), Owner + Staff va set bien moi truong de chay ITC_10.19.

**Cach dung:** Tao 1 request `00_SETUP_AutoSeed` trong Postman (bat ky method), dan script duoi day vao **Tests**, chay 1 lan truoc Runner.

**Bien seed login (chi de lay token):**
- `seed_admin_email` (mac dinh: admin@s2o.com)
- `seed_admin_password` (mac dinh: Admin@123)

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
          const ownerIdFound = ownerUser ? (ownerUser.Id || ownerUser.id || '') : '';
          if (!ownerUser || !ownerIdFound) return cb('Owner user not found after registration.');
          pm.environment.set('owner_id', ownerIdFound);
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
      if (res.code !== 200) return cb('Create staff failed. status=' + res.code + ', body=' + res.text());
      let json = null;
      try { json = res.json(); } catch (e) {}
      const userId = json ? (json.UserId || json.userId || '') : '';
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
