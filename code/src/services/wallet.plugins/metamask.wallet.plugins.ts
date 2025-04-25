import puppeteer, { Browser, Page } from 'puppeteer'; // 导入 Puppeteer 库，用于浏览器自动化
import * as path from 'path'; // 导入路径处理模块
import * as dotenv from 'dotenv';
dotenv.config();
import { delay } from '../../common/utils';

// MetaMask 扩展相关常量
const METAMASK_EXTENSION_ID = 'nkbihfbeogaeaoehlefnkodbefgpgknn';
const METAMASK_EXTENSION_VERSION = process.env.METAMASK_EXTENSION_VERSION || '12.13.0_0';
const METAMASK_WALLET_EXTENSION_PATH = path.join(__dirname, 'model', 'extensions', METAMASK_EXTENSION_ID, METAMASK_EXTENSION_VERSION);
const METAMASK_PASSWORD = process.env.METAMASK_PASSWORD || '';  // 钱包密码

// 导入 MetaMask 钱包
async function importWalletMetamask(browser: Browser,mnemonics: string): Promise<void> {
    await delay(10000);  // MetaMask安装插件之后会默认弹出钱包页面，等待10s之后再操作
    const pages = await browser.pages(); // 获取初始页面
    console.log(`进入导入钱包流程，获取浏览器pages页面个数:${pages.length}`);
    const page = pages[0];  // 第一个也页面进行操控
    if(pages.length>1){
        // 操作第一个页面
        const previousPage = pages[0];      // 根据url地址自动判断索引
        await previousPage.bringToFront();  // 聚焦到上一个页面
        console.log('[importWalletMetamask]已切换到上一个页面:', previousPage.url());
        await pages[pages.length-1].close();
    } 
    
    // 导航到 MetaMask 扩展页面
    await page.goto(`chrome-extension://${METAMASK_EXTENSION_ID}/home.html`, { waitUntil: 'networkidle2' });

    // 处理服务条款复选框
    await page.waitForSelector('#onboarding__terms-checkbox', { visible: true });
    await page.click('#onboarding__terms-checkbox');
    await delay(1000);

    // 点击“导入钱包”按钮
    await page.click('button[data-testid="onboarding-import-wallet"]');
    await page.click('button[data-testid="metametrics-no-thanks"]'); // 拒绝数据收集

    // 填充助记词
    const words = mnemonics.split(' ');
    console.log(`打印助记词:${words.length}`)
    if(words.length == 24){
        console.log(`调整为24助记词模式`)

        const dropdown_select = 'select.dropdown__select'; // 等待至少一个 <select> 出现
        await page.waitForSelector(dropdown_select, { visible: true }); // 找到 <select> 元素
        const selectElements = await page.$$(dropdown_select);
        const secondSelect = selectElements[1]; // 选中第二个 <select> 元素（索引从 0 开始，所以第二个是 1）
        const currentOptions = await secondSelect.$$eval('option', options =>
            options.map(opt => ({ text: opt.textContent, value: opt.value }))
        );
        console.log('第二个 <select> 的选项:', currentOptions);
        const targetValue = '24';
        // 检查目标 value 是否存在于选项中
        const valueExists = currentOptions.some(opt => opt.value === targetValue);
        if (!valueExists) {
            throw new Error(`目标 value  在第二个 <select> 中不存在`);
        }
         // 直接设置第二个 <select> 的 value 值
         await secondSelect.select(targetValue);
         console.log(`已将第二个 <select> 的值设置为: ${targetValue}`);
         // 触发 change 事件，确保选择生效（有些页面需要此步骤）
         await page.evaluate((select: HTMLSelectElement) => {
             const event = new Event('change', { bubbles: true });
             select.dispatchEvent(event);
         }, secondSelect);
         console.log('已触发 change 事件，确保选择生效');

        await delay(800);
    }
    

    // 循环填充助记词
    for (let i = 0; i < words.length; i++) {
        const input = await page.waitForSelector(`#import-srp__srp-word-${i}`);  // 助记词密码input，id
        if (input) {
            await input.focus();
            await input.type(words[i]);
        }
    }
    // 稍微等待下，填充过程
    await delay(300);

    // 确认助记词选择
    await page.waitForSelector('button[data-testid="import-srp-confirm"]');
    await page.click('button[data-testid="import-srp-confirm"]');  // 选中复选框
    await delay(300);
    // 确认助记词并设置密码
    console.log('MetaMask Wallet创建钱包密码操作...');
    await page.waitForSelector('input[data-testid="create-password-new"]');
    await page.type('input[data-testid="create-password-new"]', METAMASK_PASSWORD);
    await page.waitForSelector('input[data-testid="create-password-confirm"]');
    await page.type('input[data-testid="create-password-confirm"]', METAMASK_PASSWORD);
    // 同意条款
    await page.waitForSelector('input[data-testid="create-password-terms"]');
    await page.click('input[data-testid="create-password-terms"]');
    // 导入钱包
    await page.waitForSelector('button[data-testid="create-password-import');
    await page.click('button[data-testid="create-password-import"]');

    // 完成设置流程
    await page.waitForSelector('button[data-testid="onboarding-complete-done');
    await page.click('button[data-testid="onboarding-complete-done"]');
    await page.waitForSelector('button[data-testid="pin-extension-next');
    await page.click('button[data-testid="pin-extension-next"]');
    await page.waitForSelector('button[data-testid="pin-extension-done');
    await page.click('button[data-testid="pin-extension-done"]');
    await delay(5000);
}

 /**
 * 连接Metamask钱包
 */
async function connectWalletMetamaskNoPassword(page: Page):Promise<void> {
    console.log('连接 Metamask 钱包...');
    
    // 导入钱包
    // await page.bringToFront(); // 聚焦到上一个页面
    await page.goto(`chrome-extension://${METAMASK_EXTENSION_ID}/notification.html`);
    await delay(3600);
    console.log('Metamask Wallet页面操作...');

    await page.waitForSelector(`button[data-theme="light"]`);
    await page.click(`button[data-theme="light"]`);
    await delay(1600);
    await page.waitForSelector(`button[data-theme="light"]`);
    await page.click(`button[data-theme="light"]`);


    
    // await page.waitForSelector('button:text("Next")'); //
    // await page.click('button:text("Next")'); // 

    // await page.waitForSelector('button:text("Connect")'); //
    // await page.click('button:text("Connect")'); // 


    delay(1000);
    
}

// 导出函数
export { importWalletMetamask , connectWalletMetamaskNoPassword};