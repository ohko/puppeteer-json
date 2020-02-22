import * as base from "./base"
import * as handle from "./handle"

export class Runtime extends handle.Handle {

   // 开始执行
   public async AsyncStart(data: base.IData) {
      this.db = data.DB
      try {
         await this.do(data.Json)
      } catch (e) {
         if (typeof e === "string" && e == "break") { }
         else throw e
      } finally {
         if (this.finally) {
            while (this.finally.length > 0) {
               await this.do(this.finally.pop())
            }
         }
      }
   }

   // 获取执行结果
   public SyncGetResult(): base.IResult {
      return { DB: this.db, Logs: this.logs }
   }
}