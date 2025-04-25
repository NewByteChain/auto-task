
// import * as fs from 'fs';
import * as fsPromises from 'fs/promises';  // 异步方法，避免阻塞
import * as path from 'path';

// 定义文件夹信息的接口
interface FolderInfo {
    name: string;
    sizeInBytes: number;
    sizeInMB: string;
  }


/**
 * 从文件中导入内容
 * 例如：批量从txt文件中读取助记词
 * @param filePath 
 * @returns 
 */
async function importFromFile(filePath: string): Promise<string[]> {
    try {
        // 读取文件内容
        const data = await fsPromises.readFile(filePath, 'utf-8') as string;
        // 按行分割并去除空行
        const texts = await data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        return texts;
    } catch (error) {
        console.error('Error reading the file:', error);
        return [];
    }
}

/**
 * 从指定文件路径中读取内容
 * @param filePath 文件路径
 * @returns 
 */
async function readerFromFile(filePath: string): Promise<string> {
  try {
      // 读取文件内容
      const texts = await fsPromises.readFile(filePath, 'utf-8') as string;
      return texts;
  } catch (error) {
      console.error('Error reading the file:', error);
      return "";
  }
}

/**
 * 将结果追加写入文件中
 * @param filePath 
 * @param result 
 */
async function appendResultToFile(filePath: string, result: string): Promise<void> {
  const line = `${result}\n`;
  try {
    await fsPromises.appendFile(filePath, line, 'utf-8');
  } catch (error) {
    console.error('写入结果文件失败:', error);
  }
}

/**
 * 检查目录是否存在（异步）
 * @param dirPath 要检查的目录路径
 * @returns Promise<boolean> 目录是否存在
 */
async function checkDirectoryExists(dirPath: string): Promise<boolean> {
  try {
      const normalizedPath = path.resolve(dirPath);
      // 获取路径的统计信息
      const stats = await fsPromises.stat(normalizedPath);
      // 检查是否为目录
      return stats.isDirectory();
  } catch (error) {
      // ENOENT 表示路径不存在，其他错误也视为不存在
      return false;
  }
}

/**
 * 创建一个目录
 * @param basePath 
 * @returns 
 */
async function createDirectory(randomDirPath: string): Promise<boolean> {
    // 先检测目录是否存在
    const flag = await checkDirExists(randomDirPath);
    if(!flag) {      
      // 创建目录
      await fsPromises.mkdir(randomDirPath, { recursive: true });  // mkdirSync
      console.log(`创建了目录: ${randomDirPath}`);
    } 
    return true;
}

/**
 * 删除指定目录下的所有子目录和文件
 * @param dirPath 要删除的目录路径
 * @returns Promise<void>
 */
async function deleteDirectoryContents(dirPath: string): Promise<void> {
    try {
        // 检查目录是否存在
        try {
            await fsPromises.access(dirPath, fsPromises.constants.F_OK);
        } catch (error) {
            console.log(`目录 ${dirPath} 不存在，无需删除`);
            return;
        }

        // 递归删除整个目录
        await fsPromises.rm(dirPath, { recursive: true, force: true });
        console.log(`目录 ${dirPath} 及其所有内容已删除`);
    } catch (error) {
        console.error(`删除目录 ${dirPath} 时出错:`, error);
        return;
    }
}


/**
 * 递归计算文件夹大小
 * @param folderPath 
 * @returns 
 */
  async function getFolderSize(folderPath: string): Promise<number> {
    let totalSize = 0;
  
    try {
      const files = await fsPromises.readdir(folderPath);
  
      for (const file of files) {
        const fullPath = path.join(folderPath, file);
        const stats = await fsPromises.stat(fullPath);
  
        if (stats.isFile()) {
          totalSize += stats.size; // 文件直接累加大小
        } else if (stats.isDirectory()) {
          totalSize += await getFolderSize(fullPath); // 递归计算子文件夹大小
        }
      }
    } catch (error) {
      console.error(`计算文件夹大小失败: ${folderPath}`, error);
    }
  
    return totalSize;
  }

  /**
   * 检测目录是否存在
   * @param dirPath 
   * @returns 
   */
async function checkDirExists(dirPath: string): Promise<boolean> {
    try {
        await fsPromises.access(path.resolve(dirPath), fsPromises.constants.F_OK);
        return true; // 路径存在且可访问
    } catch (error) {
        return false; // 路径不存在或无权限
    }
}

/**
 * 写入内容到文件中
 * @param filePath 
 */
async function createTextFile(filePath: string, data:string): Promise<void> {
  try {
    // 确保目录存在
    const dir = path.dirname(filePath);
    await fsPromises.mkdir(dir, { recursive: true }); // recursive: true 创建多级目录
    
    // 创建空文件
    await fsPromises.writeFile(filePath, data, 'utf-8');
    console.log(`空文件创建成功: ${filePath}`);
  } catch (error) {
    console.error('创建空文件失败:', error);
    throw error;
  }
}
  
  /**
   * 检测目录下是否存在指定文件夹并计算大小
   * @param baseDir 目录路径
   * @param folderNames 需要计算得目录名称
   * @returns 
   */
  async function checkAllFolders(baseDir: string): Promise<FolderInfo[]> {
    const results: FolderInfo[] = [];
  
    try {
      // 读取目录内容
      const dirContents = await fsPromises.readdir(baseDir);
  
      // 遍历目录中的每个条目
      for (const item of dirContents) {
        const fullPath = path.join(baseDir, item);
        const stats = await fsPromises.stat(fullPath);
  
        // 只处理文件夹
        if (stats.isDirectory()) {
          const sizeInBytes = await getFolderSize(fullPath);  // 计算目录大小
          const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2); // 转换为 MB
  
          results.push({
            name: item,
            sizeInBytes,
            sizeInMB: `${sizeInMB} MB`,
          });
        }
      }
    } catch (error) {
      console.error(`读取目录失败: ${baseDir}`, error);
    }
  
    return results;
  }

  export {
    // 从指定文件路径中读取内容
    readerFromFile,
    // 从文件中导入内容
    importFromFile,
    // 将结果追加写入文件中
    appendResultToFile,
    // 一次性写入内容到 文件中
    createTextFile,


    // 检查目录是否存在（异步）
    checkDirectoryExists,
    //创建一个目录
    createDirectory,
    // 删除指定目录下的所有子目录和文件
    deleteDirectoryContents,
    // 递归计算文件夹大小
    getFolderSize,
    // 检测目录是否存在
    checkDirExists,
    // 检测目录下是否存在指定文件夹并计算大小
    checkAllFolders
  }