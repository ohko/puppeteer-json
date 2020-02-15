import * as puppeteer from "puppeteer";
import * as axios from "axios"
import * as utils from "./utils"
import * as base from "./base"

export class Handle extends utils.Utils {
   protected async handleAsyncBootPuppeteer(cmd: base.ICmd) {
      let ws: string
      try { ws = (await axios.default.get('http://127.0.0.1:9222/json/version')).data.webSocketDebuggerUrl } catch (e) { }
      if (ws != "") this.log("ws", ws)
      this.browser = (ws ? await puppeteer.connect({ browserWSEndpoint: ws, defaultViewport: null }) : await puppeteer.launch(cmd.Options))
      this.isPuppeteer = true
      this.isMultilogin = false
   }

   protected async handleAsyncBootMultilogin(cmd: base.ICmd) {
      // {"status":"OK","value":"ws://127.0.0.1:21683/devtools/browser/7a873c05-29d4-42a1-ad6b-498e70203e77"}
      // {"status":"ERROR","value":"Profile \u0027b39ce59f-b7a2-4bd0-9ce8-dcffbea3465a\u0027 is active already"}
      const url = "http://127.0.0.1:45000/api/v1/profile/start?automation=true&puppeteer=true&profileId=" + this.getValue(cmd);
      const rs = (await axios.default.get(url)).data;
      if (rs.status != "OK") {
         this.log("Multilogin连接失败", rs.value)
         throw { message: rs.value }
      }

      const ws = rs.value
      this.log("ws", ws)
      this.browser = await puppeteer.connect({ browserWSEndpoint: ws, defaultViewport: null })
      this.isPuppeteer = false
      this.isMultilogin = true
   }

   protected async handleAsyncNavigation(cmd: base.ICmd) {
      await this.page.goto(this.getValue(cmd), { waitUntil: "domcontentloaded" })
   }

   protected async handleAsyncWaitForNavigation(cmd: base.ICmd) {
      await this.page.waitForNavigation({ waitUntil: "domcontentloaded" })
   }

   protected async handleAsyncHover(cmd: base.ICmd) {
      await this.handleAsyncWaitForSelector(cmd)
      await this.page.hover(cmd.Selector)
      await this.handleAsyncWaitRand(cmd)
   }

   protected async handleAsyncClick(cmd: base.ICmd) {
      await this.handleAsyncWaitForSelector(cmd)
      await this.page.hover(cmd.Selector)
      await this.page.click(cmd.Selector)
      await this.handleAsyncWaitRand(cmd)
   }

   protected async handleAsyncWait(cmd: base.ICmd) {
      const t = Number(this.getValue(cmd))
      return await this.page.waitFor(t)
   }

   protected async handleAsyncWaitRand(cmd: base.ICmd) {
      const min = 2000
      const max = 3000
      const rand = Math.ceil(Math.random() * max) + min
      this.log("随机等待", rand)
      await this.page.waitFor(rand)
   }

   protected async handleAsyncType(cmd: base.ICmd) {
      await this.handleAsyncWaitForSelector(cmd)
      await this.page.hover(cmd.Selector)
      await this.page.click(cmd.Selector)
      await this.page.type(cmd.Selector, this.getValue(cmd))
      await this.handleAsyncWaitRand(cmd)
   }

   protected async handleAsyncSelect(cmd: base.ICmd) {
      await this.handleAsyncWaitForSelector(cmd)
      await this.page.select(cmd.Selector, this.getValue(cmd))
      await this.handleAsyncWaitRand(cmd)
   }

   protected async handleAsyncTextContent(cmd: base.ICmd) {
      await this.handleAsyncWaitForSelector(cmd)
      return this.setValue(cmd.Key, await this.page.$eval(cmd.Selector, el => el.textContent))
   }

   protected async handleAsyncHttpGet(cmd: base.ICmd) {
      this.setValue(cmd.Key, (await axios.default.get(cmd.Options["url"])).data)
   }

   protected handleSyncVar(cmd: base.ICmd) {
      this.setValue(cmd.Key, cmd.Value)
   }

   protected async handleAsyncJs(cmd: base.ICmd) {
      const js = this.replaceVarInData(this.getValue(cmd), "", "")
      this.log("js", js)
      const result = await eval(js)
      if (typeof result === "object") {
         for (let i in result) this.setValue(i, result[i])
      }
   }

   protected async handleAsyncThrow(cmd: base.ICmd) {
      throw { message: this.getValue(cmd) }
   }

   protected async handleAsyncNewPage(cmd: base.ICmd) {
      this.page = await this.browser.newPage();
      return this.page
   }

   protected async handleAsyncAlwaysPage(cmd: base.ICmd) {
      const ps = await this.browser.pages()
      this.page = ps.length ? ps.shift() : await this.browser.newPage();
      await this.page.reload()
      return this.page
   }

   protected async handleAsyncClosePage(cmd: base.ICmd) {
      return this.page.close()
   }

   protected async handleAsyncShutdown(cmd: base.ICmd) {
      return this.browser.close()
   }

   protected async handleAsyncSetHeader(cmd: base.ICmd) {
      if (this.isMultilogin) return
      return await this.page.setExtraHTTPHeaders(<puppeteer.Headers>cmd.Options);
   }

   protected handleSyncSetDefaultNavigationTimeout(cmd: base.ICmd) {
      return this.page.setDefaultNavigationTimeout(Number(this.getValue(cmd)));
   }

   protected async handleAsyncWaitForSelector(cmd: base.ICmd) {
      try {
         await this.page.waitForSelector(cmd.Selector)
      } catch (e) {
         this.log("waitForSelector2", cmd.Selector)
         await this.page.waitForSelector(cmd.Selector)
      }
   }

   protected async handleAsyncCondition(cmd: base.ICmd) {
      for (let i in cmd.Conditions) {
         let condition = this.replaceVarInData(cmd.Conditions[i].Condition)
         if (eval(condition)) {
            this.log("true", condition)
            await this.do(cmd.Conditions[i].Json)
            break
         }
         this.log("false", condition)
      }
   }

   protected async do(cmds: base.ICmd[]) {
      for (let i in cmds) {
         this.log(cmds[i].Cmd, cmds[i].Comment)
         const cmdAsync = "handleAsync" + cmds[i].Cmd.replace(/^\S/, s => { return s.toUpperCase() })
         const cmdSync = "handleSync" + cmds[i].Cmd.replace(/^\S/, s => { return s.toUpperCase() })

         if (typeof this[cmdAsync] === "function") await this[cmdAsync](cmds[i])
         else if (typeof this[cmdSync] === "function") this[cmdSync](cmds[i])
         else throw { message: "CmdNotFound" }

         if (cmds[i].WaitNav === true) this.handleAsyncWaitForNavigation(cmds[i])
      }
   }
}