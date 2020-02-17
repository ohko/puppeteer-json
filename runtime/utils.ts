import * as puppeteer from "puppeteer";
import * as axios from "axios"
import * as base from "./base"

export class Utils extends base.Base {
   protected eval(str: string): any {
      if (str === undefined) return str

      let env = Object.assign({}, this.db)
      return (function (str: string) {
         let ss: Array<string> = []
         for (var i in this) {
            ss.push("let " + i + "=" + JSON.stringify(this[i]))
         };
         ss.push(str)

         if (str.indexOf("await ") < 0) return eval(ss.join(";"))
         return eval("(async _=>{" + ss.join(";") + "})()")
      }).call(env, str)
   }

   protected getValue(cmd: base.ICmd): string {
      if (cmd.Key) return this.eval(cmd.Key)
      return cmd.Value
   }

   protected setValue(key: string, value: string) {
      this.db[key] = value
   }

   protected asyncAxiosGet(url: string) {
      return (async _ => { return (await axios.default.get(url)).data })()
   }

   protected asyncAxiosPost(url: string, data?: any) {
      return (async _ => { return (await axios.default.post(url, data)).data })()
   }

   protected makeMultiloginProfile(opt: base.IMultiloginCreateOption): Object {
      const network = {}
      if (opt.proxy) network["proxy"] = opt.proxy
      if (opt.dns) network["dns"] = opt.dns
      let option = {
         "name": opt.name,
         "notes": opt.notes ? opt.notes : "",
         "browser": "mimic",
         "os": opt.os ? opt.os : "win",
         "startUrl": "https://multilogin.com/",
         "googleServices": true,
         "enableLock": true,
         "navigator": {
            "resolution": opt.resolution ? opt.resolution : "1920x1080",
            "doNotTrack": 1
         },
         "storage": {
            "local": true,
            "extensions": true,
            "bookmarks": true,
            "history": true,
            "passwords": true
         },
         "network": network
      }

      return option
   }

   protected async asyncStartMultilogin(cmd: base.ICmd, profileId: string) {
      if (profileId == "") throw { message: "profileId is empty" }

      // {"status":"OK","value":"ws://127.0.0.1:21683/devtools/browser/7a873c05-29d4-42a1-ad6b-498e70203e77"}
      // {"status":"ERROR","value":"Profile \u0027b39ce59f-b7a2-4bd0-9ce8-dcffbea3465a\u0027 is active already"}
      const url = cmd.Options["multilogin"] + "/api/v1/profile/start?automation=true&puppeteer=true&profileId=" + profileId;
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
}