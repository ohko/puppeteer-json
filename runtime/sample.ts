import * as base from "./base"

export const Sample: base.IData = {
   Comment: "演示在baidu查找苹果APPL股票价格",
   Json: [
      {
         Cmd: base.CmdTypes.Sub, Comment: "定义一组操作集合", Value: "sub1", Json: [
            { Cmd: base.CmdTypes.ClosePage, Comment: "关闭页面" },
            { Cmd: base.CmdTypes.Shutdown, Comment: "关闭程序" },
         ]
      },
      { Cmd: base.CmdTypes.BootPuppeteer, Comment: "启动Puppeteer", Options: { headless: false, args: ["--no-sandbox"], defaultViewport: null, ignoreDefaultArgs: ["--enable-automation"] } },
      {
         Cmd: base.CmdTypes.Finally, Comment: "无论如何，最终执行一些清理操作", Json: [
            { Cmd: base.CmdTypes.Call, Comment: "调用操作集合", Value: "sub1" }
         ]
      },
      { Cmd: base.CmdTypes.HttpGet, Comment: "获取IP", Key: "ip1", Value: "http://ip.lyl.hk" },
      { Cmd: base.CmdTypes.Js, Comment: "高级JS指令", AsyncEval: "return axios.default.get('http://ip.lyl.hk').then(x=>{return {ip2:x.data}}).catch(x=>{return {ip2:x.toString()}})" },
      { Cmd: base.CmdTypes.Var, Comment: "设置循环次数", Key: "count", SyncEval: "5" },
      {
         Cmd: base.CmdTypes.Loop, Comment: "循环count次", Key: "count", Json: [
            { Cmd: base.CmdTypes.Break, Comment: "跳出循环", SyncEval: "loopCounter>2" },
            { Cmd: base.CmdTypes.Log, Comment: "记录日志", SyncEval: "'循环'+array[loopCounter]+'次'" },
         ]
      },
      { Cmd: base.CmdTypes.Var, Comment: "设置循环次数", Key: "count", SyncEval: "5" },
      {
         Cmd: base.CmdTypes.Loop, Comment: "循环count次", Key: "count", Json: [
            {
               Cmd: base.CmdTypes.Condition, Comment: "判断loopCounter",
               Conditions: [
                  {
                     Condition: "loopCounter==0", Json: [
                        { Cmd: base.CmdTypes.Log, Comment: "记录日志", SyncEval: "'循环到第1次了'" },
                     ]
                  },
                  {
                     Condition: "loopCounter>1", Json: [
                        { Cmd: base.CmdTypes.Break, Comment: "跳出Loop循环", SyncEval: "true" },
                     ]
                  },
                  {
                     Condition: "loopCounter==1", Json: [
                        { Cmd: base.CmdTypes.Log, Comment: "记录日志", SyncEval: "'循环到第2次了'" },
                     ]
                  }
               ]
            }
         ]
      },
      {
         Cmd: base.CmdTypes.If, Comment: "记录1", SyncEval: "'1'==1", Json: [
            { Cmd: base.CmdTypes.Var, Comment: "记录1", Key: "记录1", SyncEval: "'记录1'" },
         ]
      },
      {
         Cmd: base.CmdTypes.If, Comment: "不会记录2", SyncEval: "'1'===1", Json: [
            { Cmd: base.CmdTypes.Var, Comment: "不会记录2", Key: "记录2", SyncEval: "'不会记录2'" },
         ]
      },
      { Cmd: base.CmdTypes.Wait, Comment: "等待4秒", Value: "4000" },
      { Cmd: base.CmdTypes.NewPage, Comment: "创建新页面" },
      { Cmd: base.CmdTypes.ShowMouse, Comment: "显示鼠标" },
      { Cmd: base.CmdTypes.SetHeader, Comment: "设置Header", Options: { "Accept-Language": "zh-CN,zh;q=0.9" } },
      { Cmd: base.CmdTypes.SetTimeout, Comment: "设置默认打开页面超时时间", Key: "timeout" },
      { Cmd: base.CmdTypes.Wait, Comment: "等待4秒", Value: "4000" },
      { Cmd: base.CmdTypes.NewPage, Comment: "创建新页面" },
      { Cmd: base.CmdTypes.Wait, Comment: "等待4秒", Value: "4000" },
      { Cmd: base.CmdTypes.Var, Comment: "激活第二页", Key: "index", SyncEval: "2" },
      { Cmd: base.CmdTypes.ActivePage, Comment: "激活第二页", Key: "index" },
      { Cmd: base.CmdTypes.Wait, Comment: "等待4秒", Value: "4000" },
      { Cmd: base.CmdTypes.ClosePage, Comment: "关闭第二页" },
      { Cmd: base.CmdTypes.Wait, Comment: "等待4秒", Value: "4000" },
      { Cmd: base.CmdTypes.ClosePage, Comment: "关闭当前页面" },
      { Cmd: base.CmdTypes.Wait, Comment: "等待4秒", Value: "4000" },
      { Cmd: base.CmdTypes.Navation, Comment: "打开百度", Key: "url" },
      { Cmd: base.CmdTypes.Wait, Comment: "等待4秒", Value: "4000" },
      { Cmd: base.CmdTypes.Type, Comment: "输入内容", Selector: "#kw", Key: "keyword" },
      { Cmd: base.CmdTypes.Wait, Comment: "等待4秒", Value: "4000" },
      { Cmd: base.CmdTypes.ClosePage, Comment: "关闭当前页面" },
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