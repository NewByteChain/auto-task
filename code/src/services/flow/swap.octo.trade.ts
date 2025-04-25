import * as path from 'path';
import { v4 as uuidv4 } from 'uuid'; // 导入 uuid 库
import puppeteer, { Browser, Page, Target ,ElementHandle } from 'puppeteer';
import {WalletConfig,walletConfigs} from "../../interface/walletConfigs"; // 接口定义
import { connectWalletOkx,importWalletOkx,connectWalletOkxConfirm,swapWalletOkxConfirm } from "../wallet.plugins/okx.wallet.plugins"; // 钱包插件
import { deleteDirectoryContents,createDirectory, checkAllFolders,checkDirExists} from '../../common/fileUtils';
import { delay, strToBool} from '../../common/utils';
import { timeout } from '../../common/decoratorsUtils';
// 主文件
import { globalState } from "../../globalState";
import * as dotenv from 'dotenv';
dotenv.config();

// 浏览器配置
const CHROME_BROWSER_HEADLESS = strToBool(process.env.CHROME_BROWSER_HEADLESS || "false"); // 默认有头模式
// mint钱包私钥
const WALLET_ETH_PRIVATEKEY = process.env.WALLET_ETH_PRIVATEKEY || "";
// mint钱包密码
const OKX_WALLET_PASSWORD = process.env.OKX_WALLET_PASSWORD || "";

/**
 * octo 钱包自动化
 */
export class OctoAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private wallet: WalletConfig;
  private walletPage: Promise<Page> | null = null; // 钱包插件页面

  constructor(walletType: 'metamask' | 'okx' | 'phantom') {
    this.wallet = walletConfigs[walletType];
  }

  /**
   * 获取钱包插件页面
   * 基于brower监听，这里有个大坑，循环监听会叠加targetcreated事件
   * @param randomDirName 
   * @returns 
   */
  async getWalletPage(): Promise<Page> {
      // 寻找插件
      return new Promise<Page>((resolve, reject) => {
        this.browser!.on('targetcreated', async (target: Target) => {
            const targetUrl = target.url();
            // 检查是否为 OKX Wallet 插件页面
            if (targetUrl.startsWith('chrome-extension://mcohilncbfahbmgdjkbpemcciiolgcge/notification.html')) {
                let p = await target.page();                
                if (p) {
                    // 检查某些元素是否存在
                    console.log(`[002]targetcreated 找到插件页面`);
                    resolve(p);
                }
                // console.log('[002]找到 OKX Wallet 页面，URL:', targetUrl);
            }
        });
      });
  }

  /**
   * 初始化浏览器和插件
   */
  async initialize(randomDirName:string): Promise<void> {
    const userDirPath = path.join(this.wallet.userDataDir!, randomDirName);
    console.log(`用户数据目录设置：${userDirPath}`);
    
    // 插件版本目录
    const OKX_WALLET_EXTENSION_VERSION = process.env.OKX_WALLET_EXTENSION_VERSION || '3.45.22_0';
    
    this.browser = await puppeteer.launch({
      headless: CHROME_BROWSER_HEADLESS, // 设置为 false 以便调试，生产环境可改为 true
      args: [
        `--user-data-dir=${userDirPath}`, // 指定用户数据目录
        `--disable-extensions-except=${path.join(this.wallet.extensionPath,OKX_WALLET_EXTENSION_VERSION)}`,
        `--load-extension=${path.join(this.wallet.extensionPath,OKX_WALLET_EXTENSION_VERSION)}`,
        `--no-sandbox`,   // 禁用沙箱限制
        `--disable-setuid-sandbox`,
        '--lang=en-US' // 设置浏览器语言为英语（美国）
      ],
      protocolTimeout: 60000 
    });
    this.page = await this.browser.newPage();  // 创建一个新的页面
    // 设置用户代理为英语（美国）
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36');
    // 设置请求头中的 Accept-Language 为英语（美国）
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9', // 优先英语（美国），其次其他英语
    });
    // 设置视口的宽度和高度
    await this.page.setViewport({
        width: 1280,  // 设置宽度
        height: 800,  // 设置高度
        deviceScaleFactor: 1, // 设置设备像素比，默认为1
    });
  }

  /**
   * 导航到目标网站
   */
  async gotoWebsite(url:string): Promise<void> {
    if (!this.page || !this.browser) throw new Error('Browser or Page not initialized');
    // 然后导航到目标 URL
    await this.page.goto(url, { waitUntil: 'networkidle2',timeout:90000 });
    
    // 获取所有页面
    const pages = await this.browser.pages();
    // 关闭多余的页面
    for (const p of pages) {
      if (p !== this.page) { // 保留当前页面
          await p.close();
      }
    }
    // 延迟
    await delay(Math.ceil(Math.random() * 1500) + 500); // 随机休眠，2.5s-3s
   
    console.log('已导航到目标网页并关闭多余网页');
    return;
  }

  /**
   * 导入钱包（根据私钥导入）
   * @param privateKey 私钥
   */
  async importWallet(privateKey:string): Promise<void> {
    if (!this.page || !this.browser) throw new Error('Browser or Page not initialized');
      console.log('进入导入钱包流程，importWallet');
      
      // 等待钱包弹窗
      const walletPage = await new Promise<Page>((resolve, reject) => {
        this.browser!.on('targetcreated', async (target: Target) => {
            const targetUrl = target.url();
            // 检查是否为 OKX Wallet 插件页面
            if (targetUrl.startsWith('chrome-extension://')) {
                let p = await target.page();
                if (p) {
                    resolve(p);
                }
                console.log('找到Wallet 页面，URL:', targetUrl);
            }
        });
      });

      console.log(`当前页面地址：${walletPage.url()}`);
      //chrome-extension://mcohilncbfahbmgdjkbpemcciiolgcge/notification.html
      // 关闭自动弹出得插件页面
      await walletPage.close();
      
      // 寻找多余得页面，进行关闭减少干扰
      const pages = await this.browser.pages();

      // 页面重新聚焦 
      const previousPage = pages[0]; // 根据url地址自动判断索引
      await previousPage.bringToFront(); // 聚焦到上一个页面
      console.log('已切换到上一个页面:', previousPage.url());

      // 关闭多余的页面
      for (const p of pages) {
        if (p !== this.page) { // 保留当前页面
            await p.close();
        }
      }

    // 导入钱包私钥
    await importWalletOkx(this.browser, privateKey,OKX_WALLET_PASSWORD);

    console.log('[Key Nodes] Start: Wallet connection completed!');
    await delay(Math.ceil(Math.random() * 300) + 300); // 随机休眠，0.3-0.6s
  }

  /**
   * 关闭多余的页面
   */
  async closeExtraPage(): Promise<void> {
        if (!this.page || !this.browser) throw new Error('Browser or Page not initialized');
        await this.page.bringToFront(); // 聚焦到目标页面

        const pages: Page[] = await this.browser.pages();
        // 遍历所有页面，关闭插件页面
        for (const page of pages) {
          const url = page.url();
          if(page != this.page){
              await page.close(); // 非当前页，统统关闭
          }
        }
        console.log(`当前页面个数：${pages.length}`);
        await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠
  }


  /**
   * 检测目录是否存在
   * @returns 
   */
  async checkWalletStatus(){
    // 验证钱包导入状态
    const baseDir = `${path.join(path.resolve(__dirname, '../../../'),"data","wallet","okx","Default","Service Worker","CacheStorage")}`; 
    console.log(`验证钱包导入验证路径：${baseDir}`);
    // 首先需要检测目录是否存在
    const dirExist = await checkDirExists(baseDir);
    // 如果目录不存在，则肯定没有钱包导入；如果存在，需要判断该目录下是否存在文件
    if(dirExist){
       // 目录信息
       const dirInfos = await checkAllFolders(baseDir);
       if(dirInfos.length>0){
          // 存在目录
          console.log(`目录检索：${JSON.stringify(dirInfos)}`);
          return true;
       } else {
          return false;
       }
    }
    return dirExist;
  }

  /**
   * 登录钱包
   * @param url 目标网址url
   */
  async loginWallet(): Promise<void> {
    if (!this.page || !this.browser) throw new Error('Browser or Page not initialized');
    console.log('准备登录钱包');

    await delay(Math.ceil(Math.random() * 3000) + 1000); // 随机休眠

    // 获取所有打开的页面
    const pages: Page[] = await this.browser.pages();
    // 遍历所有页面，关闭插件页面
    for (const page of pages) {
      const url = page.url();
      if(page != this.page){
          await page.close(); // 非当前页，统统关闭
      }
    }

    /**
     * 连接Wallet（1），解锁钱包，支持多种钱包类型
     * 多种钱包插件交互在wallet.plgins.ts中实现，后期可扩展到更多钱包类型（维护性更好）
     */
    const walletPage = await this.browser.newPage();
    await connectWalletOkx(walletPage,OKX_WALLET_PASSWORD);
    // 切换页面之后再关闭
    await this.page.bringToFront();
    
    console.log('[Key Nodes] Restart: Wallet connection completed!');

  }
  
  /**
   * 连接钱包
   * @param url 目标网址url
   */
  async connectWallet(): Promise<void> {
        if (!this.page || !this.browser) throw new Error('Browser or Page not initialized');
        console.log('准备连接钱包');
        try{
          // 操作页面元素，点击Connect Wallet按钮//button[text()=""]
          await this.page.waitForSelector(`::-p-xpath(//button[contains(text(), "Connect Wallet")])`,{ visible: true });
          await this.page.click(`::-p-xpath(//button[contains(text(), "Connect Wallet")])`);
          await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠
          console.log('开关点击连接钱包按钮');

          // 弹出层提示交互 
          const okBtn = 'button[id*="wallet-connect-okx"]';
          await this.page.waitForSelector(okBtn,{ visible: true });
          await this.page.click(okBtn);
          
          await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠
          console.log('准备操作连接钱包');

          // 会导致浏览器关闭不可见了
          const walletPage = await this.browser.newPage();
          // 再新得页面进行钱包连接操作
          await connectWalletOkxConfirm(walletPage);
          // 关闭多余的页面
          await this.closeExtraPage();
          
          await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠
          
          console.log('[Connect Success] The operation was successfully submitted');
          
        } catch(ex:unknown){
          console.trace((ex as Error));
        }

  }
  
  /**
   * 执行 Mint 页面数据填充操作
   * @param params mint参数
   */
  @timeout(60000)
  async performSwap(amount:string): Promise<void> {
    if (!this.page || !this.browser) throw new Error('Page not initialized');
    
    await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠，2.6s-3.2s

    // 检测是否弹出了提示框
    console.log('Start performSwap...');
    
    // 输入金额
    const inputAmount = 'input.token-amount-input';
    const inputs = await this.page.$$(inputAmount);
    console.log(`获取input输入框个数：${inputs.length}`);
    if (inputs.length > 0) {
      // 如果存在默认则先清空输入框，这个没有，直接赋值
      inputs[0].type(amount);  // 可调参
      const output = await this.page.evaluate(input => input.textContent,inputs[0]);
      console.log(`Enter value to the amount input box: ${output}`);
    }
    
    // 填充页面参数，稍微停顿下
    await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠，1s-2s
    console.log(`Swap Prepare to be completed ~`);


    // 准备提交交易
    await this.page.waitForSelector(`button[id="swap-button"]`,{ visible: true });
    await this.page.click(`button[id="swap-button"]`);
    // 这里不能休眠太长，会导致页面价格更新，需要手动点击按钮
    await delay(Math.ceil(Math.random() * 100) + 100); // 随机休眠，1s-2s

    // 弹出层确认提交
    await this.page.waitForSelector(`button[id="confirm-swap-or-send"]`,{ visible: true });
    await this.page.click(`button[id="confirm-swap-or-send"]`);


    // 以下是交互OKX钱包插件
    console.log(`再次准备钱包交互，提交swap交易请求`);
    const walletPage = await this.browser.newPage();
    // 再新得页面进行钱包连接操作
    await swapWalletOkxConfirm(walletPage);
    console.log(`[OKX Wallet] 提交Swap操作成功`);
    
    // 关闭多余的页面
    await this.closeExtraPage();
    
    console.log(`Swap transaction request submission completed`);
    await delay(Math.ceil(Math.random() * 2000) + 1000); // 随机休眠，1s-2s


    return;    
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
        // 从本地缓存中获取钱包导入状态
        let WALLET_IMPORT_STATE_KEY = globalState.WALLET_IMPORT_STATE_KEY;
        // 再检查配置文件是否存在
        const OKX_USER_DATA_DIR = process.env.OKX_USER_DATA_DIR || "";
        if(WALLET_IMPORT_STATE_KEY == "" && OKX_USER_DATA_DIR!=""){
          // 取配置文件中的用户缓存目录名称
          WALLET_IMPORT_STATE_KEY = OKX_USER_DATA_DIR;
        }
        
        console.log(`钱包导入状态结果：${WALLET_IMPORT_STATE_KEY}`);
        // 判断钱包是否需要执行导入动作
        let action = true; // true-需要导入，false-不需要导入
        // 分两种情况：一种是存在值（需要二次检测文件目录是否存在），一种是不存在值（不存在值肯定需要导入）
        if(WALLET_IMPORT_STATE_KEY !==""){
          // 看上去钱包已经导入了，根据名称检测目录是否存在
          const randomDirPath = path.join(this.wallet.userDataDir!, WALLET_IMPORT_STATE_KEY);
          // 检测目录是否存在
          const dirExist = await checkDirExists(randomDirPath);
          if(dirExist){
            // 存在目录
            action = false;//不需要导入
          } else {
            // 目录不存在，依然需要重新导入钱包
            action = true; // 需要导入
          }
        }

         // 进行swap得token合约地址， 例如 YAKI，需要其他合约swap更换合约地址
         const JAI = '0xCc5B42F9d6144DFDFb6fb3987a2A916af902F5f8';
         var targetUrl = `https://swap.bean.exchange/swap?outputCurrency=${JAI}`;
        
        // 判断是否需要导入钱包操作
        if(action) {
            // 创建一个随机目录，用于存放钱包缓存
            const randomDirName = uuidv4(); // 生成一个 UUID 作为目录名
            // 基础目录，如果没有，则递归创建
            await createDirectory(this.wallet.userDataDir!);
            // 删除缓存目录
            await deleteDirectoryContents(this.wallet.userDataDir!); 
            
            // 进入目标页面：先完成钱包账户关联（一次性操作）
            await this.initialize(randomDirName); // 初始化浏览器和插件

            // 执行导入钱包得操作，不需要二次输入密码交互
            // 首次进入执行钱包导入
            await this.importWallet(WALLET_ETH_PRIVATEKEY!); // 导入钱包（针对已经导入的钱包直接执行操作）
            // 导入成功，需要将导入状态存储到内存
            globalState.WALLET_IMPORT_STATE_KEY = randomDirName;// 将导入状态存储到内存
        } else {
            // 进入目标页面：先完成钱包账户关联（一次性操作）
            await this.initialize(WALLET_IMPORT_STATE_KEY); // 初始化浏览器和插件
            /**
             * 连接Wallet（1），解锁钱包，支持多种钱包类型
             * 多种钱包插件交互在wallet.plgins.ts中实现，后期可扩展到更多钱包类型（维护性更好）
             */
            await this.loginWallet();  // 针对已经导入得钱包，重新打开浏览器需要密码登录
        }

        // 打开目标网站并关闭多余得页面
        await this.gotoWebsite(targetUrl);
        // 钱包已经导入，从网页连接钱包
        await this.connectWallet();
        await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠
        // 执行工作流
        // swap金额
        const amount = "0.1"; // 测试金额

        // 进行页面交互，进行swap操作
        await this.performSwap(amount);  // 打开铭文铸造页面

        // 等一分钟，暂停等待演示效果
        await delay(Math.ceil(Math.random() * 120000) + 1000); // 随机休眠

        console.log(`任务完成，可以关闭浏览器了。`)
        // 程序执行到这里，需要关闭浏览器，不然无法继续mint
    } catch (error) {
      console.error('发生错误:', error);
      return;
    } finally {
      await this.close();
    }
  }
}



