import * as path from 'path';
const os = require('os');
import { v4 as uuidv4 } from 'uuid'; // 导入 uuid 库
import puppeteer, { Browser, Page, Target ,ElementHandle } from 'puppeteer';
import { fetchTextFromShadowDOM,findChildElementByText } from "../../interface/puppeteer.helper"; // puppeteer公共方法
import * as proxyChain from 'proxy-chain';
import {WalletConfig,walletConfigs} from "../../interface/walletConfigs"; // 接口定义
import {pasteFromClipboard} from "../../interface/puppeteer.helper";
import { ProxyConfig } from "../../interface/proxyConfigs"; // 
import { connectWalletOkx,importWalletOkx,connectWalletOkxConfirm,connectWalletOkxPluginsConfirm } from "../wallet.plugins/okx.wallet.plugins"; // 钱包插件
import { deleteDirectoryContents,createDirectory, checkAllFolders,checkDirExists,appendResultToFile} from '../../common/fileUtils';
import { delay, parseProxyUrl,strToBool,getUrlParameter,getCurrentOsName} from '../../common/utils';
import { timeout } from '../../common/decoratorsUtils';
import {generateUniqueUsernames} from '../../common/generateUsername'; // 问题库
import { globalState,globalReferralCode } from "../../globalState";
import * as dotenv from 'dotenv';
import { forEach } from 'lodash';
dotenv.config();

// 浏览器配置
const CHROME_BROWSER_HEADLESS = strToBool(process.env.CHROME_BROWSER_HEADLESS || "false"); // 默认有头模式

// mint钱包密码
const OKX_WALLET_PASSWORD = process.env.OKX_WALLET_PASSWORD!;

/**
 * Mahojin 钱包自动化
 */
export class MahojinAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private wallet: WalletConfig;
  private walletStep:number | null = null;

  constructor(walletType: 'metamask' | 'okx' | 'phantom') {
    this.wallet = walletConfigs[walletType];
    this.walletStep = 0;
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
                    console.log(`[chrome-extension]targetcreated 找到插件页面`);
                    resolve(p);

                    try{
                      console.log(`[chrome-extension] this.walletSetp:${this.walletStep}`)
                      if(this.walletStep == 1){
                          // 连接钱包
                          await delay(1000 + Math.ceil(Math.random() * 1000)); // 随机休眠
                          await connectWalletOkxPluginsConfirm(p);
                          console.log(`[chrome-extension] 钱包交互链接网站操作成功`);
                      } else if(this.walletStep == 2){
                          // 选择网络
                          await delay(1000 + Math.ceil(Math.random() * 1000)); // 随机休眠
                          await connectWalletOkxPluginsConfirm(p);
                          console.log(`[chrome-extension] 钱包交互选择网络成功`);
                      }
                    } catch(ex){
                      console.log(`[chrome-extension] 操作出现异常，忽略处理`);
                    }
                }
                // console.log('[002]找到 OKX Wallet 页面，URL:', targetUrl);
            }
        });
      });
  }

  /**
   * 初始化浏览器和插件
   * @param randomDirName 用户缓存根目录名
   * @param proxyInfo 代理信息
   */
  async initialize(randomDirName:string,proxyInfo:ProxyConfig|null): Promise<void> {
    const userDirPath = path.join(this.wallet.userDataDir!, randomDirName);
    console.log(`用户数据目录设置：${userDirPath}`);
    
    // 插件版本目录
    const OKX_WALLET_EXTENSION_VERSION = process.env.OKX_WALLET_EXTENSION_VERSION || '3.45.22_0';

    // 浏览器args设置
    let args = [
      `--user-data-dir=${userDirPath}`, // 指定用户数据目录
      `--disable-extensions-except=${path.join(this.wallet.extensionPath,OKX_WALLET_EXTENSION_VERSION)}`,
      `--load-extension=${path.join(this.wallet.extensionPath,OKX_WALLET_EXTENSION_VERSION)}`,
      `--no-sandbox`,   // 禁用沙箱限制
      `--disable-setuid-sandbox`,
      '--lang=en-US', // 设置浏览器语言为英语（美国）
      // '--disable-web-security', // 禁用部分安全限制
      // '--disable-features=Permissions-Policy' // 禁用权限策略
    ];
    
    // 判断是否存在代理
    if(proxyInfo) {
      // 将代理转换为本地 HTTP 代理
      let proxyStr = `${proxyInfo.protocol}://${proxyInfo.username}:${proxyInfo.password}@${proxyInfo.host}:${proxyInfo.port}`;
      console.log(`打印proxyStr: ${proxyStr}`);
      const localProxy = await proxyChain.anonymizeProxy(proxyStr);  // 代理
      console.log(`本地代理: ${localProxy} -> 原代理: ${proxyStr}`);
      // 添加代理
      args.push(`--proxy-server=${localProxy}`)
    } else {
      console.log(`未启动代理加载浏览器...`)
    }
    // 启动浏览器
    this.browser = await puppeteer.launch({
      headless: CHROME_BROWSER_HEADLESS, // 设置为 false 以便调试，生产环境可改为 true
      args: args,
      protocolTimeout: 90000 
    });

    this.page = await this.browser.newPage();  // 创建一个新的页面
    // 设置默认导航超时时间为 60 秒
    await this.page.setDefaultNavigationTimeout(60000);

    // 设置用户代理为英语（美国）
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36');
    // 设置请求头中的 Accept-Language 为英语（美国）
    await this.page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9', // 优先英语（美国），其次其他英语
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
    await this.page.goto(url, { waitUntil: 'networkidle2'});
    
    // 关闭多余的页面
    await this.closeExtraPage();
    console.log('已导航到目标网页并关闭多余网页');
    // 延迟
    await delay(1000 + Math.ceil(Math.random() * 1000)); // 随机休眠

    // // 验证代理 IP
    // const ip = await this.page.evaluate(() => {
    //     return fetch('https://api.ipify.org?format=json')
    //         .then(res => res.json())
    //         .then(data => data.ip);
    // });
    // console.log('当前 IP:', ip);
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
      // const walletPage = await new Promise<Page>((resolve, reject) => {
      //   this.browser!.on('targetcreated', async (target: Target) => {
      //       const targetUrl = target.url();
      //       // 检查是否为 OKX Wallet 插件页面
      //       if (targetUrl.startsWith('chrome-extension://')) {
      //           let p = await target.page();
      //           if (p) {
      //               resolve(p);
      //           }
      //           console.log('找到Wallet 页面，URL:', targetUrl);
      //       }
      //   });
      // });

      const walletPage = await this.getWalletPage(); // 绑定钱包事件
      await walletPage.close();

      // console.log(`当前页面地址：${walletPage.url()}`);
      //chrome-extension://mcohilncbfahbmgdjkbpemcciiolgcge/notification.html
      // 关闭自动弹出得插件页面
      
      
      // 寻找多余得页面，进行关闭减少干扰
      const pages = await this.browser.pages();

      // 页面重新聚焦 
      const previousPage = pages[0]; // 根据url地址自动判断索引
      await previousPage.bringToFront(); // 聚焦到上一个页面
      console.log('已切换到上一个页面:', previousPage.url());

      // // 关闭多余的页面
      // await this.closeExtraPage();

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
              console.log(`关闭多余得页面:$${page.url()}`)
              await page.close(); // 非当前页，统统关闭
          }
        }
        console.log(`当前页面个数：${pages.length}`);
        await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠
  }
  
  /**
   * 登录钱包
   * @param url 目标网址url
   */
  async loginWallet(): Promise<void> {
    if (!this.page || !this.browser) throw new Error('Browser or Page not initialized');
    console.log('准备登录钱包');

    // await delay(Math.ceil(Math.random() * 2000) + 1000); // 随机休眠

    const walletPage1 = await this.getWalletPage(); // 绑定钱包事件
    await walletPage1.close();

    await this.page.bringToFront();

    // // 关闭多余的页面
    // await this.closeExtraPage();
    
    // await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠
    /**
     * 连接Wallet（1），解锁钱包，支持多种钱包类型
     * 多种钱包插件交互在wallet.plgins.ts中实现，后期可扩展到更多钱包类型（维护性更好）
     */
    const walletPage = await this.browser.newPage();
    await connectWalletOkx(walletPage,OKX_WALLET_PASSWORD);
    // 输入密码之后，会弹出确认连接网站操作

    await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠
    // 切换页面之后再关闭
    await this.page.bringToFront();
    // // 关闭多余的页面
    // await this.closeExtraPage();
    
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
          await delay(Math.ceil(Math.random() * 2000) + 1000); // 随机休眠
          console.log('开关点击连接钱包按钮');

          // 弹出层提示交互
          const okxHandle = await this.page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(button => button.textContent!.includes('OKX Wallet'));
          });

          const okxButton = okxHandle.asElement() as ElementHandle<HTMLButtonElement> | null;
          if (okxButton) {
            await okxButton.click();
            console.log('成功点击 OKX Wallet 按钮');
          } else {
            console.log('未找到 OKX Wallet 按钮');
          }
          await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠
          console.log('准备操作连接钱包');

          // 会导致浏览器关闭不可见了
          const walletPage = await this.browser.newPage();
          // 再新得页面进行钱包连接操作
          await connectWalletOkxConfirm(walletPage);
          // 第一次：连接操作
          await delay(Math.ceil(Math.random() * 1800) + 400); // 不能小于2.8s
          // 切换到主页
          await this.page.bringToFront();
          // 等待足够的时间，确认连接的网络请求
          await delay(Math.ceil(Math.random() * 6800) + 400); // 不能小于2.8s
          // 关闭多余的页面
          await this.closeExtraPage();          
          
          console.log('[Connect Success] The operation was successfully submitted');
          
        } catch(ex:unknown){
          console.trace((ex as Error));
        }

  }

  /**
   * 执行 Mint 页面数据填充操作
   * @param url 交互地址
   * @param questions 需要交互得问题清单
   */
  @timeout(30000)
  async connectWebsite(): Promise<void> {
    if (!this.page || !this.browser) throw new Error('Page not initialized');
    
    await delay(4000 + Math.ceil(Math.random() * 1000)); // 随机休眠
    // 检测是否弹出了提示框
    console.log('[Perform Swap] Start performSwap...');

    // 连接钱包进行系统登录
    await this.page.waitForSelector(`button[data-testid="ConnectButton"]`);
    await this.page.click(`button[data-testid="ConnectButton"]`);
    console.log('[Perform Swap] 已经点击连接钱包');

    await delay(3000 + Math.ceil(Math.random() * 1000));
    
    // 找到包含 Shadow DOM 的宿主元素
    const shadowDOM = await fetchTextFromShadowDOM(
      this.page,
      '[shadow-root],div[data-testid="dynamic-modal-shadow"]',
      '.dynamic-shadow-dom-content'
    );

    // 寻找btn按钮
    const elements = await shadowDOM.$$('button[data-testid="ListTile"]');    
    console.log(`找到Wallet ${elements.length} 个匹配元素`);
    // 遍历btn按钮
    for(var i=0;i<elements.length;i++){
      const btn = await findChildElementByText(elements[i],'span', 'OKX Wallet');
      if(btn){
        // 如果找到了，说明该按钮就是"OKX Wallet"
        console.log(`找到Wallet Button OKX Wallet`);
        await elements[i].click();
      }
    }
    await delay(2000); // 额外等待，确保弹窗加载完成
    console.log(`[OKX Wallet] 开始进行插件页面捕获`);

    await delay(6000 + Math.ceil(Math.random() * 1000));
    
  }

  /**
   * 选择网络
   */
  @timeout(30000)
  async selectNetwork(): Promise<void> {
    if (!this.page || !this.browser) throw new Error('Page not initialized');
    
    await delay(4000 + Math.ceil(Math.random() * 1000)); // 随机休眠
    await this.page.bringToFront();
    // 检测是否弹出了提示框
    console.log('[Select Network] Start selectNetwork...');
    await delay(2000 + Math.ceil(Math.random() * 1000)); // 随机休眠

    // 连接钱包进行系统登录
    // 找到包含 Shadow DOM 的宿主元素
    const shadowDOM = await fetchTextFromShadowDOM(
      this.page,
      '[shadow-root],div[data-testid="dynamic-modal-shadow"]',
      '.dynamic-shadow-dom-content'
    );

    // 寻找btn按钮
    const elements = await shadowDOM.$('button[data-testid="SelectNetworkButton"]');    
    if(elements){
      // 如果找到了，说明该按钮就是"OKX Wallet"
      console.log(`[Select Network] 找到Wallet Button OKX Wallet`);
      await elements.click();
      console.log('[Select Network] 已经点击连接钱包');
      console.log(`[Select Network] 开始进行插件页面捕获`);
    }

    await delay(8000 + Math.ceil(Math.random() * 1000));
    
  }

  // 设置用户名
  @timeout(20000)
  async setUsername(): Promise<void> {
    if (!this.page || !this.browser) throw new Error('Page not initialized');

    await delay(2000 + Math.ceil(Math.random() * 1000)); // 随机休眠
    // 设置用户名
    try {
      // 找到包含 Shadow DOM 的宿主元素
      const shadowDOM = await fetchTextFromShadowDOM(
        this.page,
        '[shadow-root],div[data-testid="dynamic-modal-shadow"]',
        '.dynamic-shadow-dom-content'
      );

      if(!shadowDOM){
        console.log(`[Set Username] 未找到设置用户名称的shadow弹窗，跳过此步骤。`);
        return;
      }

      // 寻找btn按钮
      const input = await shadowDOM.$('input[copykey="dyn_collect_user_data.fields.username.label"]');    
      if(input){
        // 如果找到了
        console.log(`[Set Username] 找到Set Username页面input元素`);
        
        // 分配一个用户名
        const names =  await generateUniqueUsernames(10); // 一次性生成10个用户名
        console.log(`[Set Username] 生成的用户名列表：${JSON.stringify(names)}`);
        // 元素存在，执行操作
        await input.type(names[0]);
        await delay(1000 + Math.ceil(Math.random() * 1000)); // 随机休眠

        // 提交按钮
        const btn = await shadowDOM.$(`button[type="submit"]`);
        if(btn){
          await btn.click();
          console.log('[Set Username] 已经提交用户名');
        } else {
          console.log(`[Set Username] 未找到提交按钮`);
        }
      } else {
        // 元素不存在，跳过
        console.log('[Set Username] Set inpurt not found, skipping...');
      }
    } catch (ex){
      console.log(`[Set Username] 设置用户名输入框出现异常，可能已经设置过了`);
    }
  }

  /**
   * 领取积分
   */
  @timeout(20000)
  async performClaim(): Promise<void> {
    if (!this.page || !this.browser) throw new Error('Page not initialized');

    await delay(3000 + Math.ceil(Math.random() * 1000)); // 随机休眠
    console.log('[Perform Claim] 进入Claim领取积分流程');
    // 点击个人头像按钮
    await this.page.waitForSelector(`button.active\\:bg-white`,{ visible: true });
    await this.page.click(`button.active\\:bg-white`);
    await delay(1000 + Math.ceil(Math.random() * 1000)); // 随机休眠

    // 判断claim按钮是否存在 disabled样式
    const claimSeletor = `button.disabled\\:text-white-alpha-30`;
    // 等待元素出现
    await this.page.waitForSelector(claimSeletor,{ visible: true });
    // 检查 disabled 属性
    const isDisabled = await this.page.$eval(claimSeletor, button => button.disabled);
    console.log('[Perform Claim] Button is disabled:', isDisabled); // true 或 false
    if(!isDisabled){
      // 点击领取按钮
      await this.page.click(claimSeletor);
      console.log('[Perform Claim] 已经点击领取按钮');
    } else {
      console.log('[Perform Claim] 领取按钮已经禁用，跳过领取操作');
    }

    await delay(1000 + Math.ceil(Math.random() * 1000)); // 随机休眠
    // 取消弹窗显示
    await this.page.waitForSelector(`button.active\\:bg-white`,{ visible: true });
    await this.page.click(`button.active\\:bg-white`);

    await delay(1000 + Math.ceil(Math.random() * 1000)); // 随机休眠

  }

  /**
   * 随机创建一张图片（交互）
   */
  async performCreate(): Promise<void> {
    if (!this.page || !this.browser) throw new Error('Page not initialized');

    await delay(3000 + Math.ceil(Math.random() * 1000)); // 随机休眠
    console.log('[Perform Create] 进入Create创建图像流程');
    // 使用 .//text() 查找所有后代文本
    var createSelector = '::-p-xpath(//button[.//text()[contains(., "Create")]])';
    await this.page.waitForSelector(createSelector,{ visible: true });
    await this.page.click(createSelector);
    await delay(1000 + Math.ceil(Math.random() * 1000)); // 随机休眠


    // 随机创建图像
    var generateSelector = '::-p-xpath(//button[.//text()[contains(., "Generate")]])';
    await this.page.waitForSelector(generateSelector,{ visible: true });
    await this.page.click(generateSelector);

    // 等待的时间需要稍微长一些
    await delay(25000 + Math.ceil(Math.random() * 1000)); // 随机休眠

  }

  // 关闭浏览器
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      console.log('浏览器已关闭');
    }
  }


  /**
   * 执行任务流程
   * @param privateKey 钱包私钥
   * @param proxyStr 代理
   * @param qs 问题列表
   * @param inviteCode 邀请码
   * @returns 
   */
  async run(privateKey:string,proxyStr:string): Promise<string> {
    try {

        // 测试
        // privateKey = process.env.WALLET_ETH_PRIVATEKEY ||  '';
        // proxyStr = '';

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

         // 对目标网站进行交互
         var targetUrl = `https://app.mahojin.ai/images?sortBy=featured&creationFilter=all`;
         // 代理信息
         console.log(`代理信息：${proxyStr}`);
         var proxyInfo: ProxyConfig | null = null; ;
         if(proxyStr && proxyStr != ''){
            proxyInfo = parseProxyUrl(proxyStr) as ProxyConfig;
         }
         console.log(`格式化得代理信息：${proxyInfo}`);
        
        // 判断是否需要导入钱包操作
        if(action) {
            // 创建一个随机目录，用于存放钱包缓存
            const randomDirName = uuidv4(); // 生成一个 UUID 作为目录名
            // 基础目录，如果没有，则递归创建
            await createDirectory(this.wallet.userDataDir!);
            // 删除缓存目录
            await deleteDirectoryContents(this.wallet.userDataDir!); 
            
            await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠
            // 进入目标页面：先完成钱包账户关联（一次性操作）
            await this.initialize(randomDirName,proxyInfo); // 初始化浏览器和插件

            // 执行导入钱包得操作，不需要二次输入密码交互
            // 首次进入执行钱包导入
            await this.importWallet(privateKey); // 导入钱包（针对已经导入的钱包直接执行操作）
            // 导入成功，需要将导入状态存储到内存
            globalState.WALLET_IMPORT_STATE_KEY = randomDirName;// 将导入状态存储到内存
        } else {
            // 进入目标页面：先完成钱包账户关联（一次性操作）
            await this.initialize(WALLET_IMPORT_STATE_KEY,proxyInfo); // 初始化浏览器和插件
            /**
             * 连接Wallet（1），解锁钱包，支持多种钱包类型
             * 多种钱包插件交互在wallet.plgins.ts中实现，后期可扩展到更多钱包类型（维护性更好）
             */
            await this.loginWallet();  // 针对已经导入得钱包，重新打开浏览器需要密码登录
            
        }

        
        await this.page?.bringToFront();  // 聚焦到当前页面
        // 打开目标网站并关闭多余得页面
        await this.gotoWebsite(targetUrl);
        await delay(2000); // 随机休眠

        // 连接网站
        this.walletStep = 1;
        await this.connectWebsite();
        await delay(1000 + Math.ceil(Math.random() * 1000)); // 随机休眠

        console.log(`切换到主页`);
        // await this.page?.bringToFront();

        // 切换网络
        this.walletStep = 2;
        await this.selectNetwork();
        await delay(1000 + Math.ceil(Math.random() * 1000)); // 随机休眠
        
        this.walletStep = 3;
        // 设置用户名（一次性设置）
        var MAHOJIN_SET_USERNAME_ENABLE = true;  // 默认需要设置用户名
        if(process.env.MAHOJIN_SET_USERNAME_ENABLE){
          MAHOJIN_SET_USERNAME_ENABLE =  strToBool(process.env.MAHOJIN_SET_USERNAME_ENABLE); 
        }
        if(MAHOJIN_SET_USERNAME_ENABLE) {
            // 设置用户名（这个只需要一次性设置）
            await this.setUsername(); // 设置用户名
            await delay(1000 + Math.ceil(Math.random() * 1000)); // 随机休眠
        }

        // 领取积分操作
        await this.performClaim();  // 打开铭文铸造页面
        await delay(1000 + Math.ceil(Math.random() * 1000)); // 随机休眠

        // 创建图像操作
        await this.performCreate(); // 随机创建一张图片（交互）
        await delay(1000 + Math.ceil(Math.random() * 1000)); // 随机休眠

        console.log(`任务完成，可以关闭浏览器了。`);
        return "ok";
        // 程序执行到这里，需要关闭浏览器，不然无法继续mint
    } catch (error) {
      console.error('发生错误:', error);
      return "fail";
    } finally {
      console.log(`finally:正在执行关闭浏览器`);
      await this.close();
    }
  }
}



