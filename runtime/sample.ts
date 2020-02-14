import * as base from "./base"

export const Sample: base.IData = {
   Comment: "演示在baidu查找苹果APPL股票价格",
   Json: [
      { Cmd: "boot", Comment: "启动Puppeteer", Options: { headless: true, args: ["--no-sandbox"], defaultViewport: null } },
      { Cmd: "newPage", Comment: "创建新页面" },
      { Cmd: "setHeader", Comment: "设置Header", Options: { "Accept-Language": "zh-CN,zh;q=0.9" } },
      { Cmd: "setDefaultNavigationTimeout", Comment: "设置默认打开页面超时时间", Data: "5000" },
      { Cmd: "navigation", Comment: "浏览器打开百度", Data: "$url" },
      { Cmd: "type", Comment: "输入内容", Selector: "#kw", Data: "$keyword" },
      { Cmd: "click", Comment: "点击搜索", Selector: "#su" },
      { Cmd: "textContent", Comment: "获取textContent", Selector: ".op-stockdynamic-moretab-cur-num", Data: "$price" },
      { Cmd: "closePage", Comment: "关闭页面" },
      { Cmd: "shutdown", Comment: "关闭Puppeteer" },
   ],
   DB: {
      url: "https://www.baidu.com",
      keyword: "AAPL"
   }
}