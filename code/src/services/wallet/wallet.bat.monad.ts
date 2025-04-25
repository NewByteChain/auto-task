import Web3 from 'web3';
import * as bip39 from 'bip39';
import { hdkey } from 'ethereumjs-wallet';
import * as path from 'path';
import {importFromFile} from '../../common/fileUtils';
import { delay } from '../../common/utils';

// 配置 RPC 和 token 信息
// const RPC_URL = 'https://testnet-rpc2.monad.xyz/c5d85270948b26be3314bd0393299f4f4a5d56f4';
const RPC_URL = 'https://testnet-rpc.monad.xyz/';
const web3 = new Web3(RPC_URL);

// ERC-20 token 合约地址（替换为实际地址）
const TOKEN_CONTRACT_ADDRESS = '0x836047a99e11F376522B447bffb6e3495Dd0637c';

// ERC-20 ABI（仅包含 balanceOf 方法）

// EXPLORER_URL = "https://testnet.monadexplorer.com/tx/0x"
// RPC_URL = "https://testnet-rpc.monad.xyz/"
// # RPC_URL = "https://monad-testnet.drpc.org/" 

// TOKENS = {
//     "native": "native",  # MON
//     "DAK": "0x0F0BDEbF0F83cD1EE3974779Bcb7315f9808c714",
//     "YAKI": "0xfe140e1dCe99Be9F4F15d657CD9b7BF622270C50",
//     "CHOG": "0xE0590015A873bF326bd645c3E1266d4db41C4E6B",
// }

// ERC20 ABI for balance checking
const ERC20_ABI = [{"inputs":[],"name":"","outputs":null,"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"CheckpointUnorderedInsertion","outputs":null,"stateMutability":"","type":"error"},{"inputs":[],"name":"ECDSAInvalidSignature","outputs":null,"stateMutability":"","type":"error"},{"inputs":[{"internalType":"uint256","name":"length","type":"uint256"}],"name":"ECDSAInvalidSignatureLength","outputs":null,"stateMutability":"","type":"error"},{"inputs":[{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"ECDSAInvalidSignatureS","outputs":null,"stateMutability":"","type":"error"},{"inputs":[{"internalType":"uint256","name":"increasedSupply","type":"uint256"},{"internalType":"uint256","name":"cap","type":"uint256"}],"name":"ERC20ExceededSafeSupply","outputs":null,"stateMutability":"","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","outputs":null,"stateMutability":"","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","outputs":null,"stateMutability":"","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","outputs":null,"stateMutability":"","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","outputs":null,"stateMutability":"","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","outputs":null,"stateMutability":"","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","outputs":null,"stateMutability":"","type":"error"},{"inputs":[{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"ERC2612ExpiredSignature","outputs":null,"stateMutability":"","type":"error"},{"inputs":[{"internalType":"address","name":"signer","type":"address"},{"internalType":"address","name":"owner","type":"address"}],"name":"ERC2612InvalidSigner","outputs":null,"stateMutability":"","type":"error"},{"inputs":[{"internalType":"uint256","name":"timepoint","type":"uint256"},{"internalType":"uint48","name":"clock","type":"uint48"}],"name":"ERC5805FutureLookup","outputs":null,"stateMutability":"","type":"error"},{"inputs":[],"name":"ERC6372InconsistentClock","outputs":null,"stateMutability":"","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"currentNonce","type":"uint256"}],"name":"InvalidAccountNonce","outputs":null,"stateMutability":"","type":"error"},{"inputs":[],"name":"InvalidShortString","outputs":null,"stateMutability":"","type":"error"},{"inputs":[{"internalType":"uint8","name":"bits","type":"uint8"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"SafeCastOverflowedUintDowncast","outputs":null,"stateMutability":"","type":"error"},{"inputs":[{"internalType":"string","name":"str","type":"string"}],"name":"StringTooLong","outputs":null,"stateMutability":"","type":"error"},{"inputs":[{"internalType":"uint256","name":"expiry","type":"uint256"}],"name":"VotesExpiredSignature","outputs":null,"stateMutability":"","type":"error"},{"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","outputs":null,"stateMutability":"","type":"event"},{"inputs":[{"indexed":true,"internalType":"address","name":"delegator","type":"address"},{"indexed":true,"internalType":"address","name":"fromDelegate","type":"address"},{"indexed":true,"internalType":"address","name":"toDelegate","type":"address"}],"name":"DelegateChanged","outputs":null,"stateMutability":"","type":"event"},{"inputs":[{"indexed":true,"internalType":"address","name":"delegate","type":"address"},{"indexed":false,"internalType":"uint256","name":"previousVotes","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newVotes","type":"uint256"}],"name":"DelegateVotesChanged","outputs":null,"stateMutability":"","type":"event"},{"inputs":[],"name":"EIP712DomainChanged","outputs":null,"stateMutability":"","type":"event"},{"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","outputs":null,"stateMutability":"","type":"event"},{"inputs":[],"name":"CLOCK_MODE","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"burnFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint32","name":"pos","type":"uint32"}],"name":"checkpoints","outputs":[{"internalType":"struct Checkpoints.Checkpoint208","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"clock","outputs":[{"internalType":"uint48","name":"","type":"uint48"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"delegatee","type":"address"}],"name":"delegate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"delegatee","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"delegateBySig","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"delegates","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"eip712Domain","outputs":[{"internalType":"bytes1","name":"fields","type":"bytes1"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"version","type":"string"},{"internalType":"uint256","name":"chainId","type":"uint256"},{"internalType":"address","name":"verifyingContract","type":"address"},{"internalType":"bytes32","name":"salt","type":"bytes32"},{"internalType":"uint256[]","name":"extensions","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"timepoint","type":"uint256"}],"name":"getPastTotalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"timepoint","type":"uint256"}],"name":"getPastVotes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getVotes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"numCheckpoints","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]  as const;;

// 创建 token 合约实例
const tokenContract = new web3.eth.Contract(ERC20_ABI, TOKEN_CONTRACT_ADDRESS);

// 从助记词生成钱包地址
async function getAddressFromMnemonic(mnemonic: string, index: number = 0): Promise<string> {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const hdwallet = hdkey.fromMasterSeed(seed);
    const path = `m/44'/60'/0'/0/${index}`; // 使用标准的 Ethereum 派生路径
    const wallet = hdwallet.derivePath(path).getWallet();
    return wallet.getAddressString();
}

// 查询单个地址的 token 余额
async function getTokenBalance(address: string): Promise<string> {
    try {
        // 显式指定 balanceOf 返回类型为 string
        // const balance = await tokenContract.methods.balanceOf(address).call() as string;
        const balance = await web3.eth.getBalance(address);
        // 将余额从 wei 转换为可读单位（假设 token 有 18 位小数）
        return web3.utils.fromWei(balance, 'ether');
    } catch (error) {
        console.error(`Error fetching balance for ${address}:`, error);
        return '0';
    }
}

// 批量查询助记词钱包的 token 余额
async function batchQueryTokenBalances(mnemonics: string[]): Promise<{ address: string; balance: string }[]> {
    const results: { address: string; balance: string }[] = [];

    for (const mnemonic of mnemonics) {
        try {
            // 验证助记词有效性
            if (!bip39.validateMnemonic(mnemonic)) {
                console.error(`Invalid mnemonic: ${mnemonic}`);
                continue;
            }

            // 生成第一个地址（index = 0）
            const address = await getAddressFromMnemonic(mnemonic);
            await delay(Math.ceil(Math.random() * 1200) + 100); // 随机休眠：100ms-1300ms
            const balance = await getTokenBalance(address);

            results.push({ address, balance });
            console.log(`Mnemonic: ${mnemonic.slice(0, 10)}... | Address: ${address} | Balance: ${balance}`);
        } catch (error) {
            console.error(`Error processing mnemonic ${mnemonic.slice(0, 10)}...:`, error);
        }
    }

    return results;
}

/**
 * Monad批量余额查询
 */
export async function monadBalancesQuery() {
    // 使用示例
    const filePath = path.join(__dirname,'../../../data/', 'monad_mnemonics_01.txt'); // 确保路径正确
    console.log('Imported filePath:', filePath);

    let mnemonics = await importFromFile(filePath);
    console.log('Imported mnemonics:', mnemonics.length);

    // 实现余额查询

    console.log('Starting batch query...');
    const balances = await batchQueryTokenBalances(mnemonics);
    console.log('Results:', balances);
}

// runTest().catch(err => console.error('Test failed:', err));