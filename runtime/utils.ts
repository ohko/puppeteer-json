import * as base from "./base"
import * as axios from "axios"

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
}