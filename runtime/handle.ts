import * as puppeteer from "puppeteer";
import * as axios from "axios"
import * as utils from "./utils"
import * as base from "./base"
import * as installMouseHelper from './install-mouse-helper'
import {TimeoutError} from "puppeteer/Errors"
import {ElementHandle} from "puppeteer";

const parser = require('ua-parser-js')

export class Handle extends utils.Utils {

   // ========== Puppeteer ==========

   // 启动Puppeteer，会尝试连接已经打开的Puppeteer
   // Options是启动新Puppeteer所需要的参数，可参考Puppeteer官方文档
   // { "Cmd": "bootPuppeteer", "Comment": "启动Puppeteer", "Options": { "headless": true, "args": ["--no-sandbox"], "defaultViewport": null } }
   protected async handleAsyncBootPuppeteer(cmd: base.CmdBootPuppeteer) {
      this.isPuppeteer = true
      this.isMultilogin = false
      this.isVMlogin = false
      let ws: string
      try { ws = (await axios.default.get('http://127.0.0.1:8511/json/version')).data.webSocketDebuggerUrl } catch (e) { }
      if (ws != "") this.log("ws:", ws)
      this.browser = (ws ? await puppeteer.connect({ browserWSEndpoint: ws, defaultViewport: null }) : await puppeteer.launch(cmd.Options))
      this.pages = await this.browser.pages()
      this.onTargetcreated()
      this.onTargetdestroyed()
   }

   // ========== Multilogin ==========

   // 创建Multilogin指纹，Options是设置一些必要的参数
   // 创建成功，指纹ID会存入profileId字段
   // Key是创建指纹需要的动态参数
   // { "Cmd": "createMultilogin", "Comment": "创建multilogin指纹", Options:<base.CmdCreateMultilogin>{} },
   protected async handleAsyncCreateMultilogin(cmd: base.CmdCreateMultilogin) {
      this.isPuppeteer = false
      this.isVMlogin = false
      this.isMultilogin = true
      const profileId = this.multiloginProfileId
      const createOption = <base.IMultiloginCreateOption>this.getValue(cmd.Key)
      const url = "https://api.multiloginapp.com/v2/profile?token=" + process.env.MultiloginToken + "&mlaVersion=" + createOption.mlaVersion + "&defaultMode=FAKE";
      const opt = this.createMultiloginProfile(createOption)
      const rs = (await axios.default.post(url, opt)).data;
      // 成功返回：{"uuid": "c0e42b54-fbd5-41b7-adf3-673e7834f143"}
      // 失败返回：{"status": "ERROR","value": "os: must match \"lin|mac|win|android\""}
      if (rs.status == "ERROR") {
         this.log("Multilogin指纹创建失败:", rs.value)
         throw { message: rs.value }
      }
      // 
      this.setValue(profileId, rs.uuid)
   }

   // 启动Multilogin指纹，指纹ID从Key读取，Key未设置默认为profileId，Options是设置一些必要的参数
   // { "Cmd": "bootMultilogin", "Comment": "连接multilogin", "Key": "profileId" },
   protected async handleAsyncBootMultilogin(cmd: base.CmdBootMultilogin) {
      this.isVMlogin = false
      this.isPuppeteer = false
      this.isMultilogin = true
      let profileId = this.getValue(cmd.Key)
      if (!profileId) profileId = this.multiloginProfileId
      await this.asyncStartMultilogin(cmd, profileId)
   }

   // 分享Multilogin指纹，指纹ID从Key读取，Key未设置默认为profileId，Options是设置一些必要的参数
   // { "Cmd": "shareMultilogin", "Comment": "连接multilogin", "Key": "profileId", "Value":"shareToUser" },
   protected async handleAsyncShareMultilogin(cmd: base.CmdShareMultilogin) {
      let profileId = this.getValue(cmd.Key)
      let user = this.getValue(cmd.Value)
      if (!profileId) profileId = this.multiloginProfileId

      if (profileId == "") throw { message: "profileId is empty" }
      if (user == "") throw { message: "user is empty" }

      // {"status":"OK"}
      // {"status":"ERROR"}
      const url = process.env.MultiloginURL + "/api/v1/profile/share?profileId=" + profileId + "&user=" + user;
      let rs: any
      for (let i = 0; i < 6; i++) {
         try {
            rs = (await axios.default.get(url)).data;
         } catch (e) {
            rs = { status: "ERROR", value: e.toString() }
         }
         if (rs.status == "OK") break
         this.log("[10秒后重试]Multilogin分享失败:", profileId, JSON.stringify(rs))
         await (async _ => { await new Promise(x => setTimeout(x, 10000)) })()
      }
      if (rs.status != "OK") {
         this.log("Multilogin分享失败:", rs.value)
         throw { message: rs.value }
      }

      const ws = rs.value
      this.log("ws", ws)
      this.browser = await puppeteer.connect({ browserWSEndpoint: ws, defaultViewport: null })
   }

   // 删除Multilogin指纹，指纹ID从Key读取，Key未设置默认为profileId
   // { Cmd: "removeMultilogin", Comment: "删除Multilogin指纹", Key: "profileId" },
   protected async handleAsyncRemoveMultilogin(cmd: base.CmdRemoveMultilogin) {
      const profileId = this.getValue(cmd.Key)
      if (!profileId) return
      const url = "https://api.multiloginapp.com/v1/profile/remove?token=" + process.env.MultiloginToken + "&profileId=" + profileId;

      let rs: any
      for (let i = 0; i < 6; i++) {
         try {
            rs = (await axios.default.get(url)).data;
         } catch (e) {
            rs = { status: "ERROR", value: e.toString() }
         }
         if (rs.status == "OK") break
         this.log("[10秒后重试]Multilogin指纹删除失败:", profileId, JSON.stringify(rs))
         await (async _ => { await new Promise(x => setTimeout(x, 10000)) })()
      }

      // 成功返回：{"status":"OK"}
      // 失败返回：{"status":"ERROR","value":"profile not found"}
      if (rs.status == "ERROR") {
         this.log("Multilogin指纹删除失败:", rs.value)
         throw { message: rs.value }
      }
      this.log("Multilogin指纹删除成功")
   }

   // 在数组中的指定数据里生成一个随机数
   getRandomItem = (arr: any[]) => {
      let randomIndex = Math.floor((Math.random() * arr.length))
      return arr[randomIndex]
   }

   // 判断浏览器版本和字体是否合法
   isValidProfile(profile: any) {
      let ua = parser(profile.userAgent);
      if (ua.browser.name != 'Chrome' && ua.browser.name != 'Chromium') {
         return false;
      }
      if (ua.browser.major < 79) {
         return false;
      }
      return true
   }

   // ========== VMlogin ==========

   // 获取 vmlogin 随机配置
   async VMloginRandomProfile(platform: String) {
      let url = `${process.env.VMloginURL}/api/v1/profile/randomProfile?platform=${platform}`
      try {
         let data = (await axios.default.get(url)).data
         // 生成随机profile时，发生错误
         if (data.status && data.status == 'ERROR') {
            return false
         }
         let { webgl, audio, webRtc } = data
         data.langHdr = 'en-US';
         data.webglVendor = webgl.vendor;
         data.webglRenderer = webgl.renderer;
         data.audioNoise = audio.noise;
         data.webRtcType = webRtc.type;
         data.publicIp = webRtc.publicIp;
         data.localIps = webRtc.localIps;
         if (platform == 'Windows') {
            let flag = this.isValidProfile(data)
            if (flag == false) {
               return false
            } else {
               return data
            }
         } else {
            return data
         }
      } catch (e) {
         throw { message: e }
      }
   }

   // 对指纹进行仓库的入库出库操作。
   // 如果不进行出入库操作，再vmlogin页面就会有很多指纹，使界面功能十分卡顿。
   // 所以，对于每次进行脚本时，可根据要求使用此命令来对指纹进行入库出库操作。
   // 一般在脚本开始，调用命令传入 get 进行出库， 脚本结束调用命令传入 set 进行入库。
   // 注意，在脚本结束后最好是将此命令放在 Shutdown 后面执行。
   protected async handleAsyncWarehouseVmlogin (cmd: base.CmdWarehouseVmlogin) {
      if (!process.env.VMloginToken) {
         await this.log("在执行WarehouseVmlogin命令时，没有发现 VMloginToken 的值。");
         return;
      }

      // 如果是入库，则应该等待浏览器被完整关闭后才进行入库。
      // 所以此处等待，有一个等待 Shutdown 命令运行完成。也就是确保vmlogin完整关闭后，
      // 再进行入库。
      if (cmd.Action === 'set') {
         await this.sleep(7/*秒*/ * 1000);
      }

      /**
       * 有一些细节须在此处表面:
       * 1、已入库的指纹，再次调用入库，不会出错。返回的count会是0，表示0条指纹被入库了，也就是已在仓库里的指纹再次入库不会有任何效果。
       * 2、已入库的指纹，再通过vmlogin 的 /profile/detail 接口获取不到该指纹的详细信息，会抛出：{"status":"ERROR","value":416} 错误。
       * 3、已出库的指纹，再次调用出库，不会出错。返回的count会是0，表示0条指纹出库了，也就是已出库的指纹再次调用出库不会有任何效果。
       */
      const profileId = this.getValue(cmd.Key);
      const result = await axios.default.post("https://api.vmlogin.com/v1/profile/warehouse", {
         'token': process.env.VMloginToken,
         'profileId': profileId,
         'action': cmd.Action
      });

      await this.log(`指纹${profileId}执行${cmd.Action==='set'?'入':'出'}库操作结果：${JSON.stringify(result.data)}`);
   }

   // 创建VMlogin指纹
   // 创建成功，指纹ID会存入profileId字段
   // Key是创建指纹需要的动态参数
   // { "Cmd": "createVMlogin", "Comment": "创建vmlogin指纹", "Key":"options"},
   protected async handleAsyncCreateVMlogin(cmd: base.CmdCreateVMlogin) {
      this.isPuppeteer = false
      this.isMultilogin = false
      this.isVMlogin = true
      const profileId = this.vmloginProfileId
      let createOption = <base.VMloginCreateOption>this.getValue(cmd.Key)
      let body: any
      if (!createOption.platform) {
         createOption.platform = 'Windows'
      }
      for (let i = 0; i < 50; i++) {
         try {
            body = await this.VMloginRandomProfile(createOption.platform)
         } catch (e) {
            console.log(e)
         }
         if (body != false) break
         this.log("[3秒后重试]创建Vmlogin指纹失败:")
         await (async _ => { await new Promise(x => setTimeout(x, 3000)) })()
      }
      body.name = createOption.name || "hk" + (new Date().toISOString())
      body.notes = createOption.notes || "Test profile notes"
      body.tag = createOption.tag || "自动注册"
      body.proxyHost = createOption.proxyHost
      body.proxyPort = createOption.proxyPort
      body.proxyUser = createOption.proxyUser
      body.proxyPass = createOption.proxyPass
      body.proxyType = createOption.proxyType || "HTTP"
      body.webRtc = createOption.webRtc || {
         "type": "FAKE",
         "fillOnStart": true,
         "localIps": createOption.localIps || [`192.168.${this.random(1, 255)}.${this.random(1, 255)}`]
      }
      body.browserSettings = createOption.browserSettings || {
         "pepperFlash": false, // 其他配置 -> 启用Pepper Flash插件
         "mediaStream": true, // 其他配置 -> 启用媒体（WebRTC音频/视频）流
         "webkitSpeech": true, // 其他配置 -> 启用语音输入（x-webkit-speech）
         "fakeUiForMedia": true, // 其他配置 -> 通过选择媒体流的默认设备绕过媒体流信息栏
         "gpuAndPepper3D": true, // 其他配置 -> 启用GPU插件和Pepper 3D渲染
         "ignoreCertErrors": false, // 其他配置 -> 忽略网站证书错误
         "audioMute": false, // 其他配置 -> 音频静音
         "disableWebSecurity": false, // 其他配置 -> 不强制执行同一源策略
         "disablePdf": false, // 其他配置 -> 禁用PDF扩展
         "touchEvents": false, // 其他配置 -> 启用对触摸事件功能检测的支持
         "hyperlinkAuditing": true
      }
      body.browserApi = Object.assign({
         setWebBluetooth: true,
         setBatteryStatus: true,
         autoGeoIp: true,
         speechSynthesis: true
      }, createOption.browserApi || {});
      body.langHdr = createOption.langHdr || "en-US"
      body.acceptLanguage = createOption.acceptLanguage || "en-US,en;q=0.9"
      body['startUrl'] = createOption.startUrl || 'https://www.whoer.net'
      body.synSettings = createOption.synSettings || {
         "synCookie": true,
         "synBookmark": true,
         "synHistory": true,
         "synExtension": true,
         "synKeepKey": true,
         "synLastTag": true
      }
      body.browserParams = createOption.browserParams || '--disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-renderer-backgrounding'
      body.hardwareConcurrency = createOption.hardwareConcurrency || this.getRandomItem([8, 16])
      body.canvasDefType = createOption.canvasDefType || "NOISE"
      body.maskFonts = createOption.maskFonts || true
      body.timeZoneFillOnStart = createOption.timeZoneFillOnStart || true
      body.audio.noise = createOption.audioNoise || true
      body.autoWanIp = createOption.autoWanIp || true
      body.localCache = createOption.localCache || {
         "deleteCache": true
      }
      if (createOption.platform == 'Windows') {
         body.iconId = createOption.iconId || 10
         body.screenWidth = createOption.screenWidth || 1920
         body.screenHeight = createOption.screenHeight || 1080
         body.fontSetting = {
            "dynamicFonts": false,
            "selectAll": false,
            "clientRects": true,
            "rand": true
         }
         body.pixelRatio = createOption.pixelRatio || "1.0"
      } else if (createOption.platform == 'iPhone') {
         body.os = createOption.os || "iPhone 8"
         body.iconId = createOption.iconId || 5
         body.screenHeight = createOption.screenHeight || 1334
         body.screenWidth = createOption.screenWidth || 750
         body.userAgent = createOption.userAgent || "Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Mobile/15E148 Safari/604.1"
         body.webgl = createOption.webgl || {
            "vendor": "Apple Inc.",
            "renderer": "Apple A11 GPU"
         }
         body.fontSetting = createOption.fontSetting || {
            "dynamicFonts": false,
            "fontList": [
               '.PhonepadTwo',
               'Diner',
               'Georgia',
               'Arial',
               'Times New Roman'
            ],
            "selectAll": false,
            "clientRects": true,
            "rand": false
         }
         body.mobileEmulation = createOption.mobileEmulation || true
         body.browserSettings = createOption.browserSettings || {
            "pepperFlash": false, // 其他配置 -> 启用Pepper Flash插件
            "mediaStream": true, // 其他配置 -> 启用媒体（WebRTC音频/视频）流
            "webkitSpeech": true, // 其他配置 -> 启用语音输入（x-webkit-speech）
            "fakeUiForMedia": true, // 其他配置 -> 通过选择媒体流的默认设备绕过媒体流信息栏
            "gpuAndPepper3D": true, // 其他配置 -> 启用GPU插件和Pepper 3D渲染
            "ignoreCertErrors": false, // 其他配置 -> 忽略网站证书错误
            "audioMute": false, // 其他配置 -> 音频静音
            "disableWebSecurity": false, // 其他配置 -> 不强制执行同一源策略
            "disablePdf": false, // 其他配置 -> 禁用PDF扩展
            "touchEvents": true, // 其他配置 -> 启用对触摸事件功能检测的支持
            "hyperlinkAuditing": true
         }
      } else if (createOption.platform == 'Firefox') {
         body.iconId = createOption.iconId || 2
         body.screenWidth = createOption.screenWidth || 1920
         body.screenHeight = createOption.screenHeight || 1080
         body.fontSetting = {
            "dynamicFonts": false,
            "selectAll": false,
            "clientRects": true,
            "rand": true
         }
      } else {
         body.fontSetting = {
            "dynamicFonts": false,
            "selectAll": false,
            "clientRects": true,
            "rand": true
         }
      }
      let option = {
         'token': process.env.VMloginToken,
         'Body': body
      }
      const url = "https://api.vmlogin.com/v1/profile/create"
      // const opt = this.createVMloginProfile(createOption)
      // const rs = (await axios.default.post(url, opt)).data;
      const rs = (await axios.default.post(url, option)).data;
      // 成功返回：{"value": "c0e42b54-fbd5-41b7-adf3-673e7834f143"}
      // 失败返回：{"status": "ERROR","value": "401"}
      if (rs.status == "ERROR") {
         this.log("VMlogin指纹创建失败:", rs.value)
         throw { message: rs.value }
      }

      this.setValue(profileId, rs.value)
      this.setValue("userAgent", body.userAgent)
   }

   // 启动VMlogin指纹，指纹ID从Key读取，Key未设置默认为profileId
   // { "Cmd": "bootVMlogin", "Comment": "连接vmlogin", "Key": "profileId" },
   protected async handleAsyncBootVMlogin(cmd: base.CmdBootVMlogin) {
      this.isVMlogin = true
      this.isPuppeteer = false
      this.isMultilogin = false
      let profileId = this.getValue(cmd.Key)
      if (!profileId) profileId = this.vmloginProfileId
      await this.asyncStartVMlogin(cmd, profileId)
   }

   // 删除VMlogin指纹，指纹ID从Key读取，Key未设置默认为profileId
   // { Cmd: "removeVMlogin", Comment: "删除VMlogin指纹", Key: "profileId" },
   protected async handleAsyncRemoveVMlogin(cmd: base.CmdRemoveVMlogin) {
      const profileId = this.getValue(cmd.Key)
      if (!profileId) return
      const url = "https://api.vmlogin.com/v1/profile/remove?token=" + process.env.VMloginToken + "&profileId=" + profileId;

      let rs: any
      for (let i = 0; i < 6; i++) {
         try {
            rs = (await axios.default.get(url)).data;
         } catch (e) {
            rs = { status: "ERROR", value: e.toString() }
         }
         if (rs.status == "OK") break
         this.log("[10秒后重试]VMlogin指纹删除失败:", profileId, JSON.stringify(rs))
         await (async _ => { await new Promise(x => setTimeout(x, 10000)) })()
      }

      // 成功返回：{"status":"OK"}
      // 失败返回：{"status":"ERROR","value":"416"}
      if (rs.status == "ERROR") {
         this.log("VMlogin指纹删除失败:", rs.value)
         throw { message: rs.value }
      }
      this.log("VMlogin指纹删除成功")
   }

   // ========== 浏览器 ==========

   // 访问指定的网址，从Key或Value获取网址，Options可以设置Puppeteer支持的导航参数
   // { "Cmd": "navigation", "Comment": "浏览器打开百度", "Key": "url", "Options": { waitUntil: "domcontentloaded" } }
   protected async handleAsyncNavigation(cmd: base.CmdNavigation) {

      // 使用 Object.assign 处理对象类型的参数。
      // 这是必须的，因为如果直接使用传入的option, 对该对象内部的字段若进行了修改
      // 则会影响到下一次执行此命令时本对象的具体表现方式，这种现象尤其在 Loop 循环里
      // 多次使用本命令。
      const opt = Object.assign({}, cmd.Options || {})

      if (!opt.waitUntil) {opt.waitUntil = "domcontentloaded";}

      // 允许 referer 从 db 里取到数据，这样更方便实现页面调度。
      if (opt.referer) {opt.referer = this.syncEval({SyncEval: opt.referer})}
      const url = this.getValue(cmd.Key)
      if (!url) return

      let error = null;
      for (let i = 0; i < 5; i++) {
         try {
            error = null;
            await this.page.goto(url, opt)
         } catch (e) {
            error = e;
         }

         // 执行一次后没有错误，不用再执行了。
         if (!error) {
            break;
         }
      }

      // 执行到这里，发现有错误，说明必然是两次尝试都出问题了。此时需要把错误继续抛出。
      if (error) {
         if (error.toString().includes(`ERR_PROXY_CONNECTION_FAILED`)) throw {message: "ERR_PROXY_CONNECTION_FAILED"}
         else if (error.toString().includes(`ERR_INTERNET_DISCONNECTED`)) throw {message: "ERR_INTERNET_DISCONNECTED"}
         else if (error instanceof TimeoutError) {
         } else throw error
      }

   }

   // 页面回退
   // { "Cmd": "PageBack", "Commont": "浏览器回退到上一页", ""Options": { waitUntil: "domcontentloaded" }" }
   protected async handleSyncPageBack(cmd: base.CmdPageBack) {
      const opt = cmd.Options || { waitUntil: "networkidle0" }
      try {
         await this.page.goBack(opt)
      } catch (e) {
         if (e.toString().includes(`ERR_PROXY_CONNECTION_FAILED`)) throw { message: "ERR_PROXY_CONNECTION_FAILED" }
         else if (e.toString().includes(`ERR_INTERNET_DISCONNECTED`)) throw { message: "ERR_INTERNET_DISCONNECTED" }
         else if (e instanceof TimeoutError) { }
         else throw e
      }
   }

   // 页面前进
   // { "Cmd": "PageForward", "Commont": "浏览器前进一页", ""Options": { waitUntil: "domcontentloaded" }" }
   protected async handleSyncPageForward(cmd: base.CmdPageForward) {
      const opt = cmd.Options || { waitUntil: "networkidle0" }
      try {
         await this.page.goForward(opt)
      } catch (e) {
         if (e.toString().includes(`ERR_PROXY_CONNECTION_FAILED`)) throw { message: "ERR_PROXY_CONNECTION_FAILED" }
         else if (e.toString().includes(`ERR_INTERNET_DISCONNECTED`)) throw { message: "ERR_INTERNET_DISCONNECTED" }
         else if (e instanceof TimeoutError) { }
         else throw e
      }
   }

   // 创建新的Page
   // { "Cmd": "newPage", "Comment": "创建新页面" }
   protected async handleAsyncNewPage(cmd: base.CmdNewPage) {
      this.page = await this.browser.newPage();
   }

   // 获取当前已有的page总数
   // { "Cmd": "pagesCount", "Comment": "获取当前已有的page总数", "Key": "pagesCount" }
   protected async handleAsyncPagesCount(cmd: base.CmdPagesCount) {
      this.pages = await this.browser.pages();
      this.setValue(cmd.Key, String(this.pages.length))
   }

   // 切换 tab（索引值从1开始）
   // { "Cmd": "activePage", "Comment": "切换 tab", "Key": "index" }
   protected handleSyncActivePage(cmd: base.CmdActivePage): void {
      let index = this.getValue(cmd.Key) - 1
      let length = this.pages.length

      // 此处 index 是减去1之后的，也就是 从0 开始的了。
      // 原来的：`if (index <= 0 || index > length) {` 这个判断似乎依然是按index从1为开始下标坐的判断。
      // 所以下面修改为  以0为起始下标做判断:
      if (index < 0 || index >= length) {
         throw { message: `当前 pages 总数为 ${length}，Key 值应在 1 < Key <= ${length} 范围内，当前 Key 值为 ${index + 1}，` }
      }

      this.pages[index].bringToFront()
      this.page = this.pages[index]
   }

   // 选择一个已有的Page或新建一个Page
   // { "Cmd": "alwaysPage", "Comment": "选择一个已有的或新建一个页面" }
   protected async handleAsyncAlwaysPage(cmd: base.CmdAlwaysPage) {
      const ps = await this.browser.pages()
      this.page = ps.length ? ps.shift() : await this.browser.newPage();
   }

   // 刷新当前page
   // { "Cmd": "reloadPage", "Comment": "刷新页面" }
   protected async handleAsyncReloadPage(cmd: base.CmdReloadPage) {
      const opt = cmd.Options || { waitUntil: "networkidle0" }
      try {
         await this.page.reload(opt)
      } catch (e) {
         if (e instanceof TimeoutError) { }
         else throw e
      }
   }

   // 关闭当前page
   // { "Cmd": "closePage", "Comment": "关闭页面" }
   protected async handleAsyncClosePage(cmd: base.CmdClosePage) {
      if (!this.page) return
      try { await this.page.close() } catch (e) { }
   }

   // 关闭浏览器
   // { "Cmd": "shutdown", "Comment": "关闭程序" }
   protected async handleAsyncShutdown(cmd: base.CmdShutdown) {
      if (this.browser) await this.browser.close()
      this.browser = undefined

      // let profileId = this.getValue("profileId")
      // if (!profileId) profileId = this.multiloginProfileId

      // if (profileId == "") throw { message: "profileId is empty" }

      // // {"status":"OK"}
      // // {"status":"ERROR"}
      // const url = process.env.MultiloginURL + "/api/v1/profile/stop?profileId=" + profileId;
      // let rs: any
      // for (let i = 0; i < 6; i++) {
      //    try {
      //       rs = (await axios.default.get(url)).data;
      //    } catch (e) {
      //       rs = { status: "ERROR", value: e.toString() }
      //    }
      //    if (rs.status == "OK") break
      //    this.log("[10秒后重试]Multilogin关闭失败:", profileId, JSON.stringify(rs))
      //    await (async _ => { await new Promise(x => setTimeout(x, 10000)) })()
      // }
      // if (rs.status != "OK") {
      //    this.log("Multilogin关闭失败:", rs.value)
      //    throw { message: rs.value }
      // }
   }

   // 设置Header，此功能Multilogin无效，Options为Header的键值对
   // { "Cmd": "setHeader", "Comment": "设置Header，Multilogin中无效", "Options": { "Accept-Language": "zh-CN,zh;q=0.9" } }
   protected async handleAsyncSetHeader(cmd: base.CmdSetHeader) {
      if (this.isMultilogin) return this.log("Multilogin忽略set header")

      // 请求头有时候也有使用 db 里的数据的需求，这里进行一波处理，使其有效。
      if (cmd.Options) {
         for ( let f in cmd.Options) {
            let hdv = cmd.Options[f];
            cmd.Options[f] = this.getValue(hdv) || hdv;
         }
      }
      await this.page.setExtraHTTPHeaders(cmd.Options);
   }

   // 设置默认超时时间，时间从Key或Value中读取
   // { "Cmd": "setTimeout", "Comment": "设置默认打开页面超时时间，时间来自Key或Value", "Key": "timeout" },
   protected async handleAsyncSetTimeout(cmd: base.CmdSetTimeout) {
      this.timeout = Number(this.getValue(cmd.Key))
      this.page.setDefaultNavigationTimeout(this.timeout);
      this.page.setDefaultTimeout(this.timeout);
   }

   // 键盘事件 根据传入的key值实现不同的键盘事件
   // { "Cmd": "keyboard", "Comment": "键盘事件", "key": "" },
   protected async handleAsyncKeyboard(cmd: base.CmdKeyboard) {
      const key = this.getValue(cmd.Key)
      await this.page.keyboard.press(key, {delay: 100})
   }

   // 屏幕截图
   // { "Cmd": "screenshot", "Comment": "屏幕截图保存到Value中，Options参考puppeteer", "Value": "screenshot1", Options:{}, },
   protected async handleAsyncScreenshot(cmd: base.CmdScreenshot) {
      if (!this.page) return
      const key = cmd.Value || "Screenshot_" + (new Date().toISOString())
      const opt = cmd.Options || { type: "png", encoding: "base64" }
      opt["encoding"] = "base64"
      const prefix = opt["type"] == "jpeg" ? "data:image/jpeg;base64," : "data:image/png;base64,"

      if(cmd.Selector){
        let rect: base.IRect
        if (!cmd.Index) {
           await this.page.$eval(cmd.Selector, (el) => el.scrollIntoView())
           const el = await this.page.$(cmd.Selector)
           rect = await el.boundingBox()
        } else {
           await this.page.$$eval(cmd.Selector, (els, index) => els[index].scrollIntoView(), cmd.Index)
           const els = await this.page.$$(cmd.Selector)
           rect = await els[cmd.Index].boundingBox()
        }
        opt["clip"] = rect
      }
      
      const screenshot = (await this.page.screenshot(opt))
      this.log("截图：", key)
      this.saveScreenshot(key, prefix + screenshot.toString())
   }

   // 屏幕截图
   // { "Cmd": "screenshotBase64", "Comment": "Selector截图保存到Value中，Options参考puppeteer", "Value": "screenshot1", Options:{} },
   protected async handleAsyncScreenshotBase64(cmd: base.CmdScreenshotBase64) {
      if (!this.page) return
      const opt = cmd.Options || { type: "png" }
      opt["encoding"] = "base64"
      const prefix = opt["type"] == "jpeg" ? "data:image/jpeg;base64," : "data:image/png;base64,"

      let rect: base.IRect
      if (!cmd.Index) {
         await this.page.$eval(cmd.Selector, (el) => el.scrollIntoView())
         const el = await this.page.$(cmd.Selector)
         rect = await el.boundingBox()
      } else {
         await this.page.$$eval(cmd.Selector, (els, index) => els[index].scrollIntoView(), cmd.Index)
         const els = await this.page.$$(cmd.Selector)
         rect = await els[cmd.Index].boundingBox()
      }
      opt["clip"] = rect

      const screenshot = (await this.page.screenshot(opt))
      this.setValue(cmd.Value, prefix + screenshot.toString())
   }

   // 下载网页保存成PDF 保存路径为脚本运行目录下的 download
   // { "Cmd": "Pdf", "Comment": "保存pdf", Name: "fileName", options?: {}}
   protected async handleAsyncPdf(cmd: base.CmdPdf){
      const opt = cmd.Options || {};
      const prefix = './download/';
      const value = this.getValue(cmd.Name);
      if(!value) return;

      const fileName = prefix + value;

      opt["path"] = fileName;
      
      await this.page.pdf(opt);
   }

   // 检查屏幕Zoom
   // { "Cmd": "checkZoom", "Comment": "如果页面Zoom被人为改动过，就会抛出异常"}
   protected async handleAsyncCheckZoom(cmd: base.CmdCheckZoom) {
      // Retina: 2, true
      // Not Retina: 1, false
      const isRetina = await this.page.evaluate(_ => { return [window.devicePixelRatio, window.matchMedia("(-webkit-min-device-pixel-ratio: 1.5),(min--moz-device-pixel-ratio: 1.5),(-o-min-device-pixel-ratio: 3/2),(min-resolution: 1.5dppx)").matches] })
      if (isRetina[0] === 2 && isRetina[1] === true) { }
      else if (isRetina[0] === 1 && isRetina[1] === false) { }
      else throw { message: "页面ZOOM不是100%" }
   }

   // 获取浏览器地址
   // { "Cmd": "getURL", "Comment": "获取浏览器地址", Key:"nowURL" }
   protected async handleAsyncGetURL(cmd: base.CmdGetURL) {
      this.setValue(cmd.Key, this.page.url())
   }

   // ========== 用户输入 ==========

   // 鼠标移动到元素上，Index用于多元素的索引
   // { "Cmd": "hover", "Comment": "鼠标hover", "Selector": "#su", "Index":"用于多个元素的索引" }
   protected async handleAsyncHover(cmd: base.CmdHover) {
      await this.handleAsyncWaitForSelector(<base.CmdWaitForSelector>{ Selector: cmd.Selector })
      let rect: base.IRect

      // 模拟滚屏(垂直方向)
      const windowHeight = await this.page.evaluate(_ => { return window.innerHeight })
      let maxWhile = 50;
      while (maxWhile > 0) {
         maxWhile--
         rect = await this.boundingBox(cmd);

         // 如果目标dom高度小于 视窗高度，要求将此dom完全展示出来，才算是滚动到了视野中。
         let ajuHeight = rect.height > windowHeight ? (windowHeight/2) : rect.height;

         // 判断内容是否在视野中
         if (rect.y < (windowHeight - ajuHeight) && rect.y >= 0) break


         let moveY = (rect.y > (windowHeight - ajuHeight) ? windowHeight - ajuHeight : -windowHeight)
         moveY = this.random(moveY / 2, moveY);

         // 下面是通过在页面里执行JavaScript实现页面滚动，这是旧的滚动方式。
         // const scrollY = await this.page.evaluate(_ => { return window.scrollY })
         // const moveCount = this.random(5, 10)
         // let moveY = (rect.y > windowHeight ? windowHeight : -windowHeight)
         // moveY = this.random(moveY / 2, moveY)
         // for (let i = 0; i < moveCount; i++) {
         //    await this.page.evaluate(y => { window.scrollTo(0, y) }, scrollY + (moveY / moveCount * i))
         // }

         // 这是新的滚动方式。使用仿真滚动。
         if (await this.isPC()) {
            await this.mouseScroll(moveY, cmd.ScrollSelector || "body", this.getScrollSelectorIndex(cmd));
         } else {
            await this.touchScroll(moveY);
         }

         await this.handleAsyncWait(<base.CmdWait>{ Value: this.random(this.userInputWaitMin, this.userInputWaitMax).toString() })
      }

      if (!cmd.Index) {
         //@ts-ignore
         await this.page.$eval(cmd.Selector, (el) => el.scrollIntoViewIfNeeded())
         const el = await this.page.$(cmd.Selector)
         rect = await el.boundingBox()
      } else {
         const index = this.getIndex(cmd)
         //@ts-ignore
         await this.page.$$eval(cmd.Selector, (els, index) => els[index].scrollIntoViewIfNeeded(), index)
         const els = await this.page.$$(cmd.Selector)
         rect = await els[index].boundingBox()
      }
      let point;
      if (cmd.x && cmd.y) {
         // 如果指定了要把鼠标移动到元素里的某个位置，则使用此位置。此需求在点击canvas里面绘制的按钮时有用。
         point = {
            x: rect.x + this.syncEval(<base.CmdSyncEval>{ SyncEval: cmd.x }),
            y: rect.y + this.syncEval(<base.CmdSyncEval>{ SyncEval: cmd.y })
         };
      } else {
         point = this.calcElementPoint(rect);
      }
      /*if (await this.isPC())*/ await this.asyncMouseMove(point.x, point.y)
      await this.handleAsyncWait(<base.CmdWait>{ Value: this.random(this.userInputWaitMin, this.userInputWaitMax).toString() })
   }

   // 滚动命令
   // { "Cmd": "var", "Comment": "定义滚动距离", "Key": "distance" SyncEval: "500" }
   // { "Cmd": "scroll", "Comment": "滚动", Key: "distance"  "ScrollSelector": "body", "Index": "0"}
   protected async handleAsyncScroll(cmd: base.CmdScroll) {
      let distance = this.getValue(cmd.Key);

      if (await this.isPC()) {
         await this.mouseScroll(distance, cmd.ScrollSelector || "body", cmd.ScrollSelectorIndex);
      } else {
         await this.touchScroll(distance)
      }
   }

   // 鼠标移动到弹出层元素上，Index用于多元素的索引
   // { "Cmd": "hover", "Comment": "鼠标hover", "Selector": "#su", "Index":"用于多个元素的索引", "PopupSelect": "要滚动的父元素" }
   protected async handleAsyncPopupHover(cmd: base.CmdPopupHover) {
       await this.handleAsyncWaitForSelector(<base.CmdWaitForSelector>{ Selector: cmd.PopupSelect })
       let rect: base.IRect
       const popupHeight = await this.page.evaluate(m => { return document.querySelector(m.PopupSelect).clientHeight }, cmd)
   
       // 模拟滚屏
       let maxWhile = 50;
       while (maxWhile > 0) {
       maxWhile--
        if (!cmd.Index) {
            rect = await this.page.evaluate(m => { 
                let el = document.querySelector(m.Selector);

                return {
                  x: el.offsetLeft,
                  y: el.offsetTop,
                  width: el.offsetWidth,
                  height: el.offsetHeight
                }
            }, cmd)

        } else {
            const index = this.getIndex(cmd)

            rect = await this.page.evaluate((m, index) => { 
                let el = document.querySelectorAll(m.Selector)[index];

                return {
                  x: el.offsetLeft,
                  y: el.offsetTop,
                  width: el.offsetWidth,
                  height: el.offsetHeight
                }
            }, cmd, index)
        }

        // 判断内容是否在视野中
        const scrollY = await this.page.evaluate(m => { return document.querySelector(m.PopupSelect).scrollTop }, cmd)
        if ((rect.y - popupHeight + rect.height) < scrollY && rect.y >= 0) break

        const moveCount = this.random(5, 10)
        let moveY = (rect.y > popupHeight ? popupHeight : -popupHeight)
        moveY = this.random(moveY / 2, moveY)
        for (let i = 0; i < moveCount; i++) {
            let Sy = scrollY + (moveY / moveCount * i);
            await this.page.evaluate((y,m) => { document.querySelector(m.PopupSelect).scrollTo(0, y) }, Sy, cmd)
        }

        await this.handleAsyncWait(<base.CmdWait>{ Value: this.random(this.userInputWaitMin, this.userInputWaitMax).toString() })
       }
   
       if (!cmd.Index) {
       //@ts-ignore
       await this.page.$eval(cmd.Selector, (el) => el.scrollIntoViewIfNeeded())
       const el = await this.page.$(cmd.Selector)
       rect = await el.boundingBox()
       } else {
       const index = this.getIndex(cmd)
       //@ts-ignore
       await this.page.$$eval(cmd.Selector, (els, index) => els[index].scrollIntoViewIfNeeded(), index)
       const els = await this.page.$$(cmd.Selector)
       rect = await els[index].boundingBox()
       }
       const point = this.calcElementPoint(rect)
       if (this.isPC()) await this.asyncMouseMove(point.x, point.y)
       await this.handleAsyncWait(<base.CmdWait>{ Value: this.random(this.userInputWaitMin, this.userInputWaitMax).toString() })
   }

   // 鼠标移动到frame元素上，Index用于多元素的索引
   // { "Cmd": "FrameHover", "Comment": "鼠标hover", "Selector": "#su", "Index":"用于多个元素的索引", "FrameName":"appIframe"}
   protected async handleAsyncFrameHover(cmd: base.CmdFrameHover) {
      const frame = this.page.frames().find(frame => frame.name() === cmd.FrameName);
      await frame.waitForSelector(cmd.Selector)

      let rect: base.IRect

      // 模拟滚屏
      const windowHeight = await frame.evaluate(_ => { return window.innerHeight })
      let maxWhile = 50;
      while (maxWhile > 0) {
         maxWhile--
         if (!cmd.Index) {
            const el = await frame.$(cmd.Selector)
            rect = await el.boundingBox()
         } else {
            const index = this.getIndex(cmd)
            const els = await frame.$$(cmd.Selector)
            rect = await els[index].boundingBox()
         }
         // 判断内容是否在视野中
         if (rect.y < windowHeight && rect.y >= 0) break
         const scrollY = await frame.evaluate(_ => { return window.scrollY })
         const moveCount = this.random(5, 10)
         let moveY = (rect.y > windowHeight ? windowHeight : -windowHeight)
         moveY = this.random(moveY / 2, moveY)
         for (let i = 0; i < moveCount; i++) {
            await frame.evaluate(y => { window.scrollTo(0, y) }, scrollY + (moveY / moveCount * i))
         }
         await this.handleAsyncWait(<base.CmdWait>{ Value: this.random(this.userInputWaitMin, this.userInputWaitMax).toString() })
      }

      if (!cmd.Index) {
         //@ts-ignore
         await frame.$eval(cmd.Selector, (el) => el.scrollIntoViewIfNeeded())
         const el = await frame.$(cmd.Selector)
         rect = await el.boundingBox()
      } else {
         const index = this.getIndex(cmd)
         //@ts-ignore
         await frame.$$eval(cmd.Selector, (els, index) => els[index].scrollIntoViewIfNeeded(), index)
         const els = await frame.$$(cmd.Selector)
         rect = await els[index].boundingBox()
      }
      const point = this.calcElementPoint(rect)
      if (this.isPC()) await this.asyncMouseMove(point.x, point.y)
      await this.handleAsyncWait(<base.CmdWait>{ Value: this.random(this.userInputWaitMin, this.userInputWaitMax).toString() })
   }

    // 鼠标移动到弹出层元素上，Index用于多元素的索引
    // { "Cmd": "hover", "Comment": "鼠标hover", "Selector": "#su", "Index":"用于多个元素的索引", "PopupSelect": "要滚动的父元素"}
    protected async handleAsyncFramePopupHover(cmd: base.CmdFramePopupHover) {
        const frame = this.page.frames().find(frame => frame.name() === cmd.FrameName);
        await frame.waitForSelector(cmd.PopupSelect)

        let rect: base.IRect
        const popupHeight = await frame.evaluate(m => { return document.querySelector(m.PopupSelect).clientHeight }, cmd)
   
        // 模拟滚屏
        let maxWhile = 50;
        while (maxWhile > 0) {
            maxWhile--
            if (!cmd.Index) {
                rect = await frame.evaluate(m => { 
                    let el = document.querySelector(m.Selector);

                    return {
                      x: el.offsetLeft,
                      y: el.offsetTop,
                      width: el.offsetWidth,
                      height: el.offsetHeight
                    }
                }, cmd)
            } else {
                const index = this.getIndex(cmd)

                rect = await frame.evaluate((m, index) => { 
                    let el = document.querySelectorAll(m.Selector)[index];

                    return {
                      x: el.offsetLeft,
                      y: el.offsetTop,
                      width: el.offsetWidth,
                      height: el.offsetHeight
                    }
                }, cmd, index)
            }
        
            // 判断内容是否在视野中
            const scrollY = await frame.evaluate(m => { return document.querySelector(m.PopupSelect).scrollTop }, cmd)
            if ((rect.y - popupHeight + rect.height) < scrollY && rect.y >= 0) break
        
            const moveCount = this.random(5, 10)
            let moveY = (rect.y > popupHeight ? popupHeight : -popupHeight)
            moveY = this.random(moveY / 2, moveY)
            for (let i = 0; i < moveCount; i++) {
                let Sy = scrollY + (moveY / moveCount * i);
                await frame.evaluate((y,m) => { document.querySelector(m.PopupSelect).scrollTo(0, y) }, Sy, cmd)
            }
        
            await this.handleAsyncWait(<base.CmdWait>{ Value: this.random(this.userInputWaitMin, this.userInputWaitMax).toString() })
        }
       
        if (!cmd.Index) {
           //@ts-ignore
           await frame.$eval(cmd.Selector, (el) => el.scrollIntoViewIfNeeded())
           const el = await frame.$(cmd.Selector)
           rect = await el.boundingBox()
        } else {
           const index = this.getIndex(cmd)
           //@ts-ignore
           await frame.$$eval(cmd.Selector, (els, index) => els[index].scrollIntoViewIfNeeded(), index)
           const els = await frame.$$(cmd.Selector)
           rect = await els[index].boundingBox()
        }
        const point = this.calcElementPoint(rect)
        if (this.isPC()) await this.asyncMouseMove(point.x, point.y)
        await this.handleAsyncWait(<base.CmdWait>{ Value: this.random(this.userInputWaitMin, this.userInputWaitMax).toString() })
   }

   // 单击元素，Index用于多元素的索引（针对手机端）
   // { "Cmd": "tap", "Comment": "点击", "Selector": "#su", "Index":"用于多个元素的索引"}
   protected async handleAsyncTap(cmd: base.CmdTap) {
      await this.handleAsyncHover(<base.CmdHover>{ Selector: cmd.Selector, Index: cmd.Index })
      await this.page.touchscreen.tap(this.mouseX, this.mouseY)
      await this.handleAsyncWait(<base.CmdWait>{ Value: this.random(this.userInputWaitMin, this.userInputWaitMax).toString() })
   }

   // 单击元素，Index用于多元素的索引
   // 内置先移动到元素上再点击
   // { "Cmd": "click", "Comment": "点击搜索", "Selector": "#su", "Index":"用于多个元素的索引", "WaitNav":false }
   protected async handleAsyncClick(cmd: base.CmdClick) {
      if(cmd.PopupSelect){
        await this.handleAsyncPopupHover(<base.CmdPopupHover>{ Selector: cmd.Selector, Index: cmd.Index, PopupSelect: cmd.PopupSelect})
      }else{
        await this.handleAsyncHover(<base.CmdHover>{ Selector: cmd.Selector, Index: cmd.Index, x: cmd.x, y: cmd.y, ScrollSelector: cmd.ScrollSelector, ScrollSelectorIndex: cmd.ScrollSelectorIndex})
      }

      const clickCount = (cmd.Options && cmd.Options["clickCount"]) || 1
      // 重新算个坐标
      // let rect: base.IRect
      // if (!cmd.Index) {
      //    const el = await this.page.$(cmd.Selector)
      //    rect = await el.boundingBox()
      // } else {
      //    const els = await this.page.$$(cmd.Selector)
      //    rect = await els[this.getIndex(cmd)].boundingBox()
      // }
      // const point = this.calcElementPoint(rect)
      // var ts,te;document.addEventListener("mousedown",function(){ts=new Date()});document.addEventListener("mouseup",function(){te=new Date();console.log(te-ts)})
      if (cmd.WaitNav === true) {
         // const stopTime = this.random(1000, 3000)
         // this.log("stop:", stopTime)
         // await this.page.evaluate(() => window.stop());
         // await this.handleAsyncWait({ Cmd: "", Value: stopTime.toString() })
         await Promise.all([
            this.handleAsyncWaitForNavigation(<base.CmdWaitForNavigation>{}),
            this.asyncMouseClick(this.mouseX, this.mouseY, { delay: this.random(50, 100) }),
         ]);
      } else {
         await this.asyncMouseClick(this.mouseX, this.mouseY, { clickCount: clickCount, delay: this.random(50, 100) })
      }
      await this.handleAsyncWait(<base.CmdWait>{ Value: this.random(this.userInputWaitMin, this.userInputWaitMax).toString() })
   }

   // 单击frame的元素，Index用于多元素的索引
   // 内置先移动到元素上再点击
   // { "Cmd": "FrameClick", "Comment": "点击搜索", "Selector": "#su", "Index":"用于多个元素的索引", "WaitNav":false, "FrameName":"appIframe"}
   protected async handleAsyncFrameClick(cmd: base.CmdFrameClick) {
      if(cmd.PopupSelect){
        await this.handleAsyncFramePopupHover(<base.CmdFramePopupHover>{ Selector: cmd.Selector, Index: cmd.Index, FrameName: cmd.FrameName, PopupSelect: cmd.PopupSelect })
      }else{
        await this.handleAsyncFrameHover(<base.CmdFrameHover>{ Selector: cmd.Selector, Index: cmd.Index, FrameName: cmd.FrameName })
      }

      const clickCount = (cmd.Options && cmd.Options["clickCount"]) || 1
      const frame = this.page.frames().find(frame => frame.name() === cmd.FrameName);

      if (cmd.WaitNav === true) {
        await Promise.all([
            frame.waitForNavigation(),
            this.asyncMouseClick(this.mouseX, this.mouseY, { delay: this.random(50, 100) }),
        ]);
      } else {
         await this.asyncMouseClick(this.mouseX, this.mouseY, { clickCount: clickCount, delay: this.random(50, 100) })
      }

      await this.handleAsyncWait(<base.CmdWait>{ Value: this.random(this.userInputWaitMin, this.userInputWaitMax).toString() })
   }

   // 在iframe中执行方法
   // { "Cmd": "FrameEval", "Comment": "执行方法", "Selector": "#su", "Index":"用于多个元素的索引", "FrameName":"appIframe", "Value": "el.xxx"}
   protected async handleAsyncFrameEval(cmd: base.CmdFrameEval) {
      let str = cmd.Value
      if (str === undefined || typeof str != "string") return

      str = str.indexOf("return") < 0 ? "return " + str : str
      const o = Object.assign(<Object>{}, this.db)
      const f = Function.apply({}, ['el', ...Object.keys(o), str]);
      let frame;
      let fs = this.page.frames();
      if (fs && cmd.Index) {
         const index = this.getValue(cmd.Index)
         frame = fs[index];
      } else if (fs) {
         frame = fs.find(frame => {
            return frame.name() === cmd.FrameName;
         });
      }

      const result = await frame.$eval(cmd.Selector, f, ...Object.values(o))
      if (typeof result === "object") {
         for (let i in result) this.setValue(i, result[i])
      }
   }

   // 在IFrame中找到输入框并输入数据，数据来源于Key或Value，Index用于多元素的索引
   // 内置先移动到元素上双击全选内容，再输入内容
   // { "Cmd": "type", "Comment": "输入从DB读取的Key，或直接输入Value，默认延时500毫秒", "Selector": "#kw", "Key": "keyword" }
   protected async handleAsyncFrameType(cmd: base.CmdFrameType) {
      const frame = this.page.frames().find(frame => frame.name() === cmd.FrameName);
      await frame.waitForSelector(cmd.Selector)
      await this.handleAsyncFrameClick(<base.CmdFrameClick>{ Selector: cmd.Selector, Index: cmd.Index, FrameName: cmd.FrameName, Options: <Object>{ clickCount: 3 } })
      await this.handleAsyncWait(<base.CmdWait>{ Value: this.random(this.userInputWaitMin, this.userInputWaitMax).toString() })
     
      const content = this.getValue(cmd.Key)
      for (let i = 0; i < content.length; i++) {
          await frame.type(cmd.Selector, content[i])
          await this.handleAsyncWait(<base.CmdWait>{ Value: this.random(this.userInputDelayMin, this.userInputDelayMax).toString() })
      }
      await this.handleAsyncWait(<base.CmdWait>{ Value: this.random(this.userInputWaitMin, this.userInputWaitMax).toString() })
    }

   // 请求拦截
   // { "Cmd": "RequestIntercept", "Comment": "拦截请求", "SyncEval": "_interceptedRequest方法的参数"}
   protected async handleAsyncRequestIntercept(cmd: base.CmdRequestIntercept) {
      await this.page.setRequestInterception(true);
      this.page.on('request', interceptedRequest => {
         this.syncEval(cmd, {_interceptedRequest: interceptedRequest})
      });
   }

   // 双击元素，Index用于多元素的索引
   // 内置先移动到元素上再双击
   // { "Cmd": "dbClick", "Comment": "双击点击", "Selector": "#kw", "Index":"用于多个元素的索引", "WaitNav":false }
   protected async handleAsyncDbClick(cmd: base.CmdDBClick) {
      await this.handleAsyncClick(<base.CmdClick>{ Selector: cmd.Selector, Index: cmd.Index, Options: <Object>{ clickCount: 2 }, WaitNav: cmd.WaitNav })
   }

   // 三击元素，Index用于多元素的索引
   // 内置先移动到元素上再双击
   // { "Cmd": "threeClick", "Comment": "三击点击", "Selector": "#kw", "Index":"用于多个元素的索引", "WaitNav":false }
   protected async handleAsyncThreeClick(cmd: base.CmdThreeClick) {

      await this.handleAsyncClick(<base.CmdClick>{ Selector: cmd.Selector, Index: cmd.Index, Options: <Object>{ clickCount: 3 }, WaitNav: cmd.WaitNav })
   }

   // 在输入框中输入数据，数据来源于Key或Value，Index用于多元素的索引
   // 内置先移动到元素上双击全选内容，再输入内容
   // { "Cmd": "type", "Comment": "输入从DB读取的Key，或直接输入Value，默认延时500毫秒", "Selector": "#kw", "Key": "keyword" }
   protected async handleAsyncType(cmd: base.CmdType) {
      await this.handleAsyncWaitForSelector(<base.CmdWaitForSelector>{ Selector: cmd.Selector })
      await this.handleAsyncThreeClick(<base.CmdThreeClick>{ Selector: cmd.Selector, Index: cmd.Index })
      await this.handleAsyncWait(<base.CmdWait>{ Value: this.random(this.userInputWaitMin, this.userInputWaitMax).toString() })

      const content = this.getValue(cmd.Key)
      for (let i = 0; i < content.length; i++) {
         await this.page.keyboard.type(content[i])
         await this.handleAsyncWait(<base.CmdWait>{ Value: this.random(this.userInputDelayMin, this.userInputDelayMax).toString() })
      }
      await this.handleAsyncWait(<base.CmdWait>{ Value: this.random(this.userInputWaitMin, this.userInputWaitMax).toString() })
   }

   // 下拉框选择
   // { "Cmd": "select", "Comment": "下拉框选择Key或Value", "Selector": "#select1", "Value": "option1" },
   protected async handleAsyncSelect(cmd: base.CmdSelect) {
      const content = this.getValue(cmd.Key)
      await this.handleAsyncWaitForSelector(<base.CmdWaitForSelector>{ Selector: cmd.Selector })
      await this.page.select(cmd.Selector, content)
      await this.handleAsyncWait(<base.CmdWait>{ Value: this.random(this.userInputWaitMin, this.userInputWaitMax).toString() })
   }

   /**
    *  下拉框选择，允许基于下标、label选择。
    *  eg:
    *
    *  // 选择 显示值为USA那个option
    *  { "Cmd": base.CmdTypes.SelectByLabel, "Comment": "下拉框选择", "Selector": "#select1", "Label": "'USA'" },
    *
    *  // 选择 第三个option, Number作为下标从1开始。
    *  { "Cmd": base.CmdTypes.SelectByLabel, "Comment": "下拉框选择", "Selector": "#select1", "Number": "3" },
    * @param cmd
    * @protected
    */
   protected async handleAsyncSelectByLabel(cmd: base.CmdSelectByLabel): Promise<any> {
      let LABEL_MODE = "1";
      let NUMBER_MODE = "2";
      let labels:any[];
      let numbers:any[];

      let mode;
      if (cmd.Label) {
         labels = [this.syncEval({SyncEval: cmd.Label})];
         mode = LABEL_MODE;
      } else if (cmd.Number) {
         numbers = [parseInt(this.syncEval({SyncEval: cmd.Number}))];
         mode = NUMBER_MODE;
      } else {
         throw new Error("命令" + cmd.Cmd + "必须提供 Label 或 Number 之一。");
      }

      let element:ElementHandle;

      if (!cmd.Index) {
         element = await this.page.$(cmd.Selector);
      } else {
         element = (await this.page.$$(cmd.Selector))[this.getIndex(cmd)];
      }

      if (!element) {
         throw new Error("选择器" + cmd.Selector + "指定的元素不存在。");
      }

      await element.executionContext().evaluate(function (
          element:HTMLSelectElement,
          mode, LABEL_MODE, NUMBER_MODE,
          labels, numbers
      ) {
         if (element.nodeName.toLowerCase() !== 'select')
            throw new Error('Element is not a <select> element.');

         const options = Array.from(element.options);

         element.value = undefined;

         for (const option of options) {
            if (mode === LABEL_MODE) {
               option.selected = labels.includes(option.innerText);
            } else if (mode === NUMBER_MODE) {
               option.selected = numbers.includes(option.index+1);
            }
            if (option.selected && !element.multiple) break;
         }
         element.dispatchEvent(new Event('input', { bubbles: true }));
         element.dispatchEvent(new Event('change', { bubbles: true }));
         return options
             .filter((option) => option.selected)
             .map((option) => option.value);
      }, element, mode, LABEL_MODE, NUMBER_MODE, labels, numbers);


   }

   // 在页面执行脚本
   // { "Cmd": "pageEval", "Comment": "在页面执行脚本", "Value": "{host:location.host}" },
   protected async handleAsyncPageEval(cmd: base.CmdPageEval) {
      let str = cmd.Value
      if (str === undefined || typeof str != "string") return

      str = str.indexOf("return") < 0 ? "return " + str : str
      const o = Object.assign(<Object>{}, this.db)
      const f = Function.apply({}, [...Object.keys(o), str]);

      const result = await this.page.evaluate(f, ...Object.values(o))
      if (typeof result === "object") {
         for (let i in result) this.setValue(i, result[i])
      }
   }

   // ========== 其他功能 ==========

   /**
    * 将指定区域进行滚动， distance表示向上滚动多长，可以负，负值就表示向下滚动。
    * 此函数模拟鼠标滚轮事件进行滚动。
    *
    * @param distance 滚动多长。
    * @param selector 指定某个区域进行滚动 默认body
    * @param index 选择器多个元素时的指定下标
    */
   async mouseScroll( distance, selector="body", index?:string) {

      if (!this.page) {
         return;
      }

      let client:puppeteer.CDPSession = await this.page.target().createCDPSession();

      if (distance === 0) {return;}

      // 先把鼠标移动到指定区域。这里有个特例，如果这个指定的区域本身就是body，则不用进行hover，
      if (selector === "body") {
         const el = await this.page.$("body");
         const rect = await el.boundingBox()
         const point = this.calcElementPoint(rect)
         if (await this.isPC()) await this.asyncMouseMove(point.x, point.y)
      } else {
         await this.handleAsyncHover({
            Cmd: base.CmdTypes.Hover,
            Selector: selector,
            Comment: "滚动前将鼠标移动到对应元素区域",
            Index: index
         });
      }

      await this.sleep(200);
      let step = 20; // 模拟鼠标每一小格滚动的长度。默认20

      // 然后进行滚动。
      const count = Math.abs(distance) / step;
      for (let i = 0; i <= count; i++) {

         // client 是控制google浏览器的客户端对象。通过发送 鼠标滚轮(mouseWheel)实现仿真滚动。
         await client.send('Input.dispatchMouseEvent', {
            type: 'mouseWheel',
            x: this.mouseX || 0,
            y: this.mouseY || 0, // 鼠标在屏幕上的坐标
            deltaX: 0,
            deltaY: (distance < 0 ? -1 : 1) * step // 鼠标滚轮一个小格要滚动的距离
         })
         await this.sleep(20);
      }

      // 滚动后需要短暂停留，以消除惯性
      await this.sleep(500);

   }

   /**
    * 在屏幕进行触摸滚动distance 的距离，可以负值，负值则向下滚动。
    * @param distance
    */
   async touchScroll(distance) {
      if (!this.page) return;

      let viewport = await this.page.evaluate(() => {
         return {width: window.innerWidth, height: window.innerHeight}
      });
      if (!viewport) return;
      if (distance === 0) return;

      let y;

      // 向上滚动
      if (distance > 0) {
         //
         // 手指从底部向顶部方向滚动。底部开始位置从屏幕 1/10 ~ 5/10 区域之间随机一个点。
         // |————————————————————|
         // |                    |
         // |                    |
         // |                    |
         // |                    |
         // |          ↑         |
         // |  |———————|——————|  |
         // |  |              |  |
         // |  |start in here |  |
         // |  |              |  |
         // |  |——————————————|  |
         // | ———————————————————|
         //
         y = this.random(viewport.height * 0.5, viewport.height * 0.9);
      } else if (distance < 0) {
         //
         // 手指从顶部向低部方向滚动。考虑到人手更多是偏向下方的，所以此时，让结束点保证在 1/10 ~ 5/10 区域内。
         // |————————————————————|
         // |                    |
         // |                    |
         // |                    |
         // |                    |
         // |          |         |
         // |  |———————↓——————|  |
         // |  |              |  |
         // |  |  end in here |  |
         // |  |              |  |
         // |  |——————————————|  |
         // | ———————————————————|
         //
         let endY = this.random(viewport.height * 0.5, viewport.height * 0.9);
         y = endY - Math.abs(distance);
      }

      let { x: startX, y: startY } = {x: this.random(30, viewport.width - 30), y};

      // 手指滚动起始点和结束点不一定很坐标完全相同，所以这里做一个变化。
      let flag = Math.random() >= 0.5 ? 1 : -1;
      let flagValue = this.random(40, 100);
      let resultX = startX + (flagValue * flag);
      if (resultX < 10) {
         // 在屏幕边缘了，这种情况可很少有。
         resultX = 10;
      }

      let pointStart = {x: startX, y: startY};
      let pointEnd = {x: resultX, y: startY - distance};

      await this.touchScroller(pointStart, pointEnd);
   }

   /**
    * 在屏幕进行横向(水平方向)触摸滚动, distance 为正值表示向左滚动，为负值表示向右滚动。
    * 向右：手指先放在较左边，然后向右边划过一段距离。屏幕内容向右滚动，原本在屏幕左侧的内容被滚动到屏幕内。
    * 向左：手指先放在较右边，然后想左边划过一段距离。屏幕内容向左滚动，原本在屏幕右侧的内容被滚动到屏幕内。
    * @param distance 滚动距离。
    * @param selector 在某个区域内滚动，如果没有指定此值，则不会滚动，因为横向滚动必须只在某个支持滚动的dom内进行。
    * @param index 搭配选择器使用的。
    */
   async touchScrollHorizontal(distance:number, selector, index?:string) {
      if (!selector) return;
      if (distance === 0) return;

      // 先把滚动区域上下滚动到屏幕内。
      await this.handleAsyncHover({
         Cmd: base.CmdTypes.Hover,
         Selector: selector,
         Comment: "将应元素区域滚动到屏幕内",
         Index: index
      });

      // 得到指定滚动区域的坐标和大小。
      let rect:puppeteer.BoundingBox = await this.boundingBox({Selector: selector, Index: index});

      // 修正滚动距离，有可能传入的滚动距离大于了元素本身的(长边的)长度。
      // 此时应保证滑动距离需要小于元素本身长度。
      if (Math.abs(distance) >= rect.width) {
         let newDistance = rect.width * (this.random(80, 90) / 100);
         if (distance < 0) distance = -newDistance;
      }

      // 根据滚动方向计算坐标
      let spaceBoth = rect.width - Math.abs(distance);
      let space = spaceBoth / 2;

      // 左边的坐标
      let pointStart = this.calcElementPoint({x:rect.x, y:rect.y, width: space, height: rect.height});

      // 右边的坐标
      let pointEnd = this.calcElementPoint({x: pointStart.x + Math.abs(distance), y: rect.y, width: space, height: rect.height});

      if (distance < 0) {
         // 向右边滚动
         await this.touchScroller(pointStart, pointEnd);
      } else {
         // 向左边滚动
         await this.touchScroller(pointEnd, pointStart);
      }

   }

   /**
    * 触屏滚动实现方法。
    * @param pointStart
    * @param pointEnd
    */
   async touchScroller(pointStart:base.IPoint, pointEnd:base.IPoint) {
      let steps = 30;
      let {x: startX, y: startY} = pointStart;
      let {x: endX, y: endY} = pointEnd;

      let client:puppeteer.CDPSession = await this.page.target().createCDPSession();
      await client.send('Input.dispatchTouchEvent', {
         type: 'touchStart',
         touchPoints: [{ x: Math.round(startX), y: Math.round(startY) }]
      });

      const stepX = (endX - startX) / steps;
      const stepY = (endY - startY) / steps;

      for (let i = 1; i <= steps; i++) {
         let po = {
            x: Math.round(startX += stepX),
            y: Math.round(startY += stepY)
         };

         await client.send('Input.dispatchTouchEvent', {
            type: 'touchMove',
            touchPoints: [po]
         });

         await this.sleep(8);
      }

      await this.sleep(150); // 触点释放前的停留时间，控制惯性

      await client.send('Input.dispatchTouchEvent', {
         type: 'touchEnd',
         touchPoints: [/*{x: endX, y: endY}*/]
      });

      // 滑动后需要短暂停留，以消除惯性
      await this.sleep(800);
   }
   /**
    * 水平滚动。
    *
    * 在 ScrollSelector，ScrollIndex 这个dom里进行水平滚动。
    * 直到 Selector，Index 这个元素出现在视野范围内。
    *
    * { "Cmd": "scrollHorizontal", "Comment": "水平滚动", Key: "distance"  "ScrollSelector": "#ad-list", "ScrollIndex": "0", Selector: "", Index:""}
    *
    * @param cmd
    * @protected
    */
   protected async handleAsyncScrollHorizontal (cmd: base.CmdScrollHorizontal) {

      // 保证滚动区域的位置显示到屏幕里。
      await this.handleAsyncHover({
         Cmd: base.CmdTypes.Hover,
         Selector: cmd.ScrollSelector,
         Index: cmd.ScrollSelectorIndex,
         Comment: "scrollintoscreen"
      });

      // 先取到滚动区域的大小。
      let scrollRect = await this.boundingBox({Selector: cmd.ScrollSelector, Index: cmd.ScrollSelectorIndex});

      // 开始横向滚动。
      while (true) {

         // 先取到目标dom的位置。
         let rect = await this.boundingBox(cmd);

         // 判断位置是否到达滚动区域内了。
         let ajuWidth = (rect.width < scrollRect.width ? rect.width : scrollRect.width) / 2;

         if (rect.x >= scrollRect.x && rect.x <= scrollRect.x + (scrollRect.width - ajuWidth)) {
            // 在区域内了。
            break;
         }

         // 计算横向滚动距离
         let moveX = (rect.x > (scrollRect.width - ajuWidth) ? scrollRect.width - ajuWidth : -scrollRect.width)
         moveX = this.random(moveX / 2, moveX);

         // 进行滚动。
         await this.touchScrollHorizontal(moveX, cmd.ScrollSelector, cmd.ScrollSelectorIndex);

         // 等待一小会儿。
         await this.handleAsyncWait(<base.CmdWait>{ Value: this.random(this.userInputWaitMin, this.userInputWaitMax).toString() })
      }
   }

   /**
    * 获取页面内cookies
    * @param cmd
    * @protected
    */
   protected async handleAsyncGetCookies (cmd: base.CmdGetCookies) {
      let cookies = await this.page.cookies(...cmd.urls);
      this.setValue(
          cmd.Key,
          JSON.stringify(
              (cookies||[]).map(v => ({name: v.name, value: v.value}))
          )
      );
   }

   // 过滤网络请求，过滤表达式来源于Key
   // { "Cmd": "filterRequest", "Comment": "过滤请求，变量_url", "SyncEval": "/\.png$/.test(_url) || /\.jpg$/.test(_url)" }
   protected async handleAsyncFilterRequest(cmd: base.CmdFilterRequest) {
      await this.page.setRequestInterception(true);
      this.page.on('request', interceptedRequest => {
         if (this.syncEval(cmd, { _url: interceptedRequest.url() })) {
            interceptedRequest.abort();
         }
         else interceptedRequest.continue();
      });
   }

   // 监听 dialog 弹窗事件，控制点击确定/取消
   // { "Cmd": "dialogClick", "Comment": "点击下载弹窗的确定按钮", "Key": "pressValue" }
   protected async handleAsyncDialogClick(cmd: base.CmdDialogClick) {
      let pressValue = this.getValue(cmd.Key).toString()
      if (!this.dialogValue) {
         this.dialogValue = pressValue
         this.page.on('dialog', dialog => {
            if (this.dialogValue === 'true') {
               dialog.accept()
            } else if (this.dialogValue === 'false') {
               dialog.dismiss()
            }
         });
      } else this.dialogValue = pressValue
   }

   // 等待页面加载完成，一般不需要主动调用
   // { "Cmd": "waitForNavigation", "Comment": "等待页面加载完成，一般不需要主动调用" }
   protected async handleAsyncWaitForNavigation(cmd: base.CmdWaitForNavigation) {
      const opt = cmd.Options || {}
      if (!opt.waitUntil) {opt.waitUntil = "domcontentloaded";}
      if (!cmd.Json) cmd.Json = [];
      try {
         await Promise.all([
            this.page.waitForNavigation(opt),
            this.do(cmd.Json)
         ]);
      } catch (e) {
         if (e.toString().includes(`ERR_PROXY_CONNECTION_FAILED`)) throw { message: "ERR_PROXY_CONNECTION_FAILED" }
         else if (e.toString().includes(`ERR_INTERNET_DISCONNECTED`)) throw { message: "ERR_INTERNET_DISCONNECTED" }
         else if (e instanceof TimeoutError) { }
         else throw e
      }
   }

   // 主动时间等待，时间来自Key或Value
   // { "Cmd": "wait", "Comment": "等待", "Value": "5000" }
   protected async handleAsyncWait(cmd: base.CmdWait) {
      const t = Number(cmd.Value)
      // await this.page.waitFor(t)
      await (async _ => { await new Promise(x => setTimeout(x, t)) })()
   }

   // 主动随机等待，随机数最小最大在Options中设置
   // { "Cmd": "waitKey", "Comment": "随机等待", "Key": "waitTime" }
   protected async handleAsyncWaitKey(cmd: base.CmdWaitForKey) {
      await this.handleAsyncWait(<base.CmdWait>{ Value: this.getValue(cmd.Key) })
   }

   // 获取元素textContent文本内容，保存到Key字段中
   // { "Cmd": "textContent", "Comment": "获取textContent，保存到DB的Key中", "Selector": ".op-stockdynamic-moretab-cur-num", "Key": "text", "Index":"用于多个元素的索引" }
   protected async handleAsyncTextContent(cmd: base.CmdTextContent) {
      await this.handleAsyncWaitForSelector(<base.CmdWaitForSelector>{ Selector: cmd.Selector })
      if (!cmd.Index) {
         return this.setValue(cmd.Key, await this.page.$eval(cmd.Selector, el => el.textContent))
      }

      const index = this.getIndex(cmd)
      return this.setValue(cmd.Key, await this.page.$$eval(cmd.Selector, (els, index) => els[index].textContent, index))
   }

   // 获取元素outerHTML代码，保存到Key字段中
   // { "Cmd": "outerHTML", "Comment": "获取outerHTML，保存到DB的Key中", "Selector": ".op-stockdynamic-moretab-cur-num", "Key": "html", "Index":"用于多个元素的索引" }
   protected async handleAsyncOuterHTML(cmd: base.CmdOuterHTML) {
      await this.handleAsyncWaitForSelector(<base.CmdWaitForSelector>{ Selector: cmd.Selector })
      if (!cmd.Index) {
         return this.setValue(cmd.Key, await this.page.$eval(cmd.Selector, el => el.outerHTML))
      }

      const index = this.getIndex(cmd)
      return this.setValue(cmd.Key, await this.page.$$eval(cmd.Selector, (els, index) => els[index].outerHTML, index))
   }
   
   // 获取Frame里的元素outerHTML代码，保存到Key字段中
   // { "Cmd": "FrameOuterHTML", "Comment": "获取outerHTML，保存到DB的Key中", "Selector": ".op-stockdynamic-moretab-cur-num", "Key": "html", "Index":"用于多个元素的索引", "FrameName":"appIframe"}
   protected async handleAsyncFrameOuterHTML(cmd: base.CmdFrameOuterHTML) {
    //   await this.handleAsyncWaitForSelector(<base.CmdWaitForSelector>{ Selector: cmd.Selector })
      const frame = this.page.frames().find(frame => frame.name() === cmd.FrameName);
      await frame.waitForSelector(cmd.Selector)
    
      if (!cmd.Index) {
         return this.setValue(cmd.Key, await frame.$eval(cmd.Selector, el => el.outerHTML))
      }

      const index = this.getIndex(cmd)
      return this.setValue(cmd.Key, await frame.$$eval(cmd.Selector, (els, index) => els[index].outerHTML, index))
   }

   // 网络请求Value中的地址，获取的数据保存到Key字段中
   // { "Cmd": "httpGet", "Comment": "网络get请求Value地址，返回数据保存到Key中", Key: "ip", Value: "http://ip.lyl.hk" }
   protected async handleAsyncHttpGet(cmd: base.CmdHttpGet) {
      this.setValue(cmd.Key, (await axios.default.get(cmd.Value)).data)
   }

   // 自定义变量，Key=Value
   // { "Cmd": "var", "Comment": "将Value定义到变量Key，保存到DB中", "Key": "key1", "SyncEval": "123" }
   protected handleSyncVar(cmd: base.CmdVar) {
      this.setValue(cmd.Key, this.syncEval(cmd))
   }

   // 记录日志Key或Value
   // { "Cmd": "log", "Comment": "记录Key或Value到日志", "Key": "key1", "SyncEval": "123" }
   protected async handleAsyncLog(cmd: base.CmdLog) {
      this.log(this.syncEval(cmd))
   }

   // 执行Key或Value中的复杂的javascript脚本，将返回的对象属性保存到DB数据中
   // { "Cmd": "js", "Comment": "高级操作，执行javascript，返回对象保存到DB数据", "AsyncEval": "let _ip=(await axios.default.get('http://ip.lyl.hk')).data;return {ip2:_ip}" }
   protected async handleAsyncJs(cmd: base.CmdJs) {
      const result = await this.asyncEval(cmd)
      if (typeof result === "object") {
         for (let i in result) this.setValue(i, result[i])
      }
   }

   // 抛出错误信息Key或Value，终止当前的指令组
   // { "Cmd": "throw", "Comment": "中断所有操作，抛出Key或Value信息", "SyncEval": "满足条件才throw/空就是无条件throw" }
   protected async handleAsyncThrow(cmd: base.CmdThrow) {
      // 没定义条件，直接throw
      if (!cmd.SyncEval) throw { message: cmd.Comment }
      // 定义了条件，要满足条件才throw
      if (this.syncEval(cmd)) throw { message: cmd.Comment }
      this.log("throw不满足")
   }

   // 继续循环当前的指令组，条件来自自Key或Value，条件空则视为无条件继续循环
   // { "Cmd": "continue", "Comment": "继续循环", "SyncEval": "满足条件才continue/空就是无条件continue" }
   protected async handleAsyncContinue(cmd: base.CmdContinue) {
      // 没定义条件，直接continue
      if (!cmd.SyncEval) throw "continue"
      // 定义了条件，要满足条件才continue
      if (this.syncEval(cmd)) throw "continue"
      this.log("continue不满足")
   }

   // 跳出当前的Loop/Condition，条件来自自Key或Value，条件空则视为无条件跳出
   // { "Cmd": "break", "Comment": "跳出循环", "SyncEval": "满足条件才break/空就是无条件break" }
   protected async handleAsyncBreak(cmd: base.CmdBreak) {
      // 没定义条件，直接break
      if (!cmd.SyncEval) throw "break"
      // 定义了条件，要满足条件才break
      if (this.syncEval(cmd)) throw "break"
      this.log("break不满足")
   }

   // 跳出当前的指令组，条件来自自Key或Value，条件空则视为无条件跳出
   // { "Cmd": "jumpOut", "Comment": "跳出循环", "SyncEval": "满足条件才jumpOut/空就是无条件jumpOut" }
   protected async handleAsyncJumpOut(cmd: base.CmdJumpOut) {
      // 没定义条件，直接jumpOut
      if (!cmd.SyncEval) throw "jumpOut"
      // 定义了条件，要满足条件才jumpOut
      if (this.syncEval(cmd)) throw "jumpOut"
      this.log("jumpOut不满足")
   }

   // 返回当前的sub，条件来自自Key或Value，条件空则视为无条件跳出
   // { "Cmd": "return", "Comment": "返回", "SyncEval": "满足条件才return/空就是无条件return" }
   protected async handleAsyncReturn(cmd: base.CmdReturn) {
      // 没定义条件，直接return
      if (!cmd.SyncEval) throw "return"
      // 定义了条件，要满足条件才return
      if (this.syncEval(cmd)) throw "return"
      this.log("return不满足")
   }

   // 显示鼠标坐标，方便调试
   // { "Cmd": "showMouse", "Comment": "显示鼠标"}
   protected async handleAsyncShowMouse(cmd: base.CmdShowMouse) {
      await installMouseHelper.default(this.page)
   }

   // 等待某个元素出现
   // { "Cmd": "waitForSelector", "Comment": "等待元素出现，一般不需要主动调用", "Selector":"选择器" }
   protected async handleAsyncWaitForSelector(cmd: base.CmdWaitForSelector) {
      // 此方法容易产生: waiting for selector ".nav-logo-link" failed: timeout 300000ms exceeded 错误。。
      // 使用for包裹，使其有机会再试一次。

      let option = Object.assign({}, cmd.Options || {});

      if (!option.timeout) {
         option.timeout = parseInt(this.getValue("waitForSelectorTimeout") || "10000");
      }

      let error = null;
      for (let index = 0; index < 20; index++) {
         try {
            await this.page.waitForSelector(cmd.Selector, option);
         }catch (e) {
            error = e;
         }

         // 没有出现错误，则不用再执行了。
         if (!error) {
            break;
         }
      }

      // 有错误，抛出去。
      if (error) {
         throw error;
      }
   }

   // 检查某个元素是否存在，默认等待5秒
   // 如果配置Json子指令，元素存在即可执行子指令
   // 同时设置Key为"1"/"0"
   // { "Cmd": "existsSelector", "Comment": "是否存在某个元素，存在返回'1'，不存在返回'0'", "Selector":"选择器", "Json":[...]}
   protected async handleAsyncExistsSelector(cmd: base.CmdExistsSelector) {
      const opt = cmd.Options || { timeout: 5000 }
      if (!opt.hasOwnProperty("timeout")) opt["timeout"] = 5000

      const exists = await this.page.waitForSelector(cmd.Selector, opt)
         .then(_ => { return true })
         .catch(_ => { return false });

      if (exists && cmd.Json) {
         try {
            await this.do(cmd.Json)
         } catch (e) {
            if (e === base.CmdTypes.JumpOut) return
            throw e
         }
      }
   }

   // 检查某个元素是否存在，默认等待5秒
   // 如果配置Json子指令，元素不存在即可执行子指令
   // 同时设置Key为"1"/"0"
   // { "Cmd": "notExistsSelector", "Comment": "是否存在某个元素，存在返回'1'，不存在返回'0'", "Selector":"选择器", "Json":[...]}
   protected async handleAsyncNotExistsSelector(cmd: base.CmdNotExistsSelector) {
      const opt = cmd.Options || { timeout: 5000 }
      if (!opt.hasOwnProperty("timeout")) opt["timeout"] = 5000

      const exists = await this.page.waitForSelector(cmd.Selector, opt)
         .then(_ => { return false })
         .catch(_ => { return true });

      if (exists && cmd.Json) {
         try {
            await this.do(cmd.Json)
         } catch (e) {
            if (e === base.CmdTypes.JumpOut) return
            throw e
         }
      }
   }

   // 点击符合正则表达式的字符串，默认等待5秒
   // { "Cmd": "clickText", "Comment": "点击字符串", "Selector":"选择器", "Key":"key"}
   protected async handleAsyncClickText(cmd: base.CmdClickText) {
      const opt = cmd.Options || { timeout: 5000, clickCount: 1 }
      if (!opt.hasOwnProperty("timeout")) opt["timeout"] = 5000
      const clickCount = (cmd.Options && cmd.Options["clickCount"]) || 1

      const rect = await this.page.$$eval(cmd.Selector, (els, cmdKey) => {
         for (var i = 0; i < els.length; i++) {
            if (new RegExp(cmdKey).test(els[i].outerHTML)) {
               const rect = els[i].getBoundingClientRect()
               return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
            }
         }
         return null
      }, this.getValue(cmd.Key))
      if (rect == null) throw { message: "(" + cmd.Selector + ")未找到字符串:" + this.getValue(cmd.Key) }
      const point = this.calcElementPoint(rect)
      await this.asyncMouseMove(point.x, point.y)
      await this.handleAsyncWait(<base.CmdWait>{ Value: this.random(this.userInputWaitMin, this.userInputWaitMax).toString() })
      if (cmd.WaitNav === true) {
         await Promise.all([
            this.handleAsyncWaitForNavigation(<base.CmdWaitForNavigation>{}),
            this.asyncMouseClick(this.mouseX, this.mouseY, { delay: this.random(50, 100) }),
         ]);
      } else {
         await this.asyncMouseClick(this.mouseX, this.mouseY, { clickCount: clickCount, delay: this.random(50, 100) })
      }
      await this.handleAsyncWait(<base.CmdWait>{ Value: this.random(this.userInputWaitMin, this.userInputWaitMax).toString() })
   }

   // 循环执行Json中的指令组，循环次数来自Key或Value
   // { "Cmd": "loop", "Comment": "循环Key或Value次数，内置loopCounter为循环计数器", Key: "循环次数", "Json": [{Cmd...}] }
   protected async handleAsyncLoop(cmd: base.CmdLoop) {
      const count = Number(this.getValue(cmd.Key))
      this.log("loop:", count)
      for (let i = 0; i < count; i++) {
         this.setValue("loopCounter", i.toString())
         try {
            await this.do(cmd.Json)
         } catch (e) {
            if (e === "continue") continue
            if (e === "break") break
            throw e
         }
      }
   }

   // 执行Json中的指令组，发生错误时不退出程序
   // { "Cmd": "Try", "Comment": "执行Json中的指令组，执行Json中的指令组，发生错误时不退出程序", Key: "是否成功运行的结果", "Json": [{Cmd...}] }
   protected async handleAsyncTry(cmd: base.CmdTry) {
      this.setValue(cmd.Key, '1')
      try {
         await this.do(cmd.Json)
      } catch (e) {
         // 系统异常 & 自定义 throw （不退出程序）
         if (typeof e === 'object') {
            this.setValue(cmd.Key, '0')
            this.log(`错误：${e.message}`)
         } else {
            throw e
         }
      }
   }

   // 生成随机数[min,max]，最小最大值在Options中配置，数据带计算方法
   // { "Cmd": "random", "Comment": "生成随机数", "Key": "rand1", "Options": {"min":"key1", "max":"key2"}}
   protected handleSyncRandom(cmd: base.CmdRandom) {
      this.setValue(cmd.Key, this.random(this.syncEval({ SyncEval: cmd.Options["min"] }), this.syncEval({ SyncEval: cmd.Options["max"] })).toString())
   }

   // 获取元素数量保存到Key中
   // { "Cmd": "elementCount", "Comment": "获取元素数量", "Selector": "#select1", "Key": "key1" },
   protected async handleAsyncElementCount(cmd: base.CmdElementCount) {
      const els = await this.page.$$(cmd.Selector)
      this.setValue(cmd.Key, els.length.toString())
   }
   
   // 获取元素数量保存到Key中
   // { "Cmd": "FrameElementCount", "Comment": "获取元素数量", "Selector": "#select1", "Key": "key1", "FrameName":"appIframe" },
   protected async handleAsyncFrameElementCount(cmd: base.CmdFrameElementCount) {
       const frame = this.page.frames().find(frame => frame.name() === cmd.FrameName);
       const els = await frame.$$(cmd.Selector)
       this.setValue(cmd.Key, els.length.toString())
   }

   // 多条件判断，满足条件即执行Json指令组
   // { "Cmd": "condition", "Comment": "条件判断", "Conditions": [ { "Condition": "key1==123", "Json": [{Cmd...}] } ] }
   protected async handleAsyncCondition(cmd: base.CmdCondition) {
      for (let i in cmd.Conditions) {
         let condition = cmd.Conditions[i].Condition
         if (this.syncEval({ SyncEval: condition })) {
            this.log("true", condition)
            try {
               await this.do(cmd.Conditions[i].Json)
            } catch (e) {
               if (e == base.CmdTypes.Break) return
               if (e == base.CmdTypes.JumpOut) continue
               throw e
            }
         } else this.log("false", condition)
      }
   }

   // 指令组定义，名称来自Key或Value
   // { "Cmd": "sub", "Comment": "定义一组操作集合", "Value": "sub1", "Json": [{Cmd...}] }
   protected async handleAsyncSub(cmd: base.CmdSub) {
      if (!this.cmds) this.cmds = {}
      this.cmds[cmd.Value] = cmd.Json
   }

   // 调用指令组，名称来自Key或Value
   // { "Cmd": "call", "Comment": "调用操作集合", "Value": "sub1"}
   protected async handleAsyncCall(cmd: base.CmdCall) {
      if (!this.cmds) this.cmds = {}

      if (!this.cmds.hasOwnProperty(cmd.Value)) throw { message: "Not Found sub:" + cmd.Value }
      try {
         await this.do(this.cmds[cmd.Value])
      } catch (e) {
         if (e == base.CmdTypes.Return) return
         throw e
      }
   }

   // Key条件满足则会执行Json
   // { "Cmd": "if", "Comment": "条件满足则会执行", "SyncEval": "a=1", "Json":[...]}
   protected async handleAsyncIf(cmd: base.CmdIf) {
      try {
         if (this.syncEval(cmd)) {
            await this.do(cmd.Json)
         } else {
            if (cmd.ElseJson && cmd.ElseJson.length > 0) {
               await this.do(cmd.ElseJson)
            }
         }
      } catch (e) {
         if (e === base.CmdTypes.JumpOut) return
         throw e
      }
   }

   // 定义一组操作，无论如何，最终都会执行这些操作
   // { "Cmd": "finally", "Comment": "无论如何，最终执行一些清理操作", "Json": [{Cmd...}] }
   protected handleSyncFinally(cmd: base.CmdFinally) {
      if (!this.finally) this.finally = []
      this.finally.push(cmd.Json)
   }

   // 执行命令前判断页面是否白屏
   protected async checkSiteNoFound() {
      try {
         await this.handleAsyncTextContent(<base.CmdTextContent>{Selector: "body", Key: "bodyContent"})
         const nfText = 'This site can’t be reached';
         const bodyContent = this.getValue('bodyContent');

         // 页面发生错误(空白页)
         if (new RegExp(nfText).test(bodyContent)) {
            await this.handleAsyncReloadPage(<base.CmdReloadPage>{})
            this.log('页面空白，刷新了一次')
            await this.handleAsyncWait(<base.CmdWait>{Value: this.random(this.userInputWaitMin, this.userInputWaitMax).toString()})
         }

         this.setValue('bodyContent', '');
      }catch (e) {
         /*
          ignore
          忽略错误，这个方法本身就是辅助执行作用，此方法的错误可忽略。
         */
      }
   }

   // 执行指令组
   protected async do(cmds: base.ICmd[]) {
      let rect: base.IRect
      for (let i in cmds) {
         const cmd = cmds[i]
         await this.log("CMD:", cmd.Cmd, cmd.Comment)
         const cmdAsync = "handleAsync" + cmd.Cmd.replace(/^\S/, s => { return s.toUpperCase() })
         const cmdSync = "handleSync" + cmd.Cmd.replace(/^\S/, s => { return s.toUpperCase() })

         let selector = (cmd as base.CmdSelector).Selector

         // 如果selector 是 db: 开头，则将此selector值从db里取。
         if (selector && selector.indexOf("db:") === 0) {
            selector = this.getValue(selector.split(":")[1]);
            (cmd as base.CmdSelector).Selector = selector;
         }

         const index = (cmd as base.CmdIndex).Index
         if (selector && !cmd.ScreenshotFull && (cmd.ScreenshotBefore || cmd.ScreenshotBehind)) {
            if (!index) {
               await this.page.$eval(selector, (el) => el.scrollIntoView())
               const el = await this.page.$(selector)
               rect = await el.boundingBox()
            } else {
               await this.page.$$eval(selector, (els, index) => els[index].scrollIntoView(), index)
               const els = await this.page.$$(selector)
               rect = await els[index].boundingBox()
            }
         }
         if (cmd.ScreenshotBefore) {
            if (cmd.ScreenshotFull) await this.handleAsyncScreenshot(<base.CmdScreenshot>{})
            else await this.handleAsyncScreenshot(<base.CmdScreenshot>{ Options: <Object>{ clip: rect } })
         }

         if(this.page && this.browser && cmd.reloadOnPageBad){
            await this.checkSiteNoFound();
         }
         
         let func;
         let isAsync = false;

         if (typeof this[cmdAsync] === "function") {
            func = this[cmdAsync];
            isAsync = true;
         }
         else if (typeof this[cmdSync] === "function") func = this[cmdSync]
         else throw { message: "CmdNotFound" }

         try {
            if(isAsync) await func.call(this, cmd)
            else func.call(this, cmd)
         }catch (e) {
            const message = e.message;

            if(message && message.indexOf && (message.indexOf("ERR_TUNNEL_CONNECTION_FAILED") > -1 || message.indexOf("ERR_CONNECTION_CLOSED") > -1)){

               // 只有在有浏览器和页面实例的时候才可以进行重试。
               if(this.page && this.browser) {
                  await this.handleAsyncReloadPage(<base.CmdReloadPage>{})
                  await this.handleAsyncWait(<base.CmdWait>{Value: this.random(this.userInputWaitMin, this.userInputWaitMax).toString()})
                  this.log('页面空白，刷新重新执行命令')

                  if (isAsync) await func.call(this, cmd)
                  else func.call(this, cmd)
               } else {
                  throw e;
               }
            }else{
                throw e;
            }
         }

        //   if (typeof this[cmdAsync] === "function") await this[cmdAsync](cmd)
        //   else if (typeof this[cmdSync] === "function") this[cmdSync](cmd)
        //   else throw { message: "CmdNotFound" }

         if (cmd.ScreenshotBehind) {
            if (cmd.ScreenshotFull) await this.handleAsyncScreenshot(<base.CmdScreenshot>{})
            else await this.handleAsyncScreenshot(<base.CmdScreenshot>{ Options: <Object>{ clip: rect } })
         }
      }
   }
}
