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

  let passed = 0, failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ ${name}`); passed++; }
    catch (e) { console.log(`  ❌ ${name}: ${e.message}`); failed++; }
  }

  console.log('\n📋 Tauri Todo — E2E 测试\n');

  await test('页面正常加载', async () => {
    if (!(await page.isVisible('#todoInput'))) throw new Error('输入框不可见');
  });

  await test('添加待办项', async () => {
    const count = await page.$$eval('.todo-item', els => els.length);
    await page.fill('#todoInput', 'E2E_新增');
    await page.click('#addBtn');
    await page.waitForFunction((c) => document.querySelectorAll('.todo-item').length > c, count, { timeout: 5000 });
    await page.waitForTimeout(500);
    const items = await page.$$eval('.todo-item .todo-text', els => els.map(e => e.textContent.trim()));
    if (!items.includes('E2E_新增')) throw new Error(`未找到新增项: ${items.join(', ')}`);
  });

  await test('标记完成', async () => {
    // 找到刚添加的项
    const items = await page.$$('.todo-item');
    const target = items[items.length - 1]; // 新项在最后
    const check = await target.$('.todo-check');
    await check.click();
    await page.waitForTimeout(500);
    const cls = await target.getAttribute('class');
    if (!cls.includes('completed')) throw new Error('没有 completed');
  });

  await test('编辑待办项', async () => {
    const items = await page.$$('.todo-item');
    const target = items[items.length - 1];
    const btn = await target.$('.btn-edit');
    await btn.click();
    await page.waitForTimeout(300);
    const input = await target.$('input[type="text"]');
    if (!input) throw new Error('编辑输入框未出现');
    await input.fill('E2E_已编辑');
    await input.press('Enter');
    await page.waitForTimeout(800);
    const text = await page.$eval('.todo-item:last-child .todo-text', el => el.textContent.trim());
    if (text !== 'E2E_已编辑') throw new Error(`编辑后 text: "${text}"`);
  });

  await test('删除待办项', async () => {
    const count = await page.$$eval('.todo-item', els => els.length);
    const del = await page.$('.todo-item:last-child .btn-del');
    await del.click();
    await page.waitForFunction((c) => document.querySelectorAll('.todo-item').length < c, count, { timeout: 5000 });
  });

  await test('分类和日期', async () => {
    await page.fill('#todoInput', 'E2E_分类日期');
    await page.selectOption('#catSelect', { value: '学习' });
    await page.fill('#dueInput', '2026-12-31');
    await page.click('#addBtn');
    await page.waitForTimeout(1000);
    const cat = await page.$eval('.todo-item:last-child .todo-cat', el => el.textContent.trim());
    if (cat !== '学习') throw new Error(`分类: "${cat}"`);
  });

  await test('统计更新', async () => {
    const stats = await page.$eval('#stats', el => el.textContent);
    if (!stats.includes('已完成')) throw new Error(`统计: "${stats}"`);
  });

  console.log(`\n📊 结果: ${passed}/${passed+failed} 通过\n`);
  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
