import * as base from "./base"
import * as handle from "./handle"

export class Runtime extends handle.Handle {
   public async AsyncStart(data: base.IData) {
      this.db = data.DB
      await this.do(data.Json)
   }

   public SyncGetResult(): base.IResult {
      return { DB: this.db, Logs: this.logs }
   }
}