// 百家姓列表
const surnames = [
    "a", "ai", "an", "ang", "ao", "ba", "bai", "ban", "bang", "bao",
  "bei", "ben", "beng", "bi", "bian", "biao", "bie", "bin", "bing", "bo",
  "bu", "ca", "cai", "can", "cang", "cao", "ce", "cen", "ceng", "cha",
  "chai", "chan", "chang", "chao", "che", "chen", "cheng", "chi", "chong", "chou",
  "chu", "chua", "chuai", "chuan", "chuang", "chui", "chun", "chuo", "ci", "cong",
  "cou", "cu", "cuan", "cui", "cun", "cuo", "da", "dai", "dan", "dang",
  "dao", "de", "den", "deng", "di", "dian", "diao", "die", "ding", "diu",
  "dong", "dou", "du", "duan", "dui", "dun", "duo", "e", "en", "er",
  "fa", "fan", "fang", "fei", "fen", "feng", "fo", "fou", "fu", "ga",
  "gai", "gan", "gang", "gao", "ge", "gei", "gen", "geng", "gong", "gou",
  "gu", "gua", "guai", "guan", "guang", "gui", "gun", "guo", "ha", "hai",
  "han", "hang", "hao", "he", "hei", "hen", "heng", "hong", "hou", "hu",
  "hua", "huai", "huan", "huang", "hui", "hun", "huo", "ji", "jia", "jian",
  "jiang", "jiao", "jie", "jin", "jing", "jiong", "jiu", "ju", "juan", "jue",
  "jun", "ka", "kai", "kan", "kang", "kao", "ke", "ken", "keng", "kong",
  "kou", "ku", "kua", "kuai", "kuan", "kuang", "kui", "kun", "kuo", "la",
  "lai", "lan", "lang", "lao", "le", "lei", "leng", "li", "lian", "liang",
  "liao", "lie", "lin", "ling", "liu", "long", "lou", "lu", "luan", "lue",
  "lun", "luo", "ma", "mai", "man", "mang", "mao", "me", "mei", "men",
  "meng", "mi", "mian", "miao", "mie", "min", "ming", "miu", "mo", "mou",
  "mu", "na", "nai", "nan", "nang", "nao", "ne", "nei", "nen", "neng",
  "ni", "nian", "niang", "niao", "nie", "nin", "ning", "niu", "nong", "nou",
  "nu", "nuan", "nue", "nun", "nuo", "ou", "pa", "pai", "pan", "pang",
  "pao", "pei", "pen", "peng", "pi", "pian", "piao", "pie", "pin", "ping",
  "po", "pou", "pu", "qi", "qia", "qian", "qiang", "qiao", "qie", "qin",
  "qing", "qiong", "qiu", "qu", "quan", "que", "qun", "ran", "rang", "rao",
  "re", "ren", "reng", "ri", "rong", "rou", "ru", "ruan", "rui", "run",
  "ruo", "sa", "sai", "san", "sang", "sao", "se", "sen", "seng", "sha",
  "shai", "shan", "shang", "shao", "she", "shen", "sheng", "shi", "shou", "shu",
  "shua", "shuai", "shuan", "shuang", "shui", "shun", "shuo", "si", "song", "sou",
  "su", "suan", "sui", "sun", "suo", "ta", "tai", "tan", "tang", "tao",
  "te", "teng", "ti", "tian", "tiao", "tie", "ting", "tong", "tou", "tu",
  "tuan", "tui", "tun", "tuo", "wa", "wai", "wan", "wang", "wei", "wen",
  "weng", "wo", "wu", "xi", "xia", "xian", "xiang", "xiao", "xie", "xin",
  "xing", "xiong", "xiu", "xu", "xuan", "xue", "xun", "ya", "yan", "yang",
  "yao", "ye", "yi", "yin", "ying", "yo", "yong", "you", "yu", "yuan",
  "yue", "yun", "za", "zai", "zan", "zang", "zao", "ze", "zei", "zen",
  "zeng", "zha", "zhai", "zhan", "zhang", "zhao", "zhe", "zhen", "zheng", "zhi",
  "zhong", "zhou", "zhu", "zhua", "zhuai", "zhuan", "zhuang", "zhui", "zhun", "zuo",
  "zong", "zou", "zu", "zuan", "zui", "zun", "zuo", "ouyang", "sima", "shangguan",
  "xiahou", "zhuge", "wenren", "dongfang", "helian", "huangfu", "weichi", "gongyang",
  "dantai", "gongye", "zongzheng", "puyang", "chunyu", "shanyu", "taishu", "shentu",
  "gongsun", "zhongsun", "xuanyuan", "linghu", "zhongli", "yuwen", "changsun", "murong",
  "situ", "sikong"
  ];
  
  // 3000常见汉字去重拼音（450个）
  const nameParts = [
    "a", "ai", "an", "ang", "ao", "ba", "bai", "ban", "bang", "bao",
    "bei", "ben", "beng", "bi", "bian", "biao", "bie", "bin", "bing", "bo",
    "bu", "ca", "cai", "can", "cang", "cao", "ce", "cen", "ceng", "cha",
    "chai", "chan", "chang", "chao", "che", "chen", "cheng", "chi", "chong", "chou",
    "chu", "chua", "chuai", "chuan", "chuang", "chui", "chun", "chuo", "ci", "cong",
    "cou", "cu", "cuan", "cui", "cun", "cuo", "da", "dai", "dan", "dang",
    "dao", "de", "den", "deng", "di", "dian", "diao", "die", "ding", "diu",
    "dong", "dou", "du", "duan", "dui", "dun", "duo", "e", "en", "er",
    "fa", "fan", "fang", "fei", "fen", "feng", "fo", "fou", "fu", "ga",
    "gai", "gan", "gang", "gao", "ge", "gei", "gen", "geng", "gong", "gou",
    "gu", "gua", "guai", "guan", "guang", "gui", "gun", "guo", "ha", "hai",
    "han", "hang", "hao", "he", "hei", "hen", "heng", "hong", "hou", "hu",
    "hua", "huai", "huan", "huang", "hui", "hun", "huo", "ji", "jia", "jian",
    "jiang", "jiao", "jie", "jin", "jing", "jiong", "jiu", "ju", "juan", "jue",
    "jun", "ka", "kai", "kan", "kang", "kao", "ke", "ken", "keng", "kong",
    "kou", "ku", "kua", "kuai", "kuan", "kuang", "kui", "kun", "kuo", "la",
    "lai", "lan", "lang", "lao", "le", "lei", "leng", "li", "lian", "liang",
    "liao", "lie", "lin", "ling", "liu", "long", "lou", "lu", "luan", "lue",
    "lun", "luo", "ma", "mai", "man", "mang", "mao", "me", "mei", "men",
    "meng", "mi", "mian", "miao", "mie", "min", "ming", "miu", "mo", "mou",
    "mu", "na", "nai", "nan", "nang", "nao", "ne", "nei", "nen", "neng",
    "ni", "nian", "niang", "niao", "nie", "nin", "ning", "niu", "nong", "nou",
    "nu", "nuan", "nue", "nun", "nuo", "ou", "pa", "pai", "pan", "pang",
    "pao", "pei", "pen", "peng", "pi", "pian", "piao", "pie", "pin", "ping",
    "po", "pou", "pu", "qi", "qia", "qian", "qiang", "qiao", "qie", "qin",
    "qing", "qiong", "qiu", "qu", "quan", "que", "qun", "ran", "rang", "rao",
    "re", "ren", "reng", "ri", "rong", "rou", "ru", "ruan", "rui", "run",
    "ruo", "sa", "sai", "san", "sang", "sao", "se", "sen", "seng", "sha",
    "shai", "shan", "shang", "shao", "she", "shen", "sheng", "shi", "shou", "shu",
    "shua", "shuai", "shuan", "shuang", "shui", "shun", "shuo", "si", "song", "sou",
    "su", "suan", "sui", "sun", "suo", "ta", "tai", "tan", "tang", "tao",
    "te", "teng", "ti", "tian", "tiao", "tie", "ting", "tong", "tou", "tu",
    "tuan", "tui", "tun", "tuo", "wa", "wai", "wan", "wang", "wei", "wen",
    "weng", "wo", "wu", "xi", "xia", "xian", "xiang", "xiao", "xie", "xin",
    "xing", "xiong", "xiu", "xu", "xuan", "xue", "xun", "ya", "yan", "yang",
    "yao", "ye", "yi", "yin", "ying", "yo", "yong", "you", "yu", "yuan",
    "yue", "yun", "za", "zai", "zan", "zang", "zao", "ze", "zei", "zen",
    "zeng", "zha", "zhai", "zhan", "zhang", "zhao", "zhe", "zhen", "zheng", "zhi",
    "zhong", "zhou", "zhu", "zhua", "zhuai", "zhuan", "zhuang", "zhui", "zhun", "zhuo",
    "zi", "zong", "zou", "zu", "zuan", "zui", "zun", "zuo"
  ];
  
  // 修饰词（出生年份 1965-2007 + 其他随机数字）
  const modifiers = [
    ...Array.from({ length: 43 }, (_, i) => (1965 + i).toString()), // 1965-2007
    "123", "456", "789", "666", "888", "999", "1234", "4321", "8888", "520", "1314"
  ];
  



  // 生成唯一用户名的函数
  export function generateUniqueUsernames(targetCount: number): string[] {
    const usernames = new Set<string>();
    const maxAttempts = targetCount * 2; // 防止无限循环，尝试次数设为目标的两倍
    let attempts = 0;
  
    while (usernames.size < targetCount && attempts < maxAttempts) {
        // 姓氏
        const surname = surnames[Math.floor(Math.random() * surnames.length)];
        // 名1
        const name1 = nameParts[Math.floor(Math.random() * nameParts.length)];
        // 名2
        const name2 = nameParts[Math.floor(Math.random() * nameParts.length)];
        // 修饰词
        const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
        // 创建一个1-100的随机数
        const randomNum = Math.floor(Math.random() * 100) + 1; // 1-100的随机数
        // 生成用户名：只有40%概率得用户名存在尾部数字修饰
        const username = `${surname}${name1+name2}${ randomNum>60?modifier:''}`;
  
        usernames.add(username);
        attempts++;
    }
  
    if (usernames.size < targetCount) {
      console.warn(`只生成了 ${usernames.size} 个唯一用户名，未达到目标 ${targetCount}`);
    }
  
    return Array.from(usernames);
  }
  
//   // 生成 100 万个唯一用户名
//   const targetCount = 1_000_000;
//   const uniqueUsernames = generateUniqueUsernames(targetCount);
  
//   // 输出前 10 个示例并显示总数
//   console.log("生成的用户名前 10 个示例：", uniqueUsernames.slice(0, 10));
//   console.log("总计生成唯一用户名数量：", uniqueUsernames.length);
  
//   // 可选：将结果保存到文件
//   import { writeFileSync } from "fs";
//   writeFileSync("usernames.json", JSON.stringify(uniqueUsernames, null, 2), "utf-8");
//   console.log("用户名已保存到 usernames.json 文件");