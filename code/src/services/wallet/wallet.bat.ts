import * as bip39 from 'bip39';
import { HDNode } from '@ethersproject/hdnode';
import * as fs from 'fs';
import * as path from 'path';

interface Wallet {
  seedPhrase: string;
  privateKey: string;
  address: string;
}

export class WalletHelper {

     constructor() {
     }


    /**
     * 根据助记词生成以太坊私钥和地址
     * @param seedPhrase 助记词字符串（12 或 24 词）
     * @param coinType 链类型（60 为以太坊，0 为比特币，714 为 BNB Chain）
     * @returns 包含私钥和地址的对象
     */
    generatePrivateKeyFromSeed(seedPhrase: string, coinType: number = 60): Wallet {
        // 验证助记词有效性
        if (!bip39.validateMnemonic(seedPhrase)) {
            throw new Error(`无效的助记词: ${seedPhrase}`);
        }

        // 从助记词生成种子
        const seed = bip39.mnemonicToSeedSync(seedPhrase);

        // 使用默认以太坊路径 m/44'/60'/0'/0/0 生成钱包
        const hdNode = HDNode.fromSeed(seed);
        const path = `m/44'/${coinType}'/0'/0/0`;
        const walletNode = hdNode.derivePath(path);

        return {
            seedPhrase,
            privateKey: walletNode.privateKey,
            address: walletNode.address,
        };
    }

    /**
     * 生成新的单个以太坊钱包
     * @param strength 助记词的熵强度（128 = 12词，256 = 24词，默认 128）
     * @returns 包含助记词、私钥和地址的钱包对象
     */
    generateNewEthWallet(strength: 128 | 256 = 128): Wallet {
        // 生成助记词
        const mnemonic = bip39.generateMnemonic(strength);
    
        // 从助记词生成种子
        const seed = bip39.mnemonicToSeedSync(mnemonic);
    
        // 使用以太坊默认路径 m/44'/60'/0'/0/0 推导钱包
        const hdNode = HDNode.fromSeed(seed);
        const walletNode = hdNode.derivePath("m/44'/60'/0'/0/0");
    
        return {
            seedPhrase:mnemonic,
            privateKey: walletNode.privateKey,
            address: walletNode.address,
        };
    }

    /**
     * 批量生成新的以太坊钱包
     * @param count 生成钱包的数量
     * @param strength 助记词的熵强度（128 = 12词，256 = 24词）
     * @returns 钱包数组
     */
    batchGenerateNewEthWallets(count: number, strength: 128 | 256 = 128): Wallet[] {
        const wallets: Wallet[] = [];
        
        for (let i = 0; i < count; i++) {
        const wallet = this.generateNewEthWallet(strength);
        wallets.push(wallet);
            console.log(`生成钱包 ${i + 1}: ${wallet.address}`);
        }
    
        return wallets;
    }
    

    /**
     * 根据助记词批量生成钱包
     * @param seedPhrases 助记词数组
     * @returns 包含所有钱包信息的数组
     */
    batchGenerateWallets(seedPhrases: string[]): Wallet[] {
        const wallets: Wallet[] = [];
        
        for (const seed of seedPhrases) {
            try {
                const wallet = this.generatePrivateKeyFromSeed(seed.trim());
                wallets.push(wallet);
                console.log(`成功生成: ${wallet.privateKey}`);
            } catch (error) {
                const e = error as Error; // 类型断言
                console.error(`生成失败: ${seed}, 错误: ${e.message }`);
            }
        }

        return wallets;
    }

    /**
     * 从文件读取助记词
     * @param filePath 文件路径
     * @returns 助记词数组
     */
    loadSeedPhrases(filePath: string): string[] {
        if (!fs.existsSync(filePath)) {
            throw new Error(`文件不存在: ${filePath}`);
        }

        const content = fs.readFileSync(filePath, 'utf-8');
            return content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    }

    /**
     * 将钱包信息保存到文件
     * @param wallets 钱包数组
     * @param filePath 输出文件路径
     */
    saveWalletsToFile(wallets: Wallet[], filePath: string): void {
        const output = wallets
            .map(wallet => (
                // `助记词: ${wallet.seedPhrase}\n` +
                // `私钥: ${wallet.privateKey}\n` +
                // `地址: ${wallet.address}\n` +
                // '-'.repeat(50)
                `${wallet.privateKey}`
                // `地址: ${wallet.address}`
            ))
            .join('\n');

        fs.writeFileSync(filePath, output, 'utf-8');
    }

    /**
     * 读取
     */
    readerRun(): void {
        try {
            const SEED_PHRASES_FILE = path.resolve(__dirname, "../../../data", 'seed_phrases.txt');
            // 从文件读取助记词
            const seedPhrases = this.loadSeedPhrases(SEED_PHRASES_FILE);

            // 批量生成钱包
            const wallets = this.batchGenerateWallets(seedPhrases);
            // 配置参数
            const OUTPUT_FILE = path.resolve(__dirname,"../../../data",'wallets.txt');
            console.log(`OUTPUT_FILE:${OUTPUT_FILE}`);
            // 保存结果到文件
            this.saveWalletsToFile(wallets, OUTPUT_FILE);
            console.log(`已生成 ${wallets.length} 个钱包，结果保存到 ${OUTPUT_FILE}`);
        } catch (error) {
            const e = error as Error; // 类型断言
            console.error(`执行失败: ${e.message}`);
        }
    }

    /**
     * 创建新钱包
     */
    runNewWallet(count: number, strength: 128 | 256 = 128): void {
        try {
            // 创建新的钱包（批量）
            const wallets = this.batchGenerateNewEthWallets(count, strength);
            // 保存结果到文件
            const PHRASES_FILE = path.resolve(__dirname, "../../../data", 'seed_phrases2.txt');
            const output = wallets
            .map(wallet => (
                // `助记词: ${wallet.seedPhrase}\n` +
                // `私钥: ${wallet.privateKey}\n` +
                // `地址: ${wallet.address}\n` +
                // '-'.repeat(50)
                `${wallet.seedPhrase}`
            ))
            .join('\n');
            // 保存结果到文件
            fs.writeFileSync(PHRASES_FILE, output, 'utf-8');
            

            // 保存公钥地址
            const PUBLIC_FILE = path.resolve(__dirname, "../../../data", 'publick_key.txt');
            const output2 = wallets
            .map(wallet => (
                // `助记词: ${wallet.seedPhrase}\n` +
                // `私钥: ${wallet.privateKey}\n` +
                // `地址: ${wallet.address}\n` +
                // '-'.repeat(50)
                `${wallet.address}`
            ))
            .join('\n');
            // 保存结果到文件
            fs.writeFileSync(PUBLIC_FILE, output2, 'utf-8');
            
            console.log(`已生成 ${wallets.length} 个钱包，结果保存到`);
        } catch (error) {
            const e = error as Error; // 类型断言
            console.error(`执行失败: ${e.message}`);
        }
    }

}
