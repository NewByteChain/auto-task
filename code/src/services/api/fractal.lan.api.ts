import { makeRequest } from './api.common';
import * as dotenv from 'dotenv';
dotenv.config();
import { ApiResponse} from '../../interface/api.data.interface';

const FRACTAL_LAN_HOST = process.env.FRACTAL_LAN_HOST;

/**
 * 查询数据分析差价模型查询
 * @returns 
 */
export async function queryFractalOrdPrice(address:string,rate:number): Promise<ApiResponse<any> | null> {
  try {
    let url = `${FRACTAL_LAN_HOST}/v1/fb/query-fractal-ord-price`;
    console.log(`url:${url}`)
    const getResult = await makeRequest<any>(
      url,
      'GET',
      {
        "address":address , // mint接收底池
        "rate":rate   // 建仓比例
      }
    ) as ApiResponse<any>;
    console.log('queryFractalOrdPrice GET:', JSON.stringify(getResult));
    return getResult;
  } catch (error) {
    console.error('queryFractalOrdPrice Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * 根据address写入FB铸造仓位信息
 * @param address mint地址
 * @param ticker 标的ticker名称
 * @param minted_total 本次新增mint数量
 */
export async function insertFractalOrdAddress(address:string,ticker:string,minted_total:string): Promise<ApiResponse<any>|null> {
  try {
    const url = `${FRACTAL_LAN_HOST}/v1/fb/insert-fractal-ord-address`;
    console.log(`url:${url}`)
    // POST请求
    const postResult = await makeRequest<{ success: boolean }>(
      url,
      'POST',
      {
        "address": address,
        "ticker": ticker,
        "minted_total": minted_total
      }
    ) as ApiResponse<any>;

    return postResult;

  } catch (error) {
    console.error('POST Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

