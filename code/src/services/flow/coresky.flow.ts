import * as path from 'path';
import { v4 as uuidv4 } from 'uuid'; // 导入 uuid 库
import puppeteer, { Browser, Page, Target ,ElementHandle } from 'puppeteer';
import * as proxyChain from 'proxy-chain';
import {WalletConfig,walletConfigs} from "../../interface/walletConfigs"; // 接口定义
import { ProxyConfig } from "../../interface/proxyConfigs"; // 
import { connectWalletOkx,importWalletOkx,connectWalletOkxConfirm2 } from "../wallet.plugins/okx.wallet.plugins"; // 钱包插件
import { deleteDirectoryContents,createDirectory, checkAllFolders,checkDirExists,appendResultToFile} from '../../common/fileUtils';
import { delay, parseProxyUrl,strToBool,getRandomInteger} from '../../common/utils';
import { timeout } from '../../common/decoratorsUtils';
import { globalState,globalReferralCode } from "../../globalState";
import * as dotenv from 'dotenv';
dotenv.config();

// 浏览器配置
const CHROME_BROWSER_HEADLESS = strToBool(process.env.CHROME_BROWSER_HEADLESS || "false"); // 默认有头模式

// mint钱包密码
const OKX_WALLET_PASSWORD = process.env.OKX_WALLET_PASSWORD!;

/**
 * Coresky 钱包自动化
 */
export class CoreskyAutomation {
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
                      console.log(`[chrome-extension] this.walletStep:${this.walletStep}`)
                      if(this.walletStep == 1){
                        await delay(Math.ceil(Math.random() * 1000) + 1000); // 不能小于2.8s
                        await connectWalletOkxConfirm2(p);
                        console.log(`[chrome-extension] 钱包交互链接网站操作成功`);
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
      args.push(`--proxy-server=${localProxy}`);
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
    await delay(Math.ceil(Math.random() * 1000) + 500); // 随机休眠，2.5s-3s

    // 验证代理 IP
    const ip = await this.page.evaluate(() => {
        return fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => data.ip);
    });
    console.log('当前 IP:', ip);
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
          await this.page.waitForSelector(`::-p-xpath(//div[contains(text(), "Connect Wallet")])`,{ visible: true });
          await this.page.click(`::-p-xpath(//div[contains(text(), "Connect Wallet")])`);
          await delay(Math.ceil(Math.random() * 2000) + 1000); // 随机休眠
          console.log('点击连接钱包按钮');

          // 弹出层提示交互
          const okxHandle = await this.page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('.item'));
            return buttons.find(button => button.textContent!.includes('OKX'));
          });

          const okxButton = okxHandle.asElement() as ElementHandle<HTMLDivElement> | null;
          if (okxButton) {
            await okxButton.click();
            console.log('成功点击 OKX Wallet 按钮');
          } else {
            console.log('未找到 OKX Wallet 按钮');
          }
          await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠
          console.log('准备操作连接钱包');

          // // 会导致浏览器关闭不可见了
          // const walletPage = await this.browser.newPage();
          // // 再新得页面进行钱包连接操作
          // await connectWalletOkxConfirm2(walletPage);

          // // 等待钱包弹窗
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
          // await connectWalletOkxConfirm2(walletPage);

          // 第一次：连接操作
          await delay(Math.ceil(Math.random() * 20000) + 1000); // 不能小于2.8s
          this.walletStep = 2;  

          // 切换到主页
          await this.page.bringToFront();
          // 等待足够的时间，确认连接的网络请求
          await delay(Math.ceil(Math.random() * 2800) + 400); // 不能小于2.8s
          // // 关闭多余的页面
          // await this.closeExtraPage();          
          
          console.log('[Connect Success] The operation was successfully submitted');
          
        } catch(ex:unknown){
          console.trace((ex as Error));
        }

  }

  /**
   * 抽取邀请码
   * @param url 
   * @returns 
   */
  private extractRouteValue1(url: string): string | null {
    const regex = /https:\/\/share\.coresky\.com\/([^/]+)\/tasks-rewards/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
  
  /**
   * 任务1：每日签到
   * @param url 交互地址
   * @param questions 需要交互得问题清单
   */
  @timeout(30000)
  async performDailyCheckin(url:string): Promise<void> {
      if (!this.page || !this.browser) throw new Error('Page not initialized');

      // // 判断页面是否已经重定向
      // if(!this.page.url().includes(url)) {
      //     // 重定向到新的网页
      //     await this.page.goto(url, { waitUntil: 'networkidle2'});
      // }
      
      await delay(Math.ceil(Math.random() * 5000) + 1000); // 随机休眠，2.6s-3.2s
      // 检测是否弹出了提示框
      console.log('[Daily Check-in] Start performDailyCheckin...');
      // 点击复制邀请连接
      const link = await this.page.$eval('.url p', element => element.textContent);
      console.log('Invitation URL:', link);
      if(link){
          // 获取邀请码，并进行验证是否在邀请码列表，如果不在列表，则需要加入列表中
          const referral_code = this.extractRouteValue1(link!);        
          console.log(`[Daily Check-in] 获取当前用户的分享邀请码${referral_code}`);
          if(referral_code) {
              // 需要先检测全局变量，邀请码列表中是否存在本轮邀请码（去重写入）
              const code = globalReferralCode.CORESKY_REFERRAL_CODE.find(c => c === referral_code);
              console.log(`[Daily Check-in] 检索全局变量中是否存在本次任务得邀请码:${code}`);
              if(!code){
                // 如果没找到，该账号是第一次出现，记录到全局变量中，并写入文件中
                globalReferralCode.CORESKY_REFERRAL_CODE.push(referral_code);
                // 追加写入文件
                await appendResultToFile(path.join(__dirname,'../../','data', 'task', `coresky_code.txt`), referral_code);
                console.log(`[Daily Check-in] 检测到该邀请码首次出现，加入邀请码文件中:${referral_code}`);
              }
          }
      } else {
        console.log(`[Daily Check-in] 获取分享链接失败，链接钱包未能成功，本次任务终止。`);
        await this.close();
        return;
      }
      
      await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠
      
      // 操作每日签到，使用 .//text() 查找所有后代文本
      var dailySelector = '::-p-xpath(//button[.//text()[contains(., "Check-in")]])';
      await this.page.waitForSelector(dailySelector,{ visible: true });
      await this.page.click(dailySelector);
      await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠

      console.log(`[Daily Check-in] Swap transaction request submission completed`);
      return;    
  }

  /**
   * 任务2：投票
   * @param url 
   * @returns 
   */
  @timeout(40000)
  async performMemeVote(url:string): Promise<void> {
      if (!this.page || !this.browser) throw new Error('Page not initialized');
      console.log('[Daily Vote] Start performMemeVote...');
      // 重定向到新的网页
      await this.page.goto(url, { waitUntil: 'networkidle2'});
      
      await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠，2.6s-3.2s

      // 等待网格项加载
      await this.page.waitForSelector('.item-inner', { timeout: 10000 });
      // 获取所有包含 .item-inner 的元素
      const items = await this.page.$$('.item-inner');
      console.log(`[Daily Vote] 在页面当中，找到：${items.length} 个投票项目`);

      // 前5项投票，随机抽取
      const index = getRandomInteger(0,(items.length>=4)?4:items.length);  // 随机抽取前面5个项目进行投票
      console.log(`[Daily Vote] 随机抽取第 ${index+1} 名得项目进行投票`);
      const item = items[index]; // 抽取目标
      
      // 在当前 item-inner 中查找 class="left" 的 div
      const leftButton = await item.$('.left');
      
      if (leftButton) {
        console.log(`[Daily Vote] 找到了 "left" 按钮，准备点击`);
        await leftButton.click();
        
        // 添加短暂延迟，避免操作过快导致问题
        await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠，2.6s-3.2s

        // 找到输入投票分数得输入框
        const inputSelector = `input[class="el-input__inner"][aria-label="Points"]`;
        await this.page.waitForSelector(inputSelector);
        await this.page.focus(inputSelector); // 聚焦输入框
        // 清除输入框中的值
        await this.page.click(inputSelector, { clickCount: 3 }); // 三次点击以选中所有文本
        await this.page.keyboard.press('Backspace'); // 删除选中的文本
        // 填充页面参数，稍微停顿下
        await delay(Math.ceil(Math.random() * 100) + 200); // 随机休眠
        // 投票分数，随机1-3分
        const vote = getRandomInteger(1,3); // 随机生成1-3分
        await this.page.type(inputSelector, vote.toString()); // 接收者
        // 投票操作
        await this.page.waitForSelector('button.el-button--primary');
        await this.page.click('button.el-button--primary');

        // 投票之后在页面进行停顿
        await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠
        console.log(`[Daily Vote] Voting Success`);
        
      } else {
        console.error(`[Daily Vote] Voting Failed, No voting button found`);
        await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠
      }

      return;    
  }

  /**
   * 等待input输入可以输入
   * @param page 
   * @param selector 
   * @param timeout 
   */
  async waitForInputEnabled(page: Page, selector: string, timeout: number = 30000): Promise<void> {
    try{
      await page.waitForFunction(
          (sel: string) => {
              const input = document.querySelector(sel) as HTMLInputElement;
              return input && !input.disabled;
          },
          { timeout },
          selector
      );
    } catch(ex:unknown){
      console.log(`waitForInputEnabled() 出现异常`);
      // console.trace(ex);
    }
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
  async run(privateKey:string,proxyStr:string ,inviteCode:string): Promise<string> {
    try {
        console.log(`即将执行任务，邀请码:${inviteCode}`);
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
         var targetUrl = `https://share.coresky.com/${inviteCode}/tasks-rewards`;
         // 代理信息
         console.log(`代理信息：${proxyStr}`);
         var proxyInfo: ProxyConfig | null = null; ;
         if(proxyStr != ''){
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
            await this.loginWallet();   // 针对已经导入得钱包，重新打开浏览器需要密码登录
            
        }

        
        await this.page?.bringToFront();  // 聚焦到当前页面
        // 打开目标网站并关闭多余得页面
        await this.gotoWebsite(targetUrl);
        await delay(1000); // 随机休眠

        
        this.walletStep = 1;        // 设置步骤
        // 临时变量，使用本地缓存
        var _url:string = "";
        var url = await this.page?.url() ?? "";  
      
        // 这里需要网站是否已经完成连接钱包（但是未登录网站）
        try{
          
          var disconnectSelector = '::-p-xpath(//div[contains(text(), "Connect Wallet")])';
          const elementHandle: ElementHandle | null = await this.page!.$(disconnectSelector);
          if (elementHandle) {
              // 不可见，表示还没连接过钱包，执行连接钱包
              console.log(`[Wallet Connetc] Connect Wallet 可见，网站还没连接过钱包，执行钱包连接`);
              // 钱包已经导入，从网页连接钱包
              await this.connectWallet();  //
          }
        } catch(ex:unknown){
          // 不可见，表示还没连接过钱包，执行连接钱包
          console.log(`[Wallet Connetc] Disconnect 识别异常，有可能已经跳转到到交互页面`);
          // 钱包已经导入，从网页连接钱包
        }
        
        console.log(`执行登录成功，进入目标交互页面`);
    
        await delay(Math.ceil(Math.random() * 3000) + 1000); // 随机休眠
        // 任务1：进行每日签到
        await this.performDailyCheckin(url);  // 打开铭文铸造页面

        // 奖励积分到账需要一定时间
        await delay(Math.ceil(Math.random() * 3000) + 1000); // 随机休眠
        const url2 = `https://www.coresky.com/meme`;  // 投票链接
        // 任务2：进行投票
        await this.performMemeVote(url2);

        // 等一分钟，暂停等待演示效果
        await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠

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



