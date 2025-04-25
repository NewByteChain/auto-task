import { request } from 'undici';
import { ApiResponse } from '../../interface/api.data.interface';

// 封装成可复用的请求函数
export async function makeRequest<T>(
    url: string, 
    method: 'GET' | 'POST', 
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      // 定义请求参数
      const options: any = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
      // POST请求参数处理
      if (data && method === 'POST') {
        options.body = JSON.stringify(data);
      } else  if(data && method === 'GET'){
        // GET请求参数处理
        const queryString = new URLSearchParams(data as any).toString();
        url = `${url}?${queryString}`;    
      }
  
      const { statusCode, body } = await request(url, options);
  
      if (statusCode < 200 || statusCode >= 300) {
        throw new Error(`Request failed with status: ${statusCode}`);
      }
  
      const response = await body.json();
      return response as ApiResponse<T>;
  
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }
  