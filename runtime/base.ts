import * as puppeteer from "puppeteer";

export interface IData {
   Comment?: string; // 说明
   Json: ICmd[]; // 指令配置
   DB: Object; // 数据
}

export interface ICondition {
   Condition: string; // 条件
   Comment?: string; // 指令说明
   Json: ICmd[]; // 指令配置
}

export interface IResult {
   DB: Object; // 数据
   Logs: any[]; // 日志
   Screenshots: Object; // base64截图数组
}

export interface IRect {
   x: number; // The x-coordinate of top-left corner.
   y: number; // The y-coordinate of top-left corner.
   width: number; // The width.
   height: number; // The height.
}

export interface IPoint {
   x: number;
   y: number;
}

export interface IMultiloginCreateOption {
   mlaVersion: string,// mlaVersion
   name: string, // 指纹名称
   notes?: string, // 指纹说明，默认空
   browser?: string, // 浏览器 mimic|stealthfox|mimic_mobile 默认minic
   os?: string, // 系统 lin|mac|win|android，默认win
   resolution?: string, // 分辨率，默认：1920x1080
   proxy?: Object, // 代理：默认空。{type:"HTTP",host:"x.x.x.x",port:"xxxx",username:"xxx",password:"xxx"}
   dns?: string[], // DNS：默认空
   language?: string, // 语言
}

export interface VMloginCreateOption {
   name: string, // 指纹名称
   notes?: string, // 指纹说明，默认空
   tag?: string, // 指纹所属组名
   platform?: string, // 浏览器的编译平台，可填的值参考Navigator.Platform https://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today
   screenHeight?: number, // 屏幕高度
   screenWidth?: number, // 屏幕宽度
   proxyHost?: string, // IP 地址 
   proxyType?: string, // 代理类型 HTTP|SOCKS4|SOCKS5
   proxyPort?: number, // 代理端口
   proxyUser?: string, // 代理登录用户
   proxyPass?: string, // 代理登录密码
   userAgent?: string // 用户代理
   canvasDefType?: string, // 硬件指纹【Canvas】保护 NOISE|OFF|BLOCK
   appVersion?: string, // 版本 
   audioNoise?: boolean, // 硬件指纹【AudioContext】保护（噪声模式）。
   audioInputs?: number, // 音频输入
   audioOutputs?: number, // 音频输出
   videoInputs?: number, // 媒体输入
   webRtcType?: string, // webRtc 类型 FAKE
   publicIp?: string, // 公网 ip
   localIps?: string[], // 内网 ip
   autoWanIp?: boolean, // 自动检测 ip
   langHdr?: string, // 语言
   product?: string, // 引擎 Gecko
   timeZoneFillOnStart?: boolean, // 基于 IP 设置时区
   hardwareConcurrency?: number,
   disableFlashPlugin?: boolean, // flash 插件是否可用
   browserSettings?: Object, // 浏览器配置。 {pepperFlash: true,mediaStream: true,webkitSpeech: true,fakeUiForMedia: true,gpuAndPepper3D: true,ignoreCertErrors: true,audioMute: true,disableWebSecurity: true,disablePdf: true,touchEvents: true,hyperlinkAuditing: true}
   localCache?: Object, // 本地缓存。{deleteCache: true,deleteCookie: true}
   webglVendor?: string,
   webglRenderer?: string,
   appName?: string,
   synSettings?: Object, // 浏览器配置同步配置
   fontList?: any[], // 浏览器字体列表
   mobileEmulation?: boolean, // 移动仿真功能
   dynamicFonts?: boolean, // 是否启用动态字体设置
   startUrl?: string, // 浏览器打开的默认地址
   maskFonts?: boolean, // 是否开启指纹保护
   acceptLanguage?: string, // Navigator参数 -> Accept-Language
   pixelRatio?: string,// Navigator参数 -> Device pixel Ratio
   browserParams?: string // 浏览器启动参数
}

export class Base {
   // puppeteer
   protected browser: puppeteer.Browser;
   protected page: puppeteer.Page;
   protected mouseX: number = 0; // 鼠标最后X坐标
   protected mouseY: number = 0; // 鼠标最后Y坐标
   protected timeout: number = 30000; // 默认超时时间 
   protected dialogValue: string; // dialog 弹窗点击的值
   protected pages: puppeteer.Page[]; // pages总数

   protected db = {}; // 数据对象
   protected logs = []; // 日志
   protected screenshots = {}; // base64截图数据

   // puppeteer / multilogin / VMlogin 判断
   protected isPuppeteer: boolean = false;
   protected isMultilogin: boolean = false;
   protected isVMlogin: boolean = false;

   // 指令相关
   protected cmds: Object; // 子操作集
   protected finally: ICmd[][]; // 最后清理指令

   // 用户输入操作随机等待时间：hover/click/input/select...
   protected userInputWaitMin = 1000
   protected userInputWaitMax = 3000;
   // 用户输入间隔随机等待时间：keyboard.type...
   protected userInputDelayMin = 10
   protected userInputDelayMax = 500;

   // multilogin默认配置
   protected multiloginProfileId = "profileId"
   // vmlogin默认配置
   protected vmloginProfileId = "profileId"

   constructor() { }

   // 记录日志
   protected async log(...data: any[]) {
      if (process.env.DEBUG) console.log("[" + (new Date()).toISOString() + "]", data.join(" "))
      this.logs.push("[" + (new Date()).toISOString() + "]" + data.join(" "))
   }
}

export enum CmdTypes {
   AlwaysPage = "alwaysPage",
   BootMultilogin = "bootMultilogin",
   BootPuppeteer = "bootPuppeteer",
   Break = "break",
   JumpOut = "jumpOut",
   Return = "return",
   Call = "call",
   CheckZoom = "checkZoom",
   Tap = "tap",
   Click = "click",
   ClosePage = "closePage",
   Condition = "condition",
   Continue = "continue",
   CreateMultilogin = "createMultilogin",
   DBClick = "dbClick",
   ElementCount = "elementCount",
   ExistsSelector = "existsSelector",
   FilterRequest = "filterRequest",
   Finally = "finally",
   ClickText = "clickText",
   GetURL = "getURL",
   Hover = "hover",
   HttpGet = "httpGet",
   If = "if",
   Js = "js",
   Log = "log",
   Loop = "loop",
   Try = "try",
   Navation = "navigation",
   NewPage = "newPage",
   PagesCount = 'pagesCount',
   ActivePage = 'activePage',
   NotExistsSelector = "notExistsSelector",
   OuterHTML = "outerHTML",
   PageEval = "pageEval",
   Random = "random",
   ReloadPage = "reloadPage",
   RemoveMultilogin = "removeMultilogin",
   CreateVMlogin = 'createVMlogin',
   BootVMlogin = 'bootVMlogin',
   RemoveVMlogin = 'removeVMlogin',
   Screenshot = "screenshot",
   ScreenshotBase64 = "screenshotBase64",
   Select = "select",
   SetHeader = "setHeader",
   SetTimeout = "setTimeout",
   ShareMultilogin = "shareMultilogin",
   ShowMouse = "showMouse",
   Shutdown = "shutdown",
   Sub = "sub",
   TextContent = "textContent",
   ThreeClick = "threeClick",
   Throw = "throw",
   Type = "type",
   Var = "var",
   Wait = "wait",
   WaitForNavigation = "waitForNavigation",
   WaitForSelector = "waitForSelector",
   WaitForKey = "waitForKey",
   DialogClick = "dialogClick",
   CreateVMloginForIphone = "createVMloginForIphone",
   CreateVMloginForAndroid = "createVMloginForAndroid"
}

/*
Cmd: string; // 操作指令
Comment?: string; // 指令说明

Key?: string; // 同步计算表达式，返回数据DB中的数据
Value?: string; // 操作值
SyncEval?: string; // 同步计算表达式
AsyncEval?: string; // 异步计算表达式

Selector?: string; // 页面selector选择器
Index?: string; // selector选择器的索引

Options?: Object; // 指令参数
WaitNav?: boolean; // 是否是会产生跳转，这个会产生一个等待页面加载完成的操作
Conditions?: ICondition[]; // 分支
Json?: _ICmd[]; // loop循环子指令

ScreenshotBefore?: boolean; // 指令前截屏
ScreenshotBehind?: boolean; // 指令后截屏
ScreenshotFull?: boolean; // 全屏截图，默认只截图Selector
*/

type CmdBase = {
   Comment: string,
   ScreenshotBefore?: boolean; // 指令前截屏
   ScreenshotBehind?: boolean; // 指令后截屏
   ScreenshotFull?: boolean; // 全屏截图，默认只截图Selector 
}

export type CmdSelector = { Selector: string }
export type CmdIndex = { Index?: string }
export type CmdKey = { Key: string }
export type CmdValue = { Value: string }
export type CmdSyncEval = { SyncEval: string }
export type CmdAsyncEval = { AsyncEval: string }
export type CmdJson = { Json: ICmd[] }

export type CmdBootPuppeteer = { Cmd: CmdTypes.BootPuppeteer, Options?: puppeteer.LaunchOptions } & CmdBase
export type CmdCreateMultilogin = { Cmd: CmdTypes.CreateMultilogin, Key: string } & CmdBase
export type CmdShareMultilogin = { Cmd: CmdTypes.ShareMultilogin } & CmdBase & CmdKey & CmdValue
export type CmdBootMultilogin = { Cmd: CmdTypes.BootMultilogin } & CmdBase & CmdKey
export type CmdRemoveMultilogin = { Cmd: CmdTypes.RemoveMultilogin } & CmdBase & CmdKey
export type CmdCreateVMlogin = { Cmd: CmdTypes.CreateVMlogin, Key: string } & CmdBase
export type CmdCreateVMloginForIphone = { Cmd: CmdTypes.CreateVMloginForIphone, Key: string } & CmdBase
export type CmdCreateVMloginForAndroid = { Cmd: CmdTypes.CreateVMloginForAndroid, Key: string } & CmdBase
export type CmdBootVMlogin = { Cmd: CmdTypes.BootVMlogin } & CmdBase & CmdKey
export type CmdRemoveVMlogin = { Cmd: CmdTypes.RemoveVMlogin } & CmdBase & CmdKey
export type CmdNavigation = { Cmd: CmdTypes.Navation, Options?: puppeteer.DirectNavigationOptions } & CmdBase & CmdKey
export type CmdNewPage = { Cmd: CmdTypes.NewPage } & CmdBase
export type CmdPagesCount = { Cmd: CmdTypes.PagesCount } & CmdKey & CmdBase
export type CmdActivePage = { Cmd: CmdTypes.ActivePage } & CmdKey & CmdBase
export type CmdAlwaysPage = { Cmd: CmdTypes.AlwaysPage } & CmdBase
export type CmdReloadPage = { Cmd: CmdTypes.ReloadPage, Options?: puppeteer.DirectNavigationOptions } & CmdBase
export type CmdClosePage = { Cmd: CmdTypes.ClosePage } & CmdBase
export type CmdShutdown = { Cmd: CmdTypes.Shutdown } & CmdBase
export type CmdSetHeader = { Cmd: CmdTypes.SetHeader, Options?: puppeteer.Headers } & CmdBase
export type CmdSetTimeout = { Cmd: CmdTypes.SetTimeout } & CmdBase & CmdKey
export type CmdScreenshot = { Cmd: CmdTypes.Screenshot, Value?: string, Options?: puppeteer.Base64ScreenShotOptions } & CmdBase
export type CmdScreenshotBase64 = { Cmd: CmdTypes.ScreenshotBase64, Value: string, Options?: puppeteer.Base64ScreenShotOptions } & CmdBase & CmdSelector & CmdIndex
export type CmdCheckZoom = { Cmd: CmdTypes.CheckZoom } & CmdBase
export type CmdGetURL = { Cmd: CmdTypes.GetURL } & CmdBase & CmdKey

export type CmdHover = { Cmd: CmdTypes.Hover } & CmdBase & CmdSelector & CmdIndex
export type CmdTap = { Cmd: CmdTypes.Tap } & CmdBase & CmdSelector & CmdIndex
export type CmdClick = { Cmd: CmdTypes.Click, Options?: Object, WaitNav?: boolean } & CmdBase & CmdSelector & CmdIndex
export type CmdDBClick = { Cmd: CmdTypes.DBClick, WaitNav?: boolean } & CmdBase & CmdSelector & CmdIndex
export type CmdThreeClick = { Cmd: CmdTypes.ThreeClick, WaitNav?: boolean } & CmdBase & CmdSelector & CmdIndex
export type CmdType = { Cmd: CmdTypes.Type } & CmdBase & CmdKey & CmdSelector & CmdIndex
export type CmdSelect = { Cmd: CmdTypes.Select } & CmdBase & CmdKey & CmdSelector & CmdIndex
export type CmdPageEval = { Cmd: CmdTypes.PageEval } & CmdBase & CmdValue
export type CmdClickText = { Cmd: CmdTypes.ClickText, Options?: { timeout: number }, WaitNav?: boolean } & CmdBase & CmdSelector & CmdKey
export type CmdDialogClick = { Cmd: CmdTypes.DialogClick } & CmdBase & CmdKey

export type CmdFilterRequest = { Cmd: CmdTypes.FilterRequest } & CmdBase & CmdSyncEval
export type CmdWaitForNavigation = { Cmd: CmdTypes.WaitForNavigation, Options?: puppeteer.DirectNavigationOptions } & CmdBase
export type CmdWait = { Cmd: CmdTypes.Wait } & CmdBase & CmdValue
export type CmdWaitForKey = { Cmd: CmdTypes.WaitForKey } & CmdBase & CmdKey
export type CmdTextContent = { Cmd: CmdTypes.TextContent } & CmdBase & CmdSelector & CmdIndex & CmdKey
export type CmdOuterHTML = { Cmd: CmdTypes.OuterHTML } & CmdBase & CmdSelector & CmdIndex & CmdKey
export type CmdHttpGet = { Cmd: CmdTypes.HttpGet } & CmdBase & CmdKey & CmdValue
export type CmdVar = { Cmd: CmdTypes.Var } & CmdBase & CmdKey & CmdSyncEval
export type CmdLog = { Cmd: CmdTypes.Log } & CmdBase & CmdSyncEval
export type CmdJs = { Cmd: CmdTypes.Js } & CmdBase & CmdAsyncEval
export type CmdThrow = { Cmd: CmdTypes.Throw } & CmdBase & CmdSyncEval
export type CmdContinue = { Cmd: CmdTypes.Continue } & CmdBase & CmdSyncEval
export type CmdBreak = { Cmd: CmdTypes.Break } & CmdBase & CmdSyncEval
export type CmdJumpOut = { Cmd: CmdTypes.JumpOut } & CmdBase & CmdSyncEval
export type CmdReturn = { Cmd: CmdTypes.Return } & CmdBase & CmdSyncEval
export type CmdShowMouse = { Cmd: CmdTypes.ShowMouse } & CmdBase
export type CmdWaitForSelector = { Cmd: CmdTypes.WaitForSelector, Options?: puppeteer.WaitForSelectorOptions } & CmdBase & CmdSelector
export type CmdExistsSelector = { Cmd: CmdTypes.ExistsSelector, Options?: { timeout: number } } & CmdBase & CmdSelector & CmdJson
export type CmdNotExistsSelector = { Cmd: CmdTypes.NotExistsSelector, Options?: { timeout: number } } & CmdBase & CmdSelector & CmdJson
export type CmdLoop = { Cmd: CmdTypes.Loop } & CmdBase & CmdKey & CmdJson
export type CmdTry = { Cmd: CmdTypes.Try } & CmdBase & CmdKey & CmdJson
export type CmdRandom = { Cmd: CmdTypes.Random, Options: { min: string, max: string } } & CmdBase & CmdKey
export type CmdElementCount = { Cmd: CmdTypes.ElementCount } & CmdBase & CmdSelector & CmdKey
export type CmdCondition = { Cmd: CmdTypes.Condition, Conditions: ICondition[] } & CmdBase
export type CmdSub = { Cmd: CmdTypes.Sub } & CmdBase & CmdValue & CmdJson
export type CmdCall = { Cmd: CmdTypes.Call } & CmdBase & CmdValue
export type CmdIf = { Cmd: CmdTypes.If } & CmdBase & CmdSyncEval & CmdJson
export type CmdFinally = { Cmd: CmdTypes.Finally } & CmdBase & CmdJson

export type ICmd = CmdBootPuppeteer | CmdCreateMultilogin | CmdShareMultilogin | CmdBootMultilogin | CmdRemoveMultilogin
   | CmdCreateVMlogin | CmdRemoveVMlogin | CmdBootVMlogin | CmdNavigation | CmdNewPage | CmdPagesCount | CmdActivePage
   | CmdAlwaysPage | CmdReloadPage | CmdClosePage | CmdShutdown | CmdSetHeader | CmdSetTimeout
   | CmdScreenshot | CmdScreenshotBase64 | CmdCheckZoom | CmdGetURL
   | CmdHover | CmdTap | CmdClick | CmdDBClick | CmdThreeClick | CmdClickText | CmdDialogClick
   | CmdType | CmdSelect | CmdPageEval
   | CmdFilterRequest | CmdWaitForNavigation | CmdWait | CmdWaitForKey
   | CmdTextContent | CmdOuterHTML | CmdHttpGet | CmdVar | CmdLog
   | CmdJs | CmdThrow | CmdContinue | CmdBreak | CmdJumpOut | CmdReturn | CmdShowMouse
   | CmdWaitForSelector | CmdExistsSelector | CmdNotExistsSelector
   | CmdLoop | CmdTry | CmdRandom | CmdRandom | CmdElementCount | CmdCondition
   | CmdSub | CmdCall | CmdIf | CmdFinally | CmdCreateVMloginForIphone | CmdCreateVMloginForAndroid
