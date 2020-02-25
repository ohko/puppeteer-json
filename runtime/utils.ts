import * as puppeteer from "puppeteer";
import * as axios from "axios"
import * as base from "./base"

// 公用方法
export class Utils extends base.Base {

   // 异步执行脚本，将db数据但当作参数执行脚本内容，用于执行丰富的javascript脚本
   // 返回对象：{x:1, y:"a"}
   protected async asyncEval(str: string): Promise<Object> {
      if (str === undefined) return str

      const o = Object.assign({ axios: axios }, this.db)
      const f = Function.apply({}, [...Object.keys(o), str]);
      return await f(...Object.values(o));
   }

   // 同步执行脚本，将db数据但当作参数执行脚本内容，主要用于常规javasript脚本
   protected syncEval(str: string, ths: Object = {}): any {
      if (str === undefined) return str

      str = str.indexOf("return") < 0 ? "return " + str : str
      const o = Object.assign(ths, this.db)
      const f = Function.apply({}, [...Object.keys(o), str]);
      return f(...Object.values(o))
   }

   // 为selectorAll提供索引功能
   protected getIndex(cmd: base.ICmd): any {
      if (cmd.Index) return this.syncEval(cmd.Index)
      return 0
   }

   // 获取cmd参数
   // 如果Key存在，将返回同步执行Key的结果
   // 如果SyncEval存在，将返回同步执行Eval的结果
   // 如果AsyncEval存在，将返回异步执行Eval的结果
   // 否则直接返回Value
   protected async asyncGetValue(cmd: base.ICmd): Promise<any> {
      if (cmd.Key) return this.syncEval(cmd.Key)
      if (cmd.SyncEval) return this.syncEval(cmd.SyncEval)
      if (cmd.AsyncEval) return await this.asyncEval(cmd.AsyncEval)
      return cmd.Value
   }

   // 设置db中Key=Value，Value等于undefined时删除Key
   protected setValue(key: string, value: string) {
      if (value === undefined) delete this.db[key]
      else this.db[key] = value
   }

   // 在Rect的区域内随机生成一个Point点
   protected calcElementPoint(rect: base.IRect): base.IPoint {
      const xMax = rect.x + rect.width * 0.2
      const xMin = rect.x + rect.width * 0.8
      const yMax = rect.y + rect.height * 0.2
      const yMin = rect.y + rect.height * 0.8
      return { x: this.random(xMin, xMax), y: this.random(yMin, yMax) }
   }

   // 随机数：[min,max] min<=x<=max
   protected random(min: number, max: number): number {
      return Math.round(Math.floor(Math.random() * (max - min + 1)) + min)
   }

   // 随机生成一个字符串
   protected randomString(length: number): string {
      const chars = "abcdefghijklmnopqrstuvwxyz"
      var result = '';
      for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
      return result;
   }

   // 生成Multilogin指纹参数
   protected createMultiloginProfile(opt: base.IMultiloginCreateOption): Object {
      const network = {}
      if (opt.proxy) network["proxy"] = opt.proxy
      if (opt.dns) network["dns"] = opt.dns
      let option = {
         "name": opt.name,
         "notes": opt.notes ? opt.notes : "",
         "browser": "mimic",
         "os": opt.os ? opt.os : "win",
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

   // 异步启动Multilogin指纹
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

   // 移动鼠标，记录最后鼠标坐标
   // x或y为0时随机到一个坐标
   protected async asyncMouseMove(x: number, y: number) {
      // 恢复上次坐标
      if (!this.mouseX) this.mouseX = this.random(100, 1000)
      if (!this.mouseY) this.mouseY = this.random(100, 1000)
      await this.page.mouse.move(this.mouseX, this.mouseY, { steps: 1 })

      let steps = this.random(5, 10)
      x = x ? x : this.random(100, 1000)
      y = y ? y : this.random(100, 1000)
      this.mouseX = x
      this.mouseY = y
      await this.page.mouse.move(x, y, { steps: steps })
   }

   // 点击鼠标，记录最后鼠标坐标
   // x或y为0时随机到一个坐标
   protected async asyncMouseClick(x: number, y: number, options: any) {
      await this.asyncMouseMove(x, y)
      await this.page.mouse.click(x, y, options)
   }
}