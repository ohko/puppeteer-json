import * as puppeteer from "puppeteer";
import * as axios from "axios"
import * as base from "./base"

// 公用方法
export class Utils extends base.Base {

   // 异步执行脚本，将db数据但当作参数执行脚本内容，用于执行丰富的javascript脚本
   // 返回对象：{x:1, y:"a"}
   protected async asyncEval(cmd: base.CmdAsyncEval): Promise<Object> {
      if (cmd.AsyncEval === undefined) return cmd.AsyncEval

      const o = Object.assign({ axios: axios, _db: this.db }, this.db)
      const f = Function.apply({}, [...Object.keys(o), cmd.AsyncEval]);
      return await f(...Object.values(o));
   }

   // 同步执行脚本，将db数据但当作参数执行脚本内容，主要用于常规javasript脚本
   protected syncEval(cmd: base.CmdSyncEval, ths: Object = {}): any {
      if (cmd.SyncEval === undefined) return cmd.SyncEval
      if (typeof cmd.SyncEval != "string") return cmd.SyncEval

      const str = cmd.SyncEval.indexOf("return") < 0 ? "return " + cmd.SyncEval : cmd.SyncEval
      ths["_db"] = this.db
      const o = Object.assign(ths, this.db)
      const f = Function.apply({}, [...Object.keys(o), str]);
      return f(...Object.values(o))
   }

   // 为selectorAll提供索引功能
   protected getIndex(cmd: base.CmdIndex): any {
      if (cmd.Index) return this.syncEval(<base.CmdSyncEval>{ SyncEval: cmd.Index })
      return 0
   }

   // 设置db中Key=Value，Value等于undefined时删除Key
   protected setValue(key: string, value: string) {
      if (value === undefined) delete this.db[key]
      else this.db[key] = value
   }

   // 获取db中Key的Value
   protected getValue(key: string) {
      return this.db[key]
   }

   // 保存screenshot
   protected saveScreenshot(key: string, value: string) {
      this.screenshots[key] = value
   }

   // 在Rect的区域内随机生成一个Point点
   protected calcElementPoint(rect: base.IRect): base.IPoint {
      const xMin = rect.x + rect.width * 0.3
      const xMax = rect.x + rect.width * 0.7
      const yMin = rect.y + rect.height * 0.3
      const yMax = rect.y + rect.height * 0.7
      const point = { x: this.random(xMin, xMax), y: this.random(yMin, yMax) }
      // this.log("Rect -> Point:", JSON.stringify(rect), JSON.stringify(point))
      return point
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

   // 监听 targetcreated 事件
   protected onTargetcreated() {
      this.browser.on('targetcreated', async target => {
         if (target.type() === 'page') {
            let page = await target.page()
            this.pages.push(page)
         }
      })
   }

   // 监听 targetdestroyed 事件
   protected onTargetdestroyed() {
      this.browser.on('targetdestroyed', async (target: any) => {
         // 识别 page 实例的 id
         let id = await target._targetInfo.targetId

         this.pages.forEach((item: any, index) => {
            if (id === item._target._targetInfo.targetId) {
               this.pages.splice(index, 1)

               if (!this.pages.length) {
                  this.page = undefined
                  return
               }

               let lastIndex = this.pages.length - 1
               this.page = this.pages[lastIndex]
               this.pages[lastIndex].bringToFront()
               return
            }
         })
      })
   }

   // 生成Multilogin指纹参数
   protected createMultiloginProfile(opt: base.IMultiloginCreateOption): Object {
      const network = {}
      if (opt.proxy) network["proxy"] = opt.proxy
      if (opt.dns) network["dns"] = opt.dns
      let option = {
         "name": opt.name,
         "notes": opt.notes ? opt.notes : "",
         "browser": opt.browser ? opt.browser : "mimic",
         "os": opt.os ? opt.os : "win",
         "enableLock": true,
         "navigator": {
            "resolution": opt.resolution ? opt.resolution : "1920x1080",
            "doNotTrack": 1,
            "language": opt.language ? opt.language : null
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
   protected async asyncStartMultilogin(cmd: base.CmdBootMultilogin, profileId: string) {
      if (profileId == "") throw { message: "profileId is empty" }

      // {"status":"OK","value":"ws://127.0.0.1:21683/devtools/browser/7a873c05-29d4-42a1-ad6b-498e70203e77"}
      // {"status":"ERROR","value":"Profile \u0027b39ce59f-b7a2-4bd0-9ce8-dcffbea3465a\u0027 is active already"}
      const url = process.env.MultiloginURL + "/api/v1/profile/start?automation=true&puppeteer=true&profileId=" + profileId;
      let rs: any
      for (let i = 0; i < 6; i++) {
         try {
            rs = (await axios.default.get(url)).data;
         } catch (e) {
            rs = { status: "ERROR", value: e.toString() }
         }
         if (rs.status == "OK") break
         this.log("[10秒后重试]Multilogin连接失败:", profileId, JSON.stringify(rs))
         await (async _ => { await new Promise(x => setTimeout(x, 10000)) })()
      }
      if (rs.status != "OK") {
         this.log("Multilogin连接失败:", rs.value)
         throw { message: rs.value }
      }

      const ws = rs.value
      this.log("ws", ws)
      this.browser = await puppeteer.connect({ browserWSEndpoint: ws, defaultViewport: null })
      this.pages = await this.browser.pages()
      this.onTargetcreated()
      this.onTargetdestroyed()
   }

   // 生成VMlogin指纹参数
   protected createVMloginProfile(opt: base.VMloginCreateOption): Object {
      let option = {
         'token': process.env.VMloginToken,
         'Body': {
            'name': opt.name,
            'notes': opt.notes,
            'proxyHost': opt.proxyHost,
            'proxyType': opt.proxyType,
            'proxyPort': opt.proxyPort,
            'proxyUser': opt.proxyUser,
            'proxyPass': opt.proxyPass,
            // 'autoWanIp': opt.autoWanIp,
            'browserSettings': opt.browserSettings,
            // 'localCache': opt.localCache,
            'langHdr': opt.langHdr,
            'userAgent': opt.userAgent,
            'canvasDefType': opt.canvasDefType,
            'appVersion': opt.appVersion,
            'product': opt.product,
            'appName': opt.appName,
            'hardwareConcurrency': opt.hardwareConcurrency,
            "timeZoneFillOnStart": opt.timeZoneFillOnStart,
            'platform': opt.platform || "Win64",
            'screenHeight': opt.screenHeight || 1080,
            'screenWidth': opt.screenWidth || 1920,
            'disableFlashPlugin': opt.disableFlashPlugin,
            "maskFonts": true,
            'audio': {
               'noise': opt.audioNoise
            },
            'webgl': {
               'vendor': opt.webglVendor,
               'renderer': opt.webglRenderer
            },
            'mediaDevices': {
               'audioInputs': opt.audioInputs,
               'audioOutputs': opt.audioOutputs,
               'videoInputs': opt.videoInputs
            },
            'webRtc': {
               'type': "FAKE",
               'fillOnStart': true,
               'publicIp': `${this.random(1, 255)}.${this.random(1, 255)}.${this.random(1, 255)}.${this.random(1, 255)}`,
               'localIps': [`192.168.${this.random(1, 255)}.${this.random(1, 255)}`]
            },
            'synSettings': {
               'synCookie': true,
               'synBookmark': true,
               'synHistory': true,
               'synExtension': true,
               'synKeepKey': true,
               'synLastTag': true
            },
            "autoWanIp": true,
            "startUrl": "https://www.whoer.net",
            "localCache": {
               'deleteCache': true
           }
         }
      }
      return option
   }

   // 异步启动VMlogin指纹
   protected async asyncStartVMlogin(cmd: base.CmdBootVMlogin, profileId: string) {
      if (profileId == "") throw { message: "profileId is empty" }

      const url = process.env.VMloginURL + "/api/v1/profile/start?profileId=" + profileId;
      let rs: any
      for (let i = 0; i < 6; i++) {
         try {
            rs = (await axios.default.get(url)).data;
         } catch (e) {
            rs = { status: "ERROR", value: e.toString() }
         }

         if (rs.status == "OK") break
         this.log("[10秒后重试]VMlogin连接失败:", profileId, JSON.stringify(rs))
         await (async _ => { await new Promise(x => setTimeout(x, 10000)) })()
      }
      if (rs.status != "OK") {
         this.log("Multilogin连接失败:", rs.value)
         throw { message: rs.value }
      }

      let ws: any
      for (let i = 0; i < 6; i++) {
         await (async _ => { await new Promise(x => setTimeout(x, 5000)) })()
         try {
            ws = (await axios.default.get(rs.value + '/json/version')).data.webSocketDebuggerUrl
         } catch (e) {
            this.log('[5秒后重试]ws获取失败')
         }

         if (ws) break
      }
      if (!ws) throw { message: 'ws获取失败' }
      this.log("ws", ws)

      try {
         this.browser = await puppeteer.connect({ browserWSEndpoint: ws, defaultViewport: null })
         this.pages = await this.browser.pages()
      } catch (e) { console.log(`catch ${e}`) }

      this.onTargetcreated()
      this.onTargetdestroyed()
   }

   /**
    * @desc 生成一个二次贝塞尔曲线 point
    * @param {number} t 当前百分比
    * @param {Array} point1 起点坐标
    * @param {Array} controlPoint 控制点
    * @param {Array} point2 终点坐标
    */
   protected quadraticBezier(t: number, point1: base.IPoint, controlPoint: base.IPoint, point2: base.IPoint): base.IPoint {
      let { x: x1, y: y1 } = point1;
      let { x: cx, y: cy } = controlPoint;
      let { x: x2, y: y2 } = point2;

      let x = (1 - t) * (1 - t) * x1 + 2 * t * (1 - t) * cx + t * t * x2;
      let y = (1 - t) * (1 - t) * y1 + 2 * t * (1 - t) * cy + t * t * y2;
      return { x, y };
   }

   // 获取两点之间的距离（勾股定理公式）
   protected getDistanceBetweenTwoPoints(point1, point2) {
      let a = point1.x - point2.x
      let b = point1.y - point2.y

      return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));;
   }

   /**
     * @desc 获取贝塞尔曲线的所有点
     * @param {Array} point1 起始点
     * @param {Array} controlPoint  控制点
     * @param {Array} point2 终止点
     */
   protected getAllBezierPoints(point1: base.IPoint, controlPoint: base.IPoint, point2: base.IPoint): base.IPoint[] {
      let distance = this.getDistanceBetweenTwoPoints(point1, point2)
      let random = this.random(80, 120)
      let num = distance / random // 生成 x 个 point 

      let points: base.IPoint[] = []

      for (let i = 0; i < num; i++) {
         let point: base.IPoint = this.quadraticBezier(i / num, point1, controlPoint, point2)
         points.push(point);
      }

      points.push(point2);
      return points;
   }

   // 移动鼠标，记录最后鼠标坐标
   // x或y为0时随机到一个坐标
   protected async asyncMouseMove(x: number, y: number) {
      let { max, min } = Math
      let { random } = this

      // 恢复上次坐标
      if (!this.mouseX) this.mouseX = random(100, 1000)
      if (!this.mouseY) this.mouseY = random(100, 1000)

      let { mouseX, mouseY } = this
      await this.page.mouse.move(this.mouseX, this.mouseY);

      x = x ? x : random(100, 1000)
      y = y ? y : random(100, 1000)

      // 随机生成一个绘制二次贝塞尔曲线所需的控制点 
      let controlPoint: base.IPoint = { x: random(min(mouseX, x), max(mouseX, x)), y: random(min(mouseY, y), max(mouseY, y)) }

      let points: base.IPoint[] = this.getAllBezierPoints({ x: mouseX, y: mouseY }, controlPoint, { x, y })
      for (const { x, y } of points) {
         let steps = random(1, 3)
         await this.page.mouse.move(x, y, { steps });
      }

      this.mouseX = x
      this.mouseY = y
   }

   // 点击鼠标，记录最后鼠标坐标
   // x或y为0时随机到一个坐标
   protected async asyncMouseClick(x: number, y: number, options: any) {
      if (this.mouseX != x || this.mouseY != y) await this.asyncMouseMove(x, y)
      await this.page.mouse.click(x, y, options)
   }

   // 判断当前设备是否是 PC 端
   protected async isPC() {
      let agentInfo = await this.browser.userAgent()
      let agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
      let flag = true;
      for (let i = 0; i < agents.length; i++) {
         if (agentInfo.indexOf(agents[i]) > 0) {
            flag = false;
            break;
         }
      }
      return flag;
   }
}