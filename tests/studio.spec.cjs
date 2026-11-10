const {test,expect}=require('playwright/test');
const {seedSession,routeSession}=require('./auth-fixture.cjs');
const {routeFonts}=require('./fonts.cjs');
let errors;
test.beforeEach(async({page})=>{
 errors=[];page.on('pageerror',e=>errors.push(e.message));
 await seedSession(page);
 await page.route('**/*',async route=>{
  if(await routeSession(route))return;
  if(await routeFonts(route))return;
  const u=new URL(route.request().url());
  if(u.hostname==='script.google.com')throw Error('Unexpected backend write');
  if(u.hostname!=='127.0.0.1')return route.fulfill({contentType:'text/plain',body:''});
  return route.continue();
 });
 await page.goto('/');
 await expect(page.locator('#owner-app')).toBeVisible();
});
test.afterEach(()=>expect(errors).toEqual([]));
async function build(page){
 for(const [id,value] of [['sel-date','422'],['sel-day','107'],['sel-month','205'],['sel-year','301']])await page.locator('#'+id).selectOption(value);
 await page.locator('#birth-be-year').fill('2527');
 await page.getByRole('button',{name:'ประมวลผล',exact:true}).click();
 await expect(page.locator('.studio-present')).toBeEnabled();
}
test('organized desktop workspace uses real card assets',async({page},info)=>{
 await expect(page.locator('.studio-present')).toBeDisabled();
 await expect(page.locator('.studio-advanced')).not.toHaveAttribute('open');
 await page.locator('.studio-advanced summary').click();
 await expect(page.locator('#sel-taksa')).toBeVisible();
 await page.locator('.studio-advanced summary').click();
 await build(page);
 await expect(page.locator('#studio-empty')).toBeHidden();
 for(const id of ['studio-view','studio-analysis','studio-save'])await expect(page.locator('#'+id)).toBeVisible();
 await page.evaluate(()=>document.fonts.ready);
 await expect.poll(()=>page.locator('#main-board img').evaluateAll(nodes=>nodes.every(n=>n.complete&&n.naturalWidth>0))).toBe(true);
 await page.screenshot({path:info.outputPath('workspace.png'),fullPage:true});
});
test('presentation preserves client data and manual values across views and Escape',async({page},info)=>{
 await build(page);
 await page.locator('#db-name').fill('คุณตัวอย่าง <ทดสอบ>');
 await page.locator('#db-note').fill('บันทึกส่วนตัว ไม่แสดงต่อลูกค้า');
 await page.locator('.number-dropdown').first().selectOption('9');
 await page.locator('.studio-present').click();
 await expect(page.locator('#presentation-title')).toHaveText('คุณตัวอย่าง <ทดสอบ>');
 await expect(page.locator('#presentation-title')).toBeFocused();
 await expect(page.locator('#save-area')).toBeHidden();
 await expect(page.locator('#db-note')).toBeHidden();
 await page.locator('[data-presentation-view="seven"]').click();
 await expect(page.getByRole('meter')).toHaveCount(7);
 await page.locator('[data-presentation-view="graph12"]').click();
 await expect(page.locator('.graph12-card')).toHaveCount(12);
 await page.evaluate(()=>document.fonts.ready);
 await expect.poll(()=>page.locator('.graph12-card').evaluateAll(nodes=>Math.max(...nodes.map(n=>n.getBoundingClientRect().bottom)))) .toBeLessThanOrEqual(page.viewportSize().height);
 await page.screenshot({path:info.outputPath('presentation-graph12.png')});
 const age=await page.locator('.graph12-age-button').nth(1).textContent();
 await page.locator('.graph12-age-button').nth(1).click();
 await expect(page.locator('#presentation-description')).toContainText(age);
 await page.keyboard.press('Escape');
 await expect(page.locator('#presentation-header')).toBeHidden();
 await expect(page.locator('.studio-present')).toBeFocused();
 await expect(page.locator('#db-name')).toHaveValue('คุณตัวอย่าง <ทดสอบ>');
 await expect(page.locator('#db-note')).toHaveValue('บันทึกส่วนตัว ไม่แสดงต่อลูกค้า');
 await expect(page.locator('.number-dropdown').first()).toHaveValue('9');
 await expect(page.locator('#graph12-view')).toBeHidden();
});
test('presentation entered from graph12 returns to graph12',async({page})=>{
 await build(page);
 await page.locator('.btn-graph12').click();
 await page.locator('.studio-present').click();
 await page.locator('[data-presentation-view="seven"]').click();
 await page.locator('#presentation-exit').click();
 await expect(page.locator('#graph12-view')).toBeVisible();
 await expect(page.locator('#presentation-header')).toBeHidden();
});
