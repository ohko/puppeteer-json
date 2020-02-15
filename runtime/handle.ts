import * as puppeteer from "puppeteer";
import * as axios from "axios"
import * as utils from "./utils"
import * as base from "./base"

export class Handle extends utils.Utils {

   // { "Cmd": "bootPuppeteer", "Comment": "启动Puppeteer", "Options": { "headless": true, "args": ["--no-sandbox"], "defaultViewport": null } }
   protected async handleAsyncBootPuppeteer(cmd: base.ICmd) {
      let ws: string
      try { ws = (await axios.default.get('http://127.0.0.1:9222/json/version')).data.webSocketDebuggerUrl } catch (e) { }
      if (ws != "") this.log("ws:", ws)
      this.browser = (ws ? await puppeteer.connect({ browserWSEndpoint: ws, defaultViewport: null }) : await puppeteer.launch(cmd.Options))
      this.isPuppeteer = true
      this.isMultilogin = false
   }

   // { "Cmd": "bootMultilogin", "Comment": "连接multilogin", "Key": "profileId" },
   protected async handleAsyncBootMultilogin(cmd: base.ICmd) {
      // {"status":"OK","value":"ws://127.0.0.1:21683/devtools/browser/7a873c05-29d4-42a1-ad6b-498e70203e77"}
      // {"status":"ERROR","value":"Profile \u0027b39ce59f-b7a2-4bd0-9ce8-dcffbea3465a\u0027 is active already"}
      const url = "http://127.0.0.1:45000/api/v1/profile/start?automation=true&puppeteer=true&profileId=" + this.getValue(cmd);
      const rs = (await axios.default.get(url)).data;
      if (rs.status != "OK") {
         this.log("Multilogin连接失败:", rs.value)
         throw { message: rs.value }
      }

      const ws = rs.value
      this.log("ws", ws)
      this.browser = await puppeteer.connect({ browserWSEndpoint: ws, defaultViewport: null })
      this.isPuppeteer = false
      this.isMultilogin = true
   }

   // { "Cmd": "navigation", "Comment": "浏览器打开百度", "Key": "url", "Options": { waitUntil: "domcontentloaded" } }
   protected async handleAsyncNavigation(cmd: base.ICmd) {
      await this.page.goto(this.getValue(cmd), cmd.Options)
   }

   // { "Cmd": "waitForNavigation", "Comment": "等待页面加载完成，一般不需要主动调用" }
   protected async handleAsyncWaitForNavigation(cmd: base.ICmd) {
      await this.page.waitForNavigation(cmd.Options)
   }

   // { "Cmd": "hover", "Comment": "鼠标hover", "Selector": "#su" }
   protected async handleAsyncHover(cmd: base.ICmd) {
      await this.handleAsyncWaitForSelector(cmd)
      await this.page.hover(cmd.Selector)
      await this.handleAsyncWaitRand(cmd)
   }

   // { "Cmd": "click", "Comment": "点击搜索", "Selector": "#su" }
   protected async handleAsyncClick(cmd: base.ICmd) {
      await this.handleAsyncWaitForSelector(cmd)
      await this.page.hover(cmd.Selector)
      await this.page.click(cmd.Selector)
      await this.handleAsyncWaitRand(cmd)
   }

   // { "Cmd": "wait", "Comment": "等待", "Value": "30000" }
   protected async handleAsyncWait(cmd: base.ICmd) {
      const t = Number(this.getValue(cmd))
      return await this.page.waitFor(t)
   }

   // { "Cmd": "waitRand", "Comment": "随机等待", "Options": {"min": 2000, "max": 3000} }
   protected async handleAsyncWaitRand(cmd: base.ICmd) {
      const options = cmd.Options || {}
      const min = options.hasOwnProperty("min") ? options["min"] : 1000
      const max = options.hasOwnProperty("max") ? options["max"] : 5000
      const rand = Math.ceil(Math.random() * max) + min
      this.log("随机等待", rand)
      await this.page.waitFor(rand)
   }

   // { "Cmd": "type", "Comment": "输入从DB读取的Key，或直接输入Value", "Selector": "#kw", "Key": "keyword", "Value": "keyword" }
   protected async handleAsyncType(cmd: base.ICmd) {
      await this.handleAsyncWaitForSelector(cmd)
      await this.page.hover(cmd.Selector)
      await this.page.click(cmd.Selector)
      await this.page.type(cmd.Selector, this.getValue(cmd))
      await this.handleAsyncWaitRand(cmd)
   }

   // { "Cmd": "select", "Comment": "下拉框选择Key或Value", "Selector": "#select1", "Value": "option1" },
   protected async handleAsyncSelect(cmd: base.ICmd) {
      await this.handleAsyncWaitForSelector(cmd)
      await this.page.select(cmd.Selector, this.getValue(cmd))
      await this.handleAsyncWaitRand(cmd)
   }

   // { "Cmd": "textContent", "Comment": "获取textContent，保存到DB的Key中", "Selector": ".op-stockdynamic-moretab-cur-num", "Key": "price" }
   protected async handleAsyncTextContent(cmd: base.ICmd) {
      await this.handleAsyncWaitForSelector(cmd)
      return this.setValue(cmd.Key, await this.page.$eval(cmd.Selector, el => el.textContent))
   }

   // { "Cmd": "httpGet", "Comment": "网络get请求Value地址，返回数据保存到Key中", Key: "ip", Value: "http://ip.lyl.hk" }
   protected async handleAsyncHttpGet(cmd: base.ICmd) {
      this.setValue(cmd.Key, (await axios.default.get(cmd.Value)).data)
   }

   // { "Cmd": "var", "Comment": "将Value定义到变量Key，保存到DB中", "Key": "key1", "Value": "123" }
   protected handleSyncVar(cmd: base.ICmd) {
      this.setValue(cmd.Key, cmd.Value)
   }

   // { "Cmd": "log", "Comment": "记录Key或Value到日志", "Key": "key1", "Value": "123" }
   protected handleSyncLog(cmd: base.ICmd) {
      this.log(this.getValue(cmd))
   }

   // { "Cmd": "js", "Comment": "高级操作，执行javascript，返回对象保存到DB数据", "Value": "let _ip=(await axios.default.get('http://ip.lyl.hk')).data;return {ip2:_ip}" }
   protected async handleAsyncJs(cmd: base.ICmd) {
      const js = this.getValue(cmd)
      const result = await this.eval(js)
      this.log("js", js)
      if (typeof result === "object") {
         for (let i in result) this.setValue(i, result[i])
      }
   }

   // { "Cmd": "throw", "Comment": "中断所有操作，抛出Key或Value信息", "Key": "key1", "Value": "发现错误" }
   protected async handleAsyncThrow(cmd: base.ICmd) {
      throw { message: this.getValue(cmd) }
   }

   // { "Cmd": "break", "Comment": "跳出循环", "Value": "满足条件才break/空就是无条件break" }
   protected handleSyncBreak(cmd: base.ICmd) {
      // 没定义条件，直接break
      if (!cmd.Key && !cmd.Value) throw "break"
      // 定义了条件，要满足条件才break
      if (this.eval(this.getValue(cmd))) throw "break"
      this.log("break不满足")
   }

   // { "Cmd": "newPage", "Comment": "创建新页面" }
   protected async handleAsyncNewPage(cmd: base.ICmd) {
      this.page = await this.browser.newPage();
      return this.page
   }

   // { "Cmd": "alwaysPage", "Comment": "选择一个已有的或新建一个页面" }
   protected async handleAsyncAlwaysPage(cmd: base.ICmd) {
      const ps = await this.browser.pages()
      this.page = ps.length ? ps.shift() : await this.browser.newPage();
      await this.page.reload()
      return this.page
   }

   // { "Cmd": "closePage", "Comment": "关闭页面" }
   protected async handleAsyncClosePage(cmd: base.ICmd) {
      return this.page.close()
   }

   // { "Cmd": "shutdown", "Comment": "关闭程序" }
   protected async handleAsyncShutdown(cmd: base.ICmd) {
      return this.browser.close()
   }

   // { "Cmd": "setHeader", "Comment": "设置Header，Multilogin中无效", "Options": { "Accept-Language": "zh-CN,zh;q=0.9" } }
   protected async handleAsyncSetHeader(cmd: base.ICmd) {
      if (this.isMultilogin) return
      return await this.page.setExtraHTTPHeaders(<puppeteer.Headers>cmd.Options);
   }

   // { "Cmd": "setDefaultNavigationTimeout", "Comment": "设置默认打开页面超时时间，时间来自Key或Value", "Value": "5000" },
   protected handleSyncSetDefaultNavigationTimeout(cmd: base.ICmd) {
      return this.page.setDefaultNavigationTimeout(Number(this.getValue(cmd)));
   }

   // { "Cmd": "waitForSelector", "Comment": "等待元素出现，一般不需要主动调用" }
   protected async handleAsyncWaitForSelector(cmd: base.ICmd) {
      await this.page.waitForSelector(cmd.Selector)
   }

   // { "Cmd": "loop", "Comment": "循环Key或Value次数", Key: "循环次数", Value: "循环次数", "Json": [{Cmd...}] }
   protected async handleAsyncLoop(cmd: base.ICmd) {
      const count = Number(this.getValue(cmd))
      this.log("loop:", count)
      for (let i = 0; i < count; i++) {
         this.setValue(cmd.Key, i.toString())
         try {
            await this.do(cmd.Json)
         } catch (e) {
            if (typeof e === "string" && e === "break") break
            throw e
         }
      }
   }

   // { "Cmd": "condition", "Comment": "条件判断", "Conditions": [ { "Condition": "key1==123", "Json": [{Cmd...}] } ] }
   protected async handleAsyncCondition(cmd: base.ICmd) {
      try {
         for (let i in cmd.Conditions) {
            let condition = cmd.Conditions[i].Condition
            if (this.eval(condition)) {
               this.log("true", condition)
               await this.do(cmd.Conditions[i].Json)
               break
            }
            this.log("false", condition)
         }
      } catch (e) {
         if (typeof e === "string" && e == "break") return
         throw e
      }
   }

   protected async do(cmds: base.ICmd[]) {
      for (let i in cmds) {
         this.log("CMD:", cmds[i].Cmd, cmds[i].Comment)
         const cmdAsync = "handleAsync" + cmds[i].Cmd.replace(/^\S/, s => { return s.toUpperCase() })
         const cmdSync = "handleSync" + cmds[i].Cmd.replace(/^\S/, s => { return s.toUpperCase() })

         if (typeof this[cmdAsync] === "function") await this[cmdAsync](cmds[i])
         else if (typeof this[cmdSync] === "function") this[cmdSync](cmds[i])
         else throw { message: "CmdNotFound" }

         if (cmds[i].WaitNav === true) this.handleAsyncWaitForNavigation(cmds[i])
      }
   }
}