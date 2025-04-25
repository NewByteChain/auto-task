import * as path from 'path';
import puppeteer,{ Browser, Page, Target } from 'puppeteer';
import * as proxyChain from 'proxy-chain';
import {WalletConfig,walletConfigs} from "../../interface/walletConfigs"; // 接口定义
import { ProxyConfig } from "../../interface/proxyConfigs"; // 
import { importWalletXverse, connectWalletXverseWithPassword, connectWalletXverse, connectWalletXverseSign} from "../wallet.plugins/xverse.wallet.plugins"; // 钱包插件
import { deleteDirectoryContents, createDirectory, checkDirExists} from '../../common/fileUtils';
import { delay, parseProxyUrl, strToBool} from '../../common/utils';
import { timeout } from '../../common/decoratorsUtils';
import { globalState,globalReferralCode } from "../../globalState";
import * as dotenv from 'dotenv';
dotenv.config();
import * as apiAdspowerService from '../api/api.adspower';

// adsPower API Host 和 Port
const ADSPOWER_API_HOST = process.env.ADSPOWER_API_HOST || '127.0.0.1'; // AdsPower API Host
const ADSPOWER_API_PORT = process.env.ADSPOWER_API_PORT || '50325'; // AdsPower API Port

// mint钱包密码
const XVERSE_PASSWORD = process.env.XVERSE_PASSWORD!;

/**
 * Incentiv 钱包自动化
 */
export class IncentivAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private wallet: WalletConfig;
  private walletStep:number | null = null;

  constructor() {
    // 固定钱包模式
    this.wallet = walletConfigs['xverse'];
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
            console.log(`[chrome-extension] targetcreated URL: ${targetUrl}`);
            // 检查是否为 OKX Wallet 插件页面
            if (targetUrl.startsWith(`chrome-extension://${this.wallet.extensionId}`)) {
                let p = await target.page();                
                if (p) {
                    // 检查某些元素是否存在
                    console.log(`[chrome-extension]targetcreated 找到插件页面`);
                    resolve(p);

                    try{
                      console.log(`[chrome-extension] this.walletSetp:${this.walletStep}`);
                      if(this.walletStep == 2){
                          // 切换步骤
                          this.walletStep = 3;
                          // 连接钱包
                          await delay(1000 + Math.ceil(Math.random() * 1000)); // 随机休眠
                          await connectWalletXverse(p);
                          console.log(`[chrome-extension] 钱包交互链接网站操作成功`);
                      } else if(this.walletStep == 3){
                          // 签名操作
                          await delay(1000 + Math.ceil(Math.random() * 1000)); // 随机休眠
                          await connectWalletXverseSign(p);
                          console.log(`[chrome-extension] 页面进行签名操作成功`);
                      }
                    } catch(ex){
                      console.log(`[chrome-extension] 操作出现异常，忽略处理`);
                    }
                }
                // console.log('[chrome-extension] 找到 OKX Wallet 页面，URL:', targetUrl);
            }
        });
      });
  }


  /**
   * 初始化浏览器和插件
   * @param wsEndpoint 启动浏览器的 WebSocket 端点
   */
  async initialize(wsEndpoint:string): Promise<void> {
    console.log(`[Initialize] wsEndpoint: ${wsEndpoint}`);

    // 启动浏览器
    this.browser = await puppeteer.connect({
        browserWSEndpoint: wsEndpoint,
        defaultViewport: { width: 1280, height: 720 },
    });
    console.log('[Initialize] Connected to browser');

    // 获取现有页面
    const pages = await this.browser.pages();
    this.page = pages[0] || (await this.browser.newPage());

    // 设置默认导航超时时间为 60 秒
    await this.page.setDefaultNavigationTimeout(60000);

    // 设置用户代理为英语（美国）
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36');
    // 设置请求头中的 Accept-Language 为英语（美国）
    await this.page.setExtraHTTPHeaders({ 
        'Accept-Language': 'en-US,en;q=0.9', // 优先英语（美国），其次其他英语
    });
    console.log('[Initialize] Connected to browser complete');
  }

  /**
   * 导航到目标网站
   */
  async gotoWebsite(url:string): Promise<void> {
    if (!this.page || !this.browser) throw new Error('Browser or Page not initialized');

    // 切换到页面
    const pages = await this.browser.pages();
    console.log(`[Goto Website] 当前页面个数：${pages.length}`)

    this.page = pages[0];
    await this.page.bringToFront();  // 聚焦到当前页面

    // 然后导航到目标 URL
    await this.page.goto(url, { waitUntil: 'networkidle2'});

    // // 关闭多余的页面
    // await this.closeExtraPage();
    console.log('[Goto Website] 已导航到目标网页并关闭多余网页');
    // 延迟
    await delay(1000 + Math.ceil(Math.random() * 1000)); // 随机休眠

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
   * @param mnemonic 助记词
   */
  async importWallet(mnemonic:string): Promise<void> {
    if (!this.page || !this.browser) throw new Error('Browser or Page not initialized');
      console.log('[Import Wallet] 进入导入钱包流程，importWallet');
      
      // 聚焦页面
      await this.page.bringToFront();
      await delay(1000 + Math.ceil(Math.random() * 1000)); // 随机休眠

      // 关闭多余的页面
      await this.closeExtraPage();

      await delay(1000 + Math.ceil(Math.random() * 1000)); // 随机休眠

      // 创建一个页面
      const walletPage = await this.browser.newPage();   // (await browser.pages())[0]; // 获取初始页面
      // 导入钱包私钥
      await importWalletXverse(walletPage, mnemonic, XVERSE_PASSWORD);
      console.log('[Import Wallet] Wallet connection completed!');
      
      // 延长等待时间确保xverse插件登录密码输入
      await delay(2000 + Math.ceil(Math.random() * 1000)); // 随机休眠
      // 重定向
      await walletPage.goto(`chrome-extension://${this.wallet.extensionId}/popup.html`);
      // try{
      //     console.log('[Import Wallet] 密码登录钱包完成一次验证');
      //     // 需要登录
      //     await connectWalletXverseWithPassword(walletPage, XVERSE_PASSWORD);
      // } catch(ex:unknown){
      //     console.log(`[Import Wallet] 钱包插件登录出现异常，忽略密码登录`)
      // }
      
      
      await delay(3000 + Math.ceil(Math.random() * 1000)); // 随机休眠，0.3-0.6s
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
    console.log('[Login Wallet] 准备登录钱包');

    // await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠

    console.log(`[Connect Website] 开始注册Wallet钱包插件页面，this.walletStep：${this.walletStep}`);
    
    /**
     * 连接Wallet（1），解锁钱包，支持多种钱包类型
     * 多种钱包插件交互在wallet.plgins.ts中实现，后期可扩展到更多钱包类型（维护性更好）
     */
    const walletPage = await this.browser.newPage();
    await connectWalletXverseWithPassword(walletPage,XVERSE_PASSWORD);     
    // 输入密码之后，会弹出确认连接网站操作

    await delay(7000 + Math.ceil(Math.random() * 1000)); // 随机休眠
    // 切换页面之后再关闭
    await this.page.bringToFront();
    // // 关闭多余的页面
    // await this.closeExtraPage();
    
    console.log('[Login Wallet] Restart: Wallet connection completed!');

  }
  
  /**
   * 通过钱包连接网站
   * @param url 交互地址
   * @param questions 需要交互得问题清单
   */
  @timeout(50000)
  async connectWebsite(): Promise<void> {
    if (!this.page || !this.browser) throw new Error('Page not initialized');
    
    await delay(4000 + Math.ceil(Math.random() * 1000)); // 随机休眠
    await this.page.bringToFront();
    // 检测是否弹出了提示框
    console.log('[Connect Website] Start connectWebsite...');

    // // 连接钱包进行系统登录
    // const buttons = await this.page.$$(`button[class*="bg-transparent"]`);
    // console.log(`[Connect Website] 找到 ${buttons.length} 个符合条件的Button`);

    // // 单击连接钱包按钮
    // await buttons[0].click();
    // console.log('[Connect Website] 已经点击连接钱包');

    // await delay(2000 + Math.ceil(Math.random() * 1000));

    // 选择钱包，使用 .//text() 查找所有后代文本
    var web3Selector = '::-p-xpath(//button[.//text()[contains(., "Web3 is my thing")]])';
    // 连接Web3钱包创建账户
    await this.page.waitForSelector(web3Selector,{ visible: true}); // 替换为实际选择器
    await this.page.click(web3Selector);
    await delay(2000 + Math.ceil(Math.random() * 1000));

    // 使用现有钱包，使用 .//text() 查找所有后代文本
    var walletSelector = '::-p-xpath(//button[.//text()[contains(., "I\'ll use my existing wallet")]])';
    // 连接已有钱包
    await this.page.waitForSelector(walletSelector,{ visible: true}); // 替换为实际选择器
    await this.page.click(walletSelector);
    await delay(2000 + Math.ceil(Math.random() * 1000));

    // Decide for me, 根据button的显示文本查找按钮
    var decideSelector = '::-p-xpath(//button[contains(text(), "Decide for me")])';
    // Decide for me
    await this.page.waitForSelector(decideSelector,{ visible: true}); // 替换为实际选择器
    await this.page.click(decideSelector);
    await delay(6000 + Math.ceil(Math.random() * 1000));

    // 难点:机器人验证
    await delay(20000 + Math.ceil(Math.random() * 1000));

    // Continue
    var continueSelector = '::-p-xpath(//button[.//text()[contains(., "Continue")]])';
    // 连接已有钱包
    await this.page.waitForSelector(continueSelector,{ visible: true}); // 替换为实际选择器
    await this.page.click(continueSelector);
    await delay(2000 + Math.ceil(Math.random() * 1000));


    // MetaMask
    var metaMaskSelector = '::-p-xpath(//button[.//text()[contains(., "MetaMask")]])';
    // 连接已有钱包
    await this.page.waitForSelector(metaMaskSelector,{ visible: true}); // 替换为实际选择器
    await this.page.click(metaMaskSelector);
    await delay(2000 + Math.ceil(Math.random() * 1000));

    // MetaMask钱包交互,需要先完成一次登录密码
    // 首次连接,出现多次连接钱包与确认操作

    
    console.log(`[Connect Website] 开始进行插件页面捕获, this.walletStep = ${this.walletStep} `);
    
    // // 注册插件事件
    // await this.getWalletPage();
    
    await delay(12000 + Math.ceil(Math.random() * 1000));
    console.log(`[Connect Website] 连接钱包等待期结束。`);
    
  }
 
  // 查看积分
  @timeout(30000)
  async viewPoints(): Promise<void> {
    if (!this.page || !this.browser) throw new Error('Page not initialized');

    await delay(1000 + Math.ceil(Math.random() * 1000)); // 随机休眠
    
    try {
        // 提交按钮
        const btn = await this.page.$(`button[aria-controls="radix-\\:rh\\:"]`);
        if(btn){
          console.log('[View Points] 找到积分按钮');
          const firstChildText = await this.page.$eval('button[aria-controls="radix-\\:rh\\:"] span', element => element.textContent);
          console.log(`[View Points] 当前账户积分余额: ${firstChildText}`);
        } else {
          console.log(`[View Points] 未找到积分按钮`);
        }
    } catch (ex){
      console.log(`[View Points] 查看积分出现异常`);
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
   * @param adsInfo ads指纹浏览器任务参数
   * @param proxyStr 代理
   * @param qs 问题列表
   * @param inviteCode 邀请码
   * @returns 
   */
  async run(adsInfo:any,proxyStr:string): Promise<string> {
    try {
         // 对目标网站进行交互
         var targetUrl = `https://testnet.incentiv.net/`;
        //  // 代理信息
        //  console.log(`代理信息：${proxyStr}`);
        //  var proxyInfo: ProxyConfig | null = null; ;
        //  if(proxyStr && proxyStr != ''){
        //     proxyInfo = parseProxyUrl(proxyStr) as ProxyConfig;
        //  }
        //  console.log(`格式化得代理信息：${proxyInfo}`);
        
         try {
            // 请求指纹浏览器
            const startResponse  = await apiAdspowerService.browserStart({
                user_id:'jfg5xcc'
            });
            if(!startResponse || startResponse.code != 0){
                console.log(`请求浏览器失败，返回结果：${JSON.stringify(startResponse)}`);
                return "fail";
            }
            // 端点
            var wsEndpoint = startResponse.data.ws.puppeteer;
            console.log(`Browser started with WebSocket endpoint: ${wsEndpoint}`);
            // 替换为实际的 WebSocket 端点HOST
            wsEndpoint = wsEndpoint.replace('127.0.0.1',ADSPOWER_API_HOST);

            // 再重新初始化浏览器
            await this.initialize(wsEndpoint); // 初始化浏览器和插件
            console.log(`第二次浏览器初始化完成。`);
            await delay(2000 + Math.ceil(Math.random() * 2000)); // 随机休眠

        } catch(ex:unknown){
          console.log(`初始化浏览器出现异常`)
        }
        
        // 打开目标网站并关闭多余得页面
        await this.gotoWebsite(targetUrl);
        await delay(3000 + Math.ceil(Math.random() * 2000)); // 随机休眠

        // // 执行导入钱包得操作，不需要二次输入密码交互
        // // 首次进入执行钱包导入
        // await this.importWallet(mnemonic); // 导入钱包（针对已经导入的钱包直接执行操作）

        // 连接网站(一次性连接钱包)

        // 判断当前页面是否在指定的url页面
        const currentUrl = this.page?.url();
        console.log(`[Goto Website] 当前页面URL: ${currentUrl}`);
        if(!currentUrl || !currentUrl.startsWith(`https://testnet.incentiv.net/login`)) {
            this.walletStep = 2;
            await this.connectWebsite();
        }
        

        console.log(`切换到主页`);

        // 等待40s，等待连接钱包
        await delay(50 * 1000 + Math.ceil(Math.random() * 5000)); // 随机休眠

        console.log(`Start 开始获取页面的积分`);
        // // 查看积分
        // await this.viewPoints();

        await delay(10 * 1000 + Math.ceil(Math.random() * 5000)); // 随机休眠

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



