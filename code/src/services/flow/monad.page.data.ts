// import puppeteer, { Browser, Page, Target } from 'puppeteer';
import puppeteer, { Browser, Page, Target,ElementHandle  }  from 'puppeteer';
// import { getCurrentOsName } from '../../common/utils';
import {WalletConfig,walletConfigs,SwapParams} from "../../interface/walletConfigs"; // 接口定义
import * as dotenv from 'dotenv';
dotenv.config();

// 延时辅助函数，替代 waitForTimeout
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));


export class MonadAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private wallet: WalletConfig;

  constructor(walletType: 'metamask' | 'okx' | 'phantom') {
    this.wallet = walletConfigs[walletType];
  }

  /**
   * 初始化浏览器和插件
   */
  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: false, // 设置为 false 以便调试，生产环境可改为 true
      args: [
        `--user-data-dir=${this.wallet.userDataDir}`, // 指定用户数据目录
        `--disable-extensions-except=${this.wallet.extensionPath}`,
        `--load-extension=${this.wallet.extensionPath}`,
      ]
    });
    this.page = await this.browser.newPage();  // 创建一个新的页面
  }

  /**
   * 导航到目标网站
   */
  async gotoWebsite(url:string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    await this.page.goto(url, { waitUntil: 'networkidle2' });
    console.log('已导航到 Monad Testnet');
  }

  /**
   * 导入钱包
   * @param mnemonic 助记词
   */
  async importtWallet(mnemonic:string): Promise<void> {
    
    if (!this.page || !this.browser) throw new Error('Browser or Page not initialized');
    // 访问 Chrome 钱包插件的页面
    await this.page.goto(`chrome-extension://${this.wallet.extensionId}/popup.html`); // 替换为您的插件 ID
    console.log(`进入importtWallet`)

    await this.page.waitForSelector('button',{timeout:3000}); 

    // 导入已有钱包（等待页面加载完成并完成选择）
    await this.page.waitForSelector('button:nth-of-type(1)'); // 等待第一个按钮加载
    // 获取第二个按钮
    const btn = await this.page.$('button:nth-of-type(1)');
    if(btn) {
      await btn.click(); // 点击第二个按钮
    }
    
    const buttons = await this.page.$$('button');
    console.log(`content:${(await this.page.content()).toString()}`);
    console.log(`buttons:${buttons.length}  ${buttons[1].evaluate(el=>el.textContent).toString()}`);
    await this.page.click('button:nth-of-type(1)'); // 点击第一个按钮
    console.log(`已经单击了第二个按钮`);
    await buttons[1].click();
    
    delay(2000); // 等待弹窗加载完成

    // 导入钱包
    await this.page.waitForSelector('i[class="okx-wallet-plugin-futures-grid-20"]');
    await this.page.click('i[class="okx-wallet-plugin-futures-grid-20"]');
    
    // 输入助记词
    let mnemonics = mnemonic.split(' '); // 分割助记词
    console.log(`mnemonics:${mnemonics.length}`);
    // 填充助记词
    const inputs = await this.page.$$('input'); // 获取所有 input 元素
   
    for (let i = 0; i < inputs.length; i++) {
      if (i < inputs.length) {
          await inputs[i].type(mnemonics[i]); // 填充内容
      }
    }
    // 提交助记词导入
    await this.page.waitForSelector('button[type="submit"]'); // 替换为实际的选择器
    await this.page.click('button[type="submit"]');

    // 等待导入完成
    await this.page.waitForNavigation();

    console.log('Wallet imported successfully!');

  }

  /**
   * 连接钱包
   */
  async connectWallet(url:string): Promise<void> {
    if (!this.page || !this.browser) throw new Error('Browser or Page not initialized');

    await this.page.waitForSelector('button'); // 等待任意按钮加载
    
    // 使用 evaluate 查找包含指定文案的按钮
    await this.page.evaluateHandle((text) => {
        // 查找所有按钮并返回第一个包含指定文本的按钮
        return Array.from(document.querySelectorAll('button')).find(button => {
            if(button.textContent && button.textContent.includes(text)){
                console.log('点击了“Connect Wallet”按钮');
                button.click();  // 点击button
                return button;
            }
        });
    }, `Connect Wallet`);
    
    // 等待钱包弹窗
    const walletPage = await new Promise<Page>((resolve, reject) => {
        this.browser!.on('targetcreated', async (target: Target) => {
            const targetUrl = target.url();
            // 检查是否为 OKX Wallet 插件页面
            if (targetUrl.startsWith('chrome-extension://')) {
                let p = await target.page();
                if (p) resolve(p);
                console.log('找到 OKX Wallet 页面，URL:', targetUrl);
            }
        });
    });

    // 根据钱包类型处理连接
    if (this.wallet.name === 'MetaMask') {
      await walletPage.waitForSelector('.button.btn-primary'); // "Next" 按钮
      await walletPage.click('.button.btn-primary');
      await walletPage.waitForSelector('.button.btn-primary'); // "Connect" 按钮
      await walletPage.click('.button.btn-primary');
    } else if (this.wallet.name === 'OKX Wallet') {
      // 如何输入密码？
      console.log(`walletPage:${JSON.stringify(walletPage)}`);
      await walletPage.waitForSelector('input[type="password"]'); // 等待密码输入字段可见
      await walletPage.type('input[type="password"]', process.env.OKX_WALLET_PASSWORD||""); // 输入密码
      await walletPage.waitForSelector('button[type="submit"]'); // 等待登录按钮可见
      await walletPage.click('button[type="submit"]'); // 点击登录按钮

      // OKX 特定的连接逻辑
      // await walletPage.waitForSelector('button.confirm'); // 示例选择器
      // await walletPage.click('button.confirm');
    } else if (this.wallet.name === 'Phantom') {
      // Phantom 特定的连接逻辑
      await walletPage.waitForSelector('button.connect');
      await walletPage.click('button.connect');
    }

    // 关闭钱包弹窗
    await walletPage.close();

    // 获取所有页面
    const pages = await this.browser.pages();
    let previousPageIndex = 0;
    // 找到目标url得网页tab索引
    for(var i=0;i<pages.length;i++){
      if(pages[i].url().includes(url)){
        previousPageIndex = i;
      }
    }
    // 页面重新聚焦 
    const previousPage = pages[previousPageIndex]; // 根据url地址自动判断索引
    await previousPage.bringToFront(); // 聚焦到上一个页面
    console.log('已切换到上一个页面:', previousPage.url());

    // 刷新当前聚焦的页面
    await previousPage.reload({ waitUntil: 'networkidle2' });
    console.log('已刷新页面:', previousPage.url());

    // // 假设当前聚焦在 page2，想切换回上一个页面 (page1)
    // if (pages.length > 1) {
    //     const previousPage = pages[1]; // 上一个页面是倒数第二个
    //     await previousPage.bringToFront(); // 聚焦到上一个页面
    //     console.log('已切换到上一个页面:', previousPage.url());

    //     // 刷新当前聚焦的页面
    //     await previousPage.reload({ waitUntil: 'networkidle2' });
    //     console.log('已刷新页面:', previousPage.url());
    // } else {
    //     console.log('没有上一个页面可切换');
    // }

    await delay(50000); // 额外等待，确保弹窗加载完成
    console.log(`${this.wallet.name} 钱包已连接`);
  }

  /**
   * 执行 Swap 操作
   * @param params 
   */
  async performSwap(params: SwapParams): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    // 假设页面有 Swap 输入框和按钮
    await this.page.waitForSelector('#from-token-input'); // 替换为实际选择器
    await this.page.type('#from-token-input', params.fromToken);
    await this.page.type('#to-token-input', params.toToken);
    await this.page.type('#amount-input', params.amount);

    await this.page.click('#swap-button'); // 替换为实际选择器
    console.log('Swap 操作已提交');

    // 等待钱包弹窗
    const walletPage = await new Promise<Page>((resolve, reject) => {
        this.browser!.once('targetcreated', async (target: Target) => {
          const page = await target.page();
          if (page) resolve(page);
          else reject(new Error('Wallet page not found'));
        });
    });

    await delay(2000); // 额外等待，确保弹窗加载完成

    // 签名确认
    await walletPage.waitForSelector('.button.btn-primary'); // 替换为实际确认按钮选择器
    await walletPage.click('.button.btn-primary');
    console.log('交易已签名并提交');
  }

  // 关闭浏览器
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      console.log('浏览器已关闭');
    }
  }

  // 主流程
  async run(): Promise<void> {
    try {
      // process.env.MNEMONIC
      // 抓取目标地址
      var targetUrl = 'https://testnet.monad.xyz/';
      await this.initialize(); // 初始化浏览器和插件
      await this.gotoWebsite(targetUrl); // 导航到目标网站
      await this.importtWallet(process.env.MNEMONIC||""); // 导入钱包
      await this.connectWallet(targetUrl); // 连接钱包（针对已经导入的钱包直接执行操作）
    //   await this.performSwap(swapParams);  // 执行 Swap 操作
    } catch (error) {
      console.error('发生错误:', error);
    } finally {
      // await this.close();
    }
  }
}



/**
    如何通过 Node.js 实现通过puppeteer模拟浏览器登录并与 Chrome 钱包插件进行账户链接的方案。
    1、我需要交互的网站是https://testnet.monad.xyz/，这是一个区块链应用，需要登录和连接钱包才能使用。
    2、这种需求通常涉及自动化浏览器操作和与区块链钱包（如 MetaMask、OKX、Phantom）多种钱包类型的交互，实现账户链接。
    3、账户链接成功之后，在页面里面进行swap操作，并针对chrome插件钱包进行签名操作，完成交易。
    请帮我实现这个需求，我需要一个完整的代码示例，需要实现typescript代码，我会在我的项目里面使用。

 */