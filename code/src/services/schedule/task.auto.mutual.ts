// 导入模块
import { OctoAutomation } from '../flow/swap.octo.trade';
import { runKlokappAutoFlow } from '../flow.klokapp.task';
import { runCoreskyAutoFlow } from '../flow.coresky.task';
import { runSomniaAutoFlow } from '../flow.somnia.task';
import { runMahojinAutoFlow } from '../flow.mahojin.task';
import { runSatsterminalAutoFlow } from '../flow.satsterminal.task';

/**
 * 任务状态标志
 */
let TASK_STATUS_OCTO_AUTO_MINT: boolean = false; 
let TASK_STATUS_KLOKAPP_AUTO_MINT: boolean = false;
let TASK_STATUS_CORESKY_AUTO_MINT: boolean = false;
let TASK_STATUS_SOMNIA_AUTO_MINT: boolean = false;
let TASK_STATUS_MAHOJIN_AUTO_MINT: boolean = false;
let TASK_STATUS_SATSTERMINAL_AUTO_MINT: boolean = false;

/**
 * Octo Auto Swap
 */
export async function taskOctoAutoSwap(): Promise<void> {
    // console.log(`进入taskOctoAutoMint()...`)
    const client = new OctoAutomation('okx'); // 可切换为 okx、metamask 或 phantom
    // 判断任务是否正在执行过程中
    if(TASK_STATUS_OCTO_AUTO_MINT) {
        // 正在执行
        // console.warn(`[taskOctoAutoMint]已有任务正在执行,当前任务自动退出!!!`);
        return;
    }
    TASK_STATUS_OCTO_AUTO_MINT = true;
    try {
        // 执行拉取数据任务
        await client.run();
        // 解锁
        TASK_STATUS_OCTO_AUTO_MINT = false;
    } catch(ex) {        
        // console.error(`[taskOctoAutoMint]任务执行遭遇错误,当前任务自动退出`);
        TASK_STATUS_OCTO_AUTO_MINT = false;
        throw ex;
    }

}

/**
 * Klokapp Auto Mint
 */
export async function taskKlokappAutoFlow(): Promise<void> {
    // console.log(`进入[taskKlokappAutoMint()]...`)
    // const client = new KlokappAutomation('okx'); // 可切换为 okx、metamask 或 phantom

    // 判断任务是否正在执行过程中
    if(TASK_STATUS_KLOKAPP_AUTO_MINT) {
        // 正在执行
        // console.warn(`[taskKlokappAutoMint]已有任务正在执行,当前任务自动退出!!!`);
        return;
    }
    TASK_STATUS_KLOKAPP_AUTO_MINT = true;
    try {
        // 执行拉取数据任务
        await runKlokappAutoFlow();
        // 解锁
        TASK_STATUS_KLOKAPP_AUTO_MINT = false;
    } catch(ex) {        
        // console.error(`[taskKlokappAutoMint]任务执行遭遇错误,当前任务自动退出`);
        TASK_STATUS_KLOKAPP_AUTO_MINT = false;
        throw ex;
    }
}

/**
 * Coresky Auto Flow
 * @returns 
 */
export async function taskCoreskyAutoFlow(): Promise<void> {
    // console.log(`进入[taskKlokappAutoMint()]...`)
    // const client = new KlokappAutomation('okx'); // 可切换为 okx、metamask 或 phantom

    // 判断任务是否正在执行过程中
    if(TASK_STATUS_CORESKY_AUTO_MINT) {
        // 正在执行
        // console.warn(`[taskKlokappAutoMint]已有任务正在执行,当前任务自动退出!!!`);
        return;
    }
    TASK_STATUS_CORESKY_AUTO_MINT = true;
    try {
        // 执行拉取数据任务
        await runCoreskyAutoFlow();
        // 解锁
        TASK_STATUS_CORESKY_AUTO_MINT = false;
    } catch(ex) {        
        // console.error(`[taskKlokappAutoMint]任务执行遭遇错误,当前任务自动退出`);
        TASK_STATUS_CORESKY_AUTO_MINT = false;
        throw ex;
    }
}


/**
 * Somnia Auto Flow
 * @returns 
 */
export async function taskSomniaAutoFlow(): Promise<void> {
    // 判断任务是否正在执行过程中
    if(TASK_STATUS_SOMNIA_AUTO_MINT) {
        return;
    }
    TASK_STATUS_SOMNIA_AUTO_MINT = true;
    try {
        // 执行拉取数据任务
        await runSomniaAutoFlow();
        // 解锁
        TASK_STATUS_SOMNIA_AUTO_MINT = false;
    } catch(ex) {        
        // console.error(`[taskKlokappAutoMint]任务执行遭遇错误,当前任务自动退出`);
        TASK_STATUS_SOMNIA_AUTO_MINT = false;
        throw ex;
    }
}

/**
 * Mahojin Auto Flow
 * @returns 
 */
export async function taskMahojinAutoFlow(): Promise<void> {
    // 判断任务是否正在执行过程中
    if(TASK_STATUS_MAHOJIN_AUTO_MINT) {
        return;
    }
    TASK_STATUS_MAHOJIN_AUTO_MINT = true;
    try {
        // 执行拉取数据任务
        await runMahojinAutoFlow();
        // 解锁
        TASK_STATUS_MAHOJIN_AUTO_MINT = false;
    } catch(ex) {        
        // console.error(`[taskMahojinAutoFlow]任务执行遭遇错误,当前任务自动退出`);
        TASK_STATUS_MAHOJIN_AUTO_MINT = false;
        throw ex;
    }
}


/**
 * Satsterminal Auto Flow
 * @returns 
 */
export async function taskSatsterminalAutoFlow(): Promise<void> {
    // 判断任务是否正在执行过程中
    if(TASK_STATUS_SATSTERMINAL_AUTO_MINT) {
        return;
    }
    TASK_STATUS_SATSTERMINAL_AUTO_MINT = true;
    try {
        // 执行拉取数据任务
        await runSatsterminalAutoFlow();
        // 解锁
        TASK_STATUS_SATSTERMINAL_AUTO_MINT = false;
    } catch(ex) {
        TASK_STATUS_SATSTERMINAL_AUTO_MINT = false;
        throw ex;
    }
}