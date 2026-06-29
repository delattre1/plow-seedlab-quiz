import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const QUIZ = path.resolve('quiz.html');
const url = pathToFileURL(QUIZ).href;

let failed = 0;
const results = [];

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('pageerror', (e) => { console.error('PAGE ERROR:', e.message); failed++; });
await page.goto(url);

// ---- primitives ----
const index = () => page.$eval('#question', el => parseInt(el.getAttribute('data-index'), 10));
const total = () => page.$eval('#question', el => el.getAttribute('data-total'));
const optionKeys = () => page.$$eval('#options .option', els => els.map(e => e.getAttribute('data-key')));
const selectedKey = () => page.$$eval('#options .option', els => {
  const s = els.find(e => e.getAttribute('aria-selected') === 'true');
  return s ? s.getAttribute('data-key') : null;
});
const resultVisible = () => page.$eval('#result', el => {
  if (el.hidden) return false;
  const cs = getComputedStyle(el);
  return cs.display !== 'none' && cs.visibility !== 'hidden';
});
const pick = (k) => page.click(`#options .option[data-key="${k}"]`);
const next = () => page.click('#next');
const prev = () => page.click('#prev');
const submit = () => page.click('#submit');
const restart = () => page.click('#restart');
const score = () => page.$eval('#score', el => parseInt(el.getAttribute('data-score'), 10));
const scoreTotal = () => page.$eval('#score', el => el.getAttribute('data-total'));

// Navigate to index i from the current position using #next/#prev,
// WITHOUT restarting (restart would wipe remembered answers).
async function goto(i) {
  let cur = await index();
  while (cur < i) { await next(); cur = await index(); }
  while (cur > i) { await prev(); cur = await index(); }
}
async function answerAll(keys) {
  await restart();
  for (let i = 0; i < keys.length; i++) {
    await goto(i);
    await pick(keys[i]);
  }
}

async function scenario(n, name, fn) {
  try {
    await fn();
    results.push(`[${n}] ${name} ✓`);
  } catch (e) {
    failed++;
    results.push(`[${n}] ${name} ✗ — ${e.message}`);
  }
}

// 1. Initial render
await scenario(1, 'initial render', async () => {
  assert((await index()) === 0, `index expected 0, got ${await index()}`);
  assert((await total()) === '5', `data-total expected "5", got ${await total()}`);
  const ks = await optionKeys();
  assert(JSON.stringify(ks) === JSON.stringify(['a','b','c','d']), `optionKeys ${JSON.stringify(ks)}`);
  assert((await selectedKey()) === null, `selectedKey expected null, got ${await selectedKey()}`);
  assert((await resultVisible()) === false, 'result should be hidden');
});

// 2. Navigation + clamp
await scenario(2, 'navigation + clamp', async () => {
  await restart();
  for (let i = 0; i < 4; i++) await next();
  assert((await index()) === 4, `after 4 next, expected 4 got ${await index()}`);
  await next();
  assert((await index()) === 4, `clamp at 4 failed, got ${await index()}`);
  await prev();
  assert((await index()) === 3, `prev expected 3 got ${await index()}`);
  await prev(); await prev(); await prev();
  assert((await index()) === 0, `down to 0 expected 0 got ${await index()}`);
  await prev();
  assert((await index()) === 0, `clamp at 0 failed, got ${await index()}`);
});

// 3. Selection persists
await scenario(3, 'selection persists', async () => {
  await restart();
  await pick('b');
  assert((await selectedKey()) === 'b', `selectedKey expected b got ${await selectedKey()}`);
  await next();
  await prev();
  assert((await index()) === 0, `back at index 0, got ${await index()}`);
  assert((await selectedKey()) === 'b', `selection forgotten, got ${await selectedKey()}`);
});

// 4. Perfect score
await scenario(4, 'perfect → score 5/5', async () => {
  await answerAll(['b','c','b','d','c']);
  await submit();
  assert((await score()) === 5, `expected 5 got ${await score()}`);
  assert((await scoreTotal()) === '5', `data-total expected "5" got ${await scoreTotal()}`);
  assert((await resultVisible()) === true, 'result should be visible');
});

// 5. Mixed score
await scenario(5, 'mixed → score 3/5', async () => {
  await answerAll(['b','a','b','d','a']);
  await submit();
  assert((await score()) === 3, `expected 3 got ${await score()}`);
});

// 6. Unanswered counts wrong
await scenario(6, 'unanswered counts wrong → score 1', async () => {
  await restart();
  await goto(0);
  await pick('b');
  await submit();
  assert((await score()) === 1, `expected 1 got ${await score()}`);
});

// 7. Restart resets
await scenario(7, 'restart resets', async () => {
  await restart();
  assert((await index()) === 0, `index expected 0 got ${await index()}`);
  assert((await selectedKey()) === null, `selectedKey expected null got ${await selectedKey()}`);
  assert((await resultVisible()) === false, 'result should be hidden');
});

await browser.close();

// ---- offline / single-file greps ----
const src = readFileSync(QUIZ, 'utf8');
const greps = [
  [/src\s*=\s*["'][^"']*https?:\/\//i, 'external src URL'],
  [/href\s*=\s*["'][^"']*https?:\/\//i, 'external href URL'],
  [/\bfetch\s*\(/, 'fetch('],
  [/XMLHttpRequest/, 'XMLHttpRequest'],
];
for (const [re, label] of greps) {
  if (re.test(src)) { failed++; results.push(`[grep] forbidden: ${label} ✗`); }
}
results.push('[grep] no external resource references ✓');

console.log(results.join('\n'));
const passed = 7 - results.filter(r => /^\[\d\].*✗/.test(r)).length;
console.log(`VERIFY: ${passed}/7 scenarios passed`);
process.exit(failed === 0 ? 0 : 1);
