/**
 * 自动化工作流任务
 */
import * as path from 'path';
import * as fs from 'fs';
import { appendResultToFile,createTextFile,checkDirExists,importFromFile,readerFromFile} from '../common/fileUtils';
import { delay, getCurrentDateString,getRandomElement,getUniqueElementsWithIndex,removeByReference,
  getRandomInteger,getRandomValuesFromArray
} from '../common/utils';
import { timeout } from '../common/decoratorsUtils';
import { SomniaAutomation } from '../services/flow/somnia.flow';
// import { generateQuestions } from '../common/generateQuestions'; // 问题库
import { globalState,globalReferralCode } from "../globalState";


class AutoworkFlowsTaskExecutor {
  
    private inputFile: string;   // 读取私钥（任务所有私钥）
    private outputFile: string;  // 当日已经完成任务得私钥
    private sentKeyAddressFile: string; // 发送地址文件路径

    private fullPrivateKeys:string[];
    private privateKeys: [string,number][]; // 等待执行得私钥列表
    private proxies: string[];   // 静态代理
    private sendAddress: [string,number][];  // 发送地址（未使用得地址）

    /**
     * 构造函数
     * @param inputFile 私钥路径
     * @param outputFile 执行记录路径
     */
    constructor(inputFile: string, outputFile: string,sendAddressFile: string) {
      this.inputFile = inputFile;
      this.outputFile = outputFile;
      this.sentKeyAddressFile = sendAddressFile;

      this.fullPrivateKeys = []; // 所有任务私钥
      this.privateKeys = [];  // 当日未执行任务得私钥
      this.proxies = []; // 所有代理信息
      this.sendAddress = []; // 发送地址
    }
  
    // 初始化：读取私钥
    async initialize(): Promise<void> {
        //-----------------------------------------------------------------------
        // 读取私钥文件
        var fullPrivateFilePath = path.join(__dirname, '..','..', 'private_keys.txt');
        console.log(`读取私钥文件路径：${fullPrivateFilePath}`);
        const fullPrivateFilePathExist = await checkDirExists(fullPrivateFilePath);
        console.log(`私钥文件路径存在验证:${fullPrivateFilePathExist}`);
        if(!fullPrivateFilePathExist){
          // 如果不存在,则获取目录层级下面的的代理配置文件
          fullPrivateFilePath = this.inputFile;  // 第二优先选项: 读取项目定制私钥文件
        }
        // 抽取私钥文件的数据
        var input = await importFromFile(fullPrivateFilePath);
        // 输出目录可能不存在
        const outputFileExist = checkDirExists(this.outputFile);
        if(!outputFileExist){
          // 创建私钥执行文件
          await createTextFile(this.outputFile,"");
        }
        // 读取已经执行过的私钥文件
        const output = await importFromFile(this.outputFile);
        // 对比两个数组，只获取没有执行任务计划的数据
        input = input.filter(item => item !== "");  // 去除空行
        this.fullPrivateKeys = input;
        console.log(`读取到私钥个数： ${this.fullPrivateKeys.length} `);

        // 需要找到原数组中的索引
        this.privateKeys = getUniqueElementsWithIndex(this.fullPrivateKeys,output) as [string,number][];
        console.log(`未执行任务的私钥加载完毕, 剩余待执行私钥个数： ${this.privateKeys.length}`);
        //-----------------------------------------------------------------------

        //-----------------------------------------------------------------------
        // ## 检测是否代理文件是否存在
        var proxyFilePath = path.join(__dirname, '..','..', 'proxies.txt');
        console.log(`代理文件路径：${proxyFilePath}`);
        const proxyFilePathExist = await checkDirExists(proxyFilePath);
        console.log(`代理文件存在验证:${proxyFilePathExist}`);
        if(!proxyFilePathExist){
          // 如果不存在,则获取目录层级下面的的代理配置文件
          proxyFilePath = path.join(__dirname, '..','data', 'proxies.txt');
        }
        // 抽取代理配置文件的数据
        var proxies = await importFromFile(proxyFilePath);
        // 需要排除空字符串得内容
        proxies = proxies.filter(item => item !== "");
        this.proxies = proxies;
        console.log(`获取到的代理个数：${this.proxies.length}`);
        console.log(`读取到当日未完成任务得私钥个数： ${this.privateKeys.length}`);
        //-----------------------------------------------------------------------

        // 所有地址
        var allAddressPath = path.join(__dirname,'../','data', 'task', `somnia_address.txt`);
        // 私钥与发送地址绑定表
        var allAddress = await importFromFile(allAddressPath) as string[];
        // 需要排除空字符串得内容
        allAddress = allAddress.filter(item => item !== "");
        // 读取已经使用得地址
        var sentAddresses = await importFromFile(this.sentKeyAddressFile) as string[];
        sentAddresses = sentAddresses.filter(item => item !== ""); 
        // 保存记录格式
        this.sendAddress = getUniqueElementsWithIndex(allAddress, sentAddresses) as [string,number][];
        
        // this.sendAddress = rows.map((item) => JSON.parse(item) as [string,string] ); 
        
    }
      
    // 执行单个任务
    async runSingleTask(selKey:[string,number],selAddress:[string,number]): Promise<boolean> {
      // 工作流客户端
      const cliet = new SomniaAutomation();    
      // 抽取私钥
      const privateKey = selKey[0];
      console.log(`执行任务,selKey:${JSON.stringify(selKey)}`);
      // 抽取发送地址
      const address = selAddress[0];
      console.log(`执行任务,selAddress:${ JSON.stringify(selAddress) }`);
      
      // 代理模式：
      // 使用系统网络：proxies填写空数据即可
      // 动态代理：代理数量大于1，小于私钥数量
      // 固定代理：proxies数量=私钥数据数量
      var proxyStr = "";
      if(this.proxies.length >= this.fullPrivateKeys.length){
        proxyStr = this.proxies[selKey[1]];  // 固定代理模式
        console.log(`代理模式：固定代理`);
      } else if(this.proxies.length > 0){
        // 动态代理，随机获取一个代理即可（如果配置多个代理，一般配置一个即可）
        proxyStr = getRandomElement(this.proxies); // 随机获取一个
        console.log(`代理模式：动态代理`);
      } else {
        // 否则，就是不使用代理（默认使用系统网络，系统可能使用固定代理）
        console.log(`代理模式：使用系统网络`);
      }
      
      console.log(`代理信息: ${proxyStr}`);
      // 下次任务清理用户缓存（执行新得任务）
      globalState.WALLET_IMPORT_STATE_KEY = ""; 

      // 执行任务
      var result = await cliet.run(privateKey,proxyStr,[address]); // 结果如是ok，则不需要重试      
      
      // 执行结果如果不是 ok，则表示程序未能正常结束
      if(result == "ok") {
          // 将结果写入文件中
          await appendResultToFile(this.outputFile, privateKey);
          // 发送地址也同样写一份
          await appendResultToFile(this.sentKeyAddressFile, address);  // 一对一绑定发送地址即可
      }
      // 不管任务是否执行成功，根据对象删除索引（本次任务已经执行，让其他任务继续）
      await removeByReference(this.privateKeys,selKey);
      // 删除发送地址记录
      await removeByReference(this.sendAddress,selAddress)
      
      return true; // 任务成功，返回 true
    }
  
    // 批量执行所有任务
    async runAllTasks(): Promise<void> {
      let hasMoreTasks = true;
      // 任务执行完毕，开始循环执行
      while (hasMoreTasks) {
        // 获取私钥列表（未执行）
        const remainingKeys = this.privateKeys;
        // 随机抽取一个当日未执行得任务得私钥，需要对应的索引
        const selKey = getRandomElement(remainingKeys);
        // const selected = remainingKeys[4];  // 测试用固定私钥测试

        // 找到匹配的address
        const selAddress = getRandomElement(this.sendAddress);
        // 可能找不到任务列表了
        if (!selKey) {
          console.log('所有私钥已执行完毕');
          hasMoreTasks = false; // 无剩余任务，返回 false
          continue;
        }
        
        // 循环执行任务
        await this.runSingleTask(selKey,selAddress);
        
        await delay(1000); // 模拟任务间隔
      }
      console.log('所有任务执行完成');
      await delay(5*60*1000); // 模拟任务间隔
    }
  }
  
  // 主函数
  export async function runSomniaAutoFlow() {
    
    // 读取文件
    const inputFile = path.join(__dirname, '../','data','task', 'somnia_keys.txt');
    const outputFile = path.join(__dirname,'../','data', 'task', `somnia.${getCurrentDateString()}.txt`);
    const sendKeyAddressFile = path.join(__dirname,'../','data', 'task', `somnia_keys_address.txt`);

    const executor = new AutoworkFlowsTaskExecutor(inputFile, outputFile,sendKeyAddressFile);
    await executor.initialize();
    await executor.runAllTasks();
    console.log('任务已经执行结束...');
    console.log('--------------------------------------------------------------------');
    return;
  }


