import * as puppeteer from "puppeteer";
import * as utils from "./utils"
import * as base from "./base"

export class Handle extends utils.Utils {
   protected async handleAsyncBoot(cmd: base.ICmd) {
      this.browser = await puppeteer.launch(cmd.Options)
   }

   protected async handleAsyncNavigation(cmd: base.ICmd) {
      return await this.page.goto(this.getVal(cmd.Val), { waitUntil: "domcontentloaded" })
   }

   protected async handleAsyncWait(cmd: base.ICmd) {
      const t = Number(cmd.Val)
      return await this.page.waitFor(t)
   }

   protected async handleAsyncType(cmd: base.ICmd) {
      await this.page.waitForSelector(cmd.Selector)
      await this.page.type(cmd.Selector, this.getVal(cmd.Val))
   }

   protected async handleAsyncTextContent(cmd: base.ICmd) {
      await this.page.waitForSelector(cmd.Selector)
      return this.setVal(cmd.Val, await this.page.$eval(cmd.Selector, el => el.textContent))
   }

   protected async handleAsyncNewPage(cmd: base.ICmd) {
      this.page = await this.browser.newPage();
      return this.page
   }

   protected async handleAsyncAlwaysPage(cmd: base.ICmd) {
      const ps = await this.browser.pages()
      this.page = ps.length ? ps.shift() : await this.browser.newPage();
      return this.page
   }

   protected async handleAsyncClosePage(cmd: base.ICmd) {
      return this.page.close()
   }

   protected async handleAsyncShutdown(cmd: base.ICmd) {
      return this.browser.close()
   }
}