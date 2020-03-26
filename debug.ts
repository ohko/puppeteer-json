#!/usr/bin/env ts-node

import * as base from "./runtime/base";
import * as WebSocket from "ws";

const json = {
   Comment: "演示在baidu查找苹果APPL股票价格",
   Json: [
      { Cmd: base.CmdTypes.BootPuppeteer, Comment: "启动Puppeteer", Options: { headless: false, args: ["--no-sandbox"], defaultViewport: null } },
      { Cmd: base.CmdTypes.NewPage, Comment: "创建新页面" },
      { Cmd: base.CmdTypes.ShowMouse, Comment: "显示鼠标" },
      { Cmd: base.CmdTypes.SetHeader, Comment: "设置Header", Options: { "Accept-Language": "zh-CN,zh;q=0.9" } },
      { Cmd: base.CmdTypes.SetTimeout, Comment: "设置默认打开页面超时时间", Key: "timeout" },
      { Cmd: base.CmdTypes.Navation, Comment: "浏览器打开百度", Key: "url" },
      { Cmd: base.CmdTypes.Type, Comment: "输入内容", Selector: "#kw", Key: "keyword" },
      { Cmd: base.CmdTypes.Click, Comment: "点击搜索", Selector: "#su" },
      { Cmd: base.CmdTypes.TextContent, Comment: "获取textContent", Selector: ".op-stockdynamic-moretab-cur-num", Key: "price" },
      { Cmd: base.CmdTypes.ClosePage, Comment: "关闭页面" },
      { Cmd: base.CmdTypes.Shutdown, Comment: "关闭程序" },
   ],
   DB: {
      url: "https://www.baidu.com",
      keyword: "AAPL",
   }
}

const ws = new WebSocket('ws://127.0.0.1:8081/');
let db = json.DB
let index = 0

ws.on('message', async (data) => {
   if (data != "hello") {
      const res = JSON.parse(<string>data)
      if (res.No != 0) {
         console.log(res.Data)
         ws.close()
         return
      }
      db = res.DB
      console.log(db)
   }

   await (async _ => { await new Promise(x => setTimeout(x, 3000)) })()

   // 单步执行指令
   if (index < json.Json.length) {
      const cmd = { Json: [json.Json[index]], DB: db, Comment: "DEBUG", }
      index++
      ws.send(JSON.stringify(cmd))
   } else {
      ws.close()
   }
});
