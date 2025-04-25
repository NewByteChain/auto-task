import * as fs from 'fs';
import * as path from 'path';
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32'; // 导入工厂函数
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { ECPairInterface, ECPairFactory } from 'ecpair'; // 显式导入 ECPair
import { importFromFile } from '../../common/fileUtils';
// 初始化 ECC 库
bitcoin.initEccLib(ecc);

// 初始化 bip32 和 ECPair
const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);

// 定义返回结果的接口
interface WalletInfo {
  mnemonic: string;
  address: string;
  privateKey: string;
}

// 读取文件并处理助记词
async function processMnemonicsFromFile(filePath: string): Promise<WalletInfo[]> {
  try {
    console.log('Imported filePath:', filePath);
    // 读取助记词
    let mnemonics = await importFromFile(filePath);
    console.log('Imported mnemonics:', mnemonics.length);

    // const fileContent = fs.readFileSync(filePath, 'utf-8');
    // const mnemonicLines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const results: WalletInfo[] = [];

    // 遍历每一行助记词
    for (const mnemonic of mnemonics) {
      // 验证助记词是否有效
      if (!bip39.validateMnemonic(mnemonic)) {
        console.warn(`Invalid mnemonic skipped: ${mnemonic}`);
        continue;
      }

    // 将助记词转换为种子
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const root = bip32.fromSeed(seed); // 使用初始化后的 bip32

    // 使用 BIP86 路径生成 BTC 地址（主网: m/86'/0'/0'/0/0）
    const derivationPath = "m/86'/0'/0'/0/1";
    const child = root.derivePath(derivationPath);
    // 生成 Taproot 地址 (P2TR)
    const { address } = bitcoin.payments.p2tr({
        internalPubkey: Buffer.from(child.publicKey.slice(1, 33)), // Taproot 需要 32 字节的 x-only 公钥
        network: bitcoin.networks.bitcoin, // 主网
      });
    // const { address } = bitcoin.payments.p2pkh({
    //     pubkey: Buffer.from(child.publicKey),
    //     network: bitcoin.networks.bitcoin, // 主网
    // });

    // 获取私钥（WIF 格式）
    const keyPair = ECPair.fromPrivateKey(child.privateKey!, { network: bitcoin.networks.bitcoin });
    const privateKey = keyPair.toWIF();

      // 保存结果
      results.push({
        mnemonic,
        address: address!,
        privateKey,
      });
    }

    return results;
  } catch (error) {
    console.error('Error processing mnemonics:', error);
    throw error;
  }
}

// 验证 WIF 格式私钥
function validateWifPrivateKey(wifKey: string): void {
  // WIF 格式检查：51或52个字符，Base58编码
  const wifRegex = /^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/;
  if (!wifRegex.test(wifKey)) {
      throw new Error(`无效的 WIF 格式私钥: 期望51-52个Base58字符，实际得到${wifKey.length}个字符`);
  }
}

/**
 * 从 WIF 私钥生成 Taproot 地址
 * @param wifKey 私钥
 * @param network 网络
 * @returns 
 */
function getTaprootAddressFromWif(
  wifKey: string,
  network = bitcoin.networks.bitcoin
): string {
  try {
      // 验证 WIF 格式
      validateWifPrivateKey(wifKey);

      // 从 WIF 创建密钥对
      const keyPair: ECPairInterface = ECPair.fromWIF(wifKey, network);

      // 确保使用压缩公钥（Taproot 需要 32 字节 X-only 公钥）
      if (!keyPair.compressed) {
          throw new Error('Taproot 地址需要压缩公钥（WIF 以 K 或 L 开头）');
      }

      // 获取公钥并转换为 X-only 格式
      const publicKey = keyPair.publicKey; // 33 字节压缩公钥
      const xOnlyPubkey:Uint8Array<ArrayBuffer> = publicKey.slice(1); // 去掉 0x02/0x03 前缀，保留 32 字节 X 坐标

      // 生成 Taproot (P2TR) 地址
      const { address } = bitcoin.payments.p2tr({
          internalPubkey:  Buffer.from(xOnlyPubkey),
          network
      });

      if (!address) {
          throw new Error('Taproot 地址生成失败');
      }

      return address;
  } catch (error) {
      console.error('Taproot 地址生成错误:', error);
      throw error instanceof Error 
          ? error 
          : new Error('无法从提供的 WIF 私钥生成 Taproot 地址');
  }
}

/**
 * 
 * @param privateKey 私钥地址
 * @param format 地址格式
 * @param network 可选，网络
 * @returns 
 */
export function getBtcAddressWithFormat(
  privateKey: string,
  format: 'taproot' | 'legacy' | 'segwit' | 'bech32' = 'taproot',
  network = bitcoin.networks.bitcoin
): string {
  try {
      // 验证 WIF 格式
      validateWifPrivateKey(privateKey);
      console.log(`私钥验证通过`);
      const keyPair: ECPairInterface = ECPair.fromWIF(privateKey, network);
      
      // 确保 pubkey 是 Buffer 类型
      const pubkey: Buffer = Buffer.from(keyPair.publicKey);

      switch (format) {
          case 'taproot': // 原生 SegWit 地址 (bc1 开头)
            return getTaprootAddressFromWif(privateKey);
          case 'legacy': // 传统地址 (1 开头)
              return bitcoin.payments.p2pkh({ pubkey: pubkey, network }).address!;
          case 'segwit': // SegWit 地址 (3 开头)
              return bitcoin.payments.p2sh({
                  redeem: bitcoin.payments.p2wpkh({ pubkey: pubkey, network })
              }).address!;
          case 'bech32': // 原生 SegWit 地址 (bc1 开头)
              return bitcoin.payments.p2wpkh({ pubkey: pubkey, network }).address!;
          default:
              throw new Error('不支持的地址格式');
      }
  } catch (error) {
      console.error('地址生成错误:', error);
      throw new Error('无法生成比特币地址');
  }
}

// 主函数
export async function btcWalletQuery() {

  try {
    
    // 读取 txt 文件内容
    const filePath = path.join(__dirname,'../../../','data', 'mnemonics.txt'); // 确保路径正确
    const wallets = await processMnemonicsFromFile(filePath);
    // 输出内容
    const output = wallets.map(item => item.privateKey ).join('\n'); // 将指定字段的值连接成字符串，每行一个
    

    // console.log(`Mnemonic: ${item.mnemonic}`);
    // console.log(`Address: ${item.address}`);
    // console.log(`Private Key: ${item.privateKey}`);
    // console.log('------------------------');
    console.log(`${output}`)
    // 可选：将结果保存到文件
    fs.writeFileSync(
        path.join(__dirname,'../../../','data', 'seed_phrases2.txt'),
        output,
        'utf-8'
    );
    console.log('Results saved to output txt');
  } catch (error) {
    console.error('Failed to process file:', error);
  }
}