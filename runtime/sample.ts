import * as base from "./base"

export const Sample: base.IData = {
   Comment: "演示在baidu查找苹果APPL股票价格",
   Json: [
      {
         Cmd: "sub", Comment: "定义一组操作集合", Value: "sub1",
         Json: [
            { Cmd: "closePage", Comment: "关闭页面" },
            { Cmd: "shutdown", Comment: "关闭程序" },
         ]
      },
      { Cmd: "bootPuppeteer", Comment: "启动Puppeteer", Options: { headless: false, args: ["--no-sandbox"], defaultViewport: null } },
      {
         Cmd: "finally", Comment: "无论如何，最终执行一些清理操作",
         Json: [
            { Cmd: "call", Comment: "调用操作集合", Value: "sub1" }
         ]
      },
      { Cmd: "httpGet", Comment: "获取IP", Key: "ip1", Value: "http://ip.lyl.hk" },
      { Cmd: "js", Comment: "高级JS指令", Value: "let _ip=(await axios.default.get('http://ip.lyl.hk')).data;return {ip2:_ip}" },
      { Cmd: "var", Comment: "设置循环次数", Key: "count", Value: "5" },
      {
         Cmd: "loop", Comment: "循环count次", Key: "count",
         Json: [
            { Cmd: "break", Comment: "跳出循环", Value: "count>=2" },
            { Cmd: "log", Comment: "记录日志", Key: "'循环'+array[count]+'次'" },
         ]
      },
      { Cmd: "var", Comment: "设置循环次数", Key: "count", Value: "5" },
      {
         Cmd: "loop", Comment: "循环count次", Key: "count",
         Json: [
            {
               Cmd: "condition", Comment: "判断count",
               Conditions: [
                  {
                     Condition: "count==1",
                     Json: [
                        { Cmd: "log", Comment: "记录日志", Value: "循环到第1次了" },
                     ]
                  },
                  {
                     Condition: "count>2",
                     Json: [
                        { Cmd: "break", Comment: "跳出循环" },
                     ]
                  },
                  {
                     Condition: "count==2",
                     Json: [
                        { Cmd: "log", Comment: "记录日志", Value: "循环到第2次了" },
                     ]
                  }
               ]
            }
         ]
      },
      { Cmd: "newPage", Comment: "创建新页面" },
      { Cmd: "setHeader", Comment: "设置Header", Options: { "Accept-Language": "zh-CN,zh;q=0.9" } },
      { Cmd: "setDefaultNavigationTimeout", Comment: "设置默认打开页面超时时间", Value: "5000" },
      { Cmd: "navigation", Comment: "浏览器打开百度", Key: "url" },
      { Cmd: "type", Comment: "输入内容", Selector: "#kw", Key: "keyword" },
      { Cmd: "click", Comment: "点击搜索", Selector: "#su" },
      { Cmd: "textContent", Comment: "获取textContent", Selector: ".op-stockdynamic-moretab-cur-num", Key: "price" },
   ],
   DB: {
      url: "https://www.baidu.com",
      ipurl: "http://ip.lyl.hk",
      keyword: "AAPL",
      count: "0",
      array: ["一", "二", "三", "四"],
   }
}