import puppeteer, { ElementHandle, Page,JSHandle } from 'puppeteer'; // 导入 Puppeteer 库，用于浏览器自动化
import { delay } from '../common/utils';

// 定义函数，获取 Shadow DOM 内目标元素的文本内容
export async function fetchTextFromShadowDOM(
    page:Page,               // Puppeteer 的 Page 类型
    shadowHostSelector: string,         // Shadow Host 的 CSS 选择器
    targetSelector: string              // Shadow DOM 内目标元素的 CSS 选择器
): Promise<ElementHandle<Element>> {                    // 返回 Promise<string>
    try {
        const targetHandle = await page.evaluateHandle(
            (shadowHostSel: string, targetSel: string) => {
                const shadowHost = document.querySelector(shadowHostSel);
                if (!shadowHost) throw new Error("Shadow host not found");
                const shadowRoot = shadowHost.shadowRoot;
                if (!shadowRoot) throw new Error("Shadow root not found");
                const targetElement = shadowRoot.querySelector(targetSel);
                if (!targetElement) throw new Error("Target element not found");
                return targetElement; // 返回 DOM 元素
            },
            shadowHostSelector,
            targetSelector
        );

        const elementHandle = targetHandle.asElement();
        if (!elementHandle) {
            throw new Error("Failed to convert to ElementHandle");
        }

        return elementHandle as ElementHandle<Element>;

    } catch (error) {
        // 类型断言 error 为 Error，确保 message 属性可用
        throw new Error(`Failed to fetch text from shadow DOM: ${(error as Error).message}`);

        
    }
}


 /**
  * 辅助函数：深入 Shadow DOM 获取目标元素（多层级hadow DOM嵌套元素获取）
  * @param context 
  * @param selectorPath 
  * @returns 
  */
 export async function getElementFromShadowRoot(
  context: Page | ElementHandle,
  selectorPath: string[]
): Promise<ElementHandle | null> {
  // 临时变量
  let currentElement: Page | ElementHandle = context;
  // 分层递进抽取选择器对象
  for (const selector of selectorPath) {

    if (currentElement instanceof Page) {
      // 第一层对象是Page对象
      const targetHandle = await currentElement.evaluateHandle((selector: string) => {
            const shadowHost = document.querySelector(selector);
            if (!shadowHost) throw new Error("Shadow host not found");
            
            // const shadowRoot = shadowHost.shadowRoot;
            // if (!shadowRoot) throw new Error("Shadow root not found");
            // const targetElement = shadowRoot.querySelector(selector);
            // if (!targetElement) throw new Error("Target element not found");
            return shadowHost; // 返回 shadowHost 元素
        },
        selector
      );
      currentElement = targetHandle;  // 外部缓存

    } else {
        // Page内部层
        // 使用 evaluateHandle 获取 Shadow Root
        const shadowRootHandle: JSHandle = await currentElement.evaluateHandle(
          (el) => el.shadowRoot
        );
        const shadowRoot = shadowRootHandle.asElement() as ElementHandle | null;
        if (!shadowRoot) throw new Error(`Shadow Root not found at ${selector}`);
        const element = await shadowRoot.$(selector);
        if (!element) throw new Error(`Element not found in Shadow Root: ${selector}`);
        currentElement = element;
    }
  }

  return currentElement as ElementHandle;
}


/**
 * 寻找特定文本元素
 * @param element 文档
 * @param tagName 标签
 * @param text 文本元素
 * @returns 
 */
export async function findChildElementByText(
    element: ElementHandle<Element>,
    tagName: string,
    text: string
): Promise<ElementHandle<Element> | null> {
    const children = await element.$$(tagName); // 获取所有匹配子元素
    for (const child of children) {
        const content = await child.evaluate(el => el.textContent?.trim());
        if (content?.includes(text)) {
            return child;
        }
    }
    return null;
}

/**
 * 页面元素点击重试机制
 * @param page 
 * @param selector 
 * @param maxRetries 
 * @returns 
 */
export async function clickWithRetry(page: Page, selector: string, maxRetries: number = 3) {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        await page.waitForSelector(selector, { visible: true, timeout: 5000 });
        await page.click(selector);
        return; // 成功则退出
      } catch (error) {
        if (error instanceof Error && error.message.includes('detached Frame')) {
          console.log(`Frame detached，第 ${attempts + 1} 次重试...`);
          attempts++;
          await delay(1000); // 等待页面稳定
        } else {
          throw error;
        }
      }
    }
    throw new Error(`在 ${maxRetries} 次尝试后仍无法点击 ${selector}`);
}


/**
 * 实现给表单input填充指定的值
 * @param page 页面
 * @param selector 选择器
 * @param value 填充的值
 */
export async function setInputValue(page: Page, selector: string, value: any): Promise<void> {
    // 使用 evaluate 直接设置输入框的 value 属性
    await page.evaluate((sel, val) => {
      const input = document.querySelector(sel) as HTMLInputElement;
      if (input) {
        // console.log(`填充新得值:${val}`);
        // 直接设置 value 属性，绕过输入事件
        // 全选并替换值
        // input.select(); // 全选输入框内容
        input.value = val;
        // 可选：触发 change 事件（如果页面需要）
        // input.dispatchEvent(new Event('change', { bubbles: true }));
        // input.dispatchEvent(new Event('blur', { bubbles: true }));
      } else {
        throw new Error(`未找到选择器为 ${sel} 的输入框`);
      }
    }, selector, value);
  
    // 验证设置是否成功
    const currentValue = await page.$eval(selector, (el) => (el as HTMLInputElement).value);
    console.log(`输入框当前值: ${currentValue}`);
}

/**
 * 读取剪贴板
 * @param page 
 * @returns 
 */
export async function pasteFromClipboard(page:Page) {
  // 在页面上下文中读取剪贴板
  const clipboardText = await page.evaluate(async () => {
    try {
      return await navigator.clipboard.readText();
    } catch (err) {
      console.error('页面内读取失败:', err);
      return null;
    }
  });
  return clipboardText;
}

