import * as base from "./base"
import * as handle from "./handle"

export class Runtime extends handle.Handle {
   public async AsyncStart(data: base.IData) {
      this.db = data.DB
      for (var i in data.Json) {
         this.log(data.Json[i].Cmd, data.Json[i].Comment)
         const cmd = "handleAsync" + data.Json[i].Cmd.replace(/^\S/, s => { return s.toUpperCase() })
         if (typeof this[cmd] !== "function") {
            this.log("CmdNotFound", cmd)
            continue
         }
         try {
            await this[cmd](data.Json[i])
         } catch (e) {
            this.log("Excpetion", e.message)
         }
      }
   }

   public SyncGetResult(): Object {
      return { data: this.db, logs: this.logs }
   }
}