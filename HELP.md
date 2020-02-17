# 指令集

```json
{ "Cmd": "alwaysPage", "Comment": "选择一个已有的或新建一个页面" }
{ "Cmd": "bootMultilogin", "Comment": "连接multilogin", "Key": "profileId", "Options": {"multilogin": "http://127.0.0.1:45000"} },
{ "Cmd": "bootPuppeteer", "Comment": "启动Puppeteer", "Options": { "headless": true, "args": ["--no-sandbox"], "defaultViewport": null } }
{ "Cmd": "break", "Comment": "跳出循环", "Value": "满足条件才break/空就是无条件break" }
{ "Cmd": "click", "Comment": "点击搜索", "Selector": "#su" }
{ "Cmd": "closePage", "Comment": "关闭页面" }
{ "Cmd": "condition", "Comment": "条件判断", "Conditions": [ { "Condition": "key1==123", "Json": [{Cmd...}] } ] }
{ "Cmd": "createMultilogin", "Comment": "创建multilogin指纹", "Options": {"multilogin": "http://127.0.0.1:45000"}},
{ "Cmd": "hover", "Comment": "鼠标hover", "Selector": "#su" }
{ "Cmd": "httpGet", "Comment": "网络get请求Value地址，返回数据保存到Key中", Key: "ip", Value: "http://ip.lyl.hk" }
{ "Cmd": "js", "Comment": "高级操作，执行javascript，返回对象保存到DB数据", "Value": "let _ip=(await axios.default.get('http://ip.lyl.hk')).data;return {ip2:_ip}" }
{ "Cmd": "log", "Comment": "记录Key或Value到日志", "Key": "key1", "Value": "123" }
{ "Cmd": "loop", "Comment": "循环Key或Value次数", Key: "循环次数", Value: "循环次数", "Json": [{Cmd...}] }
{ "Cmd": "navigation", "Comment": "浏览器打开百度", "Key": "url", "Options": { waitUntil: "domcontentloaded" } }
{ "Cmd": "newPage", "Comment": "创建新页面" }
{ "Cmd": "select", "Comment": "下拉框选择Key或Value", "Selector": "#select1", "Value": "option1" },
{ "Cmd": "setDefaultNavigationTimeout", "Comment": "设置默认打开页面超时时间，时间来自Key或Value", "Value": "5000" },
{ "Cmd": "setHeader", "Comment": "设置Header，Multilogin中无效", "Options": { "Accept-Language": "zh-CN,zh;q=0.9" } }
{ "Cmd": "shutdown", "Comment": "关闭程序" }
{ "Cmd": "textContent", "Comment": "获取textContent，保存到DB的Key中", "Selector": ".op-stockdynamic-moretab-cur-num", "Key": "price" }
{ "Cmd": "throw", "Comment": "中断所有操作，抛出Key或Value信息", "Key": "key1", "Value": "发现错误" }
{ "Cmd": "type", "Comment": "输入从DB读取的Key，或直接输入Value", "Selector": "#kw", "Key": "keyword", "Value": "keyword" }
{ "Cmd": "var", "Comment": "将Value定义到变量Key，保存到DB中", "Key": "key1", "Value": "123" }
{ "Cmd": "wait", "Comment": "等待", "Value": "30000" }
{ "Cmd": "waitForNavigation", "Comment": "等待页面加载完成，一般不需要主动调用" }
{ "Cmd": "waitForSelector", "Comment": "等待元素出现，一般不需要主动调用" }
{ "Cmd": "waitRand", "Comment": "随机等待", "Options": {"min": 2000, "max": 3000} }
```
