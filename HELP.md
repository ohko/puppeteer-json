# 指令集

本指令文档为初稿，后期将有更详细的文档来介绍各个指令的使用。

Selector 选择器，你可以使用任何html支持的选择器来选择你需要操作的dom元素。

Index 下标，有时候你要操作的元素本身就是列表的其中一个，那么其选择器必然会命中多个元素，可以通过Index下标来指定某一个。

Key 命令的执行有时候也是需要逻辑参数的，Key为我们提供了参数名称，这些参数在DB里被定义过则会在命令里被正确的使用其指定的值。

DB 就像一个全局环境，你的脚本内的一些取值，赋值，javascript 代码 能够使用的参数均来之DB，你的在javascript代码里返回的结果(必须是对象)也将会自动被
合并到DB里。

```javascript
let cmds=[
// 将脚本所处理的界面切换到第一个创建的浏览器tab界面。
{ "Cmd": "alwaysPage", "Comment": "选择一个已有的或新建一个页面" },

// 启动 Multilogin 浏览器，现在很少用它了，大部分使用 Vmlogin， 通过key传入指定的浏览器配置文件id。
{ "Cmd": "bootMultilogin", "Comment": "连接multilogin", "Key": "profileId" },

// 启动 Puppeteer 自带浏览器， Options 支持的参数见：https://zhaoqize.github.io/puppeteer-api-zh_CN/#?product=Puppeteer&version=v5.3.1&show=api-puppeteerlaunchoptions
{ "Cmd": "bootPuppeteer", "Comment": "启动Puppeteer", "Options": { "headless": true, "args": ["--no-sandbox"], "defaultViewport": null } },

// 跳出Loop循环，如果有多成Loop嵌套，只会跳出一层。
{ "Cmd": "break", "Comment": "跳出循环", "SyncEval": "满足条件才break/空就是无条件break" },

// 执行某个 sub 模块。
{ "Cmd": "call", "Comment": "调用操作集合", "Value": "sub1"},

// 检查网页是否被进行过缩放,如果进行过，将会抛出错误。
{ "Cmd": "checkZoom", "Comment": "如果页面Zoom被人为改动过，就会抛出异常"},

// 点击指定元素，如果点击了后会导致界面跳转，请将WaitNav设置为true，这样可以确保界面跳转后打开成功。再进行下一步命令。
{ "Cmd": "click", "Comment": "点击搜索", "Selector": "#su", "Index":"用于多个元素的索引", "WaitNav":false },

// 手机端点击指定元素
{ "Cmd": "tap", "Comment": "点击搜索", "Selector": "#su", "Index":"用于多个元素的索引", "WaitNav":false },

// 点击具有某个文案的元素，你传入的 Selector 通常会命中多个元素，然后通过你传入的Key确认到你要点击的那个元素。最后进行点击。
{ "Cmd": "clickText", "Comment": "点击字符串", "Selector":"选择器", "Key":"key"},

// 关闭当前处理的tab页
{ "Cmd": "closePage", "Comment": "关闭页面" },

// 条件判断，这玩意儿就像 Switch-case 这种东西
{ "Cmd": "condition", "Comment": "条件判断", "Conditions": [ { "Condition": "key1==123", "Json": [{Cmd...}] } ] },

// 在Loop循环里使用此命令，将实现和for循环本身的continue那样的功能
{ "Cmd": "continue", "Comment": "继续循环", "SyncEval": "满足条件才continue/空就是无条件continue" },

// 创建 Multilogin 指纹 命令
{ "Cmd": "createMultilogin", "Comment": "创建multilogin指纹", Options:{} },

// 双击指定的元素
{ "Cmd": "dbClick", "Comment": "双击点击", "Selector": "#kw", "Index":"用于多个元素的索引", "WaitNav":false },

// 获取指定元素的数量
{ "Cmd": "elementCount", "Comment": "获取元素数量", "Selector": "#select1", "Key": "key1" },

// 判断某个原数是否存在，如果存在，则只需json里的脚本。
{ "Cmd": "existsSelector", "Comment": "是否存在某个元素，存在返回'1'，不存在返回'0'", "Selector":"选择器", "Json":[...]},

// 请求过滤，此命令需要用在某个请求发起前，此命令传入 _url 参数，使你可以判断该url是否有必要拦截，SyncEval 返回true则会拦截。
{ "Cmd": "filterRequest", "Comment": "过滤请求，变量_url", "SyncEval": "/\.png$/.test(_url) || /\.jpg$/.test(_url)" },

// 用于最终执行的脚本块，无论出错与否，Json内的脚本都会执行，但如果这里面的脚本本身抛出错误，则会中断它的执行并抛出此错误且覆盖原来的错误。
{ "Cmd": "finally", "Comment": "无论如何，最终执行一些清理操作", "Json": [{Cmd...}] },

// 获取当前页面的地址，注意，此方法获取不到url里包含#号后面的内容
{ "Cmd": "getURL", "Comment": "获取浏览器地址", Key:"nowURL" },

// 将鼠标移动到指定元素上。
{ "Cmd": "hover", "Comment": "鼠标hover", "Selector": "#su", "Index":"用于多个元素的索引" },

// 进行Get请求，返回结果将被保存到指定的key里。
{ "Cmd": "httpGet", "Comment": "网络get请求Value地址，返回数据保存到Key中", Key: "ip", Value: "http://ip.lyl.hk" },

// if判断
{ "Cmd": "if", "Comment": "条件满足则会执行", "SyncEval": "a=1", "Json":[...], "ElseJson": [...]},

// 执行一段Js代码，注意，这段js代码的执行环境为node环境
{ "Cmd": "js", "Comment": "高级操作，执行javascript，返回对象保存到DB数据", "AsyncEval": "let _ip=(await axios.default.get('http://ip.lyl.hk')).data;return {ip2:_ip}" },

// 用在If命令里,则后续的代码将不会执行, 用在Condition里，则当前条件跳过执行下一个满足条件的condition
{ "Cmd": "jumpOut", "Comment": "跳出循环", "SyncEval": "满足条件才jumpOut/空就是无条件jumpOut" },

// 输出一个日志记录
{ "Cmd": "log", "Comment": "记录Key或Value到日志", "SyncEval": "123" },

// 执行循环，再循环内，你可以使用 loopCounter 这个内置字段来获取当前循环下标，下标你可以改，但改了只会在当前循环体后面生效， 且修改后不会影响循环执行的本身。
{ "Cmd": "loop", "Comment": "循环Key或Value次数，内置loopCounter为循环计数器", Key: "循环次数", "Json": [{Cmd...}] },

// 在当前控制的tab里打开指定网页
{ "Cmd": "navigation", "Comment": "浏览器打开百度", "Key": "url", "Options": { waitUntil: "domcontentloaded" } },

// 打开一个新的tab页面
{ "Cmd": "newPage", "Comment": "创建新页面" },

// 如果指定选择器不存在，则执行Json里的内容
{ "Cmd": "notExistsSelector", "Comment": "是否存在某个元素，存在返回'1'，不存在返回'0'", "Selector":"选择器", "Json":[...]},

// 获取指定原数的html文本内容
{ "Cmd": "outerHTML", "Comment": "获取outerHTML，保存到DB的Key中", "Selector": ".op-stockdynamic-moretab-cur-num", "Key": "html", "Index":"用于多个元素的索引" },

// 执行一段js代码，注意，这段js代码执行环境是当前所在的tab内的网页里，因此你有机会使用这里的代码获取网页内的一些东西。
{ "Cmd": "pageEval", "Comment": "在页面执行脚本", "Value": "{host:location.host}" },,

// 产生一个 [min, max] 的随机数
{ "Cmd": "random", "Comment": "生成随机数", "Key": "rand1", "Options": {"min":"key1", "max":"key2"}},

// 刷新当前页面
{ "Cmd": "reloadPage", "Comment": "刷新页面" },

// 常常用在sub模块里，此命令执行后，sub模块后面的所有代码将不会再执行。
{ "Cmd": "return", "Comment": "返回", "SyncEval": "满足条件才return/空就是无条件return" },

// 截图，但你无法使用截取到的图，这是用于截取给后端做记录看的。
{ "Cmd": "screenshot", "Comment": "屏幕截图保存到Value中，Options参考puppeteer", "Value": "screenshot1", Options:{} },

// 截图，然后你可以通过指定的Value来获取截图的base64内容。
{ "Cmd": "screenshotBase64", "Comment": "Selector截图保存到Value中，Options参考puppeteer", "Value": "screenshot1", Options:{} },

// 选择下拉框(只能是原生下拉框)里的某个值。
{ "Cmd": "select", "Comment": "下拉框选择Key或Value", "Selector": "#select1", "Value": "option1" },

// 设置请求头，设置后会作用到之后所发出的所有请求上
{ "Cmd": "setHeader", "Comment": "设置Header，Multilogin中无效", "Options": { "Accept-Language": "zh-CN,zh;q=0.9" } },

// 设置页面打开超时时间
{ "Cmd": "setTimeout", "Comment": "设置默认打开页面超时时间，时间来自Key或Value", "Key": "timeout" },

// 分享 Multilogin 到指定用户， 这个指令很少用了。
{ "Cmd": "shareMultilogin", "Comment": "连接multilogin", "Key": "profileId", "Value":"shareToUser" },

// 显示鼠标位置，会在界面上显示一个灰色小圆点， 这个请只在测试时使用
{ "Cmd": "showMouse", "Comment": "显示鼠标"},

// 关闭浏览器
{ "Cmd": "shutdown", "Comment": "关闭程序" },

// 定义一个模块，然后这个模块可以被 call 命令调用
{ "Cmd": "sub", "Comment": "定义一组操作集合", "Value": "sub1", "Json": [{Cmd...}] },

// 获取指定元素内的文本内容
{ "Cmd": "textContent", "Comment": "获取textContent，保存到DB的Key中", "Selector": ".op-stockdynamic-moretab-cur-num", "Key": "text", "Index":"用于多个元素的索引" },

// 三击指定元素
{ "Cmd": "threeClick", "Comment": "三击点击", "Selector": "#kw", "Index":"用于多个元素的索引", "WaitNav":false },

// 抛出某个错误，如果条件满足的情况下
{ "Cmd": "throw", "Comment": "中断所有操作，抛出Key或Value信息", "SyncEval": "满足条件才throw/空就是无条件throw" },

// 输入key指定的文本内容到指定的元素
{ "Cmd": "type", "Comment": "输入从DB读取的Key，或直接输入Value，默认延时500毫秒", "Selector": "#kw", "Key": "keyword" },

// 在DB里定义一个变量，小技巧，有时候可能结果或出错时会输出大量的内容，而有些内容可能就是之前进行的textContent命令的页面内容，你可以在结尾时重新var一下，然后 SyncEval传空，则可以起到清理这个字段的效果。
{ "Cmd": "var", "Comment": "将Value定义到变量Key，保存到DB中", "Key": "key1", "SyncEval": "123" },

// 等待指定的时间
{ "Cmd": "wait", "Comment": "等待", "Value": "5000" },

// 等待某个页面打开完成，允许你在Json里写一些脚本，这些脚本如果会发生页面跳转，此命令就会在跳转成功后继续下面的命令。
{ "Cmd": "waitForNavigation", "Comment": "等待页面加载完成，一般不需要主动调用", Json: [...] },

// 等待某个选择器在界面上出现
{ "Cmd": "waitForSelector", "Comment": "等待元素出现，一般不需要主动调用", "Selector":"选择器" },

// 等待一段时间，这个时间被放在 Key 所指定的变量里。
{ "Cmd": "waitKey", "Comment": "随机等待", "Key": "waitTime" },

// 捕获 Json里面的脚本的执行错误，如果执行成功 ifSuccess 则等于 '1', 否则等于 '0'
{ "Cmd": "try", "Comment": "捕获错误", "Key": "ifSuccess", Json: [...]  },

// 获取所有的打开的tab数量并保存到Key指定的变量里
{ "Cmd": "pagesCount", "Comment": "获取所有的tab数量", "Key": "pageCount" },

// 激活指定key的位置的tab，要小心，这些tab并不是按左右顺序从0~1这样的，有可能是乱顺序的。这个顺序是打开tab的先后顺序。
{ "Cmd": "activePage", "Comment": "激活某个tab", Key: ""},

// 按一下键盘指定按钮，按键值见：https://github.com/puppeteer/puppeteer/blob/main/src/common/USKeyboardLayout.ts
{ "Cmd": "keyboard", "Comment": "按键盘按钮", Key: "指定的按键" },

// 水平滚动。
// 在 ScrollSelector，ScrollIndex 这个dom里进行水平滚动。
// 直到 Selector，Index 这个元素出现在视野范围内。
{ "Cmd": "scrollHorizontal", "Comment": "水平滚动", "ScrollSelector": "#ad-list", "ScrollIndex": "0", Selector: "", Index:""},

// 获取当前所有的cookies，将会被保存到Key指定的字段里。
{ "Cmd": "getCookies", Comment: "获取cookies", Key: "cookies" }
]
```
