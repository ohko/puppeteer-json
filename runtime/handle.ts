import * as puppeteer from "puppeteer";
import * as axios from "axios"
import * as utils from "./utils"
import * as base from "./base"

export class Handle extends utils.Utils {
   protected async handleAsyncBoot(cmd: base.ICmd) {
      let ws: string
      try { ws = (await axios.default.get('http://127.0.0.1:9222/json/version')).data.webSocketDebuggerUrl } catch (e) { }
      if (ws != "") this.log("ws", ws)
      this.browser = (ws ? await puppeteer.connect({ browserWSEndpoint: ws, defaultViewport: null }) : await puppeteer.launch(cmd.Options))
   }

   protected async handleAsyncNavigation(cmd: base.ICmd) {
      await this.page.goto(this.getData(cmd.Data), { waitUntil: "domcontentloaded" })
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
      const t = Number(cmd.Data)
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
      await this.page.type(cmd.Selector, this.getData(cmd.Data))
      await this.handleAsyncWaitRand(cmd)
   }

   protected async handleAsyncSelect(cmd: base.ICmd) {
      await this.handleAsyncWaitForSelector(cmd)
      await this.page.select(cmd.Selector, this.getData(cmd.Data))
      await this.handleAsyncWaitRand(cmd)
   }

   protected async handleAsyncTextContent(cmd: base.ICmd) {
      await this.handleAsyncWaitForSelector(cmd)
      return this.setData(this.removePrefix$(cmd.Data), await this.page.$eval(cmd.Selector, el => el.textContent))
   }

   protected async handleAsyncHttpGet(cmd: base.ICmd) {
      this.setData(this.removePrefix$(cmd.Data), (await axios.default.get(cmd.Options["url"])).data)
   }

   protected async handleAsyncJs(cmd: base.ICmd) {
      console.log(this.replaceVarInData(cmd.Data, "", ""))
      const result = await eval(this.replaceVarInData(cmd.Data, "", ""))
      if (typeof result === "object") {
         for (let i in result) this.setData(i, result[i])
      }
   }

   protected async handleAsyncThrow(cmd: base.ICmd) {
      throw { message: this.getData(cmd.Data) }
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
      return await this.page.setExtraHTTPHeaders(<puppeteer.Headers>cmd.Options);
   }

   protected handleSyncSetDefaultNavigationTimeout(cmd: base.ICmd) {
      return this.page.setDefaultNavigationTimeout(Number(this.getData(cmd.Data)));
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
         console.log("eval:", condition)
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
         if (cmds[i].Cmd == "break") break

         const cmdAsync = "handleAsync" + cmds[i].Cmd.replace(/^\S/, s => { return s.toUpperCase() })
         const cmdSync = "handleSync" + cmds[i].Cmd.replace(/^\S/, s => { return s.toUpperCase() })

         if (typeof this[cmdAsync] === "function") await this[cmdAsync](cmds[i])
         else if (typeof this[cmdSync] === "function") this[cmdSync](cmds[i])
         else return this.log("CmdNotFound", cmds[i].Cmd)

         if (cmds[i].WaitNav === true) this.handleAsyncWaitForNavigation(cmds[i])
      }
   }
}