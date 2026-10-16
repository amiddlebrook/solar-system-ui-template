import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

test('Vite produces a self-contained static application', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  const assets = readdirSync('dist/assets');
  assert.match(html, /id="root"/);
  assert.ok(assets.some(path => /^index-.*\.js$/.test(path)), 'missing JavaScript bundle');
  assert.ok(assets.some(path => /^index-.*\.css$/.test(path)), 'missing bundled stylesheet');
  assert.doesNotMatch(html, /cdn\.tailwindcss\.com|aistudiocdn\.com|GEMINI_API_KEY/);
});

test('Cloudflare is configured for direct static assets', () => {
  const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
  assert.equal(config.assets.directory, './dist');
  assert.equal(config.assets.not_found_handling, 'single-page-application');
  assert.equal(config.name, 'solar-system-ui-template');
});
