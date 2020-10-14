import * as base from "./base"

export const Sample: base.IData = {
   Comment: "演示在baidu查找苹果APPL股票价格",
   Json: [

      { Cmd: base.CmdTypes.BootPuppeteer, Comment: "启动Puppeteer", Options: { headless: false, args: ["--no-sandbox"], defaultViewport: null, ignoreDefaultArgs: ["--enable-automation"] } },
      { Cmd: base.CmdTypes.NewPage, Comment: "打开新tab" },
      { Cmd: base.CmdTypes.Navation, Comment: "打开页面", Key: "url", Options: {waitUntil: "load"}},
      { Cmd: base.CmdTypes.SelectByLabel, Comment: "选择xiala", Selector: "#myselect", Number: "2"},
      {Cmd: base.CmdTypes.Wait, Comment: "等待", Value: "60000"}

   ],
   DB: {
      url: "http://test.microanswer.cn/test/selectSelect.html",
      ipurl: "http://ip.lyl.hk",
      keyword: "AAPL",
      count: "0",
      timeout: "5000",
      array: ["一", "二", "三", "四"],
   }
}