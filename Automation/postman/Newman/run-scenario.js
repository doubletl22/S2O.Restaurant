#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType
} = require('docx');

let newman;
try {
  newman = require('newman');
} catch (e) {
  console.error('Newman package not found in this folder.');
  console.error('Install with: npm i -D newman');
  process.exit(1);
}

const args = process.argv.slice(2);
const continueOnError = args.includes('--continue-on-error');
const writeBackEnvironment = args.includes('--write-back-environment');
const skipDocxReport = args.includes('--skip-docx-report');

const root = __dirname;
const collectionPath = path.join(root, 'identity service.postman_collection.json');
const environmentPath = path.join(root, 'S2O.postman_environment.json');
const runtimeEnvironmentPath = path.join(root, 'S2O.runtime_environment.json');
const reportsRoot = path.join(root, 'reports', `run-${new Date().toISOString().replace(/[:.]/g, '-')}`);

if (!fs.existsSync(collectionPath)) {
  console.error(`Collection file not found: ${collectionPath}`);
  process.exit(1);
}

if (!fs.existsSync(environmentPath)) {
  console.error(`Environment file not found: ${environmentPath}`);
  process.exit(1);
}

if (!skipDocxReport) {
  fs.mkdirSync(reportsRoot, { recursive: true });
}

const scenario = [
  { step: 'Login Admin' },
  { step: 'ITC_5.27 - Chức năng đăng kí nhà hàng', csv: 'ITC_5.27.csv' },
  { step: '00_SETUP_Khóa và mở khóa người dùng' },
  { step: 'ITC_10.19 - Chức năng khóa và mở khóa người dùng', csv: 'ITC_10.19.csv' },
  { step: '00_SETUP_Chức năng xóa người dùng' },
  { step: 'ITC_12.19 - Chức năng xóa người dùng', csv: 'ITC_12.19.csv' },
  { step: '00_SETUP_Chức năng đổi mật khẩu người dùng' },
  { step: 'ITC_13.19 - Chức năng đổi mật khẩu người dùng', csv: 'ITC_13.19.csv' },
  { step: '00_SETUP_Chức năng thống kê người dùng' },
  { step: 'ITC_15.15 - Chức năng thống kê người dùng', csv: 'ITC_15.15.csv' },
  { step: '# 00_SETUP_Thống kê nhà hàng' },
  { step: 'ITC_49.13 - Chức năng thống kê nhà hàng', csv: 'ITC_49.13.csv' },
  { step: '00_SETUP_Cập nhật hồ sơ người dùng' },
  { step: 'ITC_11.15 - Cập nhật hồ sơ người dùng', csv: 'ITC_11.15.csv' }
];

fs.copyFileSync(environmentPath, runtimeEnvironmentPath);

function sanitizeFileName(name) {
  return String(name || 'unknown')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 140);
}

function toFileToken(text, maxLen = 90) {
  const cleaned = String(text || '')
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, ' ')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!cleaned) return 'khong_mo_ta';
  return cleaned.slice(0, maxLen);
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function parseCsvFile(csvPath) {
  const csvRaw = fs.readFileSync(csvPath, 'utf8');
  return parse(csvRaw, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
}

function extractItcTag(text) {
  const match = String(text || '').match(/ITC[_\s-]?(\d+\.\d+)/i);
  if (!match) return '';
  return `ITC_${match[1]}`;
}

function resolveReportGroup(stepName, tcId) {
  const tcGroup = extractItcTag(tcId);
  if (tcGroup) return tcGroup;

  const stepGroup = extractItcTag(stepName);
  if (stepGroup) return stepGroup;

  if (/^\s*0*#?\s*00_SETUP/i.test(String(stepName || ''))) {
    return 'SETUP';
  }

  if (/login/i.test(String(stepName || ''))) {
    return 'LOGIN';
  }

  return 'MISC';
}

function parseExpectedFields(dataRow) {
  const out = {};
  if (!dataRow || typeof dataRow !== 'object') return out;

  Object.keys(dataRow).forEach((key) => {
    if (key.toLowerCase().startsWith('expected')) {
      out[key] = dataRow[key];
    }
  });

  return out;
}

function getRequestBodyText(request) {
  if (!request || !request.body) return '';

  const mode = request.body.mode;
  if (mode === 'raw') {
    return request.body.raw || '';
  }

  try {
    return JSON.stringify(request.body.toJSON(), null, 2);
  } catch (e) {
    return '';
  }
}

function getResponseText(response) {
  if (!response) return '';

  try {
    if (typeof response.text === 'function') {
      return response.text();
    }
  } catch (e) {
    // ignore and fallback
  }

  if (response.stream) {
    try {
      return Buffer.from(response.stream).toString('utf8');
    } catch (e) {
      return '';
    }
  }

  return '';
}

function toPrettyJson(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;

  try {
    return JSON.stringify(value, null, 2);
  } catch (e) {
    return String(value);
  }
}

function flattenObjectToPairs(input, prefix = '') {
  const pairs = [];

  if (input === null || input === undefined) {
    pairs.push([prefix || 'value', '']);
    return pairs;
  }

  if (Array.isArray(input)) {
    if (input.length === 0) {
      pairs.push([prefix || 'value', '(empty array)']);
      return pairs;
    }

    input.forEach((item, idx) => {
      const nextPrefix = prefix ? `${prefix}[${idx + 1}]` : `[${idx + 1}]`;
      pairs.push(...flattenObjectToPairs(item, nextPrefix));
    });
    return pairs;
  }

  if (typeof input === 'object') {
    const keys = Object.keys(input);
    if (keys.length === 0) {
      pairs.push([prefix || 'value', '(empty object)']);
      return pairs;
    }

    keys.forEach((key) => {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      pairs.push(...flattenObjectToPairs(input[key], nextPrefix));
    });
    return pairs;
  }

  pairs.push([prefix || 'value', String(input)]);
  return pairs;
}

function parseMaybeJson(rawText) {
  const text = String(rawText || '').trim();
  if (!text) return null;
  if (!(text.startsWith('{') || text.startsWith('['))) return null;

  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

function tableRowsFromObject(obj, emptyLabel = '(none)') {
  if (!obj || typeof obj !== 'object') {
    return [['value', emptyLabel]];
  }

  const pairs = flattenObjectToPairs(obj);
  if (pairs.length === 0) return [['value', emptyLabel]];
  return pairs;
}

function tableRowsFromHeaders(headers) {
  const rows = ensureArray(headers).map((h) => [
    h && h.key ? h.key : '(unknown)',
    h && h.value !== undefined ? h.value : ''
  ]);

  return rows.length > 0 ? rows : [['Headers', '(none)']];
}

function textBlockParagraphs(text) {
  const lines = String(text || '').split(/\r?\n/);
  if (lines.length === 0) {
    return [new Paragraph('')];
  }

  return lines.map((line) => new Paragraph({ text: line.length === 0 ? ' ' : line }));
}

function buildSummaryTable(rows, options = {}) {
  const leftColTwip = options.leftColTwip || 3200;
  const rightColTwip = options.rightColTwip || 7600;

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    columnWidths: [leftColTwip, rightColTwip],
    rows: rows.map(([k, v]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: leftColTwip, type: WidthType.DXA },
            children: [new Paragraph({ text: String(k || '') })]
          }),
          new TableCell({
            width: { size: rightColTwip, type: WidthType.DXA },
            children: [new Paragraph({ text: String(v === undefined || v === null ? '' : v) })]
          })
        ]
      })
    )
  });
}

function buildResultNarrative({ caseStatus, responseCode, responseStatus, responseTime, passCount, failCount }) {
  const statusText = `${responseCode || ''} ${responseStatus || ''}`.trim() || '(no status)';
  const perfText = responseTime === '' || responseTime === undefined || responseTime === null
    ? 'Khong co thong tin thoi gian phan hoi.'
    : `Thoi gian phan hoi la ${responseTime} ms.`;

  if (caseStatus === 'PASS') {
    return [
      `Case dat ket qua PASS. He thong tra ve HTTP ${statusText}.`,
      perfText,
      `Tong cong ${passCount} assertion dat va ${failCount} assertion truot.`
    ];
  }

  return [
    `Case ket luan FAIL. He thong tra ve HTTP ${statusText}.`,
    perfText,
    `Tong cong ${passCount} assertion dat va ${failCount} assertion truot. Can xem muc Assertion Detail de thay ly do cu the.`
  ];
}

async function writeCaseDocx({
  stepConfig,
  runIndex,
  execution,
  dataRow,
  assertionList,
  consoleLines,
  stepFolder
}) {
  const cursor = execution.cursor || {};
  const iterationIndex = Number(cursor.iteration || 0);
  const iterationNumber = iterationIndex + 1;

  const tcId = (dataRow && (dataRow.tc_id || dataRow.tcId)) || `ITER_${iterationNumber}`;
  const description = (dataRow && dataRow.description) || '';
  const featureName = stepConfig.step.includes(' - ')
    ? stepConfig.step.split(' - ').slice(1).join(' - ').trim()
    : stepConfig.step;

  const request = execution.request;
  const response = execution.response;

  const requestMethod = request ? request.method : '';
  const requestUrl = request && request.url ? request.url.toString() : '';
  const requestHeaders = request && request.headers ? request.headers.toJSON() : [];
  const requestBody = getRequestBodyText(request);

  const responseCode = response ? response.code : '';
  const responseStatus = response ? response.status : '';
  const responseTime = response ? response.responseTime : '';
  const responseSize = response && response.responseSize !== undefined ? response.responseSize : '';
  const responseBody = getResponseText(response);

  const expectedMap = parseExpectedFields(dataRow);

  const passCount = assertionList.filter((a) => !a.error).length;
  const failCount = assertionList.filter((a) => a.error).length;

  const caseStatus = failCount > 0 ? 'FAIL' : 'PASS';
  const reportGroup = resolveReportGroup(stepConfig.step, tcId);
  const caseDescriptionToken = toFileToken(description || 'khong_mo_ta', 100);

  const headerRows = [
    ['Case ID', tcId],
    ['Case Name / Description', description || '(none)'],
    ['Feature', featureName],
    ['Collection Item', stepConfig.step],
    ['Iteration', iterationNumber],
    ['Case Status', caseStatus],
    ['Generated At', new Date().toISOString()]
  ];

  const requestRows = [
    ['Method', requestMethod],
    ['URL', requestUrl],
    ['Request Header Count', requestHeaders.length],
    ['Report Source', 'Generated from Newman execution summary']
  ];

  const resultRows = [
    ['Expected Field Count', Object.keys(expectedMap).length],
    ['Actual HTTP Status', `${responseCode} ${responseStatus}`.trim()],
    ['Actual Response Time (ms)', responseTime],
    ['Actual Response Size (bytes)', responseSize],
    ['Assertions Passed', passCount],
    ['Assertions Failed', failCount]
  ];

  const inputRows = tableRowsFromObject(dataRow || {}, '(no input row)');
  const expectedRows = tableRowsFromObject(expectedMap, '(no expected field)');
  const headerRowsDetail = tableRowsFromHeaders(requestHeaders);

  const requestBodyJson = parseMaybeJson(requestBody);
  const requestBodyRows = requestBodyJson
    ? tableRowsFromObject(requestBodyJson, '(empty body)')
    : [['Body Text', requestBody || '(empty)']];

  const responseBodyJson = parseMaybeJson(responseBody);
  const responseBodyRows = responseBodyJson
    ? tableRowsFromObject(responseBodyJson, '(empty body)')
    : [['Body Text', responseBody || '(empty)']];

  const conclusionLines = buildResultNarrative({
    caseStatus,
    responseCode,
    responseStatus,
    responseTime,
    passCount,
    failCount
  });

  const assertionLines = assertionList.length === 0
    ? ['(No assertion captured)']
    : assertionList.map((a, idx) => {
        const state = a.error ? 'FAIL' : 'PASS';
        const reason = a.error ? ` | ${a.error.message || String(a.error)}` : '';
        return `${idx + 1}. [${state}] ${a.assertion || '(unnamed)'}${reason}`;
      });

  const allLogs = consoleLines.length === 0 ? ['(No console log)'] : consoleLines;

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: `Test Case Report - ${tcId}`,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.LEFT
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Summary', bold: true })],
            heading: HeadingLevel.HEADING_1
          }),
          buildSummaryTable(headerRows, { leftColTwip: 3400, rightColTwip: 7400 }),

          new Paragraph({
            children: [new TextRun({ text: 'Request Configuration', bold: true })],
            heading: HeadingLevel.HEADING_1
          }),
          buildSummaryTable(requestRows, { leftColTwip: 3400, rightColTwip: 7400 }),

          new Paragraph({
            children: [new TextRun({ text: 'Request Headers', bold: true })],
            heading: HeadingLevel.HEADING_2
          }),
          buildSummaryTable(headerRowsDetail, { leftColTwip: 3000, rightColTwip: 7800 }),

          new Paragraph({
            children: [new TextRun({ text: 'Input Data (CSV Row)', bold: true })],
            heading: HeadingLevel.HEADING_1
          }),
          buildSummaryTable(inputRows, { leftColTwip: 3400, rightColTwip: 7400 }),

          new Paragraph({
            children: [new TextRun({ text: 'Expected Data (from CSV)', bold: true })],
            heading: HeadingLevel.HEADING_2
          }),
          buildSummaryTable(expectedRows, { leftColTwip: 3400, rightColTwip: 7400 }),

          new Paragraph({
            children: [new TextRun({ text: 'Request Body', bold: true })],
            heading: HeadingLevel.HEADING_1
          }),
          buildSummaryTable(requestBodyRows, { leftColTwip: 3400, rightColTwip: 7400 }),

          new Paragraph({
            children: [new TextRun({ text: 'Detailed Result (Expected vs Actual)', bold: true })],
            heading: HeadingLevel.HEADING_1
          }),
          buildSummaryTable(resultRows, { leftColTwip: 3400, rightColTwip: 7400 }),

          new Paragraph({
            children: [new TextRun({ text: 'Narrative Analysis', bold: true })],
            heading: HeadingLevel.HEADING_2
          }),
          ...textBlockParagraphs(conclusionLines.join('\n')),

          new Paragraph({
            children: [new TextRun({ text: 'Assertion Detail', bold: true })],
            heading: HeadingLevel.HEADING_1
          }),
          ...textBlockParagraphs(assertionLines.join('\n')),

          new Paragraph({
            children: [new TextRun({ text: 'Response Body', bold: true })],
            heading: HeadingLevel.HEADING_1
          }),
          buildSummaryTable(responseBodyRows, { leftColTwip: 3400, rightColTwip: 7400 }),

          new Paragraph({
            children: [new TextRun({ text: 'Conclusion', bold: true })],
            heading: HeadingLevel.HEADING_1
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Final Verdict: ', bold: true }),
              new TextRun({ text: caseStatus })
            ]
          }),
          ...textBlockParagraphs(caseStatus === 'PASS'
            ? 'Case nay dat mong doi theo bo assertion va ket qua request hien tai.'
            : 'Case nay chua dat mong doi. Can doi chieu assertion fail, du lieu CSV va behavior API de cap nhat tren Jira.'),

          new Paragraph({
            children: [new TextRun({ text: 'Full Console Log', bold: true })],
            heading: HeadingLevel.HEADING_1
          }),
          ...textBlockParagraphs(allLogs.join('\n'))
        ]
      }
    ]
  });

  const fileName = `${toFileToken(tcId, 25)}_${caseDescriptionToken}__iter_${String(iterationNumber).padStart(3, '0')}__${caseStatus}.docx`;
  const filePath = path.join(stepFolder, fileName);
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);
}

function runStep(stepConfig) {
  return new Promise((resolve) => {
    let dataRows = [];
    const runOptions = {
      collection: collectionPath,
      environment: runtimeEnvironmentPath,
      folder: stepConfig.step,
      reporters: ['cli'],
      exportEnvironment: runtimeEnvironmentPath,
      color: 'on'
    };

    if (stepConfig.csv) {
      const csvPath = path.join(root, 'csv', stepConfig.csv);
      if (!fs.existsSync(csvPath)) {
        resolve({ failed: true, reason: `CSV not found: ${csvPath}` });
        return;
      }
      dataRows = parseCsvFile(csvPath);
      runOptions.iterationData = dataRows;
    }

    const logsByIteration = new Map();

    const collectionRun = newman.run(
      runOptions,
      async (err, summary) => {
        const failures = (summary && summary.run && Array.isArray(summary.run.failures))
          ? summary.run.failures
          : [];

        if (!skipDocxReport && summary && summary.run && Array.isArray(summary.run.executions)) {
          for (const execution of summary.run.executions) {
            const iter = Number((execution.cursor && execution.cursor.iteration) || 0);
            const row = dataRows[iter] || {};
            const consoleLines = logsByIteration.get(iter) || [];
            const assertionList = ensureArray(execution.assertions);
            const tcId = (row && (row.tc_id || row.tcId)) || `ITER_${iter + 1}`;
            const reportGroup = resolveReportGroup(stepConfig.step, tcId);
            const stepFolder = path.join(
              reportsRoot,
              sanitizeFileName(reportGroup),
              `${String(stepConfig.order).padStart(2, '0')}_${sanitizeFileName(stepConfig.step)}`
            );
            fs.mkdirSync(stepFolder, { recursive: true });

            try {
              await writeCaseDocx({
                stepConfig,
                runIndex: stepConfig.order,
                execution,
                dataRow: row,
                assertionList,
                consoleLines,
                stepFolder
              });
            } catch (docErr) {
              failures.push({ error: docErr, source: 'docx-report' });
            }
          }
        }

        const failed = Boolean(err) || failures.length > 0;
        const reason = err ? err.message : (failures.length > 0 ? `${failures.length} assertion/request failure(s)` : '');
        resolve({ failed, reason });
      }
    );

    collectionRun.on('console', (consoleErr, event) => {
      if (consoleErr || !event) return;

      const iter = Number((event.cursor && event.cursor.iteration) || 0);
      const level = event.level || 'log';
      const msg = ensureArray(event.messages).map((m) => String(m)).join(' ');

      if (!logsByIteration.has(iter)) logsByIteration.set(iter, []);
      logsByIteration.get(iter).push(`[${level}] ${msg}`);
    });
  });
}

(async () => {
  const failed = [];

  for (let i = 0; i < scenario.length; i++) {
    const stepConfig = { ...scenario[i], order: i + 1 };
    const step = stepConfig.step;
    console.log('');
    console.log('============================================================');
    const dataLabel = stepConfig.csv ? ` | data: csv/${stepConfig.csv}` : '';
    console.log(`[${i + 1}/${scenario.length}] Running: ${step}${dataLabel}`);
    console.log('============================================================');

    const result = await runStep(stepConfig);
    if (result.failed) {
      failed.push(step);
      console.warn(`Step failed: ${step}${result.reason ? ` | ${result.reason}` : ''}`);

      if (!continueOnError) {
        console.warn('Stopped on first failure. Use --continue-on-error to run all steps.');
        if (writeBackEnvironment && fs.existsSync(runtimeEnvironmentPath)) {
          fs.copyFileSync(runtimeEnvironmentPath, environmentPath);
        }
        process.exit(1);
      }
    }
  }

  if (writeBackEnvironment && fs.existsSync(runtimeEnvironmentPath)) {
    fs.copyFileSync(runtimeEnvironmentPath, environmentPath);
    console.log(`Environment file updated: ${environmentPath}`);
  }

  console.log('');
  console.log('==================== Scenario Completed ====================');
  if (!skipDocxReport) {
    console.log(`Case report folder: ${reportsRoot}`);
  }
  if (failed.length === 0) {
    console.log('All steps passed.');
    process.exit(0);
  }

  console.warn(`Failed steps (${failed.length}):`);
  for (const f of failed) {
    console.warn(`- ${f}`);
  }
  process.exit(1);
})();
