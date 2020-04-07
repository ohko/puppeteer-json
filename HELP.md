# 指令集

```json
{ "Cmd": "alwaysPage", "Comment": "选择一个已有的或新建一个页面" }
{ "Cmd": "bootMultilogin", "Comment": "连接multilogin", "Key": "profileId" },
{ "Cmd": "bootPuppeteer", "Comment": "启动Puppeteer", "Options": { "headless": true, "args": ["--no-sandbox"], "defaultViewport": null } }
{ "Cmd": "break", "Comment": "跳出循环", "SyncEval": "满足条件才break/空就是无条件break" }
{ "Cmd": "call", "Comment": "调用操作集合", "Value": "sub1"}
{ "Cmd": "checkZoom", "Comment": "如果页面Zoom被人为改动过，就会抛出异常"}
{ "Cmd": "click", "Comment": "点击搜索", "Selector": "#su", "Index":"用于多个元素的索引", "WaitNav":false }
{ "Cmd": "clickText", "Comment": "点击字符串", "Selector":"选择器", "Key":"key"}
{ "Cmd": "closePage", "Comment": "关闭页面" }
{ "Cmd": "condition", "Comment": "条件判断", "Conditions": [ { "Condition": "key1==123", "Json": [{Cmd...}] } ] }
{ "Cmd": "continue", "Comment": "继续循环", "SyncEval": "满足条件才continue/空就是无条件continue" }
{ "Cmd": "createMultilogin", "Comment": "创建multilogin指纹", Options:<base.CmdCreateMultilogin>{} },
{ "Cmd": "dbClick", "Comment": "双击点击", "Selector": "#kw", "Index":"用于多个元素的索引", "WaitNav":false }
{ "Cmd": "elementCount", "Comment": "获取元素数量", "Selector": "#select1", "Key": "key1" },
{ "Cmd": "existsSelector", "Comment": "是否存在某个元素，存在返回'1'，不存在返回'0'", "Selector":"选择器", "Json":[...]}
{ "Cmd": "filterRequest", "Comment": "过滤请求，变量_url", "SyncEval": "/\.png$/.test(_url) || /\.jpg$/.test(_url)" }
{ "Cmd": "finally", "Comment": "无论如何，最终执行一些清理操作", "Json": [{Cmd...}] }
{ "Cmd": "getURL", "Comment": "获取浏览器地址", Key:"nowURL" }
{ "Cmd": "hover", "Comment": "鼠标hover", "Selector": "#su", "Index":"用于多个元素的索引" }
{ "Cmd": "httpGet", "Comment": "网络get请求Value地址，返回数据保存到Key中", Key: "ip", Value: "http://ip.lyl.hk" }
{ "Cmd": "if", "Comment": "条件满足则会执行", "SyncEval": "a=1", "Json":[...]}
{ "Cmd": "js", "Comment": "高级操作，执行javascript，返回对象保存到DB数据", "AsyncEval": "let _ip=(await axios.default.get('http://ip.lyl.hk')).data;return {ip2:_ip}" }
{ "Cmd": "jumpOut", "Comment": "跳出循环", "SyncEval": "满足条件才jumpOut/空就是无条件jumpOut" }
{ "Cmd": "log", "Comment": "记录Key或Value到日志", "Key": "key1", "SyncEval": "123" }
{ "Cmd": "loop", "Comment": "循环Key或Value次数，内置loopCounter为循环计数器", Key: "循环次数", "Json": [{Cmd...}] }
{ "Cmd": "navigation", "Comment": "浏览器打开百度", "Key": "url", "Options": { waitUntil: "domcontentloaded" } }
{ "Cmd": "newPage", "Comment": "创建新页面" }
{ "Cmd": "notExistsSelector", "Comment": "是否存在某个元素，存在返回'1'，不存在返回'0'", "Selector":"选择器", "Json":[...]}
{ "Cmd": "outerHTML", "Comment": "获取outerHTML，保存到DB的Key中", "Selector": ".op-stockdynamic-moretab-cur-num", "Key": "html", "Index":"用于多个元素的索引" }
{ "Cmd": "pageEval", "Comment": "在页面执行脚本", "Value": "{host:location.host}" },
{ "Cmd": "random", "Comment": "生成随机数", "Key": "rand1", "Options": {"min":"key1", "max":"key2"}}
{ "Cmd": "reloadPage", "Comment": "刷新页面" }
{ "Cmd": "return", "Comment": "返回", "SyncEval": "满足条件才return/空就是无条件return" }
{ "Cmd": "screenshot", "Comment": "屏幕截图保存到Value中，Options参考puppeteer", "Value": "screenshot1", Options:{} },
{ "Cmd": "screenshotBase64", "Comment": "Selector截图保存到Value中，Options参考puppeteer", "Value": "screenshot1", Options:{} },
{ "Cmd": "select", "Comment": "下拉框选择Key或Value", "Selector": "#select1", "Value": "option1" },
{ "Cmd": "setHeader", "Comment": "设置Header，Multilogin中无效", "Options": { "Accept-Language": "zh-CN,zh;q=0.9" } }
{ "Cmd": "setTimeout", "Comment": "设置默认打开页面超时时间，时间来自Key或Value", "Key": "timeout" },
{ "Cmd": "shareMultilogin", "Comment": "连接multilogin", "Key": "profileId", "Value":"shareToUser" },
{ "Cmd": "showMouse", "Comment": "显示鼠标"}
{ "Cmd": "shutdown", "Comment": "关闭程序" }
{ "Cmd": "sub", "Comment": "定义一组操作集合", "Value": "sub1", "Json": [{Cmd...}] }
{ "Cmd": "textContent", "Comment": "获取textContent，保存到DB的Key中", "Selector": ".op-stockdynamic-moretab-cur-num", "Key": "text", "Index":"用于多个元素的索引" }
{ "Cmd": "threeClick", "Comment": "三击点击", "Selector": "#kw", "Index":"用于多个元素的索引", "WaitNav":false }
{ "Cmd": "throw", "Comment": "中断所有操作，抛出Key或Value信息", "SyncEval": "满足条件才throw/空就是无条件throw" }
{ "Cmd": "type", "Comment": "输入从DB读取的Key，或直接输入Value，默认延时500毫秒", "Selector": "#kw", "Key": "keyword" }
{ "Cmd": "var", "Comment": "将Value定义到变量Key，保存到DB中", "Key": "key1", "SyncEval": "123" }
{ "Cmd": "wait", "Comment": "等待", "Value": "5000" }
{ "Cmd": "waitForNavigation", "Comment": "等待页面加载完成，一般不需要主动调用" }
{ "Cmd": "waitForSelector", "Comment": "等待元素出现，一般不需要主动调用", "Selector":"选择器" }
{ "Cmd": "waitKey", "Comment": "随机等待", "Key": "waitTime" }
```
