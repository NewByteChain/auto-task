import { ethers } from 'ethers';
import path from 'path';
import {importFromFile, createTextFile} from '../../common/fileUtils';

// 配置以太坊提供者（例如使用 Infura 或 Alchemy）
const provider = new ethers.JsonRpcProvider('https://ethereum.publicnode.com');

// 批量查询余额的异步函数
export async function getEthBalances(addresses: string[]): Promise<{ address: string; balance: string }[]> {
  try {
    // 确保地址格式有效
    const validAddresses = addresses.filter((address) => ethers.isAddress(address));
    if (validAddresses.length === 0) {
      throw new Error('没有有效的以太坊地址');
    }

    // // 使用 Promise.all 并发查询余额
    // const balancePromises = validAddresses.map(async (address) => {
    //   const balance = await provider.getBalance(address);
    //   // 将余额从 wei 转换为 ETH，并格式化
    //   const balanceInEth = ethers.formatEther(balance);
    //   return { address, balance: balanceInEth };
    // });

    // // 等待所有查询完成
    // const results = await Promise.all(balancePromises);

    // 存储结果
    const results: { address: string; balance: string }[] = [];

    // 逐个查询余额
    for (const address of validAddresses) {
      const balance = await provider.getBalance(address);
      // 将余额从 wei 转换为 ETH，并格式化
      const balanceInEth = ethers.formatEther(balance);
      results.push({ address, balance: balanceInEth });
      console.log(`${address}    balance:${balanceInEth}`);
    }
    return results;
  } catch (error) {
    console.error('查询余额失败:', error);
    throw error;
  }
}



/**
 * 函数：根据私钥生成以太坊地址
 * @param privateKey 私钥地址
 * @returns 公钥地址
 */
export function getAddressFromPrivateKey(privateKey: string): string {
    try {
      // 确保私钥格式正确（以 0x 开头，64 位十六进制）
      if (!privateKey.startsWith('0x')) {
        privateKey = '0x' + privateKey;
      }
      if (privateKey.length !== 66) {
        throw new Error('私钥长度无效，应为 64 位十六进制（加上 0x 为 66 位）');
      }
  
      // 使用 ethers.Wallet 从私钥创建钱包实例
      const wallet = new ethers.Wallet(privateKey);
  
      // 获取钱包地址
      const address = wallet.address;
  
      return address;
    } catch (error:unknown) {
      console.error('生成地址失败:', (error as Error).message);
      throw error;
    }
}

/**
 * 批量查询ETH账户余额
 * @param addresses 
 */
export async function queryBatchEthBalances(){

  // 读取公钥地址
  const filePath = path.join(__dirname,'../../','data', 'public_keys.txt'); // 确保路径正确
  console.log('Imported filePath:', filePath);
  let publicKeys = await importFromFile(filePath);
  console.log('Imported publicKeys:', publicKeys.length);

  // 实现余额查询
  console.log('Starting batch query...');
  let balances = await getEthBalances(publicKeys);
  console.log('Results:', balances);
  balances = balances.filter(x=> parseFloat(x.balance) < 0.01);

  // 一次性将结果写入
  const outPath = path.join(__dirname,'../../','data', 'output.txt'); // 确保路径正确
  await createTextFile(outPath,balances.map(x=>  `${x.address}    balance:${x.balance}`).join('\n'));
  
  console.log(`写入完成`);

}


/**
 * 读取公钥地址列表
 */
export async function queryBatchEthPublickAddress(){

  // 读取公钥地址
  const filePath = path.join(__dirname,'../../','data', 'private_keys.txt'); // 确保路径正确
  console.log('Imported filePath:', filePath);
  let private_keys = await importFromFile(filePath);
  console.log('Imported private_keys:', private_keys.length);

  // 实现余额查询
  console.log('Starting batch query...');
  const addresses =[];
  for (const privateKey of private_keys) {
      const wallet = new ethers.Wallet(privateKey, provider);
      addresses.push(wallet.address);
  }  
  // 一次性将结果写入
  const outPath = path.join(__dirname,'../../','data', 'output.txt'); // 确保路径正确
  
  await createTextFile(outPath,addresses.join('\n'));
  console.log(`写入完成`);

}