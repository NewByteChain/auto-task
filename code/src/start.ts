import * as utils from './common/utils'; // 文件操作模块
import { Config } from './common/config';

// import * as winston from 'winston';
// import * as primp from 'primp'; // 假设 primp 支持 TypeScript
// import { Config, createClient } from '../utils/client';
// import { MonadXYZ } from './monad_xyz/instance';
// import { Gaszip } from './gaszip/instance';
// import { Memebridge } from './memebridge/instance';
// import { Apriori } from './apriori';
// import { Magma } from './magma/instance';
// import { Owlto } from './owlto/instance';
// import { Bima } from './bima/instance';
// import { MonadverseMint } from './monadverse_mint/instance';
// import { Shmonad } from './shmonad/instance';
// import { Orbiter } from './orbiter/instance';
// import { TestnetBridge } from './testnet_bridge/instance';
// import { WalletStats } from './help/stats';
// import { NadDomains } from './nad_domains/instance';
// import { Kintsu } from './kintsu/instance';
// import { Lilchogstars } from './lilchogstars_mint/instance';
// import { Demask } from './demask_mint/instance';
// import { Monadking } from './monadking_mint/instance';
// import { Nostra } from './nostra/instance';
// import { MagicEden } from './magiceden/instance';
// import { Aircraft } from './aircraft/instance';
// import { Dusted } from './dusted/instance';
// import { Frontrunner } from './frontrunner/instance';
// import { CexWithdraw } from './cex_withdrawal/instance';



export class Start {
  private session:  any | null = null;

  constructor(
    private accountIndex: number,
    private proxy: string,
    private privateKey: string,
    private discordToken: string,
    private twitterToken: string,
    private email: string,
    private config: Config
  ) {}

  async initialize(): Promise<boolean> {
    try {
    //   this.session = await createClient(this.proxy);
      return true;
    } catch (e) {
        console.error(`[${this.accountIndex}] | Error: ${e}`);
      return false;
    }
  }

  /**
   * 执行任务工作流
   * @returns 
   */
  async flow(): Promise<boolean> {

    // 暂时没有任务实现

    return false;

    // try {
    //   const monad = new MonadXYZ(
    //     this.accountIndex,
    //     this.proxy,
    //     this.privateKey,
    //     this.discordToken,
    //     this.config,
    //     this.session!
    //   );

    //   if (this.config.FLOW.TASKS.includes('farm_faucet')) {
    //     await monad.faucet();
    //     return true;
    //   }

    //   // 计划任务
    //   const plannedTasks: [number, string, string][] = [];
    //   const taskPlanMsg: string[] = [];
    //   let taskIndex = 1;

    //   // 循环任务列表，逐个任务执行
    //   for (const taskItem of this.config.FLOW.TASKS) {
    //     if (Array.isArray(taskItem)) {
    //       if (taskItem.every((item): item is string => typeof item === 'string')) {
    //         // 随机选择一个任务
    //         const selectedTask = taskItem[Math.floor(Math.random() * taskItem.length)];
    //         plannedTasks.push([taskIndex, selectedTask, 'random_choice']);
    //         taskPlanMsg.push(`${taskIndex}. ${selectedTask}`);
    //         taskIndex++;
    //       } else if (taskItem.every((item): item is string[] => Array.isArray(item))) {
    //         // 打乱并执行所有任务
    //         const shuffledTasks = [...taskItem].sort(() => Math.random() - 0.5);
    //         for (const subtask of shuffledTasks) {
    //           plannedTasks.push([taskIndex, subtask as any, 'shuffled_item']);
    //           taskPlanMsg.push(`${taskIndex}. ${subtask}`);
    //           taskIndex++;
    //         }
    //       }
    //     } else {
    //       plannedTasks.push([taskIndex, taskItem, 'single']);
    //       taskPlanMsg.push(`${taskIndex}. ${taskItem}`);
    //       taskIndex++;
    //     }
    //   }

    //   console.info(`[${this.accountIndex}] Task execution plan: ${taskPlanMsg.join(' | ')}`);

    //   for (const [i, task, taskType] of plannedTasks) {
    //     console.info(`[${this.accountIndex}] Executing task ${i}: ${task}`);
    //     await this.executeTask(task, monad);
    //     await this.sleep(task);
    //   }

    //   return true;
    // } catch (e) {
    //     console.error(`[${this.accountIndex}] | Error: ${e}`);
    //   return false;
    // }
  }

//   /**
//    * 任务执行函数
//    * @param task 
//    * @param monad 
//    */
//   private async executeTask(task: string, monad: MonadXYZ): Promise<void> {
//     const taskLower = task.toLowerCase();

//     switch (taskLower) {
//       case 'faucet':
//         await monad.faucet();
//         break;
//       case 'swaps':
//         await monad.swaps('swaps');
//         break;
//       case 'ambient':
//         await monad.swaps('ambient');
//         break;
//       case 'bean':
//         await monad.swaps('bean');
//         break;
//       case 'izumi':
//         await monad.swaps('izumi');
//         break;
//       case 'collect_all_to_monad':
//         await monad.swaps('collect_all_to_monad');
//         break;
//     //   case 'gaszip':
//     //     const gaszip = new Gaszip(this.accountIndex, this.proxy, this.privateKey, this.config);
//     //     await gaszip.refuel();
//     //     break;
//     //   case 'memebridge':
//     //     const memebridge = new Memebridge(this.accountIndex, this.proxy, this.privateKey, this.config);
//     //     await memebridge.refuel();
//     //     break;
//     //   case 'apriori':
//     //     const apriori = new Apriori(this.accountIndex, this.proxy, this.privateKey, this.config, this.session!);
//     //     await apriori.execute();
//     //     break;
//     //   case 'magma':
//     //     const magma = new Magma(this.accountIndex, this.proxy, this.privateKey, this.config, this.session!);
//     //     await magma.execute();
//     //     break;
//     //   case 'owlto':
//     //     const owlto = new Owlto(this.accountIndex, this.proxy, this.privateKey, this.config, this.session!);
//     //     await owlto.deployContract();
//     //     break;
//     //   case 'bima':
//     //     const bima = new Bima(this.accountIndex, this.proxy, this.privateKey, this.config, this.session!);
//     //     await bima.getFaucetTokens();
//     //     await this.sleep('bima_faucet');
//     //     if (this.config.BIMA.LEND) await bima.lend();
//     //     break;
//     //   case 'monadverse':
//     //     const monadverseMint = new MonadverseMint(this.accountIndex, this.proxy, this.privateKey, this.config, this.session!);
//     //     await monadverseMint.mint();
//     //     break;
//     //   case 'shmonad':
//     //     const shmonad = new Shmonad(this.accountIndex, this.proxy, this.privateKey, this.config, this.session!);
//     //     await shmonad.swaps();
//     //     break;
//     //   case 'orbiter':
//     //     const orbiter = new Orbiter(this.accountIndex, this.proxy, this.privateKey, this.config, this.session!);
//     //     await orbiter.bridge();
//     //     break;
//     //   case 'testnet_bridge':
//     //     const testnetBridge = new TestnetBridge(this.accountIndex, this.proxy, this.privateKey, this.config, this.session!);
//     //     await testnetBridge.execute();
//     //     break;
//     //   case 'logs':
//     //     const walletStats = new WalletStats(this.config, this.proxy);
//     //     await walletStats.getWalletStats(this.privateKey, this.accountIndex);
//     //     break;
//     //   case 'nad_domains':
//     //     const nadDomains = new NadDomains(this.accountIndex, this.proxy, this.privateKey, this.config, this.session!);
//     //     await nadDomains.registerRandomDomain();
//     //     break;
//     //   case 'kintsu':
//     //     const kintsu = new Kintsu(this.accountIndex, this.proxy, this.privateKey, this.config, this.session!);
//     //     await kintsu.execute();
//     //     break;
//     //   case 'lilchogstars':
//     //     const lilchogstars = new Lilchogstars(this.accountIndex, this.proxy, this.privateKey, this.config, this.session!);
//     //     await lilchogstars.mint();
//     //     break;
//     //   case 'demask':
//     //     const demask = new Demask(this.accountIndex, this.proxy, this.privateKey, this.config, this.session!);
//     //     await demask.mint();
//     //     break;
//     //   case 'monadking':
//     //     const monadking = new Monadking(this.accountIndex, this.proxy, this.privateKey, this.config);
//     //     await monadking.mint();
//     //     break;
//     //   case 'monadking_unlocked':
//     //     const monadkingUnlocked = new Monadking(this.accountIndex, this.proxy, this.privateKey, this.config);
//     //     await monadkingUnlocked.mintUnlocked();
//     //     break;
//     //   case 'nostra':
//     //     const nostra = new Nostra(this.accountIndex, this.proxy, this.privateKey, this.config, this.session!);
//     //     await nostra.execute();
//     //     break;
//     //   case 'magiceden':
//     //     const magicEden = new MagicEden(this.accountIndex, this.proxy, this.config, this.privateKey, this.session!);
//     //     await magicEden.mint();
//     //     break;
//     //   case 'aircraft':
//     //     const aircraft = new Aircraft(this.accountIndex, this.proxy, this.privateKey, this.config, this.session!);
//     //     await aircraft.execute();
//     //     break;
//     //   case 'dusted':
//     //     const dusted = new Dusted(this.accountIndex, this.proxy, this.privateKey, this.twitterToken, this.config, this.session!);
//     //     await dusted.execute();
//     //     break;
//     //   case 'frontrunner':
//     //     const frontrunner = new Frontrunner(this.accountIndex, this.proxy, this.privateKey, this.config, this.session!);
//     //     await frontrunner.sendTransaction();
//     //     break;
//     //   case 'cex_withdrawal':
//     //     const cexWithdraw = new CexWithdraw(this.accountIndex, this.privateKey, this.config);
//     //     await cexWithdraw.withdraw();
//     //     break;
//     }
//   }

  /**
   * 随机休眠
   * @param taskName 
   */
  private async sleep(taskName: string): Promise<void> {
    const pause = Math.floor(Math.random() * (this.config.SETTINGS.RANDOM_PAUSE_BETWEEN_ACTIONS[1] - this.config.SETTINGS.RANDOM_PAUSE_BETWEEN_ACTIONS[0] + 1)) + this.config.SETTINGS.RANDOM_PAUSE_BETWEEN_ACTIONS[0];
    console.info(`[${this.accountIndex}] Sleeping ${pause} seconds after ${taskName}`);
    // 休眠
    await utils.delay(pause * 1000);
  }
}