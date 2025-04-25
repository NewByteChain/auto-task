import { ethers,Wallet,JsonRpcProvider } from "ethers";
import { delay, parseProxyUrl,strToBool,getShortHash,getShortAddress,getRandomInteger} from '../../common/utils';
import { timeout } from '../../common/decoratorsUtils';
import { HttpsProxyAgent  } from 'https-proxy-agent';
import { fetch,ProxyAgent } from 'undici';
import * as dotenv from 'dotenv';
dotenv.config();

// 配置
const RPC_URL = process.env.RPC_URL || "https://dream-rpc.somnia.network";
const PING_TOKEN_ADDRESS = process.env.PING_TOKEN_ADDRESS || "0xbecd9b5f373877881d91cbdbaf013d97eb532154";
const PONG_TOKEN_ADDRESS = process.env.PONG_TOKEN_ADDRESS || "0x7968ac15a72629e05f41b8271e4e7292e0cc9f90";
const SWAP_CONTRACT_ADDRESS = process.env.SWAP_CONTRACT_ADDRESS || "0x6aac14f090a35eea150705f72d90e4cdc4a49b2c";

const swapContractABI = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "tokenIn", "type": "address" },
          { "internalType": "address", "name": "tokenOut", "type": "address" },
          { "internalType": "uint24", "name": "fee", "type": "uint24" },
          { "internalType": "address", "name": "recipient", "type": "address" },
          { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
          { "internalType": "uint256", "name": "amountOutMinimum", "type": "uint256" },
          { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }
        ],
        "internalType": "struct ExactInputSingleParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "exactInputSingle",
    "outputs": [{ "internalType": "uint256", "name": "amountOut", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  }
];

const PING_ABI = [
  "function mint(address to, uint256 amount) public payable",
  "function balanceOf(address owner) view returns (uint256)"
];

const PONG_ABI = [
  "function mint(address to, uint256 amount) public payable",
  "function balanceOf(address owner) view returns (uint256)"
];

/**
 * Somnia 钱包自动化
 */
export class SomniaAutomation {
  private wallet: Wallet | null = null; // 钱包对象
  private provider:JsonRpcProvider | null = null; // provider

  constructor() {

  }


  /**
   * 初始化浏览器和插件
   * @param privateKey 钱包私钥
   * @param proxyInfo 代理信息
   */
  async initialize(privateKey:string): Promise<void> {
    // // 代理
    // const httpAgent  = new HttpsProxyAgent(proxyInfo);
    // // 创建自定义 FetchRequest
    // const fetchReq = new ethers.FetchRequest(RPC_URL);
    // fetchReq.getUrlFunc = ethers.FetchRequest.createGetUrlFunc({
    //   agent: httpAgent, // 设置代理
    // });
    // // 配置 provider
    // this.provider = new ethers.JsonRpcProvider(fetchReq);

    this.provider = new ethers.JsonRpcProvider(RPC_URL);

    console.log(`[initialize] provider初始化完成`);

    let pk = privateKey.trim();  // 私钥
    if (!pk.startsWith("0x")) pk = "0x" + pk;
    this.wallet = new ethers.Wallet(pk, this.provider);
    console.log(`[initialize] wallet初始化完成`);
    
  }


  /**
   * 任务1：STT领水操作
   * @param proxy 
   * @param address 
   * @returns 
   */
  async performFaucetStt(proxy:string): Promise<boolean> {
    if (!this.provider || !this.wallet) {
      throw new Error('Provider or Wallet not initialized');
    }

    
    try {
      // 参数集
      var args = {
        method: 'POST',
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Content-Type": "application/json",
          "Accept": "application/json",
          "origin": "https://testnet.somnia.network",
          "referer": "https://testnet.somnia.network"
        },
        body: JSON.stringify({address:this.wallet.address})       
      } as any;

      // 检测是否存在代理
      if(proxy){
          // 创建 undici 的 ProxyAgent
          const proxyAgent = new ProxyAgent(proxy);
          args.dispatcher = proxyAgent; // 设置代理
          console.log(`[Faucet STT] 使用代理: ${proxy}`);
      } else {
          console.log(`[Faucet STT] 未使用代理，切换成系统默认网络`);
      }

      const response = await fetch('https://testnet.somnia.network/api/faucet', args);

      const result = await response.json();
      // 处理响应
      if (result && response.status === 200) {
        console.log(`[Faucet STT] STT 水龙头领取成功！响应: ${JSON.stringify(result)}`);
        await delay(10000); // 保持与原脚本一致的等待时间
        return true;
      } else if (response.status === 429) {
        console.log(`[Faucet STT] 请求过于频繁或已领取`);
        return false;
      } else {
        throw new Error(`[Faucet STT] 意外的状态码: ${response.status}`);
      }      
    } catch (error:unknown) {
      console.error('错误详情:', (error as Error).message);
      return false;
    }
  }

  /**
   * 任务2：PING领水 
   */
  async performFaucetPing(): Promise<void> {
    try {
      if (!this.provider || !this.wallet) throw new Error('Provider or Wallet not initialized');
      
      const pingContract = new ethers.Contract(PING_TOKEN_ADDRESS, PING_ABI, this.wallet);
      const claimAmount = ethers.parseUnits("1000", 18);
      console.log("正在请求 PING 水龙头...");
      const tx = await pingContract.mint(this.wallet.address, claimAmount, { value: 0 });
      console.log(`交易已发送。交易哈希: ${getShortHash(tx.hash)}`);
      await tx.wait();
      console.log("PING 水龙头领取成功！");
      await delay(5000);
    } catch (error:unknown) {
      console.log("PONG 水龙头领取失败: "+ (error as Error).message);
    } finally {
       
    }
  }

  /**
   * 任务3：PONG领水
   * @param private_key 
   * @param proxy 
   */
  async performFaucetPong(): Promise<void> {
    try {
      if (!this.provider || !this.wallet) throw new Error('Provider or Wallet not initialized');
      
      const pongContract = new ethers.Contract(PONG_TOKEN_ADDRESS, PONG_ABI, this.wallet);
      const claimAmount = ethers.parseUnits("1000", 18);
      console.log("正在请求 PONG 水龙头...");
      const tx = await pongContract.mint(this.wallet.address, claimAmount, { value: 0 });
      console.log(`交易已发送。交易哈希: ${getShortHash(tx.hash)}`);
      await tx.wait();
      console.log("PONG 水龙头领取成功！");
      await delay(5000);
    } catch (error:unknown) {
      console.log("PONG 水龙头领取失败: " + (error as Error).message);
    } finally {
      
    }

  }

  /**
   * 检查并授权代币
   * @param tokenAddress 
   * @param spender 
   * @param amount 
   */
  async checkAndApproveToken(tokenAddress:string, spender:string, amount:any) {
      if (!this.provider || !this.wallet) throw new Error('Provider or Wallet not initialized');
      const erc20ABI = [
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)"
      ];
      const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, this.wallet);
      const currentAllowance = await tokenContract.allowance(this.wallet.address, spender);
      if (currentAllowance < amount) {
        console.log(`需要为代币 ${getShortAddress(tokenAddress)} 授权。当前授权额度: ${ethers.formatEther(currentAllowance)}`);
        const maxApproval = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
        const tx = await tokenContract.approve(spender, maxApproval);
        console.log(`授权交易已发送: ${getShortHash(tx.hash)}`);
        await tx.wait();
        console.log("授权成功。");
      } else {
        console.log("代币已授权。");
      }
  }

  /**
   * 自动交换
   * @param totalSwaps 交换次数
   */
  async autoSwapPingPong(totalSwaps:number) {
    try {
      if (!this.provider || !this.wallet) throw new Error('Provider or Wallet not initialized');

      const swapContract = new ethers.Contract(SWAP_CONTRACT_ADDRESS, swapContractABI, this.wallet);
      const pingContract = new ethers.Contract(PING_TOKEN_ADDRESS, PING_ABI, this.wallet);
      const pongContract = new ethers.Contract(PONG_TOKEN_ADDRESS, PONG_ABI, this.wallet);
      console.log(`开始自动交换 ${totalSwaps} 次。`);
      for (let i = 0; i < totalSwaps; i++) {
        const pingBalance = await pingContract.balanceOf(this.wallet.address);
        const pongBalance = await pongContract.balanceOf(this.wallet.address);
        const minAmount = ethers.parseUnits("100", 18);
        let tokenIn, tokenOut, direction;
        if (pingBalance >= minAmount && pongBalance >= minAmount) {
          direction = Math.random() < 0.5 ? "PongToPing" : "PingToPong";
        } else if (pingBalance < minAmount && pongBalance >= minAmount) {
          direction = "PongToPing";
        } else if (pongBalance < minAmount && pingBalance >= minAmount) {
          direction = "PingToPong";
        } else {
          console.log("Ping 和 Pong 余额均不足，无法继续交换。");
          break;
        }
        tokenIn = direction === "PongToPing" ? PONG_TOKEN_ADDRESS : PING_TOKEN_ADDRESS;
        tokenOut = direction === "PongToPing" ? PING_TOKEN_ADDRESS : PONG_TOKEN_ADDRESS;
        const randomAmount = getRandomInteger(100, 300);  // 100~300之间随机一个数字
        const amountIn = ethers.parseUnits(randomAmount.toString(), 18);
        const tokenInName = this.getTokenName(tokenIn);
        const tokenOutName = this.getTokenName(tokenOut);
        console.log(`交换 ${i + 1}/${totalSwaps}: 从 ${tokenInName} 到 ${tokenOutName}，数量 ${randomAmount}`);
        // 检测并授权代币
        await this.checkAndApproveToken(tokenIn, SWAP_CONTRACT_ADDRESS, amountIn);
        const tx = await swapContract.exactInputSingle({
          tokenIn,
          tokenOut,
          fee: 500,
          recipient: this.wallet.address,
          amountIn,
          amountOutMinimum: 0,
          sqrtPriceLimitX96: 0n
        });
        console.log(`交换 ${i + 1}/${totalSwaps} 交易已发送: ${getShortHash(tx.hash)}`);
        await tx.wait();
        console.log(`交换 ${i + 1}/${totalSwaps} 成功。`);
        // await updateWalletData();
        if (i < totalSwaps - 1) {
          const delayMs = getRandomInteger(20000, 50000);
          console.log(`等待 ${delayMs / 1000} 秒后进行下一次交换...`);
          await delay(delayMs);
        }
      }
      console.log("自动交换完成。");
    } catch (err) {
      console.log("自动交换出错: " + (err as Error).message);
      // console.trace(err);
    }
  }

  /**
   * 自动发送到随机地址
   * @param addresses 接受地址数组
   * @param totalSends 发送次数
   * @param tokenAmountStr 发送金额
   * @returns 
   */
  async autoSendTokenRandom(addresses:string[],totalSends:number, tokenAmountStr:string) {
    try {
      if (!this.provider || !this.wallet) throw new Error('Provider or Wallet not initialized');

      // const addresses = readRandomAddresses();  // 随机地址
      if (addresses.length === 0) {
        console.log("地址列表为空。");
        return;
      }
      console.log(`开始自动发送代币至随机地址 ${totalSends} 次。`);
      for (let i = 0; i < totalSends; i++) {
        const randomIndex = getRandomInteger(0, addresses.length - 1);
        const targetAddress = addresses[randomIndex];
        console.log(`自动发送: 发送 ${tokenAmountStr} STT 到 ${targetAddress}`);
        const tx = await this.wallet.sendTransaction({
          to: targetAddress,
          value: ethers.parseUnits(tokenAmountStr, 18)
        });
        console.log(`自动发送 ${i + 1}/${totalSends} 交易已发送: ${getShortHash(tx.hash)}`);
        await tx.wait();
        console.log(`自动发送 ${i + 1}/${totalSends} 成功到 ${targetAddress}。`);
        // await updateWalletData();
        if (i < totalSends - 1) {
          const delayMs = getRandomInteger(5000, 10000);
          console.log(`等待 ${delayMs / 1000} 秒后进行下一次发送...`);
          await delay(delayMs);
        }
      }
      console.log("自动发送代币完成。");
    } catch (err) {
      console.log("自动发送代币出错: " + (err as Error).message);
    } finally {
      // autoSendRunning = false;
    }
  }

  /**
   * 获取钱包数据
   */
  async queryWalletData() {
    try {
      if (!this.provider || !this.wallet) throw new Error('Provider or Wallet not initialized');

      // 查询原生代币
      const balanceNative = await this.provider.getBalance(this.wallet.address);

      var walletInfo = {
        address: this.wallet.address
      } as any;
      walletInfo.balanceNative = ethers.formatEther(balanceNative);

      // 查询PING余额
      if (PING_TOKEN_ADDRESS) {
        const pingContract = new ethers.Contract(PING_TOKEN_ADDRESS, ["function balanceOf(address) view returns (uint256)"],this.provider);
        const pingBalance = await pingContract.balanceOf(this.wallet.address);
        walletInfo.balancePing = ethers.formatEther(pingBalance);
      }

      // 查询PONG余额
      if (PONG_TOKEN_ADDRESS) {
        const pongContract = new ethers.Contract(PONG_TOKEN_ADDRESS, ["function balanceOf(address) view returns (uint256)"], this.provider);
        const pongBalance = await pongContract.balanceOf(this.wallet.address);
        walletInfo.balancePong = ethers.formatEther(pongBalance);
      }
      console.log(`钱包信息 - 地址: ${getShortAddress(walletInfo.address)}, 原生代币: ${walletInfo.balanceNative}, Ping: ${walletInfo.balancePing}, Pong: ${walletInfo.balancePong}`);
    } catch (error) {
      console.log("无法获取钱包数据: " + (error as Error).message);
      console.trace(error);
    }
  }

  /**
   * 合约地址
   * @param address 
   * @returns 
   */
  getTokenName(address:string) {
    if (address.toLowerCase() === PING_TOKEN_ADDRESS.toLowerCase()) return "Ping";
    if (address.toLowerCase() === PONG_TOKEN_ADDRESS.toLowerCase()) return "Pong";
    return address;
  }


  /**
   * 执行任务流程
   * @param privateKey 钱包私钥
   * @param proxyStr 代理
   * @param addresses 发送代币接收地址
   * @returns 
   */
  @timeout(7*60*1000) // 设置超时时间为 7 分钟
  async run(privateKey:string,proxyStr:string,addresses:string[]): Promise<string> {
    try {
        // 初始化
        await this.initialize(privateKey); // 初始化浏览器和插件
         
        console.log(`得到矿工钱包的公钥地址：${this.wallet?.address}`);
        console.log(`准备工作完成，准备 Faucet STT`);

        await this.queryWalletData(); // 查询钱包数据
        await delay(2000 + Math.ceil(Math.random() * 2000)); // 随机休眠        

        var SMONIA_STT_FAUCET_ENABLE = true;  // 默认领取STT
        if(process.env.SMONIA_STT_FAUCET_ENABLE) {
            SMONIA_STT_FAUCET_ENABLE = strToBool(process.env.SMONIA_STT_FAUCET_ENABLE); // 是否开启领取STT，默认开启
        }
        var faucetFlag = false; // 是否领取成功，默认未领取成功
        if(SMONIA_STT_FAUCET_ENABLE) {
            // 任务1：领取STT
            var faucetFlag = await this.performFaucetStt(proxyStr);  // 打开铭文铸造页面
            await delay(2000 + Math.ceil(Math.random() * 2000)); // 随机休眠
            await this.queryWalletData(); // 查询钱包数据
        }

        // 任务2：领取PING
        await this.performFaucetPing();
        await delay(2000 + Math.ceil(Math.random() * 2000)); // 随机休眠
        await this.queryWalletData(); // 查询钱包数据

        // 任务3：领取PONG
        await this.performFaucetPong();
        await delay(5000 + Math.ceil(Math.random() * 2000)); // 随机休眠
        await this.queryWalletData(); // 查询钱包数据

        // 自动交换
        var SMONIA_AUTO_SWAP_ENABLE = true;  // 默认开启自动交换
        if(process.env.SMONIA_AUTO_SWAP_ENABLE) {
          SMONIA_AUTO_SWAP_ENABLE = strToBool(process.env.SMONIA_AUTO_SWAP_ENABLE); // 是否开启自动交换
        }
        if(SMONIA_AUTO_SWAP_ENABLE) {
            await this.autoSwapPingPong(4);  // 自动交换4次
            await delay(2000 + Math.ceil(Math.random() * 2000)); // 随机休眠
            await this.queryWalletData(); // 查询钱包数据
        } else {
            console.log(`自动交换已关闭`);
        }
        
        // 开启自动转账
        var SMONIA_SEND_TOKEN_ENABLE = true;  // 默认开启自动转账
        if(process.env.SMONIA_SEND_TOKEN_ENABLE) {
            SMONIA_SEND_TOKEN_ENABLE = strToBool(process.env.SMONIA_SEND_TOKEN_ENABLE); // 是否开启自动转账
        }
        
        // 限定条件：如果开启了Faucet STT，或者领取成功了STT，才执行发送代币操作
        if(SMONIA_SEND_TOKEN_ENABLE || faucetFlag) {
            // 发送代币，发送基础金额优先从配置文件中获取，否则使用默认值0.1，末尾加上随机数0~9
            const tokenAmountStr = `${process.env.SMONIA_SEND_TOKEN_AMOUNT || '0.1' }${getRandomInteger(0,9)}`; // 发送金额，0.10~0.20之间随机一个数字比较好
            console.log(`发送金额: ${tokenAmountStr}`);
            await this.autoSendTokenRandom(addresses,1,tokenAmountStr); // 每个账户发送一次
            await delay(2000 + Math.ceil(Math.random() * 2000)); // 随机休眠
            await this.queryWalletData(); // 查询钱包数据
        } else {
            console.log(`Faucet STT 失败，跳过自动交换与发送代币操作`);
        }
        
        await delay(2000 + Math.ceil(Math.random() * 2000)); // 随机休眠
        console.log(`任务完成，可以关闭浏览器了。`);
        return "ok";
        // 程序执行到这里，需要关闭浏览器，不然无法继续mint
    } catch (error) {
      console.error('发生错误:', error);
      return "fail";
    } finally {
      console.log(`finally: 当前任务已经完成。`);
    }
  }
}



