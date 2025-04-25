import { makeRequest } from './api.common';
import * as dotenv from 'dotenv';
import { ApiResponse,AdsProxyConfig,AdsFingerprintConfig } from '../../interface/api.data.interface';
dotenv.config();

// adsPower API Host 和 Port
const ADSPOWER_API_HOST = process.env.ADSPOWER_API_HOST || 'local.adspower.net'; // AdsPower API Host
const ADSPOWER_API_PORT = process.env.ADSPOWER_API_PORT || '50325'; // AdsPower API Port
// ADSPOWER_API_HOTS
const ADSPOWER_API_URL = `http://${ADSPOWER_API_HOST}:${ADSPOWER_API_PORT}`;
const ADSPOWER_API_KEY = process.env.ADSPOWER_API_KEY || '';


/**
 * API接口状态
 * @returns 
 */
export async function apiStatus(): Promise<any | null> {
  try {
    let url = `${ADSPOWER_API_URL}/status`;
    console.log(`url:${url}`)
    const getResult = await makeRequest<any>(
      url,
      'GET',
      {
        // "address":address , // mint接收底池
        // "rate":rate   // 建仓比例
      }
    ) as any;
    console.log('AdsPower apiStatus GET:', JSON.stringify(getResult));
    return getResult;
  } catch (error) {
    console.error('AdsPower apiStatus Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * 启动浏览器
 * @param param 
 * @returns 
 */
export async function browserStart(param:{
  user_id: string,  // 通过环境ID启动，创建环境成功后生成的唯一ID。
  serial_number?:number,  // 通过环境编号启动，如果已传递环境ID则优先用环境ID。
  open_tabs?:number,  // 是否打开平台和历史页面，0:打开(默认)，1:不打开。
  ip_tab?:number,  // 是否打开ip检测页，0:不打开，1:打开(默认)。
  new_first_tab?:number,  // 是否使用新版ip检测页： 1: 新版，0：旧版（默认）。
  launch_args?:string[],  // 启动参数，例：--blink-settings=imagesEnabled=false: 禁止图片加载 --disable-notifications: 禁用通知。使用API时，如果API传了“launch_args”，则以API传的值为准。
  headless?:number,  // 是否启动headless浏览器 0:否（默认）1:是。
  disable_password_filling?:number,  // 	是否禁用填充账密功能 0:否（默认）1:是。
  clear_cache_after_closing?:number,  // 关闭浏览器后是否清除缓存 0:否（默认）1:是。
  enable_password_saving?:number,  // 是否允许保存密码 0:否（默认）1:是。
  cdp_mask?:number,  // 是否屏蔽 CDP 检测 1：是（默认），0：否
  device_scale?:number  // 手机模式有效，传参范 0.1至 2，填1就是100%
}): Promise<any | null> {
  try {
    let url = `${ADSPOWER_API_URL}/api/v1/browser/start`;
    console.log(`url:${url}`)
    const getResult = await makeRequest<any>(
      url,
      'GET',
      param // 请求参数
    ) as any;
    console.log('AdsPower browserStart GET:', JSON.stringify(getResult));
    return getResult;
  } catch (error) {
    console.error('AdsPower browserStart Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * 关闭浏览器
 * @param param 
 * @returns 
 */
export async function browserStop(param:{
  user_id: string,  // 通过环境ID启动，创建环境成功后生成的唯一ID。
  serial_number?:number,  // 	通过环境编号关闭，如果已传递环境ID则优先用环境ID。
}): Promise<any | null> {
  try {
    let url = `${ADSPOWER_API_URL}/api/v1/browser/stop`;
    console.log(`url:${url}`)
    const getResult = await makeRequest<any>(
      url,
      'GET',
      param // 请求参数
    ) as any;
    console.log('AdsPower browserStop GET:', JSON.stringify(getResult));
    return getResult;
  } catch (error) {
    console.error('AdsPower browserStop Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * 浏览器检查启动状态
 * @param param 
 * @returns 
 */
export async function browserActive(param:{
  user_id: string,  // 通过环境ID启动，创建环境成功后生成的唯一ID。
  serial_number?:number,  // 	通过环境编号关闭，如果已传递环境ID则优先用环境ID。
}): Promise<any | null> {
  try {
    let url = `${ADSPOWER_API_URL}/api/v1/browser/active`;
    console.log(`url:${url}`)
    const getResult = await makeRequest<any>(
      url,
      'GET',
      param // 请求参数
    ) as any;
    console.log('AdsPower browserActive GET:', JSON.stringify(getResult));
    return getResult;
  } catch (error) {
    console.error('AdsPower browserActive Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * 创建分组
 * @param param 
 * @returns 
 */
export async function groupCreate(param:{
  group_name: string,  // 添加分组的名称，名称不能重复。
  remark?:string,  // 添加分组的备注(需升级到v2.6.7.2及以上)。
}): Promise<any | null> {
  try {
    let url = `${ADSPOWER_API_URL}/api/v1/group/create`;
    console.log(`url:${url}`)
    const getResult = await makeRequest<any>(
      url,
      'POST',
      param // 请求参数
    ) as any;
    console.log('AdsPower groupCreate POST:', JSON.stringify(getResult));
    return getResult;
  } catch (error) {
    console.error('AdsPower groupCreate Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * 修改分组
 * @param param 
 * @returns 
 */
export async function groupUpdate(param:{
  group_id: string,  // 需要修改的分组ID。
  group_name: string,  // 添加分组的名称，名称不能重复。
  remark?:string,  // 添加分组的备注(需升级到v2.6.7.2及以上)。
}): Promise<any | null> {
  try {
    let url = `${ADSPOWER_API_URL}/api/v1/group/update`;
    console.log(`url:${url}`)
    const getResult = await makeRequest<any>(
      url,
      'POST',
      param // 请求参数
    ) as any;
    console.log('AdsPower groupUpdate POST:', JSON.stringify(getResult));
    return getResult;
  } catch (error) {
    console.error('AdsPower groupUpdate Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * 查询分组
 * @param param 
 * @returns 
 */
export async function groupList(param:{
  group_name?: string,  // 指定分组名称查询分组，默认空查所有分组。
  page?: string ,  // 页码默认1第一页。
  page_size?:string ,  // 每页条数默认1条，最大2000。
}): Promise<any | null> {
  try {
    let url = `${ADSPOWER_API_URL}/api/v1/group/list`;
    console.log(`url:${url}`)
    const getResult = await makeRequest<any>(
      url,
      'GET',
      param // 请求参数
    ) as any;
    console.log('AdsPower groupList GET:', JSON.stringify(getResult));
    return getResult;
  } catch (error) {
    console.error('AdsPower groupList Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}


/**
 * 应用分类列表
 * @param param 
 * @returns 
 */
export async function applicationList(param:{
  page?: string ,  // 页码默认1第一页。
  page_size?:string ,  // 每页条数默认1条，最大2000。
}): Promise<any | null> {
  try {
    let url = `${ADSPOWER_API_URL}/api/v1/application/list`;
    console.log(`url:${url}`)
    const getResult = await makeRequest<any>(
      url,
      'GET',
      param // 请求参数
    ) as any;
    console.log('AdsPower applicationList GET:', JSON.stringify(getResult));
    return getResult;
  } catch (error) {
    console.error('AdsPower applicationList Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * 新建浏览器
 * @param param 
 * @returns 
 */
export async function userCreate(param:{
  name?: string ,  // 页对该环境进行命名，限制100字，方便记忆管理。
  domain_name?: string ,  // 	账号平台的域名：facebook.com, amazon.com...会在打开浏览器时默认访问。
  open_urls?:string[] ,  // 浏览器打开时访问的其他url地址，不填则默认只打开domain_name的地址。
  repeat_config?:number[], // 账号去重，默认允许重复，支持  0允许重复;  2根据账密去重;  3根据cookie去重;  4根据c_user去重(c_user是FaceBook专有标记);
  username?:string, // 账号密码或者Cookie至少填一个；账号允许重复则都可不填
  password?:string, // 账号密码或者Cookie至少填一个；账号允许重复则都可不填。
  fakey?:string, // 填写2FA密钥。适用于网站的二次验证码生成，类似Google身份验证器。
  cookie?:string, // 账号密码或者Cookie至少填一个；账号允许重复则都可不填；支持JSON和Netscape格式。
  ignore_cookie_error?:string, // 0：校验cookie失败时，直接返回cookie格式不正确；  1：校验cookie失败时，过滤掉格式错误的数据，保留正确格式的cookie  仅支持Netscape格式。
  group_id:string, // 	添加到对应分组的ID，未分配分组则可以传0。
  ip?:string, // 环境使用的代理IP，代理软件为lumauto、oxylabs填写。
  country?:string, // 环境使用的代理国家/地区，lumauto、oxylabs如果没有IP则需要填写国家。
  region?:string, // 环境使用的代理州/省，可不填
  city?:string, // 	环境使用的代理城市，可不填。
  remark?:string, // 备注。
  ipchecker?:string, // IP查询渠道，支持传入ip2location、ipapi。
  sys_app_cate_id?:string, // 可传入应用分类ID，0为跟随团队应用。
  // 	和user_proxy_config二选一必填
  user_proxy_config?:AdsProxyConfig, // 环境代理配置，具体查看参数对象userProxyConfig。
  // 	和user_proxy_config二选一必填
  proxyid?:string, // 	可传入代理id或random（随机一个代理）
  fingerprint_config:AdsFingerprintConfig   // 指纹配置，具体查看参数对象fingerprintConfig。
}): Promise<any | null> {
  try {
    let url = `${ADSPOWER_API_URL}/api/v1/user/create`;
    console.log(`url:${url}`)
    const getResult = await makeRequest<any>(
      url,
      'POST',
      param // 请求参数
    ) as any;
    console.log('AdsPower applicationList GET:', JSON.stringify(getResult));
    return getResult;
  } catch (error) {
    console.error('AdsPower applicationList Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * 更新环境信息
 * @param param 
 * @returns 
 */
export async function userUpdate(param:{
  user_id: string,  // 需要修改的环境ID。
  name?: string ,  // 页对该环境进行命名，限制100字，方便记忆管理。
  domain_name?: string ,  // 	账号平台的域名：facebook.com, amazon.com...会在打开浏览器时默认访问。
  open_urls?:string[] ,  // 浏览器打开时访问的其他url地址，不填则默认只打开domain_name的地址。
  repeat_config?:number[], // 账号去重，默认允许重复，支持  0允许重复;  2根据账密去重;  3根据cookie去重;  4根据c_user去重(c_user是FaceBook专有标记);
  username?:string, // 账号密码或者Cookie至少填一个；账号允许重复则都可不填
  password?:string, // 账号密码或者Cookie至少填一个；账号允许重复则都可不填。
  fakey?:string, // 填写2FA密钥。适用于网站的二次验证码生成，类似Google身份验证器。
  cookie?:string, // 账号密码或者Cookie至少填一个；账号允许重复则都可不填；支持JSON和Netscape格式。
  ignore_cookie_error?:string, // 0：校验cookie失败时，直接返回cookie格式不正确；  1：校验cookie失败时，过滤掉格式错误的数据，保留正确格式的cookie  仅支持Netscape格式。
  group_id:string, // 	添加到对应分组的ID，未分配分组则可以传0。
  ip?:string, // 环境使用的代理IP，代理软件为lumauto、oxylabs填写。
  country?:string, // 环境使用的代理国家/地区，lumauto、oxylabs如果没有IP则需要填写国家。
  region?:string, // 环境使用的代理州/省，可不填
  city?:string, // 	环境使用的代理城市，可不填。
  remark?:string, // 备注。
  ipchecker?:string, // IP查询渠道，支持传入ip2location、ipapi。
  sys_app_cate_id?:string, // 可传入应用分类ID，0为跟随团队应用。
  // 	和user_proxy_config二选一必填
  user_proxy_config?:AdsProxyConfig, // 环境代理配置，具体查看参数对象userProxyConfig。
  // 	和user_proxy_config二选一必填
  proxyid?:string, // 	可传入代理id或random（随机一个代理）
  fingerprint_config:AdsFingerprintConfig   // 指纹配置，具体查看参数对象fingerprintConfig。
}): Promise<any | null> {
  try {
    let url = `${ADSPOWER_API_URL}/api/v1/user/update`;
    console.log(`url:${url}`)
    const getResult = await makeRequest<any>(
      url,
      'POST',
      param // 请求参数
    ) as any;
    console.log('AdsPower userUpdate GET:', JSON.stringify(getResult));
    return getResult;
  } catch (error) {
    console.error('AdsPower userUpdate Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * 查询环境
 * @param param 
 * @returns 
 */
export async function userlist(param:{
  group_id?: string,  // 指定分组ID查询环境，默认不传递则查询所有分组的环境。
  user_id?: string,  // 指定环境ID查询。
  serial_number?: number,  // 指定环境编号查询。
  // user_sort: {"serial_number":"desc"}
  user_sort:JSON,  // 查询环境返回的结果可以按指定类型排序，支持serial_number（环境编号），last_open_time（最后打开时间），created_time（创建时间）三个字段，asc和desc两个值。
  page?: number ,  // 页码默认1第一页。
  page_size?:number ,  // 每页大小，默认每页1 ，最大100。
}): Promise<any | null> {
  try {
    let url = `${ADSPOWER_API_URL}/api/v1/user/list`;
    console.log(`url:${url}`)
    const getResult = await makeRequest<any>(
      url,
      'GET',
      param // 请求参数
    ) as any;
    console.log('AdsPower userlist GET:', JSON.stringify(getResult));
    return getResult;
  } catch (error) {
    console.error('AdsPower userlist Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * 删除环境
 * @param user_ids string[],  // 需要删除的环境ID，支持批量删除
 * @returns 
 */
export async function userDelete(user_ids:string[]): Promise<any | null> {
  try {
    let url = `${ADSPOWER_API_URL}/api/v1/user/delete`;
    console.log(`url:${url}`)
    const getResult = await makeRequest<any>(
      url,
      'POST',
      {user_ids:user_ids} // 请求参数
    ) as any;
    console.log('AdsPower userDelete POST:', JSON.stringify(getResult));
    return getResult;
  } catch (error) {
    console.error('AdsPower userDelete Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * 移动环境
 * @param user_ids 需要分组的环境ID，数组格式
 * @param group_id 对应的分组ID。
 * @returns 
 */
export async function userRegroup(user_ids:string[],group_id:string): Promise<any | null> {
  try {
    let url = `${ADSPOWER_API_URL}/api/v1/user/regroup`;
    console.log(`url:${url}`)
    const getResult = await makeRequest<any>(
      url,
      'POST',
      {user_ids:user_ids} // 请求参数
    ) as any;
    console.log('AdsPower userRegroup POST:', JSON.stringify(getResult));
    return getResult;
  } catch (error) {
    console.error('AdsPower userRegroup Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * 清除缓存
 * 注意事项：该接口会删除所有环境的本地缓存数据，请谨慎使用。如果想对指定的环境在打开后进行缓存删除，可使用启动浏览器接口中的"clear_cache_after_closing"。
 * @returns 
 */
export async function userDeleteCache(): Promise<any | null> {
  try {
    let url = `${ADSPOWER_API_URL}/api/v1/user/delete-cache`;
    console.log(`url:${url}`)
    const getResult = await makeRequest<any>(
      url,
      'POST',
      {} // 请求参数
    ) as any;
    console.log('AdsPower userDeleteCache POST:', JSON.stringify(getResult));
    return getResult;
  } catch (error) {
    console.error('AdsPower userDeleteCache Request Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

