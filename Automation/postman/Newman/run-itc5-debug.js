const fs = require('fs');
const { parse } = require('csv-parse/sync');
const newman = require('newman');

const rows = parse(fs.readFileSync('csv/ITC_5.27.csv', 'utf8'), {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

newman.run(
  {
    collection: 'identity service.postman_collection.json',
    environment: 'S2O.postman_environment.json',
    folder: 'ITC_5.27 - Chức năng đăng kí nhà hàng',
    iterationData: rows,
    reporters: ['cli'],
    timeoutRequest: 15000,
    timeout: 180000,
    color: 'on'
  },
  (err, summary) => {
    const failures = (summary && summary.run && summary.run.failures) || [];
    console.log('\n================ FAILURE SUMMARY ================');
    console.log('Failure count:', failures.length);
    failures.forEach((f, idx) => {
      const it = f.cursor && f.cursor.iteration !== undefined ? Number(f.cursor.iteration) + 1 : '?';
      const msg = f.error && f.error.message ? f.error.message : 'Unknown failure';
      console.log(`${idx + 1}. Iteration ${it}: ${msg}`);
    });
    process.exit(err || failures.length ? 1 : 0);
  }
);
