
// 定义 API 响应的类型（根据实际 API 调整）
interface ApiResponse<T> {
    code: string;
    module: string;
    result: T;
    msg?: string;
}

/**
 * AdsPower 代理配置接口
 * user_proxy_config对象是环境代理配置的参数信息
 */
interface AdsProxyConfig{
    proxy_soft: string; // 目前支持的代理有brightdata，brightauto，oxylabsauto，922S5auto，ipideaauto，ipfoxyauto，922S5auth，kookauto，ssh，other，no_proxy。
    proxy_type?: string; // 代理的类型，目前支持的类型有http，https，socks5；no_proxy可不传。
    proxy_host?: string; // 代理服务器的地址，可以填域名或者IP；no_proxy可不传。
    proxy_user?: string; // 代理需要登录时的账号。
    proxy_password?: string; // 代理需要登录时的密码。
    proxy_url?: string; // 该URL用于移动代理，仅支持http/https/socks5的代理。1、通过该链接，您可以通过手动操作去改变代理的IP地址。2、多个环境使用同个代理账号时，刷新IP会改变同个代理账号的IP地址。
    global_config?:string; // 使用代理管理的账号列表信息
}

/**
 * AdsPower 指纹配置接口
 * fingerprint_config对象是浏览器指纹配置的参数信息，支持多种浏览器指纹配置是AdsPower的产品特性之一。
 */
interface AdsFingerprintConfig{
    automatic_timezone?: string; // 1：基于IP自动生成对应的时区(默认)；0：指定时区。
    timezone?:string; // 指定时区，默认空字符串""代表本地时区。
    // Chrome即时通信组件，支持：
    // forward 转发，使用代理IP覆盖真实IP，代理场景使用，更安全（需升级到V2.6.8.6及以上版本 ）；
    // proxy 替换 ，使用代理IP覆盖真实IP，代理场景使用
    // local 真实 ，网站会获取真实IP；
    // disabled 禁用(默认)，网站会拿不到IP。
    webrtc?:string,
    // 询问ask(默认)，与普通浏览器的提示一样；
    // 允许allow，始终允许网站获取位置；
    // 禁止block，始终禁止网站获取位置。
    location?:string, // 网站请求获取您当前地理位置时的选择，支持：
    location_switch?:string, // 位置开关，1：基于IP自动生成对应的位置(默认)；0：指定位置。
    longitude?:string, // 经度，指定位置的经度，指定位置时必填，范围是-180到180，支持小数点后六位。
    latitude?:string, // 纬度，指定位置的纬度，指定位置时必填，范围是-90到90，支持小数点后六位。
    accuracy?:string, // 精度, 指定位置的精度(米) ，指定位置时必填，范围10-5000，整数。
    language?:string, // 浏览器的语言(默认["en-US","en"])，支持传多个语言，格式为字符串数组。
    language_switch?:string, // 基于IP国家设置语言：0：关闭；1：启用
    page_language_switch?:string, // 基于[语言]匹配界面语言：0：关闭；1：启用
    page_language?:string, // page_language_switch需为0才生效，page_language默认为native，即本地语言，也可传入国家code，具体查看界面语言
    ua?:string, // user-agent用户信息，默认不传使用随机ua库， 自定义需要确保ua格式与内容符合标准。
    screen_resolution?:string, // 屏幕分辨率，none: 使用电脑当前分辨率; random: 随机分辨率; 自定义需要下划线分隔，宽_高。
    fonts?:string[], // 浏览器的字体(默认所有) 自定义支持多字体英文，格式为字符串数组。
    canvas?:string, //浏览器canvas指纹开关 1：添加噪音(默认)； 0：电脑默认
    webgl_image?:string, // 浏览器webgl图像指纹开关 1：添加噪音(默认)； 0：电脑默认。
    webgl?:string, // 浏览器webgl元数据指纹开关 0：电脑默认； 2：自定义（需定义webgl_config）； 3：随机匹配(该类型仅在新建浏览器接口支持，更新环境信息接口暂不支持)。
    // 浏览器webgl元数据自定义，unmasked_vendor：厂商，unmasked_renderer：渲染。
    // 该值只有在webgl为2时才会启动自定义。
    // 当webgl为2时，厂商和渲染均不能为空，否则采用电脑默认。
    // webgpu基于webgl_config:
    // 1：基于 WebGL 匹配；
    // 2：真实；
    // 0：禁用。
    webgl_config?:JSON,
    audio?:string, // 浏览器音频指纹开关 1：添加噪音(默认)； 0：电脑默认。
    do_not_track?:string, // DNT即"do not track"，“请勿跟踪”浏览器设置开关，支持： default(默认)； true：开启； false：关闭。
    hardware_concurrency?:string, // 电脑CPU核数，支持：default(电脑实际CPU核数)，2，4(不传默认4核)，6，8，16。
    device_memory?:string, // 电脑内存大小，支持：default(电脑实际内存大小)， 2，4，6，8(不传默认8G)。
    flash?:string, // flash配置开关，支持： allow：启用； block：关闭(默认)。
    scan_port_type?:string, // 端口扫描保护，支持： 1：启用(默认)； 0：关闭。
    allow_scan_ports?:string, // 端口扫描保护启用时允许被扫描的指定端口，格式为字符串数组，默认不传为空。
    // 媒体设备开关：
    // 0：关闭（每个
    // 浏览器使用当前电脑默认的媒体设备id）；
    // 1:  噪音（设备数量跟随本机）；
    // 2：噪音（自定义设备数量，需传 media_devices_num）。
    media_devices?:string, 
    // audioinput_num： 麦克风数量(1-9)；
    // videoinput_num：摄像机数量(1-9)；
    // audiooutput_num: 扬声器数量(1-9)
    media_devices_num?:string, 
    // ClientRects指纹：
    // 0：每个浏览器使用当前电脑默认的ClientRects；
    // 1：添加相应的噪音，同一电脑上为每个浏览器生成不同的ClientRects。
    client_rects?:string,
    // 设备名称：
    // 0：关闭, 每个浏览器使用当前电脑的设备名称；
    // 1：掩盖, 使用合适的值代替您真实的设备名称；
    // 2：自定义设备名称
    device_name_switch?:string,
    device_name?:string, // 自定义设备名称。
    // 支持指定类型、系统、版本设置ua。若同时传入了自定义ua，则优先使用自定义的ua。
    // ua_browser: 类型，chrome || firefox；
    // ua_system_version: 系统；
    // ua_version: 版本;
    // 该字段仅在新建浏览器接口支持，更新环境接口暂不支持指定类型、系统、版本更新ua。
    // 详情见random_ua
    random_ua?:string, 
    // SpeechVoices指纹：
    // 0：每个浏览器使用当前电脑默认的SpeechVoices；
    // 1：添加相应的噪音，同一电脑上为每个浏览器生成不同的SpeechVoices。
    speech_switch?:string,
    // MAC地址：支持设置合适的值代替真是的MAC地址。
    // model: 0 （使用当前电脑的MAC地址），1（匹配合适的值代替真实的MAC地址）， 2（自定义合适的值代替真实的MAC地址） 。
    // address: 自定义MAC地址，当model为2时，需传入该值。
    mac_address_config?:string,
    // 使用对应浏览器内核打开浏览器。
    // version:内核版本，参数说明："92"为92版内核、"99"为99版内核；"ua_auto"为智能匹配；
    // type：浏览器类型，chrome || firefox。
    browser_kernel_config?:JSON, // 浏览器内核配置，支持： 0：默认内核； 1：自定义内核。
    // 0：使用【本地设置-硬件加速】的配置；
    // 1：开启硬件加速，可提升浏览器性能。使用不同的硬件，可能会影响硬件相关的指纹；
    // 2：关闭硬件加速，会降低浏览器性能。
    gpu?:string,    
    tls_switch:string, // ‘1’ 为开启禁用， ‘0’ 为不禁用
    tls?:string,    // 传入对应的 tls 16进制码，多个用英文逗号分隔，详情见 chrome_tls_cripher
}

export { 
    ApiResponse,
    AdsProxyConfig,
    AdsFingerprintConfig
};