import * as os from 'os';  // 系统模块
import path from 'path';
const systemUserInfo = os.userInfo();  // 当前系统用户名称
// console.log(`当前用户名称: ${systemUserInfo.username}`);

// 获取当前文件所在目录
const currentDir = __dirname;
// console.log('当前文件目录:', currentDir);
const serviceDir = path.resolve(currentDir, '..'); // 上移一级，可根据实际情况调整
const userDataRootDir = path.resolve(currentDir, '../'); 
console.log('项目serviceDir目录:', serviceDir);

// 配置类型
export interface WalletConfig {
    extensionPath: string;
    extensionId: string; // 插件的 Chrome 扩展 ID
    name: string;
    userDataDir?: string; // 钱包插件的用户数据目录
  }

// 钱包配置（根据实际插件路径和 ID 调整）
/*
Windows: C:\Users\<你的用户名>\AppData\Local\Google\Chrome\User Data\Default\Extensions\<扩展程序 ID>
macOS: ~/Library/Application Support/Google/Chrome/Default/Extensions/<扩展程序 ID>
Linux: ~/.config/google-chrome/Default/Extensions/<扩展程序 ID>
*/
export const walletConfigs: Record<string, WalletConfig> = {
    metamask: {
      extensionPath: `${path.join(serviceDir,"services","chrome.plugins","nkbihfbeogaeaoehlefnkodbefgpgknn")}`, // 替换为实际路径
      extensionId: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
      name: 'MetaMask',
      userDataDir: `${path.join(userDataRootDir,"data","wallet","metamask")}`
    },
    okx: {
      extensionPath:`${ path.join(serviceDir,"services","chrome.plugins","mcohilncbfahbmgdjkbpemcciiolgcge") }`,
      extensionId: 'mcohilncbfahbmgdjkbpemcciiolgcge',
      name: 'OKX Wallet',
      userDataDir: `${ path.join(userDataRootDir,"data","wallet","okx") }`,
    },
    phantom: {
      extensionPath: `${path.join(serviceDir,"services","chrome.plugins","bfnaelmomeimhlpmgjnjophhpkkoljpa")}`,
      extensionId: 'bfnaelmomeimhlpmgjnjophhpkkoljpa',
      name: 'Phantom',
      userDataDir: `${ path.join(userDataRootDir,"data","wallet","phantom") }`,
    },
    xverse: {
      extensionPath: `${path.join(serviceDir,"services","chrome.plugins","idnnbdplmphpflfnlkomgpfbpcgelopg")}`,
      extensionId: 'idnnbdplmphpflfnlkomgpfbpcgelopg',
      name: 'Xverse',
      userDataDir: `${ path.join(userDataRootDir,"data","wallet","xverse") }`,
    },
    
    binance:{
      extensionPath:`${path.join(serviceDir,"services","chrome.plugins","mcohilncbfahbmgdjkbpemcciiolgcge")}`,
      extensionId: 'mcohilncbfahbmgdjkbpemcciiolgcge',
      name: 'Binance Wallet',
      userDataDir: `${path.join(userDataRootDir,"data","wallet","binance")}`,
    }
  };


export interface SwapParams {
    fromToken: string;
    toToken: string;
    amount: string;
}


export interface MintParams {
  tick:string;  // tick名称
  mintUrl: string; // mint页面地址
  recipient: string;  // 接收地址
  amount: string;  // 数量，单张数量
  repetitions: string; // 重复次数，mint张数
}
