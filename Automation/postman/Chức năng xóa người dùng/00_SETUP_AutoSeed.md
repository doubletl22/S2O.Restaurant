# 00_SETUP_AutoSeed

**Muc dich:** Tu dong tao SystemAdmin target + SystemAdmin self (khong dung admin seed), tao Owner + Staff va set bien moi truong de chay ITC_12.19.

**Bat buoc set:**
- `seed_admin_email`
- `seed_admin_password`

**Cach dung:** Tao 1 request `00_SETUP_AutoSeed_DeleteUser` (bat ky method), dan script duoi day vao **Tests**, chay 1 lan truoc Runner.

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
