import { Browser, Page, ElementHandle } from 'puppeteer';
import {WalletConfig,walletConfigs} from "../../interface/walletConfigs"; // 接口定义
import { delay } from '../../common/utils';
import { setInputValue } from "../../interface/puppeteer.helper";

// Xverse 钱包基础配置
const WALLETCONFIG = walletConfigs['xverse'];


/**
 * 钱包插件
 */

/**
 * 导入 Xverse 钱包
 * @param page 钱包页面
 * @param mnemonics 助记词
 * @param WALLET_PASSWORD 钱包密码
 * @returns 
 */
async function importWalletXverse(page: Page,mnemonics:string,WALLET_PASSWORD:string): Promise<void> {
    console.log(`[import Wallet Xverse] 进入importWalletXverse，开始执行钱包导入`)

    // 导航到 MetaMask 扩展页面 chrome-extension://idnnbdplmphpflfnlkomgpfbpcgelopg/popup.html
    await page.goto(`chrome-extension://${WALLETCONFIG.extensionId}/popup.html`, { waitUntil: 'networkidle2' });
    await delay(1300 + Math.ceil(Math.random() * 300)); // 随机休眠

    // 查到页面得button
    // 找到恢复钱包按钮，使用 .//text() 查找所有后代文本
    var restoreSelector = '::-p-xpath(//button[.//text()[contains(., "Restore an existing wallet")]])';
    // 导入已有钱包
    await page.waitForSelector(restoreSelector,{ visible: true}); // 替换为实际选择器
    await page.click(restoreSelector);
    await delay(2000 + Math.ceil(Math.random() * 300)); // 随机休眠

    // Legal页面
    var acceptSelector = '::-p-xpath(//button[.//text()[contains(., "Accept")]])';
    // 同意条款
    await page.waitForSelector(acceptSelector,{ visible: true});
    await page.click(acceptSelector);
    await delay(2000 + Math.ceil(Math.random() * 300)); // 随机休眠

    // 填充密码
    await page.waitForSelector(`#password-input`);
    await page.type(`#password-input`, WALLET_PASSWORD);
    await delay(1000 + Math.ceil(Math.random() * 300)); // 随机休眠
    await page.waitForSelector(`#confirm-password-input`);
    await page.type(`#confirm-password-input`, WALLET_PASSWORD);
    // 提交
    await page.waitForSelector(`button[type="submit"]`);
    await page.click(`button[type="submit"]`);
    await delay(1000 + Math.ceil(Math.random() * 300)); // 随机休眠

    // Restore Your Wallet页面
    // 找到按钮名称为 Xverse 得按钮，使用 .//text() 查找所有后代文本
    var walletSelector = '::-p-xpath(//button[.//text()[contains(., "Xverse")]])';
    await page.waitForSelector(walletSelector,{ visible: true}); // 替换为实际选择器
    await page.click(walletSelector);
    await delay(1000 + Math.ceil(Math.random() * 300)); // 随机休眠
    

    // 导入钱包助记词
    // 填充助记词
    const words = mnemonics.split(' ');
    console.log(`[import Wallet Xverse] 打印助记词:${words.length}`)
    if(words.length == 24){
        console.log(`[import Wallet Xverse] 当前助记词得单词个数为24个。`)
        // 24单词助记词
        var wordSelector = '::-p-xpath(//button[.//text()[contains(., "Have a 24 word seed phrase?")]])';
        await page.waitForSelector(wordSelector,{ visible: true}); 
        await page.click(wordSelector);
        await delay(300 + Math.ceil(Math.random() * 300)); // 随机休眠
    } else {
        // 12单词助记词
        console.log(`[import Wallet Xverse] 当前助记词得单词个数为12个。`);
    }
    // 填充助记词单词
    for(var i=0;i<words.length;i++){
        await page.waitForSelector(`input#input${i}`,{ visible: true}); 
        await page.type(`input#input${i}`,words[i]);
        await delay(10); // 随机休眠
    }
    await delay(200 + Math.ceil(Math.random() * 200)); // 随机休眠
    // 提交
    var continueSelector = '::-p-xpath(//button[.//text()[contains(., "Continue")]])';
    await page.waitForSelector(continueSelector,{ visible: true}); 
    await delay(50 + Math.ceil(Math.random() * 50)); // 随机休眠
    await page.click(continueSelector); 
    // 需要停顿稍微长得时间，用于查询链上余额
    await delay(6000 + Math.ceil(Math.random() * 1000)); // 随机休眠


    // Preferred Address Type
    var continueSelector2 = '::-p-xpath(//button[.//text()[contains(., "Continue")]])';
    await page.waitForSelector(continueSelector2,{ visible: true}); 
    await page.click(continueSelector2); 
    await delay(1000 + Math.ceil(Math.random() * 1000)); // 随机休眠
    
    // // Close this tab（这步会关闭钱包页面）
    // var closeSelector = '::-p-xpath(//button[.//text()[contains(., "Close this tab")]])';
    // await page.waitForSelector(closeSelector,{ visible: true}); 
    // await page.click(closeSelector); 
    // await delay(200 + Math.ceil(Math.random() * 200)); // 随机休眠
        
    console.log('[Xverse Wallet] Import Wallet Complete');
    return;
}

/**
 * 连接Xverse钱包，带密码输入
 */
async function connectWalletXverseWithPassword(page: Page, WALLET_PASSWORD:string):Promise<void> {
    console.log('[Xverse Wallet] 连接 Xverse 钱包...');
    // 导入钱包
    await page.bringToFront(); // 聚焦到上一个页面
    await page.goto(`chrome-extension://${WALLETCONFIG.extensionId}/popup.html`);

    console.log('[Xverse Wallet] Xverse Wallet页面操作...');
    // 如何输入密码？ { visible: true }
    console.log(`[Xverse Wallet] walletPage`);
    await page.waitForSelector('input#password-input'); // 等待密码输入字段可见
    await page.type('input#password-input', WALLET_PASSWORD||""); // 输入密码
    // 提交，使用 .//text() 查找所有后代文本
    var unlockSelector = '::-p-xpath(//button[.//text()[contains(., "Unlock")]])';
    await page.waitForSelector(unlockSelector); // 等待登录按钮可见
    await page.click(unlockSelector); // 点击登录按钮
    
    await delay(1500 + Math.ceil(Math.random() * 1500)); // 随机休眠

    console.log('[Xverse Wallet] Paasword Connect Complete');
    return;
}

/**
 * 操作钱包连接确认操作（无密码连接）
 * @param page 
 * @returns 
 */
async function connectWalletXverse(page: Page):Promise<void> {
    try{
    console.log('[Xverse Wallet] connectWalletXverse 连接 Xverse 钱包...');
    // 连接钱包
    // await page.bringToFront(); // 聚焦到上一个页面
    // await page.goto(`chrome-extension://${WALLETCONFIG.extensionId}/popup.html`);

    await delay(15000 + Math.ceil(Math.random() * 1000)); // 随机休眠

    console.log('[Xverse Wallet] 等待完成，...');

    // 钱包插件点击
    var connectSelector = '::-p-xpath(//button[.//text()[contains(., "Connect")]])';
    const connect = await page.$(connectSelector);
    if(connect) {
        console.log('[Xverse Wallet] 找到Connect按钮');
        // 导入已有钱包
        await page.waitForSelector(connectSelector,{ visible: true, timeout:25000}); // 替换为实际选择器
        await page.click(connectSelector);
        
        console.log('[Xverse Wallet] Connect Complete...');
        return;
    }
    
} catch(ex:unknown){
    console.log('[Xverse Wallet] Connect Wallet出现异常。');
    console.trace(ex);
}
    
}

/**
 * 签名操作
 * @param page 
 * @returns 
 */
async function connectWalletXverseSign(page: Page):Promise<void> {
    try{
    console.log('[Xverse Wallet] connectWalletXverseSign 连接 Xverse 钱包...');
    // 连接钱包
    // await page.bringToFront(); // 聚焦到上一个页面
    // await page.goto(`chrome-extension://${WALLETCONFIG.extensionId}/popup.html`);

    await delay(15000 + Math.ceil(Math.random() * 1000)); // 随机休眠

    // 签名
    var signtSelector = '::-p-xpath(//button[.//text()[contains(., "Sign")]])';
    const sign = await page.$(signtSelector);
    if(sign) {
        console.log('[Xverse Wallet] 找到Sign按钮');
        await page.waitForSelector(signtSelector,{ visible: true, timeout:25000}); // 替换为实际选择器
        await page.click(signtSelector);
        console.log('[Xverse Wallet] Sign Complete');
        return;
    }

} catch(ex:unknown){
    console.log('[Xverse Wallet] Connect Wallet出现异常。');
    console.trace(ex);
}
    
}


/**
 * 捕获插件页面，在插件中进行确认操作
 * @param page 插件页面
 */
async function connectWalletXversePluginsConfirm(page: Page):Promise<void> {
    try{
    console.log('[Xverse Wallet Plugins Confirm] connectWalletXverseConfirm 连接 Xverse 钱包...');
    // 导入钱包
    await page.bringToFront(); // 聚焦到上一个页面
    // await page.goto(`chrome-extension://${WALLETCONFIG.extensionId}/popup.html`);

    console.log('[Xverse Wallet Plugins Confirm] 页面操作...');
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
            console.log(`[Xverse Wallet Plugins Confirm] 元素 ${btnSelector} 是可见且可用的.`);
        } else {
            console.log(`[Xverse Wallet Plugins Confirm] 元素 ${btnSelector} 是可见但不可用.`);
        }
    } else {
        console.log(`[Xverse Wallet Plugins Confirm] Element not found ${btnSelector}.`);
    }
    

    console.log('[Xverse Wallet Plugins Confirm] Confirm Complete');
    }catch(ex:unknown){
        console.log(`[Xverse Wallet Plugins Confirm] 钱包操作出现异常`);
        console.trace(ex);
    }
        
}

/**
 * Swap钱包确认操作
 * @param page 
 */
async function swapWalletXverseConfirm(page: Page):Promise<void> {
    console.log('connectWalletXverseConfirm 连接 Xverse 钱包...');
    // 导入钱包
    // await page.bringToFront(); // 聚焦到上一个页面
    await page.goto(`chrome-extension://${WALLETCONFIG.extensionId}/popup.html`);

    console.log('[Xverse Wallet] 页面Swap操作开始...');
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
        console.log(`[Xverse Wallet] 元素 ${mintSelector} 是可见且可用的.`);
    } else {
        console.log(`[Xverse Wallet] 元素 ${mintSelector} 是可见但不可用.`);
    }
    } else {
        console.log(`[Xverse Wallet] Element not found ${mintSelector}.`);
    }

    console.log('[Xverse Wallet] Swap Complete');
    
}


// 导出函数
export { 
    // 导入钱包
    importWalletXverse , 
    // 带密码输入连接钱包
    connectWalletXverseWithPassword,
    // 连接钱包，无密码连接
    connectWalletXverse,
    // 操作钱Sign签名操作（连接钱包之后再签名）
    connectWalletXverseSign,

     
    // 捕获插件页面，在插件中进行确认操作
    connectWalletXversePluginsConfirm,
    // Swap钱包确认操作
    swapWalletXverseConfirm
};