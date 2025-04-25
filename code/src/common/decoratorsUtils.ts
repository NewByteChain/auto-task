
/**
 * 装饰器，限定函数执行超时时间，超过设置得时间则自动跳过执行下一步
 * @timeout(1000) // 限时1000ms
 * @param limit 
 * @returns 
 */
function timeout(limit: number) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = async function(...args: any[]) {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Execution timeout')), limit);
            });
            
            try {
                return await Promise.race([
                    originalMethod.apply(this, args),
                    timeoutPromise
                ]);
            } catch (error) {
                if ((error as Error).message === 'Execution timeout') {
                    console.log(`Method ${propertyKey} exceeded ${limit}ms, skipped`);
                    return `Method ${propertyKey} exceeded ${limit}ms, skipped`; // 跳过执行
                }
                throw error;
            }
        };
        
        return descriptor;
    };
}


export {
    
    // 装饰器，限定函数执行超时时间，超过设置得时间则自动跳过执行下一步
    timeout,

}