/**
 * 钱包导入标志KEY缓存
 */
export const globalState: { 
    WALLET_IMPORT_STATE_KEY:string,
    WEBSITE_WALLET_CONNECT:boolean
} = {
    // 钱包导入状态，存储用户钱包缓存目录
    WALLET_IMPORT_STATE_KEY: "",
    // 网站连接钱包状态
    WEBSITE_WALLET_CONNECT:false
};

/**
 * KLOKAPP.AI 邀请码
 */
export const globalReferralCode: {
    // KLOKAPP.AI 邀请码
    KLOKAPP_REFERRAL_CODE:string[],
    // CORESKY 邀请码
    CORESKY_REFERRAL_CODE:string[]
} = {
    KLOKAPP_REFERRAL_CODE:[],
    CORESKY_REFERRAL_CODE:[]
}
