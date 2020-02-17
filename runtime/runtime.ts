import * as base from "./base"
import * as handle from "./handle"

export class Runtime extends handle.Handle {
   public async AsyncStart(data: base.IData) {
      this.db = data.DB
      try {
         await this.do(data.Json)
      } catch (e) { throw e } finally {
         if (this.finally) {
            while (this.finally.length > 0) {
               await this.do(this.finally.pop())
            }
         }
      }
   }

   public SyncGetResult(): base.IResult {
      return { DB: this.db, Logs: this.logs }
   }
}