

// // Terms of Service 检查是否需要初始化（初次使用）
  // const checkbox_terms = 'input[type="checkbox"]'  // 我同意使用条款
  // await this.page.waitForSelector(checkbox_terms, { visible: true })  // 等待复选框可见
  // await this.page.click(checkbox_terms)  // 使用 ID 选择器选中复选框
  // delay(1200);
  // // Agree to Terms 按钮操作
  // const button = await this.page.waitForSelector(`::-p-xpath(//span[contains(text(), 'Agree to Terms')])`, { visible: true,timeout: 10000})
  // await button!.click();
  // console.log("已点击文本为 'Agree to Terms' 的按钮");
  // // 刷新下页面试试
  // await this.page.reload();

  // delay(600);

  // await this.page.waitForSelector('button[data-variant="gradient"]', { visible: true, timeout: 10000 });
  // const elements = await this.page.$$('button[data-variant="gradient"]');
  // // console.log(`找到 ${elements.length} 个匹配元素,${elements.toString()}`);
  // // 选择第 n 个元素（例如第 2 个，索引从 0 开始）
  // var targetIndex = 1; // 替换为需要的索引
  // if (elements.length <= targetIndex) {
  //     targetIndex = 0;
  // }
  // await elements[targetIndex].click();
  // console.log(`已点击第 ${targetIndex + 1} 个元素`);

  // // 需要等待模态框出现
  // await this.page.waitForSelector('w3m-modal[class="open"]', {
  //   visible: true, // 确保弹窗可见
  //   timeout: 10000, // 等待15秒，因为 Web3 组件可能加载较慢
  // });




  
//   /**
//    * OCTO：连接钱包
//    * @param url 目标网址url
//    */
//   async connectWallet(): Promise<void> {
//     if (!this.page || !this.browser) throw new Error('Browser or Page not initialized');
//     console.log('准备连接钱包');
    
//     // 操作页面元素，点击Connect Wallet按钮
//     await this.page.waitForSelector('button.custom-button',{ visible: true });
//     await this.page.click('button.custom-button');
//     await delay(Math.ceil(Math.random() * 1000) + 1000); // 随机休眠
//     console.log('开始关闭弹出层');

//     // 弹出层提示交互
//     const okBtn = 'a.nav-link.btn-2';
//     const btns = await this.page.$$(okBtn);
//     if (btns.length > 0) {
//       // 如果存在默认则先清空输入框，这个没有，直接赋值
//       await btns[0].click();
//       console.log(`查询到弹出层元素个数：${btns.length}`);
//     }
    
//     await delay(Math.ceil(Math.random() * 3000) + 1000); // 随机休眠
//     console.log('准备操作ShadowRoot');
    
//     // 操作页面弹出层[shadow-root]元素
//     // 找到包含 Shadow DOM 的宿主元素
//     await this.page.waitForSelector('w3m-modal', { visible: true });  // 元素可见之后
//     const selectorPath: string[] = [
//         'w3m-modal',
//         'wui-flex',
//         'wui-card[role="alertdialog"]',
//         'w3m-router',
//         'w3m-connect-view',
//         'wui-flex',
//         'wui-list-wallet[name="OKX Wallet"]',
//         'button'
//     ];

//     const targetElement: ElementHandle | null = await getElementFromShadowRoot(this.page, selectorPath);
//     console.log(`targetElement元素：${targetElement}`)

//     // 等待钱包弹窗
//     const walletPage = await new Promise<Page>((resolve, reject) => {
//         this.browser!.on('targetcreated', async (target: Target) => {
//             const targetUrl = target.url();
//             // 检查是否为 OKX Wallet 插件页面
//             if (targetUrl.startsWith('chrome-extension://')) {
//                 let p = await target.page();
//                 if (p) {
//                     resolve(p);
//                 }
//                 console.log('找到 OKX Wallet 页面，URL:', targetUrl);
//             }
//         });
//     });

//     await walletPage.close();

// }


