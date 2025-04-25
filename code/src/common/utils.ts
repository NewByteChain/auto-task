
/**
 * 休眠函数
 * @param {*} ms 休眠时长，单位：毫秒
 * @returns 
 */
async function delay (ms:number){
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 符文名称分隔符显示处理
 * @param {*} bitField 
 * @param {*} runeName 
 * @returns 
 */
function addSeparators (bitField:any, runeName:any) {
    let result = '';
    let mask = 1; // 从最不重要的位开始
  
    for (let i = 0; i < runeName.length; i++) {
      // 检查当前位是否为1
      if ((bitField & mask) !== 0) {
        result += runeName[i] + '•'; // 在字符之间添加间隔符
      } else {
        result += runeName[i];
      }
      mask <<= 1; // 移动到下一个更重要的位
    }
  
    return result.trim(); // 移除最后一个不必要的空格（如果有的话）
}


/**
 * 10进制转2进制
 * @param {*} decimal 十进制数
 * @returns 
 */
function decimalToBinary (decimal:any) {
    // 确保输入的是一个整数
    if (!Number.isInteger(decimal)) {
        return "请输入一个整数。";
    }

    // 如果输入的是负数，可以先处理成正数，然后最后再加上负号
    let isNegative = false;
    if (decimal < 0) {
        isNegative = true;
        decimal = Math.abs(decimal);
    }

    let binary = ""; // 用来存储二进制结果的字符串

    // 当十进制数大于0时，不断进行除以2的操作，取余数作为二进制位，直到十进制数变为0为止
    while (decimal > 0) {
        binary = (decimal % 2) + binary; // 取余数并将其加到二进制字符串的前面
        decimal = Math.floor(decimal / 2); // 更新十进制数，除以2并向下取整
    }

    // 如果是负数，需要加上负号
    if (isNegative) {
        binary = "-" + binary;
    }

    return binary; // 返回二进制表示的字符串
}

/**
 * 判断当前系统时间（0时区设置）是否为东八区0点-8点
 * @returns 
 */
function isInTimeRange() {
    // 获取当前 UTC 时间
    const now = new Date();

    // 将当前时间转换为东八区时间
    const utcOffset = 8 * 60; // 东八区的分钟偏移量
    const localTime = new Date(now.getTime() + utcOffset * 60 * 1000);

    // 获取东八区的小时
    const hours = localTime.getUTCHours();

    // // 判断是否在 0 点到 8 点之间
    // return hours >= 0 && hours < 8;

     // 判断是否在 23 点到次日 8 点之间
     return (hours === 23 || hours < 8);
}

/**
 * 检测是否存在对象key存在
 * @param {*} obj 对象
 * @param {*} key key
 * @returns 
 */
function hasKey (obj:any, key:string) {
    // 检查当前对象是否为对象类型
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }

    // 检查当前对象是否包含目标键
    if (obj.hasOwnProperty(key)) {
        return true;
    }

    // 遍历对象的每个属性
    for (let k in obj) {
        if (obj.hasOwnProperty(k)) {
            // 递归检查嵌套对象
            if (hasKey(obj[k], key)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * 根据os.platform()返回的平台信息，判断当前操作系统
 * @param platform 
 */
function getCurrentOsName (platform:string):string {
    // 'darwin': macOS
    // 'win32': Windows
    // 'linux': Linux
    // 'freebsd': FreeBSD
    // 'sunos': SunOS
    // 'aix': AIX
    // 'openbsd': OpenBSD
    // 'android': Android
    // 'cygwin': Cygwin (Windows 环境下的类 Unix 环境)
    // 'win64': 64 位 Windows（在某些情况下可能会返回）

    switch (platform) {
        case 'darwin':
            platform = 'macos';
            console.log('当前操作系统是 macOS');
            return platform;
        case 'win32':
        case 'win64':
            platform = 'windows';
            console.log('当前操作系统是 Windows');
            return platform;
        case 'linux':
            platform = 'linux';
            console.log('当前操作系统是 Linux');
            return platform;
        default:
            console.log(`当前操作系统，${platform}`);
            return platform;
    }
}

/**
 * 获取随机整数
 * @param min 随机最小数
 * @param max 随机最大数
 * @returns 
 */
function getRandomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


/**
 * 使用 Fisher-Yates 算法随机打乱数组
 * @param array 要打乱的数组（会被原地修改）
 * @returns 打乱后的数组（引用同一数组）
 */
function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // 在 [0, i] 范围内随机选择一个索引
      [array[i], array[j]] = [array[j], array[i]]; // 交换元素
    }
    return array;
}


/**
 * 将字符串转换成boolean类型
 * @param value 
 * @returns 
 */
function strToBool(value: string): boolean {
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
        return true;
    } else if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
        return false;
    }
    throw new Error(`Invalid boolean string: ${value}`);
}

/**
 * 将字符串的超大数字转换成BigInt
 * @param num 字符串的整数，如果存在小数点，则自动去掉小数点
 * @returns 
 */
function convertToBigInt(num:string) {
    // 去掉小数点及其后面的部分
    const integerPart = num.split('.')[0]; // 获取小数点前的部分
    return BigInt(integerPart); // 转换为 BigInt
}


/**
 * 将列表分割成指定大小的块
 * @param lst 要分割的数组
 * @param chunkSize 每块的大小，默认 90
 * @returns 分割后的数组列表
 */
function splitList<T>(lst: T[], chunkSize: number = 90): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < lst.length; i += chunkSize) {
      result.push(lst.slice(i, i + chunkSize));
    }
    return result;
}

/**
 * 检查并格式化代理列表
 * @param proxies 代理字符串数组
 * @returns 格式化后的代理数组，或 false 如果格式无效
 */
function checkProxyFormat(proxies: string[]): string[] | false {
    const formatted_proxies: string[] = [];
    const protocols = ['http://', 'https://', 'socks://', 'socks4://', 'socks5://'];
  
    for (const proxy of proxies) {
      let cleanedProxy = proxy;
  
      // Step 1: 去除协议前缀
      for (const protocol of protocols) {
        if (cleanedProxy.startsWith(protocol)) {
          cleanedProxy = cleanedProxy.slice(protocol.length);
          break;
        }
      }
  
      // Step 2: 检查和转换格式
      if (cleanedProxy.includes('@')) {
        // 已经是 user:pass@ip:port 格式
        formatted_proxies.push(cleanedProxy);
      } else {
        // 可能是 ip:port:user:pass 格式
        const parts = cleanedProxy.split(':');
        if (parts.length === 4) {
          const [ip, port, user, password] = parts;
          const formatted_proxy = `${user}:${password}@${ip}:${port}`;
          formatted_proxies.push(formatted_proxy);
        } else {
          console.warn(`Unable to parse proxy format: ${proxy}`);
          return false;
        }
      }
    }
  
    return formatted_proxies;
}


/**
 * 将proxy代理url结构化输出
 * @param url 
 * @returns 
 */
function parseProxyUrl(url: string): any | null {
    // const regex = /^(?<protocol>[^:]+):\/\/(?<username>[^:]+):(?<password>[^@]+)@(?<host>[^:]+):(?<port>\d+)$/;
    const regex = /^(?<protocol>[^:]+):\/\/(?<username>[^:]+):(?<password>[^@]+)@(?<host>[a-zA-Z0-9.-]+):(?<port>\d+)$/;
    const match = url.match(regex);

    if (match && match.groups) {
        return {
            protocol: match.groups.protocol,
            host: match.groups.host,
            port: match.groups.port,
            username: match.groups.username,
            password: match.groups.password,
        };
    }

    return null; // 如果没有匹配，返回 null
}

/**
 * 从一个数组对象中随机抽取一个对象
 * @param array 
 * @returns 
 */
function getRandomElement<T>(array: T[]): T {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

/**
 * 从一个数组对象中随机抽取一个对象，同时返回索引
 * @param array 
 * @returns 
 */
function getRandomElementAndIndex<T>(array: T[]): [T,number] {
    const randomIndex = Math.floor(Math.random() * array.length);
    return [array[randomIndex],randomIndex];
}

/**
 * 找出 A 中不在 B 中的元素及其索引
 * @param arrayA 
 * @param arrayB 
 * @returns 
 */
function getUniqueElementsWithIndex<T>(
    arrayA: T[],
    arrayB: T[]
): [T, number][] {
    // 使用 Set 优化查找性能
    const setB = new Set(arrayB);
    
    // 过滤并映射为元组 [value, index]
    const result: [T, number][] = arrayA
        .map((value, index) => [value, index] as [T, number])
        .filter(([value]) => !setB.has(value));
    
    return result;
}

/**
 * 根据对象删除索引
 * @param array 
 * @param item 
 * @returns 
 */
function removeByReference<T>(array: T[], item: T): T[] {
    const index = array.indexOf(item);
    if (index === -1) {
        throw new Error('对象未找到');
    }
    array.splice(index, 1);
    return array;
}


/**
 * 从一个数组中抽取任意数量得对象
 * @param array 
 * @param count 
 * @returns 
 */
function getRandomValuesFromArray<T>(array: T[], count: number): T[] {
    const result: T[] = [];
    const usedIndices: Set<number> = new Set();

    while (result.length < count && result.length < array.length) {
        const randomIndex = Math.floor(Math.random() * array.length);
        if (!usedIndices.has(randomIndex)) {
            result.push(array[randomIndex]);
            usedIndices.add(randomIndex);
        }
    }

    return result;
}

/**
 * 生成日期格式化字符串
 * @returns 
 */
function getCurrentDateString(): string {
    const date = new Date();
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以要加1
    const day = String(date.getDate()).padStart(2, '0');

    // 格式化为 YYYY-MM-DD 字符串
    return `${year}-${month}-${day}`;
}

/**
 * 从URL获取参数值
 * @param url 
 * @param paramName 
 * @returns 
 */
function getUrlParameter(url: string, paramName: string): string | null {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      return params.get(paramName);
    } catch (error) {
      console.error('URL 解析失败:', error);
      return null;
    }
  }

/**
 * 获取短地址
 * @param address 
 * @param string 
 * @returns 
 */
function getShortAddress(address:string) {
    return address.slice(0, 6) + "..." + address.slice(-4);
}

/**
 * 获取短hash
 * @param hash 
 * @returns 
 */
function getShortHash(hash:string) {
    return hash.slice(0, 6) + "..." + hash.slice(-4);
}

export {
    // 休眠函数
    delay,
    // 符文名称分隔符显示处理
    addSeparators,
    // 10进制转2进制
    decimalToBinary,
    //判断当前系统时间（0时区设置）是否为东八区0点-8点
    isInTimeRange,
    // 检测是否存在对象key存在
    hasKey,
    // 根据os.platform()返回的平台信息，判断当前操作系统
    getCurrentOsName,
    
    // 获取随机整数
    getRandomInteger,
    // 从一个数组对象中随机抽取一个对象
    getRandomElement,
    // 从一个数组对象中随机抽取一个对象，同时返回索引
    getRandomElementAndIndex,
    // 从一个数组中抽取任意数量得对象
    getRandomValuesFromArray,
    // 找出 A 中不在 B 中的元素及其索引
    getUniqueElementsWithIndex,
    // 根据对象删除索引
    removeByReference,

    // 使用 Fisher-Yates 算法随机打乱数组
    shuffleArray,
    // 将列表分割成指定大小的块
    splitList,
    // 将字符串转换成boolean类型
    strToBool,
    // 将字符串的超大数字转换成BigInt
    convertToBigInt,
    // 生成日期格式化字符串
    getCurrentDateString,

    // 将proxy代理url结构化输出
    parseProxyUrl,
    // 检查并格式化代理列表
    checkProxyFormat,

    // 从URL获取参数值
    getUrlParameter,

    // 获取短地址
    getShortAddress,
    // 获取短hash
    getShortHash



}