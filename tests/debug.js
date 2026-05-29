const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 520, height: 680 });

  const htmlPath = 'file:///' + path.resolve(__dirname, '../src/index.html').replace(/\\/g, '/');
  await page.goto(htmlPath);
  await page.waitForFunction(() => typeof window.supabase !== 'undefined', { timeout: 10000 });
  await page.waitForTimeout(2000);

  // List all existing items first
  console.log('BEFORE:');
  let items = await page.$$eval('.todo-item', els => els.map(e => ({
    text: e.querySelector('.todo-text').textContent.trim(),
    cat: e.querySelector('.todo-cat')?.textContent.trim() || '-'
  })));
  console.log(JSON.stringify(items, null, 2));

  // Set and add
  await page.evaluate(() => {
    document.getElementById('catSelect').value = '学习';
    document.getElementById('todoInput').value = 'CAT_DEBUG_TEST';
  });

  // Add a click handler wrapper
  await page.evaluate(() => {
    const btn = document.getElementById('addBtn');
    const origClick = btn.onclick;
    btn.onclick = function(e) {
      console.log('CAT at click time:', document.getElementById('catSelect').value);
      return origClick.call(this, e);
    };
  });

  page.on('console', msg => console.log('  [console]', msg.text()));

  await page.click('#addBtn');
  await page.waitForTimeout(2000);

  console.log('\nAFTER:');
  items = await page.$$eval('.todo-item', els => els.map(e => ({
    text: e.querySelector('.todo-text').textContent.trim(),
    cat: e.querySelector('.todo-cat')?.textContent.trim() || '-'
  })));
  console.log(JSON.stringify(items, null, 2));

  await browser.close();
})();
