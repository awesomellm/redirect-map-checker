import { readFile } from 'node:fs/promises';
import { checkRedirectMap } from './redirect-map.mjs';

const [file, origin] = process.argv.slice(2);
if (!file || !origin) {
  console.error('Usage: node check.mjs <map.tsv> <original-site-origin>');
  process.exitCode = 2;
} else {
  try {
    const report = checkRedirectMap(await readFile(file, 'utf8'), origin);
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.some(row => row.issues.length > 0) ? 1 : 0;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
