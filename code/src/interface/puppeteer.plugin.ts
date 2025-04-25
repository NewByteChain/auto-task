import { Browser, Target, Page } from 'puppeteer';

// 定义插件页面检查器
export class PluginPageFinder {
  private browser: Browser;
  private pendingResolvers: ((page: Page) => void)[] = []; // 存储等待的 Promise resolver
  private isListenerBound: boolean = false;

  constructor(browser: Browser) {
    this.browser = browser;
    this.bindTargetCreated(); // 初始化时绑定一次
  }

  // 绑定 targetcreated 监听器（仅一次）
  private bindTargetCreated() {
    if (!this.isListenerBound) {
      this.browser.on('targetcreated', async (target: Target) => {
        const targetUrl = target.url();
        // 检查是否为 OKX Wallet 插件页面
        if (targetUrl.startsWith('chrome-extension://mcohilncbfahbmgdjkbpemcciiolgcge/notification.html')) {
          const page = await target.page();
          if (page) {
            console.log(`[002] targetcreated 找到插件页面: ${targetUrl}`);
            // 解析所有等待的 Promise
            while (this.pendingResolvers.length > 0) {
              const resolve = this.pendingResolvers.shift();
              resolve?.(page);
            }
          }
        }
      });
      this.isListenerBound = true;
      console.log('Target created listener bound.');
    }
  }

  // 获取插件页面的公共方法
  public async getPluginPage(): Promise<Page> {
    return new Promise<Page>((resolve) => {
      this.pendingResolvers.push(resolve);
      // 可选：设置超时
      setTimeout(() => {
        if (this.pendingResolvers.includes(resolve)) {
          this.pendingResolvers = this.pendingResolvers.filter(r => r !== resolve);
          console.log('Timeout waiting for plugin page');
          resolve(null as any); // 或抛出错误
        }
      }, 10000); // 10秒超时
    });
  }

  // 清理（可选）
  public cleanup() {
    if (this.isListenerBound) {
      this.browser.off('targetcreated', this.bindTargetCreated as any); // 注意：这里需要类型断言
      this.isListenerBound = false;
      this.pendingResolvers = [];
      console.log('Target created listener unbound.');
    }
  }
}