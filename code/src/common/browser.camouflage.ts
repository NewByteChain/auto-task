// import { promisify } from 'util'; // 用于将 setTimeout 转换为 Promise 形式

// import * as fs from 'fs/promises'; // 导入 Node.js 文件系统模块（异步版本）

// import * as os from 'os'; // 导入操作系统相关模块
// import * as logger from 'loguru'; // 日志记录模块（需替换为 TS 兼容的日志库）
// import AsyncWeb3 from 'web3'; // 导入 Web3.js 用于与以太坊交互
// import { Account } from 'eth_account'; // 导入以太坊账户相关类型
// import { Config } from './utils/config'; // 导入配置文件类型（需根据项目调整路径）

// 将 setTimeout 转换为 Promise 形式，便于使用 async/await
// const sleep = promisify(setTimeout);

// 定义视口接口，包含宽度和高度
interface Viewport {
    width: number;
    height: number;
}

// const RPC_URL = "your-rpc-url-here"; // 定义以太坊 RPC URL，需要替换为实际值

// // 获取用户配置文件目录
// async function getProfilesDir(): Promise<string> {
//     // 获取项目根目录（假设当前文件位于多级子目录中）
//     const rootDir = path.resolve(__dirname, '..', '..', '..', '..');
//     // 构建 profiles 目录路径：根目录/data/profiles
//     const profilesDir = path.join(rootDir, 'data', 'profiles');
//     // 确保目录存在，如果不存在则递归创建
//     await fs.mkdir(profilesDir, { recursive: true });
//     return profilesDir;
// }

// // 清理浏览器配置文件目录
// async function cleanupProfile(profileDir: string): Promise<void> {
//     try {
//         // 检查目录是否存在
//         if (await fs.access(profileDir).then(() => true).catch(() => false)) {
//             // 删除目录及其内容，忽略错误
//             await fs.rm(profileDir, { recursive: true, force: true });
//             logger.debug(`成功清理配置文件目录: ${profileDir}`);
//         }
//     } catch (e) {
//         logger.warning(`清理配置文件目录失败 ${profileDir}: ${e}`);
//     }
// }

// // 更新 Capsolver 配置文件中的 API 密钥
// async function updateCapsolverConfig(capsolverPath: string, apiKey: string): Promise<void> {
//     // 定义两个配置文件路径
//     const contentScriptPath = path.join(capsolverPath, 'my-content-script.js');
//     const configJsPath = path.join(capsolverPath, 'assets', 'config.js');

//     // 内部函数，用于更新单个文件
//     const updateFile = async (filePath: string): Promise<void> => {
//         try {
//             // 读取文件内容
//             let content = await fs.readFile(filePath, 'utf-8');
//             // 使用正则表达式替换 apiKey
//             content = content.replace(/apiKey:\s*"[^"]*"/, `apiKey: "${apiKey}"`);
//             // 写回更新后的内容
//             await fs.writeFile(filePath, content, 'utf-8');
//             logger.debug(`成功更新 ${path.basename(filePath)} 中的 API 密钥`);
//         } catch (e) {
//             logger.error(`更新 ${path.basename(filePath)} API 密钥失败: ${e}`);
//             throw e;
//         }
//     };

//     // 并发更新两个文件
//     await Promise.all([
//         updateFile(contentScriptPath),
//         updateFile(configJsPath)
//     ]);
// }

// 获取随机的 User-Agent 字符串
function getRandomUserAgent(): [string, string] {
    // 定义可能的 Chrome 版本
    const chromeVersions = [
        "123.0.0.0", "124.0.0.0", "125.0.0.0", "126.0.0.0",
        "127.0.0.0", "128.0.0.0", "129.0.0.0", "130.0.0.0",
        "131.0.0.0", "132.0.0.0", "133.0.0.0"
    ];

    // 定义可能的平台和操作系统
    const platforms: [string, string][] = [
        ["Windows NT 10.0; Win64; x64", "Windows"],
        ["Macintosh; Intel Mac OS X 10_15_7", "macOS"],
        ["X11; Linux x86_64", "Linux"]
    ];

    // 随机选择一个平台
    const [platform] = platforms[Math.floor(Math.random() * platforms.length)];
    // 随机选择一个 Chrome 版本
    const chromeVersion = chromeVersions[Math.floor(Math.random() * chromeVersions.length)];

    // 返回 User-Agent 字符串和版本号
    return [
        `Mozilla/5.0 (${platform}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`,
        chromeVersion
    ];
}

// 获取随机的视口大小
function getRandomViewport(): Viewport {
    // 定义常见的分辨率
    const resolutions: Viewport[] = [
        { width: 1920, height: 1080 },
        { width: 1366, height: 768 },
        { width: 1536, height: 864 },
        { width: 1440, height: 900 },
        { width: 1280, height: 720 }
    ];
    // 随机返回一个分辨率
    return resolutions[Math.floor(Math.random() * resolutions.length)];
}

// 获取随机的浏览器启动参数
function getRandomLaunchArgs(capsolverPath: string): string[] {
    // 基础参数，禁用一些自动化检测特性
    const baseArgs = [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--password-store=basic',
        '--no-default-browser-check'
    ];

    // 可选参数，用于进一步伪装浏览器
    const optionalArgs = [
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-site-isolation-trials',
        '--disable-setuid-sandbox',
        '--ignore-certificate-errors'
    ];

    // 随机选择 2-4 个可选参数
    const selectedOptional = optionalArgs.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2);
    
    // 扩展相关参数，加载 Capsolver 扩展
    const extensionArgs = [
        `--disable-extensions-except=${capsolverPath}`,
        `--load-extension=${capsolverPath}`,
        '--lang=en-US'
    ];

    // 设置随机视口大小
    const viewport = getRandomViewport();
    const windowSizeArg = [`--window-size=${viewport.width},${viewport.height}`];

    // 合并所有参数
    return [...baseArgs, ...selectedOptional, ...extensionArgs, ...windowSizeArg];
}

// 导出函数
export { getRandomUserAgent, getRandomViewport ,getRandomLaunchArgs};