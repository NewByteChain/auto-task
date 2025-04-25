const LANGUAGEPACK = require('./languages/index');

/**
 * 返回值对应的编码 说明
 *  1-500   笼统说明
 *  1001  错误、失败
 *  10001-19999 通用型错误（详细到细节）
 *  20001-29999 系统错误 （详细到细节）
 *  30001-59999 业务错误 (详细到细节)
 *  60001-79999 调用第三方接口错误
 *
 * @type {{}}  错误码说明
 */
const codeMessage = {
  '-1': '系统繁忙，此时请稍候再试',
  '0': '成功',
  '1': '后台系统异常(包括程序，数据库连接异常等)',
  '2': '参数不符合规范(包括参数为空等)',
  '3': '未知错误,系统中没有此编号错误的说明,开发也没有提供说明',
  '4': '核保失败',
  '5': '出单失败',
  '6': '支付失败',
  '7': '调用数据库执行sql异常',
  '99': '', // 调用第三方接口错误

  '1001': '失败',
  '1002': '未登录',
  '10001': '身份证号码不符合规范',
  '20001': '数据库连接异常',
  '30001': '投保年龄必须在20-60岁之间',
  '60001': '授权接口调用凭证过期'
} as any;

/** *
 * 返回字段常量
 * @type {string}
 */
const RETURN_CODE = 'code'; // 编号
const RETURN_MSG = 'msg'; // 说明
const RETURN_MODULE = 'module'; // 模块
const RETURN_DATA = 'result'; // 结果

/**
 * 判断是否为新版返回格式  为兼容旧版存在   新版：true  旧版 false
 * @param object
 */
const sNewReturnResult = (object:any) => {
  if (object && typeof (object) === 'object') {
    try {
      object = dataToJson(object);
      if (object[RETURN_CODE] && object[RETURN_MSG]) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  } else {
    return false;
  }
};

/**
 * 返回结果集格式化
 * @param data  需要返回的结果集
 * @returns {
     data:{}
 * }
 */
const returnDataFmt = function(data:any) {
  var returnResult = {} as any;
  data = dataToJson(data);

  returnResult[RETURN_DATA] = data;

  return returnResult;
};

/** *
 * 设置返回值信息，返回json 格式  如果为code=1 系统错误 会自动记录错误信息
 * @param   code 编号
 * @param   message 说明
 * @param   module 说明
 * @param   data 数据结果集
 */
const setReturnResultToJson = function(code:any, message:string, module:string, data:any) {
  var returnResult = {} as any;
  returnResult[RETURN_CODE] = code;
  returnResult[RETURN_MSG] = message;
  returnResult[RETURN_MODULE] = module;
  returnResult[RETURN_DATA] = data;
  code += '';
  if (code === '1') {
    console.error(module || '' + '  时间：' + dataFmt() + '   ERROR:' + message);
  } else {
    console.log(JSON.stringify(returnResult));
  }
  return returnResult;
};

/**
 * 结果集转换成json
 * @param data
 */
const dataToJson = function(data:any) {
  if (data) {
    data = typeof data === 'string' ? JSON.parse(data) : data;
  } else {
    data = {};
  }
  return data;
};

/**
 * 时间格式化
 * @returns {string}
 */
const dataFmt = function() {
  var now = new Date();
  var year = now.getFullYear() as any; // getFullYear getYear
  var month = now.getMonth() as any;
  var date = now.getDate() as any;
  var day = now.getDay() as any;
  var hour = now.getHours() as any;
  var minu = now.getMinutes() as any;
  var sec = now.getSeconds() as any;
  var week;
  month = month + 1;
  if (month < 10) month = '0' + month;
  if (date < 10) date = '0' + date;
  if (hour < 10) hour = '0' + hour;
  if (minu < 10) minu = '0' + minu;
  if (sec < 10) sec = '0' + sec;
  var arr_week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  week = arr_week[day];
  var time = '';
  time = year + '年' + month + '月' + date + '日' + ' ' + hour + ':' + minu + ':' + sec + ' ' + week;

  return time;
};

class ResultCode {
  /** *
   * 设置返回值信息，返回json 格式
   * @param   code 编号
   * @param   message 说明
   * @param   module 说明
   * @param   data 数据结果集
   * @returns {json}
   * author:wlzhou
   * create time:2016-07-14
   */
  static returnResult(code:any, message:string, module:string, data:any) {
    code = code || 99;
    message = message || this.getMessageByCode(code);
    return setReturnResultToJson(code, message, module, data);
  }

  /**
   * 多语言错误模型
   * @param   code 编号
   * @param   message 说明
   * @param   module 说明
   * @param   data 数据结果集
   * @returns {json}
   */
  static returnSuccess(headers:any, data:any) {
    // 处理多语言
    var language = headers.language || 'en';
    console.log('language:', language);
    // 获取语言包
    var langs = LANGUAGEPACK[language.toLowerCase()];
    if (!langs) {
      langs = LANGUAGEPACK['zh']; // 防止传入language语言出现不兼容
    }
    // 根据错误码值获取翻译
    var message = langs['9'];
    if (!message) {
      message = 'Request successful'; // 默认提示：Request successful
    }
    // 返回正确结果
    return setReturnResultToJson('0', message, langs['6'] || 'default', data);
  }

  /**
   * 多语言错误模型
   * @param   code 编号
   * @param   message 说明
   * @param   module 说明
   * @param   data 数据结果集
   * @returns {json}
   */
  static returnError(headers:any, ex:any, data:any) {
    console.error('Unexpectedly, no error was passed to error handler. But here is the message:', ex);
    console.error('error name:', ex.name);
    console.error('error code:', ex.code);
    var code = ex.code;
    var message = ex.message; // 默认错误提示
    // 判断code码值是否存在
    code = code || 999;
    // 处理多语言
    var language = headers.language || 'en';
    console.log('language:', language);
    // 获取语言包
    var langs = LANGUAGEPACK[language.toLowerCase()];
    if (!langs) {
      langs = LANGUAGEPACK['zh']; // 防止传入language语言出现不兼容
    }
    // 根据错误码值获取翻译
    message = langs[code + ''];
    if (!message) {
      message = langs['999']; // 防止出现码值无法匹配的错误
    }
    // 返回数据
    data = null;  // langs['10'] || 'Error'; // 如果没有指定错误情况下的返回result结果集合，直接返回Error错误即可
    // message = message; //  || this.getMessageByCode(code);
    return setReturnResultToJson(code + '', message, langs['6'] || 'default', data);
  }

  /**
   * 根据code 获取对应说明
   * @param code
   * @returns {string}
   */
  static getMessageByCode(code:any) {
    var message = '';
    try {
      message = codeMessage[code];
      if (!message) {
        new Error('没有找到对应的错误编码');
      }
    } catch (e) {
      code = '3';
      message = codeMessage[code];
    }
    return message;
  }

  /**
   * 成功
   * @param   module 说明
   * @param   data 数据结果集
   * @returns {json}
   * author:wlzhou
   * create time:2016-07-14
   */
  static success(data:any, module:string, message:string) {
    return this.returnResult('0', message, module, data);
  }

  /**
   *  失败 返回错误但不到具体错误，只提示时报
   * @param   message 说明
   * @param   module 说明
   * @param   data 数据结果集
   * @returns {json}
   */
  static fail(message:string, module:string, data:any) {
    return this.returnResult('1001', message, module, data);
  }

  /**
   * 系统系统异常  一般在try 中使用
   * @param   message 说明
   * @param   module 说明
   * @param   data 数据结果集
   * @returns {json}
   */
  static sysError(message:string, module:string, data:any) {
    return this.returnResult('1', message, module, data);
  }

  /**
   * 系统繁忙
   * @param   message 说明
   * @param   module 说明
   * @param   data 数据结果集
   * @returns {json}
   */
  static sysBusy(message:string, module:string, data:any) {
    return this.returnResult('-1', message, module, data);
  }

  /**
   * 参数错误
   * @param   message 说明
   * @param   module 说明
   * @param   data 数据结果集
   * @returns {json}
   */
  static parameError(message:string, module:string, data:any) {
    return this.returnResult('2', message, module, data);
  }

  /**
   * 调用第三接口错误
   * @param   message 说明
   * @param   module 说明
   * @param   data 数据结果集
   * @returns {json}
   */
  static interfaceFail(message:string, module:string, data:any) {
    return setReturnResultToJson('99', message, module, data);
  }
}

// module.exports = ResultCode;

export default ResultCode;