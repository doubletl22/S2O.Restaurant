# 00_SETUP_AutoSeed

**Muc dich:** Tao 1 SystemAdmin target (khong dung admin seed), login lay token va set bien de chay ITC_11.15.

**Bat buoc set:**
- `seed_admin_email`
- `seed_admin_password`

**Cach dung:** Tao 1 request `00_SETUP_AutoSeed_UserProfile` (bat ky method), dan script duoi day vao **Tests**, chay 1 lan truoc Runner.

```javascript
pm.test('AUTO SETUP (seed admin for user profile)', function (done) {
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

  login(seedAdminEmail, seedAdminPassword, function (err, sysToken) {
    if (err) { pm.expect.fail(err); done(); return; }
    pm.environment.set('sysadmin_token', sysToken);

    const adminTargetEmail = `admin.profile.${now}.${random}@test.com`;
    const adminTargetPassword = 'Admin@123';

    createSystemAdmin(sysToken, adminTargetEmail, adminTargetPassword, function (err2, id) {
      if (err2) { pm.expect.fail(err2); done(); return; }

      pm.environment.set('admin_target_id', id);
      pm.environment.set('admin_target_email', adminTargetEmail);
      pm.environment.set('admin_target_password', adminTargetPassword);
      pm.environment.set('admin_target_new_password', 'AdminNew123!');
      pm.environment.set('admin_target_new_password_2', 'AdminNew456!');

      login(adminTargetEmail, adminTargetPassword, function (err3, token) {
        if (err3) { pm.expect.fail(err3); done(); return; }
        pm.environment.set('admin_target_token', token);
        console.log('AUTO SETUP DONE');
        done();
      });
    });
  });
});
```
