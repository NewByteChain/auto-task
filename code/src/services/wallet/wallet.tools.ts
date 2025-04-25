import {importFromFile, createTextFile} from '../../common/fileUtils';
import path from 'path';

// Define the two-dimensional array
const data: string[][] = [
      [
        '0x03***9e7bc2386f163',
        'c2ef8b***896bff7e62d4031'
      ]
];
  
/**
 * 读取数组内容并输入到txt文本当中
 */
export async function readerArrayOutTxt() {

    try {
        // Extract the second item from each subarray
        const secondItems: string[] = data.map((subArray: string[]) => `'${subArray[0]}'`);
        
        // 写入目录
        const outputFile = path.join(__dirname,'../../','data', `output.txt`);
        // Write to a text file, one item per line
        await createTextFile(outputFile,secondItems.join(','));
        console.log(`Second items have been written to ${outputFile}`);
        console.log('Results saved to output txt');
    } catch (error) {
        console.error('Failed to process file:', error);
    }
}

/**
 * 代理数组处理
 */
export async function readerProxiesArrayOutTxt() {

    try {
        // 读取文件
        const filePath = path.join(__dirname,'../../','data', 'input.txt'); // 确保路径正确
        console.log('Imported filePath:', filePath);
        let inpusts = await importFromFile(filePath);
        console.log('读取文本记录行数:', inpusts.length);

        // Extract the second item from each subarray
        const secondItems: string[] = [];
        for(var i=0;i<inpusts.length;i++){
            var items = inpusts[i].split(':');
            // 拼装新的数组
            secondItems.push(`http://${items[2]}:${items[3]}@${items[0]}:${items[1]}`);
        }
        
        // 写入目录
        const outputFile = path.join(__dirname,'../../','data', `output.txt`);
        // Write to a text file, one item per line
        await createTextFile(outputFile,secondItems.join('\n'));
        console.log(`写入完成`);
    } catch (error) {
        console.error('Failed to process file:', error);
    }
}