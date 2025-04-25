import * as schedule from 'node-schedule';
import configData from "./config/task.json"

// 配置对象
// const config: { config: ConfigItem[] } = configData ;
// 配置对象，添加非空检查
const config: ConfigItem[]  = configData as ConfigItem[];
console.log(`启动定时任务执行器: ${JSON.stringify(config)}`)

// 定义类型
interface ConfigItem {
    id: string;
    time: string; // cron 表达式或时间规则
    module: string; // 模块路径
    interface: string; // 模块中的函数名
}

interface ScheduleInfo {
    id: string;
    status: 'success' | 'failed';
    schedule?: schedule.Job; // 可选的 schedule 对象
}

// 全局调度队列
let scheduleQueue: ScheduleInfo[] = [];

/**
 * 启动所有定时器
 */
export async function startSchedule(): Promise<void> {
    console.info('定时器开启');
    // const configContext = config;

    for (const item of config) {
        console.info(`开启服务: ${item.id}`);
        console.info(`服务配置: ${JSON.stringify(item)}`);

        try {
            const module = require(item.module); // 动态加载模块
            const taskFunction = module[item.interface];
            
            if (typeof taskFunction !== 'function') {
                throw new Error(`接口 ${item.interface} 不是函数`);
            }

            const job = schedule.scheduleJob(item.time, taskFunction);
            const scheduleInfo: ScheduleInfo = {
                id: item.id,
                status: 'success',
                schedule: job
            };
            scheduleQueue.push(scheduleInfo);
            console.log(`任务启动：${scheduleQueue.length}`)
        } catch (ex) {
            console.log(`哎呀，出现错误。`)
            console.info(ex instanceof Error ? ex.message : String(ex));
            const info: ScheduleInfo = {
                id: item.id,
                status: 'failed'
            };
            scheduleQueue.push(info);
        }
    }
}

/**
 * 重新加载定时器配置文件
 */
export async function reloadAll(): Promise<void> {
    if (scheduleQueue.length > 0) {
        for (const item of scheduleQueue) {
            if (item.status === 'success' && item.schedule) {
                item.schedule.cancel();
            }
        }
        scheduleQueue = []; // 清空队列
    }
    await startSchedule();
}

/**
 * 指定启动某一个定时任务
 */
export async function startOne(id: string): Promise<void> {
    console.info(`schedule ${id} is starting........`);
    const configContext = config;

    for (const item of configContext) {
        if (item.id === id) {
            const module = require(item.module);
            console.info(`=====${JSON.stringify(module)}`);

            try {
                const taskFunction = module[item.interface];
                if (typeof taskFunction !== 'function') {
                    throw new Error(`接口 ${item.interface} 不是函数`);
                }

                const job = schedule.scheduleJob(item.time, taskFunction);
                const scheduleInfo: ScheduleInfo = {
                    id: item.id,
                    status: 'success',
                    schedule: job
                };
                scheduleQueue.push(scheduleInfo);
            } catch (ex) {
                const info: ScheduleInfo = {
                    id: item.id,
                    status: 'failed'
                };
                scheduleQueue.push(info);
            }
            break; // 找到匹配项后退出循环
        }
    }
}

/**
 * 指定重新加载某一个定时任务
 */
export async function reloadOne(id: string): Promise<void> {
    if (scheduleQueue.length > 0) {
        const index = scheduleQueue.findIndex(item => item.id === id);
        if (index !== -1) {
            const item = scheduleQueue[index];
            if (item.status === 'success' && item.schedule) {
                item.schedule.cancel();
            }
            scheduleQueue.splice(index, 1); // 删除指定项
            await startOne(id);
        }
    }
}

/**
 * 停止所有定时任务
 */
export async function stopAll(): Promise<void> {
    if (scheduleQueue.length > 0) {
        for (const item of scheduleQueue) {
            if (item.status === 'success' && item.schedule) {
                item.schedule.cancel();
            }
        }
        scheduleQueue = []; // 清空队列
    }
}

/**
 * 指定停止某一个定时任务
 */
export async function stopOne(id: string): Promise<void> {
    if (scheduleQueue.length > 0) {
        const index = scheduleQueue.findIndex(item => item.id === id);
        if (index !== -1) {
            const item = scheduleQueue[index];
            if (item.status === 'success' && item.schedule) {
                item.schedule.cancel();
            }
            scheduleQueue.splice(index, 1); // 删除指定项
        }
    }
}

// 启动定时任务模块
startSchedule();

// 保持进程活跃
process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down...');
    stopAll();
    process.exit(0);
});

// 使用 setInterval 保持进程活跃

setInterval(() => {
    console.log('Scheduler started. Waiting for tasks...');
    // 空函数，仅用于保持事件循环
}, 1000 * 60 * 60); // 每小时执行一次，减少资源占用