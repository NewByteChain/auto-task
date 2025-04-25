import puppeteer, { Browser, Page, Target, ElementHandle  }  from 'puppeteer';
import {WalletConfig,walletConfigs,MintParams,SwapParams} from "../../interface/walletConfigs"; // 接口定义
import { importWalletOkx } from "../wallet.plugins/okx.wallet.plugins"; // 钱包插件
import { fetchTextFromShadowDOM,findChildElementByText } from "../../interface/puppeteer.helper"; // puppeteer公共方法
import { ProxyConfig } from "../../interface/proxyConfigs"; // 
import { queryFractalOrdPrice ,insertFractalOrdAddress} from "../api/fractal.lan.api";
import { ApiResponse } from '../../interface/api.data.interface';
import { delay, parseProxyUrl } from '../../common/utils';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid'; // 导入 uuid 库
import * as dotenv from 'dotenv';
dotenv.config();
import * as proxyChain from 'proxy-chain';
// 浏览器伪装
import { getRandomUserAgent, getRandomViewport ,getRandomLaunchArgs} from '../../common/browser.camouflage';
import { importWalletMetamask, connectWalletMetamaskNoPassword } from '../wallet.plugins/metamask.wallet.plugins';
import { deleteDirectoryContents } from '../../common/fileUtils';
import * as os from 'os';  // 系统模块
import { random } from 'lodash';
const systemUserInfo = os.userInfo();  // 当前系统用户名称
const platform = os.platform();
console.log(`当前系统：${platform},当前用户名称: ${systemUserInfo.username}`);


const METAMASK_PASSWORD = process.env.METAMASK_PASSWORD || '';  // 钱包密码


// 定义 Shadow DOM 内元素信息的接口
interface ShadowElement {
  outerHTML: string;
  tagName: string;
  textContent: string;
}


/**
 * OKX 钱包自动化
 */
export class MagicEdenAutomation {
  
private browser: Browser | null = null;
private page: Page | null = null;
private wallet: WalletConfig;



constructor(walletType: 'metamask' | 'okx' | 'phantom') {
  this.wallet = walletConfigs[walletType];
}

/**
 * 初始化浏览器和插件
 */
async initialize(proxy:ProxyConfig): Promise<void> {
  // 将代理转换为本地 HTTP 代理
  let proxyStr = `${proxy.protocol}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
  console.log(`打印proxyStr: ${proxyStr}`);

  const localProxy = await proxyChain.anonymizeProxy(proxyStr);
  console.log(`本地代理: ${localProxy} -> 原代理: ${proxyStr}`);

  // 创建一个随机目录，用于存放钱包缓存
  const randomDirName = uuidv4(); // 生成一个 UUID 作为目录名
  const randomDirPath = path.join(this.wallet.userDataDir!, randomDirName);
  await deleteDirectoryContents(this.wallet.userDataDir!); // 删除缓存目录

  // // 临时测试
  // const randomDirName = '8e6f4095-bfed-4a00-92d9-d0fcd0a7bfa6';
  // const randomDirPath = path.join(this.wallet.userDataDir!, randomDirName);

  // 插件版本目录
  const METAMASK_EXTENSION_VERSION = process.env.METAMASK_EXTENSION_VERSION || '12.13.0_0';
  
  // 本地代理模式
  this.browser = await puppeteer.launch({
    headless: false, // 设置为 false 以便调试，生产环境可改为 true
    args: [
      `--proxy-server=${localProxy}`,
      
      `--user-data-dir=${randomDirPath}`, // 指定用户数据目录
      `--disable-extensions-except=${path.join(this.wallet.extensionPath,METAMASK_EXTENSION_VERSION)}`,
      `--load-extension=${path.join(this.wallet.extensionPath,METAMASK_EXTENSION_VERSION)}`,
      '--no-sandbox', // 可选：避免权限问题
      '--disable-setuid-sandbox',
      '--lang=en-US' // 设置浏览器语言为英语（美国）
    ],
    protocolTimeout: 60000 
  });

  // // Endpoint
  // this.browser = await puppeteer.connect({
  //   browserWSEndpoint:proxyStr
  // });
  // console.log("Connected! Navigate to site...")
  this.page = await this.browser.newPage();
  
  // 设置视口的宽度和高度
  await this.page.setViewport({
      width: 1280,  // 设置宽度
      height: 800,  // 设置高度
      deviceScaleFactor: 1, // 设置设备像素比，默认为1
  });

}

/**
 * 导入钱包
 * @param mnemonic 助记词
 */
async importtWallet(mnemonic:string): Promise<void> {
  if (!this.page || !this.browser) throw new Error('Browser or Page not initialized');
    console.log('已点击链接钱包按钮');

    // 寻找多余得页面，进行关闭减少干扰
    let pages = await this.browser.pages();

    // 关闭最后一个页面
    await pages[pages.length-1].close();
    pages = await this.browser.pages();
    const previousPage = pages[0]; // 根据url地址自动判断索引
    await previousPage.bringToFront(); // 聚焦到上一个页面
    console.log('[importtWallet]已切换到上一个页面:', previousPage.url());
    
    // 导入助记词
    await importWalletMetamask(this.browser, mnemonic);

    
    console.log('钱包连接完成');
    await delay(500); // 等待0.5秒

}



/**
 * 导航到目标网站
 */
async gotoWebsite(url:string): Promise<void> {
  if (!this.page || !this.browser) throw new Error('Browser or Page not initialized');
  // 然后导航到目标 URL
  this.page = await this.browser.newPage();  // 重新创建一个页面
  // 关闭第一个页面
  var pages = await this.browser.pages();
  await pages[0].close();
  
  console.log(`Page goto URL:${url}`);
  await this.page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  console.log("Navigated! Waiting for popup...");

  // await this.page.reload();

  // 验证代理 IP
  const ip = await this.page.evaluate(() => {
      return fetch('https://api.ipify.org?format=json')
          .then(res => res.json())
          .then(data => data.ip);
  });
  console.log('当前 IP:', ip);
  
  // const pages = await this.browser.pages();
  // let index = 0;
  // // 找到目标url得网页tab索引
  // for(var i=0;i<pages.length;i++){
  //   if(pages[i].url().includes('about:blank')){
  //     index = i;
  //     break;
  //   }
  // }
  // pages[index].close();   // 关闭about:blank页面
  // console.log('已导航到 OKX Market');
}

/**
 * 添加测试网络
 */
async addTestnetToMetaMask(){
  if (!this.page || !this.browser) throw new Error('Browser or Page not initialized');
  console.log(`Page 导入网络 URL:https://testnet.monad.xyz/`);
  await this.page.goto(`https://testnet.monad.xyz/`, { waitUntil: "networkidle2", timeout: 30000 });
  console.log("Navigated! Waiting for popup...");
  // 根据名称找按钮: Manually add network
  const xpathExpression = `//button[contains(text())="Manually add network"]`;  // contains  / normalize-space
  const button = await this.page.waitForSelector(xpathExpression, { visible: true,timeout: 10000})
  await button?.click();
  // 同意条款
  await this.page.waitForSelector('button[role="checkbox"]');
  await this.page.click('button[role="checkbox"]');

  await delay(1200);

  // 还需要钱包确认操作



}


/**
 * 连接钱包
 */
async connectWallet(): Promise<void> {
  if (!this.page || !this.browser) throw new Error('Browser or Page not initialized');
  // 检测页面是否已经连接钱包
  delay(9000);  // 等待俺就可见需要时间，这里延迟很高
  console.log(`开始操作页面元素...`);
  // const xpathExpression = `//button[contains(text())="Log In"]`;  // contains  / normalize-space
  // const button = await this.page.waitForSelector(xpathExpression, { visible: true,timeout: 10000})

  // 操作页面连接钱包按钮
  await this.page.waitForSelector('button[data-test-id="wallet-connect-button"]', { visible: true,timeout: 10000});
  await this.page.click('button[data-test-id="wallet-connect-button"]');
  
  delay(3600);

  // 找到包含 Shadow DOM 的宿主元素
  const shadowDOM = await fetchTextFromShadowDOM(
    this.page,
    '[shadow-root],div[data-testid="dynamic-modal-shadow"]',
    '.dynamic-shadow-dom-content'
  );
  
  // 显示所有钱包选项
  console.log(`shadowDOM${shadowDOM}`);
  const btn = await shadowDOM.$('button.list-item-button');
  await btn!.click();
  
  console.log(`已经点击了shadowDOM元素...`);

  await delay(3000);

  // 选择MetaMask钱包
  // 找到包含 Shadow DOM 的宿主元素
  const shadowDOM2 = await fetchTextFromShadowDOM(
    this.page,
    'div[data-testid="dynamic-modal-shadow"]',
    '.wallet-list__scroll-container--fixed-height'//'.dynamic-shadow-dom-content'
  );
  // 寻找btn按钮
  const elements = await shadowDOM2.$$('button[data-testid="ListTile"]');    
  console.log(`找到Wallet ${elements.length} 个匹配元素`);
  // 遍历btn按钮
  for(var i=0;i<elements.length;i++){
    const btn = await findChildElementByText(elements[i],'span', 'MetaMask');
    if(btn){
      // 如果找到了，说明该按钮就是"MetaMask"
      console.log(`找到Wallet Button MetaMask`);
      await elements[i].click();
    }
  }
  await delay(2000); // 额外等待，确保弹窗加载完成
  console.log(`[MetaMask]开始进行插件页面捕获`);


  // 等待 MetaMask 弹窗
  const metamaskPopup = await this.browser.waitForTarget(
    (target) => target.url().includes(`chrome-extension://${this.wallet.extensionId}/notification.html`)
  );
  // 在MetaMask弹窗中操作页面元素
  if (metamaskPopup) {
    const popupPage = await metamaskPopup.page();
    console.log(`popupPage: ${popupPage}`);
    if(!popupPage) throw new Error(`错误`);
    console.log('捕获到 MetaMask 弹窗:', popupPage.url());

    await popupPage.bringToFront(); // 确保弹窗处于活动状态
    try {
        // 在弹窗中操作，例如点击 "连接" 按钮
        await popupPage.waitForSelector(`button[data-theme="light"]`);
        await popupPage.click(`button[data-theme="light"]`);
        await delay(1600);
        await popupPage.waitForSelector(`button[data-theme="light"]`);
        await popupPage.click(`button[data-theme="light"]`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('detached')) {
        throw new Error('弹窗 Frame 已分离或不可用');
      }
      throw error;
  }
  }



  // 弹出MetaMask连接插件
  // const walletPage = await new Promise<Page>((resolve, reject) => {
  //   this.browser!.on('targetcreated', async (target: Target) => {
  //       console.log(`[MetaMask]targetcreated on.....，URL:${target.url()}`);
  //       const targetUrl = target.url();
  //       // 检查是否为 OKX Wallet 插件页面
  //       if (targetUrl.startsWith(`chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/notification.html`)) {
  //           let p = await target.page(); 
  //           console.log(`[MetaMask]找到 Wallet 页面：${p}`)             
  //           if (p) {
  //               // 检查某些元素是否存在
  //               console.log(`[MetaMask]targetcreated 找到插件页面`);
  //               resolve(p);
  //           }
  //           console.log('[MetaMask]找到 Wallet 页面，URL:', targetUrl);
  //       }
  //   });
  // });

  // const page = await this.browser.newPage();  // 创建一个新的页面进行操作

  // // 连接钱包，无密码操作
  // await connectWalletMetamaskNoPassword(page);
  // this.page = await this.browser.newPage();  // 创建一个新的页面进行操作

  // 输入钱包密码
  // await this.page.waitForSelector('input[data-test-id="unlock-password"]', { visible: true,timeout: 10000});
  // await this.page.type('input[data-test-id="unlock-password"]',METAMASK_PASSWORD);

  // Connect
  console.log(`捕获 MetaMask页面成功`);
  
  await delay(2000); // 额外等待，确保弹窗加载完成
  
}

/**
 * 执行 Mint 操作
 * @param params 
 */
async performMint(params: MintParams,first:boolean): Promise<void> {
  if (!this.page) throw new Error('Page not initialized');
  await this.page.goto(params.mintUrl, { waitUntil: 'networkidle2' });  // 重新加载页面
  await delay(2000);

  // 浏览器伪装
  const [userAgent, chromeVersion] = getRandomUserAgent(); // 获取随机 User-Agent
  const viewport = getRandomViewport(); // 获取随机视口

  // const capsolverPath = path.join(__dirname, 'capsolver'); // Capsolver 扩展路径
  // const launchArgs = getRandomLaunchArgs(capsolverPath); // 获取随机启动参数
  
  // 创建新页面用于操作
  // const page2 = await browser.newPage();
  // 设置额外的 HTTP 头，伪装浏览器 
  await this.page.setExtraHTTPHeaders({
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'sec-ch-ua': `"Chromium";v="${chromeVersion}", "Google Chrome";v="${chromeVersion}"`,
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site'
  });

  // 目标 URL
  const url = `https://stake.apr.io/faucet`;
  // 导航到目标页面，等待网络空闲
  await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  
  // 模拟人类行为：滚动页面和鼠标移动
  await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await delay(Math.random() * 1000 + 1000);
  await this.page.mouse.move(Math.random() * 400 + 100, Math.random() * 400 + 100);

  // 处理服务条款复选框
  await this.page.waitForSelector('input[type="checkbox"]', { visible: true });
  await this.page.click('input[type="checkbox"]');
  await delay(Math.random() * 1000 + 1000);

  // 点击“同意条款”按钮
  const agreeButton = await this.page.waitForSelector('span:text(" Agree to Terms")', { visible: true, timeout: 10000 });
  if (agreeButton !== null) {
    await agreeButton.click();
  }

  // 点击“连接钱包”按钮
  const connectButton = await this.page.waitForSelector('span:text("Connect Wallet")');
  if (connectButton !== null) {
    await connectButton.click();
  }

  // 捕获 MetaMask 弹出窗口并选择 MetaMask
  // Capture the MetaMask popup
  const [metamaskPopup] = await Promise.all([
    new Promise<Page>((resolve, reject) => {
        // Listen for the target created event
        this.browser!.once('targetcreated', async target => {
            const page = await target.page();
            if (page) {
                resolve(page);
            } else {
                reject(new Error('Failed to get the page from the target.'));
            }
        });
    }),
    // Click on the MetaMask button
    this.page.click('wui-text:text("MetaMask")')
]);

  // 等待 MetaMask 页面加载完成
  await metamaskPopup.waitForNavigation({ waitUntil: 'networkidle2' });
  await metamaskPopup.click('button:text("Approve")'); // 点击“批准”
  await delay(Math.random() * 2000 + 1000);
  await metamaskPopup.click('button:text("Connect")'); // 点击“连接”



  await delay(2000);  // 填充页面参数，稍微停顿下
  console.log(`铸造准备完成~`);

  return;    
}

/**
 * 单次铸造工作流
 * @param params 
 */
async performMintFlow(params: MintParams): Promise<string> {
  if (!this.page || !this.browser) throw new Error('Browser or Page not initialized');
  // 点击page页面铸造按钮（多个元素获取对象）
  
  return 'ok';
}

/**
 * 执行循环铸造
 * @param params 
 */
async performLoopMintFlow(address:string): Promise<string> {
  // 铸造前，再查询一次
  let data = await queryFractalOrdPrice(address,50) as ApiResponse<any>; // 50 = 0.5%
  // "gas":{"fastestFee":5,"halfHourFee":5,"hourFee":4,"economyFee":2,"minimumFee":1,"gas":5},"utxo":50
  let list = data.result.rows; 
  let tick = list[0].ticker;

  // 铸造，铸造可以重复铸造
  var mintUrl = `https://www.okx.com/zh-hans/web3/marketplace/fractal-ordinals/inscribing#tick=${tick}`;
  var mintParams = {
      tick:tick,  // tick名称
      mintUrl:mintUrl,   // 铸造页面url
      recipient:address,    // 接收地址
      amount:list[0].limit_per_mint,       // 铸造数量，单张符文铸造数量，这个需要使用api接口查询
      repetitions:"24"  // 单张数量
  }
  console.log(`mint参数:${JSON.stringify(mintParams)}`);
  // 预演一遍，规避okx首次打开页面钱包连接操作
  await this.performMint(mintParams,true);  // 铸造准备
  
  // 循环铸造，单词最多mint 10次，
  for(var i=0;i<10;i++){
      console.log(`循环铸造：当前铸造：${i}`);
      await this.performMint(mintParams,false);  // 铸造准备
      await this.performMintFlow(mintParams); // 执行mint工作流
      // mint完成时，上报一次记录入库  
      await delay(3000);  // 停顿5s，不然页面来不及加载
  }

  return "ok";

}

// 关闭浏览器
async close(): Promise<void> {
  if (this.browser) {
    console.log('浏览器已关闭');
    await this.browser.close();   
  }
}




// 主流程
async run(): Promise<void> {
  try {
      // 测试助记词
      const mnemonic = process.env.MNEMONIC_TEST; // 从配置文件中获取
      
      // mint目标页面
      var targetUrl = `https://magiceden.io/mint-terminal/monad-testnet/0x63300257926aF6f2a1BF2d4eFB4240d8D8f250d6`; //`https://stake.apr.io/faucet`;
        // targetUrl = `https://api.ipify.org/`
      // 通过代理启动 
      var proxyStr = process.env.HTTPS_PROXY||"";
      var proxyInfo = parseProxyUrl(proxyStr) as ProxyConfig;

      await this.initialize(proxyInfo); // 初始化浏览器和插件
      await this.importtWallet(mnemonic!); // 导入钱包（针对已经导入的钱包直接执行操作）
      await this.gotoWebsite(targetUrl); // 导航到目标网站
      await this.connectWallet();  // 连接钱包操作

      
      // 
      await delay(200000); // 额外等待，确保弹窗加载完成



  } catch (error) {
    console.error('发生错误:', error);
  } finally {
    // await this.close();
  }
}
}



