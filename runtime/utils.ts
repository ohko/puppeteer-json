import * as base from "./base"

export class Utils extends base.Base {
   protected getVal(val: string): string {
      if (val.substr(0, 1) != "$") return val
      const key = val.substring(1)
      return this.db[key]
   }

   protected setVal(val: string, data: string) {
      const key = val.substring(1)
      this.db[key] = data
   }
}