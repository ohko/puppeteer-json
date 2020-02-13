import * as base from "./base"

export const Sample: base.IData = {
   Comment: "演示在baidu查找苹果APPL股票价格",
   Json: [
      { Cmd: "boot", Comment: "启动Puppeteer", Options: { headless: true, args: ["--no-sandbox"] } },
      { Cmd: "xxx", Comment: "不存在的指令" },
      { Cmd: "newPage", Comment: "创建新页面" },
      { Cmd: "closePage", Comment: "关闭页面" },
      { Cmd: "alwaysPage", Comment: "选择一个已有的或新建一个页面" },
      { Cmd: "navigation", Comment: "浏览器打开网址", Val: "$url" },
      { Cmd: "type", Comment: "输入内容", Selector: "#kw", Val: "AAPL\n" },
      { Cmd: "textContent", Comment: "获取textContent", Selector: ".op-stockdynamic-moretab-cur-num", Val: "$price" },
      { Cmd: "shutdown", Comment: "关闭Puppeteer" },
   ],
   DB: {
      "url": "https://www.baidu.com",
   }
}