import * as base from "./base"

export const Sample: base.IData = {
   Comment: "在天猫获取指定的商品评论",
   Json: [

      {Cmd: base.CmdTypes.Finally, Comment: "最终结束操作",
         Json: [
            {Cmd: base.CmdTypes.Var, Comment: "清理脏字段", Key: "tabCount", SyncEval: ""},
            {Cmd: base.CmdTypes.Shutdown, Comment: "关闭浏览器"}
         ]
      },

      {Cmd: base.CmdTypes.BootPuppeteer, Comment: "打开Puppeteer自带浏览器", Options: { defaultViewport: null, headless: false}},
      {Cmd: base.CmdTypes.Wait, Comment: "等待2秒", Value: "2000"},
      {Cmd: base.CmdTypes.NewPage, Comment: "打开新tab页"},
      {Cmd: base.CmdTypes.ShowMouse, Comment: "显示鼠标"},
      {Cmd: base.CmdTypes.Wait, Comment: "等待2秒", Value: "2000"},
      {Cmd: base.CmdTypes.Navation, Comment: "打开天猫首页", Key: "url", Options: {waitUntil: "networkidle2"}},

      {Cmd: base.CmdTypes.Type, Comment: "输入关键词", Key: "keyword", Selector: "#mq"},
      {Cmd: base.CmdTypes.Click, Comment: "点击搜索按钮", Selector: "[type='submit']", WaitNav: true},
      {Cmd: base.CmdTypes.Wait, Comment: "等待5秒", Value: "5000"},

      {Cmd: base.CmdTypes.Click, Comment: "点击搜索结果第八个", Selector: ".product[data-id] .product-iWrap .productImg-wrap", Index: "7"},
      {Cmd: base.CmdTypes.Wait, Comment: "等待4秒", Value: "4000"},

      {Cmd: base.CmdTypes.PagesCount, Comment: "获取当前所有tab数量", Key: "tabCount"},
      {Cmd: base.CmdTypes.ActivePage, Comment: "切换到最后一个tab", Key: "tabCount"},

      {Cmd: base.CmdTypes.ShowMouse, Comment: "切换新tab后重新设置显示鼠标"},
      {Cmd: base.CmdTypes.ReloadPage, Comment: "重新加载页面保证鼠标显示正确", Options: {waitUntil: "networkidle2"}},

      {Cmd: base.CmdTypes.Wait, Comment: "等待2秒", Value: "2000"},
      {Cmd: base.CmdTypes.ExistsSelector, Comment: "存在登录提示的话就关闭登录提示", Selector: "#sufei-dialog-close",
         Json: [
            {Cmd: base.CmdTypes.Click, Comment: "关闭登录提示", Selector: "#sufei-dialog-close"},
            {Cmd: base.CmdTypes.Wait, Comment: "等待1秒", Value: "1000"}
         ]
      },

      {Cmd: base.CmdTypes.Click, Comment: "点击评论取按钮", Selector: "#J_TabBar [href='#J_Reviews']"},
      {Cmd: base.CmdTypes.Wait, Comment: "等待4秒", Value: "4000"},

      {Cmd: base.CmdTypes.TextContent, Comment: "获取第一条评论的内容", Key: "talkTxt", Selector: "#J_Reviews .rate-grid tr td.tm-col-master", Index: "0"},

      {Cmd: base.CmdTypes.Wait, Comment: "等待4秒", Value: "4000"}
   ],
   DB: {
      url: "http://www.tmall.com/",
      keyword: "type c",
   }
}