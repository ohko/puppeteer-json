import * as puppeteer from "puppeteer";
import * as axios from "axios"
import * as utils from "./utils"
import * as base from "./base"
import * as installMouseHelper from './install-mouse-helper'

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

   // { "Cmd": "bootMultilogin", "Comment": "连接multilogin", "Key": "profileId", "Options": {"multilogin": "http://127.0.0.1:45000"} },
   protected async handleAsyncBootMultilogin(cmd: base.ICmd) {
      await this.asyncStartMultilogin(cmd, this.getValue(cmd))
   }

   // { "Cmd": "createMultilogin", "Comment": "创建multilogin指纹", "Options": {"multilogin": "http://127.0.0.1:45000"}},
   protected async handleAsyncCreateMultilogin(cmd: base.ICmd) {
      // {"uuid": "c0e42b54-fbd5-41b7-adf3-673e7834f143"}
      // {"status": "ERROR","value": "os: must match \"lin|mac|win|android\""}
      const createOption = this.getValue(cmd)
      const url = "https://api.multiloginapp.com/v2/profile?token=" + process.env.MultiloginToken + "&mlaVersion=" + createOption.mlaVersion + "&defaultMode=FAKE";
      const opt = this.makeMultiloginProfile(createOption)
      const rs = (await axios.default.post(url, opt)).data;
      if (rs.status == "ERROR") {
         this.log("Multilogin指纹创建失败:", rs.value)
         throw { message: rs.value }
      }
      this.setValue("profileId", rs.uuid)

      await this.asyncStartMultilogin(cmd, rs.uuid)
   }

   // { Cmd: "removeMultilogin", Comment: "删除Multilogin指纹" },
   protected async handleAsyncRemoveMultilogin(cmd: base.ICmd) {
      if (!this.isMultilogin) return
      // {"status":"OK"}
      // {"status":"ERROR","value":"profile not found"}
      const url = "https://api.multiloginapp.com/v1/profile/remove?token=" + process.env.MultiloginToken + "&profileId=" + this.getValue(cmd);
      const rs = (await axios.default.get(url)).data;
      if (rs.status == "ERROR") {
         this.log("Multilogin指纹删除失败:", rs.value)
         throw { message: rs.value }
      }
   }

   // { "Cmd": "navigation", "Comment": "浏览器打开百度", "Key": "url", "Options": { waitUntil: "domcontentloaded" } }
   protected async handleAsyncNavigation(cmd: base.ICmd) {
      await this.page.goto(this.getValue(cmd), cmd.Options)
   }

   // { "Cmd": "filterRequest", "Comment": "过滤请求，变量_url", "Key": "/\.png$/.test(_url) || /\.jpg$/.test(_url)" }
   protected async handleAsyncFilterRequest(cmd: base.ICmd) {
      await this.page.setRequestInterception(true);
      this.page.on('request', interceptedRequest => {
         if (this.syncEval(cmd.Key, { _url: interceptedRequest.url() })) {
            interceptedRequest.abort();
         }
         else interceptedRequest.continue();
      });
   }

   // { "Cmd": "waitForNavigation", "Comment": "等待页面加载完成，一般不需要主动调用" }
   protected async handleAsyncWaitForNavigation(cmd: base.ICmd) {
      await this.page.waitForNavigation(cmd.Options)
   }

   // { "Cmd": "wait", "Comment": "等待", "Value": "30000" }
   protected async handleAsyncWait(cmd: base.ICmd) {
      const t = Number(this.getValue(cmd))
      return await this.page.waitFor(t)
   }

   // { "Cmd": "showMouse", "Comment": "显示鼠标"}
   protected async handleAsyncShowMouse(cmd: base.ICmd) {
      await installMouseHelper.installMouseHelper(this.page)
   }

   // { "Cmd": "random", "Comment": "生成随机数", "Key": "rand1", "Options": {"min":2, "max":5}}
   protected handleSyncRandom(cmd: base.ICmd) {
      this.setValue(cmd.Key, this.random(this.syncEval(cmd.Options["min"]), this.syncEval(cmd.Options["max"])).toString())
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

   // { "Cmd": "hover", "Comment": "鼠标hover", "Selector": "#su", "Index":"用于多个元素的索引" }
   protected async handleAsyncHover(cmd: base.ICmd) {
      await this.handleAsyncWaitForSelector(cmd)
      let rect: base.IRect
      if (!cmd.Index) {
         //@ts-ignore
         await this.page.$eval(cmd.Selector, (el) => el.scrollIntoViewIfNeeded())
         const el = await this.page.$(cmd.Selector)
         rect = await el.boundingBox()
      } else {
         const index = this.getIndex(cmd)
         //@ts-ignore
         await this.page.$$eval(cmd.Selector, (els, index) => els[index].scrollIntoViewIfNeeded(), index)
         const els = await this.page.$$(cmd.Selector)
         rect = await els[index].boundingBox()
      }
      const point = this.calcElementPoint(rect)
      await this.page.mouse.move(point.x, point.y, { steps: 1 })
      await this.page.waitFor(this.random(this.userInputWaitMin, this.userInputWaitMax))
   }

   // { "Cmd": "click", "Comment": "点击搜索", "Selector": "#su", "Index":"用于多个元素的索引" }
   protected async handleAsyncClick(cmd: base.ICmd) {
      await this.handleAsyncWaitForSelector(cmd)
      await this.handleAsyncHover(cmd)
      const clickCount = (cmd.Options && cmd.Options["clickCount"]) || 1
      let rect: base.IRect
      if (!cmd.Index) {
         const el = await this.page.$(cmd.Selector)
         rect = await el.boundingBox()
      } else {
         const els = await this.page.$$(cmd.Selector)
         rect = await els[this.getIndex(cmd)].boundingBox()
      }
      const point = this.calcElementPoint(rect)
      // var ts,te;document.addEventListener("mousedown",function(){ts=new Date()});document.addEventListener("mouseup",function(){te=new Date();console.log(te-ts)})
      if (cmd.WaitNav === true) {
         await Promise.all([
            this.page.waitForNavigation(),
            this.page.mouse.click(point.x, point.y, { delay: this.random(50, 200) }),
         ]);
      } else {
         await this.page.mouse.click(point.x, point.y, { clickCount: clickCount, delay: this.random(50, 200) })
      }
      await this.page.waitFor(this.random(this.userInputWaitMin, this.userInputWaitMax))
   }

   // { "Cmd": "dbClick", "Comment": "双击点击", "Selector": "#kw", "Index":"用于多个元素的索引" }
   protected async handleAsyncDbClick(cmd: base.ICmd) {
      if (!cmd.Options) cmd.Options = {}
      cmd.Options["clickCount"] = 2
      await this.handleAsyncClick(cmd)
   }

   // { "Cmd": "type", "Comment": "输入从DB读取的Key，或直接输入Value，默认延时500毫秒", "Selector": "#kw", "Key": "keyword", "Value": "keyword", Options: { delay: 500 } }
   protected async handleAsyncType(cmd: base.ICmd) {
      let delay = 500
      if (cmd.Options && cmd.Options["delay"]) delay = Number(cmd.Options["delay"])
      await this.handleAsyncWaitForSelector(cmd)
      await this.handleAsyncDbClick({ Cmd: "", Selector: cmd.Selector, Index: cmd.Index })
      await this.page.type(cmd.Selector, this.getValue(cmd), { delay: delay })
      await this.page.waitFor(this.random(this.userInputWaitMin, this.userInputWaitMax))
   }

   // { "Cmd": "select", "Comment": "下拉框选择Key或Value", "Selector": "#select1", "Value": "option1" },
   protected async handleAsyncSelect(cmd: base.ICmd) {
      await this.handleAsyncWaitForSelector(cmd)
      await this.page.select(cmd.Selector, this.getValue(cmd))
      await this.page.waitFor(this.random(this.userInputWaitMin, this.userInputWaitMax))
   }

   // { "Cmd": "elementCount", "Comment": "获取元素数量", "Selector": "#select1", "Key": "key1" },
   protected async handleAsyncElementCount(cmd: base.ICmd) {
      const els = await this.page.$$(cmd.Selector)
      this.setValue(cmd.Key, els.length.toString())
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
      this.setValue(cmd.Key, this.syncEval(cmd.Value))
   }

   // { "Cmd": "log", "Comment": "记录Key或Value到日志", "Key": "key1", "Value": "123" }
   protected handleSyncLog(cmd: base.ICmd) {
      this.log(this.getValue(cmd))
   }

   // { "Cmd": "js", "Comment": "高级操作，执行javascript，返回对象保存到DB数据", "Value": "let _ip=(await axios.default.get('http://ip.lyl.hk')).data;return {ip2:_ip}" }
   protected async handleAsyncJs(cmd: base.ICmd) {
      const js = this.getValue(cmd)
      const result = await this.asyncEval(js)
      this.log("js", js)
      if (typeof result === "object") {
         for (let i in result) this.setValue(i, result[i])
      }
   }

   // { "Cmd": "throw", "Comment": "中断所有操作，抛出Key或Value信息", "Key": "key1", "Value": "发现错误" }
   protected async handleAsyncThrow(cmd: base.ICmd) {
      throw { message: this.getValue(cmd) }
   }

   // { "Cmd": "break", "Comment": "跳出循环", "Key": "满足条件才break/空就是无条件break" }
   protected async handleAsyncBreak(cmd: base.ICmd) {
      // 没定义条件，直接break
      if (!cmd.Key) throw "break"
      // 定义了条件，要满足条件才break
      if (this.getValue(cmd)) throw "break"
      this.log("break不满足")
   }

   // { "Cmd": "newPage", "Comment": "创建新页面" }
   protected async handleAsyncNewPage(cmd: base.ICmd) {
      this.page = await this.browser.newPage();
   }

   // { "Cmd": "alwaysPage", "Comment": "选择一个已有的或新建一个页面" }
   protected async handleAsyncAlwaysPage(cmd: base.ICmd) {
      const ps = await this.browser.pages()
      this.page = ps.length ? ps.shift() : await this.browser.newPage();
   }

   // { "Cmd": "reloadPage", "Comment": "刷新页面", WaitNav: true }
   protected async handleAsyncReloadPage(cmd: base.ICmd) {
      await this.page.reload()
   }

   // { "Cmd": "closePage", "Comment": "关闭页面" }
   protected async handleAsyncClosePage(cmd: base.ICmd) {
      this.page.close()
   }

   // { "Cmd": "shutdown", "Comment": "关闭程序" }
   protected async handleAsyncShutdown(cmd: base.ICmd) {
      this.browser.close()
   }

   // { "Cmd": "setHeader", "Comment": "设置Header，Multilogin中无效", "Options": { "Accept-Language": "zh-CN,zh;q=0.9" } }
   protected async handleAsyncSetHeader(cmd: base.ICmd) {
      if (this.isMultilogin) return this.log("Multilogin忽略set header")
      await this.page.setExtraHTTPHeaders(<puppeteer.Headers>cmd.Options);
   }

   // { "Cmd": "setDefaultNavigationTimeout", "Comment": "设置默认打开页面超时时间，时间来自Key或Value", "Value": "5000" },
   protected handleSyncSetDefaultNavigationTimeout(cmd: base.ICmd) {
      this.page.setDefaultNavigationTimeout(Number(this.getValue(cmd)));
   }

   // { "Cmd": "waitForSelector", "Comment": "等待元素出现，一般不需要主动调用" }
   protected async handleAsyncWaitForSelector(cmd: base.ICmd) {
      await this.page.waitForSelector(cmd.Selector)
   }

   // { "Cmd": "loop", "Comment": "循环Key或Value次数，内置loopCounter为循环计数器", Key: "循环次数", Value: "循环次数", "Json": [{Cmd...}] }
   protected async handleAsyncLoop(cmd: base.ICmd) {
      const count = Number(this.getValue(cmd))
      this.log("loop:", count)
      for (let i = 0; i < count; i++) {
         this.setValue("loopCounter", i.toString())
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
            if (await this.getValue({ Cmd: "", Key: condition })) {
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

   // { "Cmd": "sub", "Comment": "定义一组操作集合", "Value": "sub1", "Json": [{Cmd...}] }
   protected handleSyncSub(cmd: base.ICmd) {
      if (!this.cmds) this.cmds = {}
      this.cmds[this.getValue(cmd)] = cmd.Json
   }

   // { "Cmd": "call", "Comment": "调用操作集合", "Value": "sub1"}
   protected async handleAsyncCall(cmd: base.ICmd) {
      if (!this.cmds) this.cmds = {}
      if (!this.cmds.hasOwnProperty(this.getValue(cmd))) throw { message: "Not Found sub:" + this.getValue(cmd) }
      try {
         await this.do(this.cmds[this.getValue(cmd)])
      } catch (e) {
         if (typeof e === "string" && e == "break") return
         throw e
      }
   }

   // { "Cmd": "finally", "Comment": "无论如何，最终执行一些清理操作", "Json": [{Cmd...}] }
   protected handleSyncFinally(cmd: base.ICmd) {
      if (!this.finally) this.finally = []
      this.finally.push(cmd.Json)
   }

   protected async do(cmds: base.ICmd[]) {
      for (let i in cmds) {
         this.log("CMD:", cmds[i].Cmd, cmds[i].Comment)
         const cmdAsync = "handleAsync" + cmds[i].Cmd.replace(/^\S/, s => { return s.toUpperCase() })
         const cmdSync = "handleSync" + cmds[i].Cmd.replace(/^\S/, s => { return s.toUpperCase() })

         if (typeof this[cmdAsync] === "function") await this[cmdAsync](cmds[i])
         else if (typeof this[cmdSync] === "function") this[cmdSync](cmds[i])
         else throw { message: "CmdNotFound" }
      }
   }
}