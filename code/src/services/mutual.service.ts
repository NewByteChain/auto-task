import { SwapParams , MintParams} from "../interface/walletConfigs"; // 接口定义
import { MonadAutomation } from './flow/monad.page.data'; // Monad工作流
import { OctoAutomation } from './flow/swap.octo.trade';
import { MagicEdenAutomation } from './flow/magiceden.monad'; // OKX数据
import { BinanceAutomation } from './flow/cex.binance.trade'; // OKX数据
import { WalletHelper } from './wallet/wallet.bat';
import { monadBalancesQuery } from './wallet/wallet.bat.monad';
import * as walletBatSomnia  from './wallet/wallet.bat.somnia';
import { btcWalletQuery } from './wallet/wallet.bat.btc';
import * as walletTools from './wallet/wallet.tools';
import { queryBatchEthBalances,queryBatchEthPublickAddress } from './wallet/wallet.bat.eth';

// AdsPower工作流
import { IncentivAutomation } from './flow/adspower.incentiv.flow'; // AdsPower工作流

import { delay } from '../common/utils';
// import { timeout }  from '../common/decoratorsUtils';
import * as crypto from 'crypto';



/**
 * 测试Monad自动化
 * @returns 
 */
const monad = async () => {
  const automation = new MonadAutomation('okx'); // 可切换为 okx、metamask 或 phantom
   
   const swapParams: SwapParams = {
     fromToken: 'MON',
     toToken: 'DAK',
     amount: '0.1',
   };
   await automation.run();
}

/**
 * 查询somnia余额
 */
const somnia = async () => {
   await walletBatSomnia.balancesQuery();
}

/**
 * octo工作流
 * @returns 
 */
const octo = async () => {
  const client = new OctoAutomation('okx');
  // 执行
  client.run();
}


// magicEden
const me = async () => {
  const magicEden = new MagicEdenAutomation('metamask'); // 可切换为 okx、metamask 或 phantom
  
  await magicEden.run();
}

/**
 * 测试钱包批量操作
 */
const walletHelper = async () => {
  const walletHelper = new WalletHelper(); // 可切换为 okx、metamask 或 phantom
  // await walletHelper.run()
  await walletHelper.runNewWallet(1000,128);  // 创建钱包
}

/**
 * 获取币安交易所数据
 * @returns 
 */
const getBinanceTradeData = async () => {
  
    var targetUrl = 'https://www.binance.com/zh-CN/trade/BTC_USDT?type=spot';

    // 需要抓取多个ajax api数据接口
    var ajaxUrl = [
      `https://www.binance.com/api/v1/aggTrades`,     // 交易数据
      `https://www.binance.com/api/v3/uiKlines`       // K线图数据
    ] as any;

    const binanceAutomation = new BinanceAutomation();
    const data = await binanceAutomation.getBinanceTradeData(targetUrl,ajaxUrl);
    // 返回结果
    var result = {} as any;
    // 获取数据，根据键值对获取结果数据（实际网页输出api接口顺序不固定）
    result['trades'] = data[crypto.createHash('md5').update(ajaxUrl[0]).digest('hex')];
    result['uiKlines'] = data[crypto.createHash('md5').update(ajaxUrl[1]).digest('hex')];
    return result;
}

// Incentiv任务
const flowIncentivAutomation = async () => {
  const incentivAutomation = new IncentivAutomation();

  // ads浏览器参数
  const adsInfo = {

  }
  // 代理信息
  const proxyStr = '';
  // 执行
  await incentivAutomation.run(adsInfo,proxyStr);

}


// 使用示例
export async function getDexData (body:any) {

  /**
   * 钱包
   */
  // monad 领水查询
  // await monadBalancesQuery();

  // // ETH钱包
  const walletHelper = new WalletHelper(); // 可切换为 okx、metamask 或 phantom
  // 导出钱包工具
  await walletHelper.readerRun();
  // 创建钱包（助记词）
  // await walletHelper.runNewWallet(10000,128);  // 创建钱包


  // somnia(); // somnia钱包查询
  
  
  // BTC钱包查询
  // btcWalletQuery();



  /**
   * 自动化工作流程
   */

     
  // // OCTO auto mint
  // await octo();

  // klokapp auto mint
  // await klokapp();

  // 币安测试
  // const data = await getBinanceTradeData();
  // return data;


  //Magiceden auto mint
  // me();

  // await walletTools.readerProxiesArrayOutTxt();

  // // 查询ETH余额
  // await queryBatchEthBalances();

  // // 读取公钥地址列表
  // await queryBatchEthPublickAddress();


  await flowIncentivAutomation(); // AdsPower工作流
 

  return 'ok';
  
}
