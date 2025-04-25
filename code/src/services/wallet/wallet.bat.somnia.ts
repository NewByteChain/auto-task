import * as bip39 from 'bip39';
import { hdkey } from 'ethereumjs-wallet';
import { ethers,HDNodeWallet ,JsonRpcProvider } from "ethers";
import * as path from 'path';
import {importFromFile,appendResultToFile} from '../../common/fileUtils';
import { delay } from '../../common/utils';

// 配置 RPC 和 token 信息
const RPC_URL = 'https://dream-rpc.somnia.network';
const provider = new ethers.JsonRpcProvider(RPC_URL);

const TOKENS = {
    "native": "native",
    "PING": "0xbecd9b5f373877881d91cbdbaf013d97eb532154",
    "PONG": "0x7968ac15a72629e05f41b8271e4e7292e0cc9f90"
}
// ERC-20 ABI（仅包含 balanceOf 方法）
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

// 从助记词生成钱包地址
async function getAddressFromMnemonic(mnemonic: string, index: number = 0): Promise<HDNodeWallet > {
    try {
        const wallet = ethers.Wallet.fromPhrase(mnemonic);
        return wallet.connect(provider);
      } catch (error) {
        throw new Error(`Failed to create wallet: ${(error as Error).message}`);
      }
}

// 查询单个地址的 token 余额
// async function getTokenBalance(address: string): Promise<string> {
//     try {
//         // 显式指定 balanceOf 返回类型为 string
//         const balance = await web3.eth.getBalance(address);
//         // 将余额从 wei 转换为可读单位（假设 token 有 18 位小数）
//         return web3.utils.fromWei(balance, 'ether');
//     } catch (error) {
//         console.error(`Error fetching balance for ${address}:`, error);
//         return '0';
//     }
// }

  /**
   * 查询单个地址的 token 余额
   */
  async function getTokenBalance(wallet:HDNodeWallet ):Promise<any> {
    try {
      if (!provider || !wallet) throw new Error('Provider or Wallet not initialized');

      // 查询原生代币
      const balanceNative = await provider.getBalance(wallet.address);

      var walletInfo = {
        address: wallet.address
      } as any;
      walletInfo.balanceNative = ethers.formatEther(balanceNative);

      // 查询PING余额
      if (TOKENS.PING) {
        const pingContract = new ethers.Contract(TOKENS.PING, ["function balanceOf(address) view returns (uint256)"],provider);
        const pingBalance = await pingContract.balanceOf(wallet.address);
        walletInfo.balancePing = ethers.formatEther(pingBalance);
      }

      // 查询PONG余额
      if (TOKENS.PONG) {
        const pongContract = new ethers.Contract(TOKENS.PONG, ["function balanceOf(address) view returns (uint256)"], provider);
        const pongBalance = await pongContract.balanceOf(wallet.address);
        walletInfo.balancePong = ethers.formatEther(pongBalance);
      }
      
      return walletInfo;
    } catch (error) {
      console.log("无法获取钱包数据: " + (error as Error).message);
      console.trace(error);
    }
  }


// 批量查询助记词钱包的 token 余额
async function batchQueryTokenBalances(mnemonics: string[]): Promise<string[]> {
    const results: string[] = [];

    for (var index=0;index<mnemonics.length;index++){ 
        const mnemonic = mnemonics[index].trim(); // 去除首尾空格
        
        try {
            
            // 验证助记词有效性
            if (!bip39.validateMnemonic(mnemonic)) {
                console.error(`[${index}] Invalid mnemonic: ${mnemonic}`);
                continue;
            }

            // 生成第一个地址（index = 0）
            const wallet:HDNodeWallet  = await getAddressFromMnemonic(mnemonic);
            // await delay(Math.ceil(Math.random() * 1200) + 100); // 随机休眠：100ms-1300ms

            // 查询余额
            const walletInfo = await getTokenBalance(wallet);
            
            if(walletInfo.balanceNative>0.1) {
              console.log(`[${index}] Mnemonic: ${mnemonic.slice(0, 10)}... | Address: ${walletInfo.address}, 原生代币: ${walletInfo.balanceNative}, Ping: ${walletInfo.balancePing}, Pong: ${walletInfo.balancePong}`);
                // 余额大于0，将私钥写入文件中
                results.push(wallet.privateKey);
                // 直接追加写入到文件中
                await appendResultToFile(path.join(__dirname,'../../../data/', 'somnia_result.txt'),wallet.privateKey);
            }
            
        } catch (error) {
            console.error(`[${index}] Error processing mnemonic ${mnemonic.slice(0, 10)}...:`, error);
        }
    }

    return results;
}

/**
 * 批量余额查询
 */
export async function balancesQuery() {
    // 使用示例
    const filePath = path.join(__dirname,'../../../data/', 'monad_mnemonics_01.txt'); // 确保路径正确
    console.log('Imported filePath:', filePath);

    let mnemonics = await importFromFile(filePath);
    console.log('Imported mnemonics:', mnemonics.length);

    // 实现余额查询

    console.log('Starting batch query...');
    const result = await batchQueryTokenBalances(mnemonics);
    console.log('Results:', result);
    // 写入文件中
    
}

// runTest().catch(err => console.error('Test failed:', err));