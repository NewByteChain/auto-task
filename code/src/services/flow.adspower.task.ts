
import { request } from 'undici';
import * as dotenv from 'dotenv';
dotenv.config();
import { ApiResponse } from '../interface/api.data.interface';
import * as adspowerApiService from './api/api.adspower';


/**
 * API接口状态
 * @returns 
 */
export async function apiStatus(): Promise<ApiResponse<any> | null> {
  try {
    const result = await adspowerApiService.apiStatus();
    return result;
  } catch (error) {
    console.error('apiStatus Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * 启动浏览器
 * @param param 
 * @returns 
 */
export async function browserStart(param:any): Promise<ApiResponse<any> | null> {
  try {
    const result = await adspowerApiService.browserStart(param);
    return result;
  } catch (error) {
    console.error('browserStart Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * 关闭浏览器
 * @param param 
 * @returns 
 */
export async function browserStop(param:any): Promise<ApiResponse<any> | null> {
  try {
    const result = await adspowerApiService.browserStop(param);
    return result;
  } catch (error) {
    console.error('browserStop Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}


/**
 * 
 * @param param 
 * @returns 
 */
export async function browserActive(param:any): Promise<ApiResponse<any> | null> {
  try {
    const result = await adspowerApiService.browserActive(param);
    return result;
  } catch (error) {
    console.error('browserActive Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * 创建分组
 * @param param 
 * @returns 
 */
export async function groupCreate(param:any): Promise<ApiResponse<any> | null> {
  try {
    const result = await adspowerApiService.groupCreate(param);
    return result;
  } catch (error) {
    console.error('groupCreate Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * 修改分组
 * @param param 
 * @returns 
 */
export async function groupUpdate(param:any): Promise<ApiResponse<any> | null> {
  try {
    const result = await adspowerApiService.groupUpdate(param);
    return result;
  } catch (error) {
    console.error('groupUpdate Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * 查询分组
 * @param param 
 * @returns 
 */
export async function groupList(param:any): Promise<ApiResponse<any> | null> {
  try {
    param.page_size = 100;
    const result = await adspowerApiService.groupList(param);
    return result;
  } catch (error) {
    console.error('groupList Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}


/**
 * 查询环境
 * @param param 
 * @returns 
 */
export async function userlist(param:any): Promise<ApiResponse<any> | null> {
  try {
    param.page_size = 100;
    const result = await adspowerApiService.userlist(param);
    return result;
  } catch (error) {
    console.error('groupList Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}