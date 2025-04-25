import { Browser, Page, ElementHandle } from 'puppeteer';
import {WalletConfig,walletConfigs} from "../../interface/walletConfigs"; // 接口定义
import { delay } from '../../common/utils';
import { setInputValue } from "../../interface/puppeteer.helper";

// metamask钱包基础配置
const WALLETCONFIG = walletConfigs['okx'];


/**
 * 钱包插件
 */

// 导入 OKX 钱包
async function importWalletOkx(browser: Browser,privateKey:string,WALLET_PASSWORD:string): Promise<void> {
    const page = await browser.newPage();   // (await browser.pages())[0]; // 获取初始页面
    // 导航到 MetaMask 扩展页面 chrome-extension://mcohilncbfahbmgdjkbpemcciiolgcge/notification.html
    await page.goto(`chrome-extension://${WALLETCONFIG.extensionId}/notification.html#/import-with-seed-phrase-and-private-key`, { waitUntil: 'networkidle2' });

    await delay(Math.ceil(Math.random() * 300) + 300); // 随机休眠，0.3s-0.6s
    // 导入已有钱包 data-e2e-okd-tabs-pane
    await page.waitForSelector('div[data-e2e-okd-tabs-pane="2"]'); // 替换为实际选择器
    await page.click('div[data-e2e-okd-tabs-pane="2"]');
    
    await delay(Math.ceil(Math.random() * 5000) + 3000); // 随机休眠，7s-10s
    // 填充私钥
    await page.waitForSelector('textarea[type="password"]',{ visible: true, timeout:12000});
    await page.type('textarea[type="password"]', privateKey.trim(), { delay: 15 });
    // 点击页面上的其他元素，使 textarea 失去焦点
    await page.click('body'); // 点击页面的 body，或替换为其他元素的选择器
    await delay(Math.ceil(Math.random() * 4500) + 2500); // 随机休眠，4.5s-6s
    // 提交
    await page.waitForSelector('button.btn-fill-highlight',{ visible: true, timeout:10000});
    await page.click('button.btn-fill-highlight');

    await delay(Math.ceil(Math.random() * 2500) + 1100); // 随机休眠，2.5s-3.6s

    // 确认
    await page.waitForSelector('button.btn-fill-highlight',{ visible: true, timeout:10000});
    await page.click('button.btn-fill-highlight');

    await delay(Math.ceil(Math.random() * 4500) + 1500); // 随机休眠，4.5s-6s

    // 身份验证方式
    const elements = await page.$$('._item_1cywj_22');    //_item_1cywj_22
    console.log(`[OKX Wallet] Mint找到 ${elements.length} 个匹配元素`);
    const targetElement = elements[1];
    await targetElement.click();
    console.log(`[OKX Wallet] Mint已点击第 2 个元素`);
    
    // 下一页
    await page.waitForSelector('button.btn-fill-highlight');
    await page.click('button.btn-fill-highlight');

    // 密码输入
    const inputs = await page.$$('input[type="password"]');   
    console.log(`密码输入框找到 ${inputs.length} 个匹配元素`);
    if(inputs.length>1) {
        await inputs[0].type(WALLET_PASSWORD);
        await inputs[1].type(WALLET_PASSWORD);
    }
    await delay(Math.ceil(Math.random() * 1000) + 1500); // 随机休眠，1s-2.5s

    // 提交按钮
    await page.waitForSelector('button.btn-fill-highlight');
    await page.click('button.btn-fill-highlight');

    // 开启WEB3之旅
    await page.waitForSelector('button.btn-fill-primary');
    await page.click('button.btn-fill-primary');
    
    console.log('[OKX Wallet] Import Wallet Complete');
    return;
}


/**
 * 连接OKX钱包，带密码输入
 */
async function connectWalletOkx(page: Page, OKX_WALLET_PASSWORD:string):Promise<void> {
    console.log('[OKX Wallet] 连接 OKX 钱包...');
    // 导入钱包
    await page.bringToFront(); // 聚焦到上一个页面
    await page.goto(`chrome-extension://mcohilncbfahbmgdjkbpemcciiolgcge/notification.html`);

    console.log('[OKX Wallet] OKX Wallet页面操作...');
    // 如何输入密码？ { visible: true }
    console.log(`[OKX Wallet] walletPage`);
    await page.waitForSelector('input[type="password"]'); // 等待密码输入字段可见
    await page.type('input[type="password"]', OKX_WALLET_PASSWORD||""); // 输入密码
    await page.waitForSelector('button[type="submit"]'); // 等待登录按钮可见
    await page.click('button[type="submit"]'); // 点击登录按钮
    
    await delay(Math.ceil(Math.random() * 1500) + 1500); // 随机休眠，1.5s-3s

    console.log('[OKX Wallet] Paasword Connect Complete');
    return;
}

/**
 * 操作钱包连接确认操作
 * @param page 
 * @returns 
 */
async function connectWalletOkxConfirm(page: Page):Promise<void> {
    try{
    console.log('[OKX Wallet] connectWalletOkxConfirm 连接 OKX 钱包...');
    // 导入钱包
    // await page.bringToFront(); // 聚焦到上一个页面
    await page.goto(`chrome-extension://mcohilncbfahbmgdjkbpemcciiolgcge/notification.html`);

    console.log('[OKX Wallet] 页面操作...');
    // 钱包插件点击
    var mintSelector = 'button.btn-fill-highlight';
    await page.waitForSelector(mintSelector,{ visible: true,timeout:7000});  // 可见性判断
    const elementHandle: ElementHandle | null = await page.$(mintSelector);
    if (elementHandle) {
    // 判断元素是否可用（例如，是否可以点击）
    const boundingBox = await elementHandle.boundingBox();
    const isClickable = boundingBox && boundingBox.width > 0 && boundingBox.height > 0;
    if (isClickable) {
        await delay(Math.ceil(Math.random() * 2800) + 400); // 不能小于2.8s
        await page.click('button.btn-fill-highlight');    // 点击链接钱包按钮
        console.log(`[OKX Wallet] 元素 ${mintSelector} 是可见且可用的.`);
    } else {
        console.log(`[OKX Wallet] 元素 ${mintSelector} 是可见但不可用.`);
    }
    } else {
        console.log(`[OKX Wallet] Element not found ${mintSelector}.`);
    }
    
    console.log('[OKX Wallet] Connect Complete');
} catch(ex:unknown){
    console.log('[OKX Wallet] Connect Wallet出现异常。');
    console.trace(ex);
}
    
}

/**
 * 操作钱包连接确认操作 + 直接确认操作
 * @param page 钱包page页面
 * @returns 
 */
async function connectWalletOkxConfirm2(page: Page):Promise<void> {
    try{
    console.log('[OKX Wallet Confirm2] connectWalletOkxConfirm 连接 OKX 钱包...');
    // 导入钱包
    await page.bringToFront(); // 聚焦到上一个页面
    // await page.goto(`chrome-extension://mcohilncbfahbmgdjkbpemcciiolgcge/notification.html`);

    console.log('[OKX Wallet Confirm2] 页面操作...');
    // await delay(Math.ceil(Math.random() * 4800) + 400); // 不能小于2.8s
    // 钱包插件点击
    const btnSelector = 'button.btn-fill-highlight';

    // 第一步操作
    await page.waitForSelector(btnSelector,{ visible: true,timeout:7000});  // 可见性判断
    const elementHandle: ElementHandle | null = await page.$(btnSelector);
    if (elementHandle) {
        // 判断元素是否可用（例如，是否可以点击）
        const boundingBox = await elementHandle.boundingBox();
        const isClickable = boundingBox && boundingBox.width > 0 && boundingBox.height > 0;
        if (isClickable) {
            await page.click(btnSelector);    // 点击链接钱包按钮
            console.log(`[OKX Wallet Confirm] 元素 ${btnSelector} 是可见且可用的.`);
        } else {
            console.log(`[OKX Wallet Confirm] 元素 ${btnSelector} 是可见但不可用.`);
        }
    } else {
        console.log(`[OKX Wallet Confirm] Element not found ${btnSelector}.`);
    }
    
    await delay(4000 + Math.ceil(Math.random() * 1800)); // 不能小于2.8s
    
    // 第二步操作
    await page.waitForSelector(btnSelector,{ visible: true,timeout:7000});  // 可见性判断
    const elementHandle2: ElementHandle | null = await page.$(btnSelector);
    if (elementHandle2) {
        // 判断元素是否可用（例如，是否可以点击）
        const boundingBox2 = await elementHandle2.boundingBox();
        const isClickable2 = boundingBox2 && boundingBox2.width > 0 && boundingBox2.height > 0;
        if (isClickable2) {
            await page.click(btnSelector);    // 点击链接钱包按钮
            console.log(`[OKX Wallet Confirm2] 元素 ${btnSelector} 是可见且可用的.`);
        } else {
            console.log(`[OKX Wallet Confirm2] 元素 ${btnSelector} 是可见但不可用.`);
        }
    } else {
        console.log(`[OKX Wallet Confirm2] Element not found ${btnSelector}.`);
    }

    console.log('[OKX Wallet Confirm2] Confirm2 Complete');
    }catch(ex:unknown){
        console.log(`[OKX Wallet Confirm2] 钱包操作出现异常`);
        console.trace(ex);
    }
        
}

/**
 * 捕获插件页面，在插件中进行确认操作
 * @param page 插件页面
 */
async function connectWalletOkxPluginsConfirm(page: Page):Promise<void> {
    try{
    console.log('[OKX Wallet Plugins Confirm] connectWalletOkxConfirm 连接 OKX 钱包...');
    // 导入钱包
    await page.bringToFront(); // 聚焦到上一个页面
    // await page.goto(`chrome-extension://mcohilncbfahbmgdjkbpemcciiolgcge/notification.html`);

    console.log('[OKX Wallet Plugins Confirm] 页面操作...');
    // await delay(Math.ceil(Math.random() * 4800) + 400); // 不能小于2.8s
    // 钱包插件点击
    const btnSelector = 'button.btn-fill-highlight';

    // 第一步操作
    await page.waitForSelector(btnSelector,{ visible: true,timeout:7000});  // 可见性判断
    const elementHandle: ElementHandle | null = await page.$(btnSelector);
    if (elementHandle) {
        // 判断元素是否可用（例如，是否可以点击）
        const boundingBox = await elementHandle.boundingBox();
        const isClickable = boundingBox && boundingBox.width > 0 && boundingBox.height > 0;
        if (isClickable) {
            await page.click(btnSelector);    // 点击链接钱包按钮
            console.log(`[OKX Wallet Plugins Confirm] 元素 ${btnSelector} 是可见且可用的.`);
        } else {
            console.log(`[OKX Wallet Plugins Confirm] 元素 ${btnSelector} 是可见但不可用.`);
        }
    } else {
        console.log(`[OKX Wallet Plugins Confirm] Element not found ${btnSelector}.`);
    }
    

    console.log('[OKX Wallet Plugins Confirm] Confirm Complete');
    }catch(ex:unknown){
        console.log(`[OKX Wallet Plugins Confirm] 钱包操作出现异常`);
        console.trace(ex);
    }
        
}

/**
 * Swap钱包确认操作
 * @param page 
 */
async function swapWalletOkxConfirm(page: Page):Promise<void> {
    console.log('connectWalletOkxConfirm 连接 OKX 钱包...');
    // 导入钱包
    // await page.bringToFront(); // 聚焦到上一个页面
    await page.goto(`chrome-extension://mcohilncbfahbmgdjkbpemcciiolgcge/notification.html`);

    console.log('[OKX Wallet] 页面Swap操作开始...');
    await delay(Math.ceil(Math.random() * 2800) + 400); // 不能小于2.8s
    // 钱包插件点击
    var mintSelector = 'button.btn-fill-highlight';
    await page.waitForSelector(mintSelector,{ visible: true,timeout:30000});  // 可见性判断
    const elementHandle: ElementHandle | null = await page.$(mintSelector);
    if (elementHandle) {
    // 判断元素是否可用（例如，是否可以点击）
    const boundingBox = await elementHandle.boundingBox();
    const isClickable = boundingBox && boundingBox.width > 0 && boundingBox.height > 0;
    if (isClickable) {
        await delay(Math.ceil(Math.random() * 2800) + 400); // 不能小于2.8s
        await page.click('button.btn-fill-highlight');    // 点击链接钱包按钮
        console.log(`[OKX Wallet] 元素 ${mintSelector} 是可见且可用的.`);
    } else {
        console.log(`[OKX Wallet] 元素 ${mintSelector} 是可见但不可用.`);
    }
    } else {
        console.log(`[OKX Wallet] Element not found ${mintSelector}.`);
    }

    console.log('[OKX Wallet] Swap Complete');
    
}


// 导出函数
export { 
    importWalletOkx , 
    connectWalletOkx ,
    connectWalletOkxConfirm,
    // 连接钱包 + 确认连接合并交互
    connectWalletOkxConfirm2,
    // 捕获插件页面，在插件中进行确认操作
    connectWalletOkxPluginsConfirm,
    // Swap钱包确认操作
    swapWalletOkxConfirm
};