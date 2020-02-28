# 指令集

```json
{ "Cmd": "alwaysPage", "Comment": "选择一个已有的或新建一个页面" }
{ "Cmd": "bootMultilogin", "Comment": "连接multilogin", "Key": "profileId" },
{ "Cmd": "bootPuppeteer", "Comment": "启动Puppeteer", "Options": { "headless": true, "args": ["--no-sandbox"], "defaultViewport": null } }
{ "Cmd": "break", "Comment": "跳出循环", "Key": "满足条件才break/空就是无条件break" }
{ "Cmd": "call", "Comment": "调用操作集合", "Value": "sub1"}
{ "Cmd": "click", "Comment": "点击搜索", "Selector": "#su", "Index":"用于多个元素的索引" }
{ "Cmd": "closePage", "Comment": "关闭页面" }
{ "Cmd": "condition", "Comment": "条件判断", "Conditions": [ { "Condition": "key1==123", "Json": [{Cmd...}] } ] }
{ "Cmd": "continue", "Comment": "继续循环", "Key": "满足条件才continue/空就是无条件continue" }
{ "Cmd": "createMultilogin", "Comment": "创建multilogin指纹", Key:"createOption" },
{ "Cmd": "dbClick", "Comment": "双击点击", "Selector": "#kw", "Index":"用于多个元素的索引" }
{ "Cmd": "elementCount", "Comment": "获取元素数量", "Selector": "#select1", "Key": "key1" },
{ "Cmd": "existsSelector", "Comment": "是否存在某个元素，存在返回'1'，不存在返回'0'", "Key":"el1", "Selector":"选择器" }
{ "Cmd": "filterRequest", "Comment": "过滤请求，变量_url", "Key": "/\.png$/.test(_url) || /\.jpg$/.test(_url)" }
{ "Cmd": "finally", "Comment": "无论如何，最终执行一些清理操作", "Json": [{Cmd...}] }
{ "Cmd": "hover", "Comment": "鼠标hover", "Selector": "#su", "Index":"用于多个元素的索引" }
{ "Cmd": "httpGet", "Comment": "网络get请求Value地址，返回数据保存到Key中", Key: "ip", Value: "http://ip.lyl.hk" }
{ "Cmd": "js", "Comment": "高级操作，执行javascript，返回对象保存到DB数据", "Value": "let _ip=(await axios.default.get('http://ip.lyl.hk')).data;return {ip2:_ip}" }
{ "Cmd": "log", "Comment": "记录Key或Value到日志", "Key": "key1", "Value": "123" }
{ "Cmd": "loop", "Comment": "循环Key或Value次数，内置loopCounter为循环计数器", Key: "循环次数", Value: "循环次数", "Json": [{Cmd...}] }
{ "Cmd": "navigation", "Comment": "浏览器打开百度", "Key": "url", "Options": { waitUntil: "domcontentloaded" } }
{ "Cmd": "newPage", "Comment": "创建新页面" }
{ "Cmd": "outerHTML", "Comment": "获取outerHTML，保存到DB的Key中", "Selector": ".op-stockdynamic-moretab-cur-num", "Key": "html", "Index":"用于多个元素的索引" }
{ "Cmd": "random", "Comment": "生成随机数", "Key": "rand1", "Options": {"min":2, "max":5}}
{ "Cmd": "reloadPage", "Comment": "刷新页面", WaitNav: true }
{ "Cmd": "screenshot", "Comment": "屏幕截图保存到Key中，Options参考puppeteer", "Key": "screenshot1", Options:{} },
{ "Cmd": "select", "Comment": "下拉框选择Key或Value", "Selector": "#select1", "Value": "option1" },
{ "Cmd": "setHeader", "Comment": "设置Header，Multilogin中无效", "Options": { "Accept-Language": "zh-CN,zh;q=0.9" } }
{ "Cmd": "setTimeout", "Comment": "设置默认打开页面超时时间，时间来自Key或Value", "Value": "5000" },
{ "Cmd": "showMouse", "Comment": "显示鼠标"}
{ "Cmd": "shutdown", "Comment": "关闭程序" }
{ "Cmd": "sub", "Comment": "定义一组操作集合", "Value": "sub1", "Json": [{Cmd...}] }
{ "Cmd": "textContent", "Comment": "获取textContent，保存到DB的Key中", "Selector": ".op-stockdynamic-moretab-cur-num", "Key": "text", "Index":"用于多个元素的索引" }
{ "Cmd": "threeClick", "Comment": "三击点击", "Selector": "#kw", "Index":"用于多个元素的索引" }
{ "Cmd": "throw", "Comment": "中断所有操作，抛出Key或Value信息", "Key": "key1", "Value": "发现错误" }
{ "Cmd": "type", "Comment": "输入从DB读取的Key，或直接输入Value，默认延时500毫秒", "Selector": "#kw", "Key": "keyword", "Value": "keyword", Options: { delay: 500 } }
{ "Cmd": "var", "Comment": "将Value定义到变量Key，保存到DB中", "Key": "key1", "Value": "123" }
{ "Cmd": "wait", "Comment": "等待", "Value": "30000" }
{ "Cmd": "waitForNavigation", "Comment": "等待页面加载完成，一般不需要主动调用" }
{ "Cmd": "waitForSelector", "Comment": "等待元素出现，一般不需要主动调用", "Selector":"选择器" }
{ "Cmd": "waitRand", "Comment": "随机等待", "Options": {"min": 2000, "max": 3000} }
```
