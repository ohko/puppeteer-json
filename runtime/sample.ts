import * as puppeteer from "puppeteer";
import * as base from "./base"

export const Sample: base.IData = {
   Comment: "演示在baidu查找苹果APPL股票价格",
   Json: [
      <base.CmdSub>{
         Cmd: "sub", Comment: "定义一组操作集合", Value: "sub1",
         Json: [
            { Cmd: "closePage", Comment: "关闭页面" },
            { Cmd: "shutdown", Comment: "关闭程序" },
         ]
      },
      <base.CmdBootPuppeteer>{ Cmd: "bootPuppeteer", Comment: "启动Puppeteer", Options: <puppeteer.ConnectOptions>{ headless: false, args: ["--no-sandbox"], defaultViewport: null } },
      <base.CmdFinally>{
         Cmd: "finally", Comment: "无论如何，最终执行一些清理操作",
         Json: [
            { Cmd: "call", Comment: "调用操作集合", Value: "sub1" }
         ]
      },
      <base.CmdHttpGet>{ Cmd: "httpGet", Comment: "获取IP", Key: "ip1", Value: "http://ip.lyl.hk" },
      <base.CmdJs>{ Cmd: "js", Comment: "高级JS指令", AsyncEval: "return axios.default.get('http://ip.lyl.hk').then(x=>{return {ip2:x.data}}).catch(x=>{return {ip2:x.toString()}})" },
      <base.CmdVar>{ Cmd: "var", Comment: "设置循环次数", Key: "count", SyncEval: "5" },
      <base.CmdLoop>{
         Cmd: "loop", Comment: "循环count次", Key: "count",
         Json: [
            { Cmd: "break", Comment: "跳出循环", SyncEval: "loopCounter>2" },
            { Cmd: "log", Comment: "记录日志", SyncEval: "'循环'+array[loopCounter]+'次'" },
         ]
      },
      <base.CmdVar>{ Cmd: "var", Comment: "设置循环次数", Key: "count", SyncEval: "5" },
      <base.CmdLoop>{
         Cmd: "loop", Comment: "循环count次", Key: "count",
         Json: [
            {
               Cmd: "condition", Comment: "判断loopCounter",
               Conditions: [
                  {
                     Condition: "loopCounter==0",
                     Json: [
                        { Cmd: "log", Comment: "记录日志", Value: "循环到第1次了" },
                     ]
                  },
                  {
                     Condition: "loopCounter>1",
                     Json: [
                        { Cmd: "break", Comment: "这里不会跳出循环" },
                     ]
                  },
                  {
                     Condition: "loopCounter==1",
                     Json: [
                        { Cmd: "log", Comment: "记录日志", Value: "循环到第2次了" },
                     ]
                  }
               ]
            }
         ]
      },
      <base.CmdCall>{
         Cmd: "call", Comment: "直接子指令",
         Json: [
            { Cmd: "var", Comment: "直接子指令", Key: "直接子指令", SyncEval: "1" },
         ]
      },
      <base.CmdIf>{
         Cmd: "if", Comment: "记录1", SyncEval: "'1'==1",
         Json: [
            { Cmd: "var", Comment: "记录1", Key: "记录1", SyncEval: "'记录1'" },
         ]
      },
      <base.CmdIf>{
         Cmd: "if", Comment: "不会记录2", SyncEval: "'1'===1",
         Json: [
            { Cmd: "var", Comment: "不会记录2", Key: "记录2", SyncEval: "'不会记录2'" },
         ]
      },
      <base.CmdNewPage>{ Cmd: "newPage", Comment: "创建新页面" },
      <base.CmdShowMouse>{ Cmd: "showMouse", Comment: "显示鼠标" },
      <base.CmdSetHeader>{ Cmd: "setHeader", Comment: "设置Header", Options: <Object>{ "Accept-Language": "zh-CN,zh;q=0.9" } },
      <base.CmdSetTimeout>{ Cmd: "setTimeout", Comment: "设置默认打开页面超时时间", Key: "timeout" },
      <base.CmdNavigation>{ Cmd: "navigation", Comment: "浏览器打开百度", Key: "url" },
      <base.CmdWait>{ Cmd: "wait", Comment: "创建新页面", Value: "3000" },
      <base.CmdNewPage>{ Cmd: "newPage", Comment: "创建新页面" },
      <base.CmdNavigation>{ Cmd: "navigation", Comment: "浏览器打开百度", Key: "url" },
      <base.CmdScreenshot>{ Cmd: "screenshot", Comment: "截图", Value: "s1" },
      <base.CmdType>{ Cmd: "type", Comment: "输入内容", Selector: "#kw", Key: "keyword", ScreenshotBefore: true, ScreenshotBehind: true },
      <base.CmdClick>{ Cmd: "click", Comment: "点击搜索", Selector: "#su", ScreenshotBefore: true, ScreenshotBehind: true, ScreenshotFull: true },
      <base.CmdTextContent>{ Cmd: "textContent", Comment: "获取textContent", Selector: ".op-stockdynamic-moretab-cur-num", Key: "price" },
   ],
   DB: {
      url: "https://www.baidu.com",
      ipurl: "http://ip.lyl.hk",
      keyword: "AAPL",
      count: "0",
      timeout: "5000",
      array: ["一", "二", "三", "四"],
   }
}