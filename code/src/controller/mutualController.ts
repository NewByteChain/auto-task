import { Request, Response } from 'express';
import ResultCode from '../common/result.code';
import * as monitorSolDebotService from '../services/mutual.service';
import * as flowAdsPowerService from '../services/flow.adspower.task';

// 这里可以添加类型声明和其他逻辑

/**
 * 获取Debot交易所指定token得交易数据
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const getDexData = async (req: Request, res: Response) => {
    // params
    var body = req.query;
    
    // Fractal分析数据查询
    return monitorSolDebotService.getDexData(body).then(data => {
      // 返回参数已经封装好了，这里直接返回就可以了
      res.status(200).json(ResultCode.returnSuccess(req.headers, data));
    }).catch(ex => {
      console.error('[getGmgnKline]查询出现异常>>', ex);
      res.status(200).json(ResultCode.returnError(req.headers, ex, null));
    });
};

/**
 * AdsPower apiStatus: API接口状态
 * @param req 
 * @param res 
 * @returns 
 */
export const apiStatus = async (req: Request, res: Response) => {
  // params
  var body = req.query;
  
  // Fractal分析数据查询
  return flowAdsPowerService.apiStatus().then(data => {
    // 返回参数已经封装好了，这里直接返回就可以了
    res.status(200).json(ResultCode.returnSuccess(req.headers, data));
  }).catch(ex => {
    console.error('[apiStatus] 出现异常>>', ex);
    res.status(200).json(ResultCode.returnError(req.headers, ex, null));
  });
};

/**
 * 启动浏览器
 * @param req 
 * @param res 
 * @returns 
 */
export const browserStart = async (req: Request, res: Response) => {
  // params
  var body = req.query;
  
  // Fractal分析数据查询
  return flowAdsPowerService.browserStart(body).then(data => {
    // 返回参数已经封装好了，这里直接返回就可以了
    res.status(200).json(ResultCode.returnSuccess(req.headers, data));
  }).catch(ex => {
    console.error('[browserStart] 出现异常>>', ex);
    res.status(200).json(ResultCode.returnError(req.headers, ex, null));
  });
};

export const browserStop = async (req: Request, res: Response) => {
  // params
  var body = req.query;
  
  // Fractal分析数据查询
  return flowAdsPowerService.browserStop(body).then(data => {
    // 返回参数已经封装好了，这里直接返回就可以了
    res.status(200).json(ResultCode.returnSuccess(req.headers, data));
  }).catch(ex => {
    console.error('[browserStop] 出现异常>>', ex);
    res.status(200).json(ResultCode.returnError(req.headers, ex, null));
  });
};

/**
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export const browserActive = async (req: Request, res: Response) => {
  // params
  var body = req.query;
  
  // Fractal分析数据查询
  return flowAdsPowerService.browserActive(body).then(data => {
    // 返回参数已经封装好了，这里直接返回就可以了
    res.status(200).json(ResultCode.returnSuccess(req.headers, data));
  }).catch(ex => {
    console.error('[browserStop] 出现异常>>', ex);
    res.status(200).json(ResultCode.returnError(req.headers, ex, null));
  });
};

/**
 * 创建分组
 * @param req 
 * @param res 
 * @returns 
 */
export const groupCreate = async (req: Request, res: Response) => {
  // params
  var body = req.query;
  
  // Fractal分析数据查询
  return flowAdsPowerService.groupCreate(body).then(data => {
    // 返回参数已经封装好了，这里直接返回就可以了
    res.status(200).json(ResultCode.returnSuccess(req.headers, data));
  }).catch(ex => {
    console.error('[groupCreate] 出现异常>>', ex);
    res.status(200).json(ResultCode.returnError(req.headers, ex, null));
  });
};

/**
 * 修改分组
 * @param req 
 * @param res 
 * @returns 
 */
export const groupUpdate = async (req: Request, res: Response) => {
  // params
  var body = req.query;
  
  // Fractal分析数据查询
  return flowAdsPowerService.groupUpdate(body).then(data => {
    // 返回参数已经封装好了，这里直接返回就可以了
    res.status(200).json(ResultCode.returnSuccess(req.headers, data));
  }).catch(ex => {
    console.error('[groupUpdate] 出现异常>>', ex);
    res.status(200).json(ResultCode.returnError(req.headers, ex, null));
  });
};

/**
 * 查询分组
 * @param req 
 * @param res 
 * @returns 
 */
export const groupList = async (req: Request, res: Response) => {
  // params
  var body = req.query;
  
  // Fractal分析数据查询
  return flowAdsPowerService.groupList(body).then(data => {
    // 返回参数已经封装好了，这里直接返回就可以了
    res.status(200).json(ResultCode.returnSuccess(req.headers, data));
  }).catch(ex => {
    console.error('[groupList] 出现异常>>', ex);
    res.status(200).json(ResultCode.returnError(req.headers, ex, null));
  });
};


/**
 * 查询环境
 * @param req 
 * @param res 
 * @returns 
 */
export const userlist = async (req: Request, res: Response) => {
  // params
  var body = req.query;
  
  return flowAdsPowerService.userlist(body).then(data => {
    // 返回参数已经封装好了，这里直接返回就可以了
    res.status(200).json(ResultCode.returnSuccess(req.headers, data));
  }).catch(ex => {
    console.error('[groupList] 出现异常>>', ex);
    res.status(200).json(ResultCode.returnError(req.headers, ex, null));
  });
};
