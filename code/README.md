

### 程序命令

~~~
# 调试
npm run dev


# 编译
tsc

# 启动
npm run start

# 单元测试
npm test

# 编译
npm run build

~~~

### 配置说明

~~~
# 配置文件直接放在项目代码目录同级目录中

# 全局私钥文件，一行一个私钥
private_keys.txt

# 全局代理文件
proxies.txt


~~~



## 任务说明


~~~json
{ "id": "TASK_OKX_AUTO_SWAP", "time": "*/10 * * * * *", "module": "./services/schedule/task.auto.mutual", "interface": "taskOctoAutoSwap" }

{ "id": "TASK_KLOKAPP_AUTO_FLOW", "time": "*/10 * * * * *", "module": "./services/schedule/task.auto.mutual", "interface": "taskKlokappAutoFlow" }

{ "id": "TASK_CORESKY_AUTO_FLOW", "time": "*/10 * * * * *", "module": "./services/schedule/task.auto.mutual", "interface": "taskCoreskyAutoFlow" }

{ "id": "TASK_SOMNIA_AUTO_FLOW", "time": "*/10 * * * * *", "module": "./services/schedule/task.auto.mutual", "interface": "taskSomniaAutoFlow" }

{ "id": "TASK_MAHOJIN_AUTO_FLOW", "time": "*/10 * * * * *", "module": "./services/schedule/task.auto.mutual", "interface": "taskMahojinAutoFlow" }

{ "id": "TASK_SATSTERMINAL_AUTO_FLOW", "time": "*/10 * * * * *", "module": "./services/schedule/task.auto.mutual", "interface": "taskSatsterminalAutoFlow" }

~~~
