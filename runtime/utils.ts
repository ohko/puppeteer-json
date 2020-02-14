import * as base from "./base"

export class Utils extends base.Base {
   protected removePrefix$(val: string): string {
      if (val.substr(0, 1) != "$") return val
      return val.substring(1)
   }

   protected getData(key: string): string {
      if (key.substr(0, 1) != "$") return key
      return this.db[this.removePrefix$(key)]
   }

   protected setData(key: string, data: string) {
      this.db[key] = data
   }

   // 提取变量并替换
   protected replaceVarInData(data: string, prefix: string = "'", subfix: string = "'"): string {
      const res = data.match(/\$\{.+?\}/g)
      for (let j in res) {
         const key = res[j]
         const keyChild = res[j].substring(2, key.length - 1)
         while (data.indexOf(key) >= 0) {
            data = data.replace(key, prefix + this.db[keyChild] + subfix)
         }
      }
      return data
   }
}