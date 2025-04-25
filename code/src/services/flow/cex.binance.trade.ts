import puppeteer, { Browser, Page, Target } from 'puppeteer';
// import { getCurrentOsName } from '../../common/utils';
import * as crypto from 'crypto';  // 系统模块
// import { v4 as uuidv4 } from 'uuid'; // 导入 uuid 库
// import * as path from 'path';
// import {WalletConfig,walletConfigs} from "../../interface/walletConfigs"; // 接口定义
// import { deleteDirectoryContents } from '../../common/fileUtils';

import * as dotenv from 'dotenv';
dotenv.config();

// 定义接口类型
interface AjaxResponse {
  data: any; // 根据实际数据结构可以定义更具体的类型
}

interface ResultMap {
  [key: string]: any; // 根据实际数据结构可以定义更具体的类型
}



export class BinanceAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;
  // private wallet: WalletConfig;

  constructor() {
      // this.wallet = walletConfigs['binance'];
  }

  /**
   * 初始化浏览器和插件
   */
  async initialize(): Promise<void> {
    // 创建一个随机目录，用于存放钱包缓存
    // const randomDirName = uuidv4(); // 生成一个 UUID 作为目录名
    // const randomDirPath = path.join(this.wallet.userDataDir!, randomDirName);
    // await deleteDirectoryContents(this.wallet.userDataDir!); // 删除缓存目录

    this.browser = await puppeteer.launch({
      headless: true, // 设置为 false 以便调试，生产环境可改为 true
      args: [
        // `--user-data-dir=${randomDirPath}`, // 指定用户数据目录
        // `--disable-extensions-except=${this.wallet.extensionPath}`,
        // `--load-extension=${this.wallet.extensionPath}`,
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
    console.log(`已导航到目标站点：${url}`);
  }


  // 监听数据
  async getApiData(ajaxUrls:string[]): Promise<ResultMap> {
    // 改写后的 Promise
    if (!this.page || !this.browser) throw new Error('Browser or Page not initialized');
    console.log(`进入数据监听接口`);
    const promise = new Promise<ResultMap>((resolve, reject) => {
      // 定义数组和结果对象
      const list: string[] = [];
      const result: ResultMap = {};
            
      // 监听 AJAX 请求
      this.page!.on('response', async (response: any) => { // 如果有具体类型定义可以替换 any
        const request = response.request();
        // console.log(`进入response响应结果监听,${request.resourceType()}`);

        if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
          const url: string = request.url();
          //  console.log(`当前数据api url：${request.url()}`);
          // 查找匹配的 AJAX URL
          const containsPartial: string | undefined = ajaxUrls.find(
            (item: string) => url.indexOf(item) !== -1
          );
          
          // 检查是否匹配且不是 OPTIONS 请求
          if (typeof containsPartial !== 'undefined' && response.request().method().toUpperCase() !== "OPTIONS") {
            try {
              console.log(`捕获目标API：${url}`);
              // 获取响应数据
              const data: AjaxResponse = await response.json();
              
              // 添加到结果集
              list.push(url);
              const hashKey: string = crypto
                .createHash('md5')
                .update(containsPartial)
                .digest('hex');
              result[hashKey] = data; // 直接返回数据
              
              // 检查是否所有 AJAX 请求都已完成
              if (ajaxUrls.length === list.length) {
                console.log('抓取AJAX数据，成功！');
                resolve(result);
              }
            } catch (error) {
              reject(error);
            }
          }
        }
      });
    });

    return await promise;
  }


  // 关闭浏览器
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      console.log('浏览器已关闭');
    }
  }

  // 主流程
  async getBinanceTradeData(targetUrl:string,ajaxUrl:string[]): Promise<any> {
    try {
      // 抓取目标地址
      await this.initialize(); // 初始化浏览器和插件
      await this.gotoWebsite(targetUrl); // 导航到目标网站
      this.page!.reload();  // 刷新下，重新加载页面，或者 goto(url) 不用await
      const data = await this.getApiData(ajaxUrl);
      // console.log(`监听数据接口:${JSON.stringify(data)}`);
      this.browser?.close();  // 关闭浏览器
      return data;
      
    } catch (error) {
      console.error('发生错误:', error);
    } finally {
      // await this.close();
    }
  }
}

