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
   os?: string, // 系统 lin|mac|win|android，默认win
   resolution?: string, // 分辨率，默认：1920x1080
   proxy?: Object, // 代理：默认空。{type:"HTTP",host:"x.x.x.x",port:"xxxx",username:"xxx",password:"xxx"}
   dns?: string[], // DNS：默认空
}

export class Base {
   // puppeteer
   protected browser: puppeteer.Browser;
   protected page: puppeteer.Page;
   protected mouseX: number = 0; // 鼠标最后X坐标
   protected mouseY: number = 0; // 鼠标最后Y坐标
   protected timeout: number = 30000; // 默认超时时间 

   protected db = {}; // 数据对象
   protected logs = []; // 日志
   protected screenshots = {}; // base64截图数据

   // puppeteer / multilogin 判断
   protected isPuppeteer: boolean = false;
   protected isMultilogin: boolean = false;

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
   Call = "call",
   CheckZoom = "checkZoom",
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
   GetURL = "getURL",
   Hover = "hover",
   HttpGet = "httpGet",
   If = "if",
   Js = "js",
   Log = "log",
   Loop = "loop",
   Navation = "navigation",
   NewPage = "newPage",
   NotExistsSelector = "notExistsSelector",
   OuterHTML = "outerHTML",
   PageEval = "pageEval",
   Random = "random",
   ReloadPage = "reloadPage",
   RemoveMultilogin = "removeMultilogin",
   Screenshot = "screenshot",
   ScreenshotBase64 = "screenshotBase64",
   Select = "select",
   SetHeader = "setHeader",
   SetTimeout = "setTimeout",
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
export type CmdBootMultilogin = { Cmd: CmdTypes.BootMultilogin } & CmdBase & CmdKey
export type CmdRemoveMultilogin = { Cmd: CmdTypes.RemoveMultilogin } & CmdBase & CmdKey
export type CmdNavigation = { Cmd: CmdTypes.Navation, Options?: puppeteer.DirectNavigationOptions } & CmdBase & CmdKey
export type CmdNewPage = { Cmd: CmdTypes.NewPage } & CmdBase
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
export type CmdClick = { Cmd: CmdTypes.Click, Options?: Object, WaitNav?: boolean } & CmdBase & CmdSelector & CmdIndex
export type CmdDBClick = { Cmd: CmdTypes.DBClick, WaitNav?: boolean } & CmdBase & CmdSelector & CmdIndex
export type CmdThreeClick = { Cmd: CmdTypes.ThreeClick, WaitNav?: boolean } & CmdBase & CmdSelector & CmdIndex
export type CmdType = { Cmd: CmdTypes.Type } & CmdBase & CmdKey & CmdSelector & CmdIndex
export type CmdSelect = { Cmd: CmdTypes.Select } & CmdBase & CmdKey & CmdSelector & CmdIndex
export type CmdPageEval = { Cmd: CmdTypes.PageEval } & CmdBase & CmdValue

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
export type CmdShowMouse = { Cmd: CmdTypes.ShowMouse } & CmdBase
export type CmdWaitForSelector = { Cmd: CmdTypes.WaitForSelector, Options?: puppeteer.WaitForSelectorOptions } & CmdBase & CmdSelector
export type CmdExistsSelector = { Cmd: CmdTypes.ExistsSelector, Options?: { timeout: number } } & CmdBase & CmdSelector & CmdJson
export type CmdNotExistsSelector = { Cmd: CmdTypes.NotExistsSelector, Options?: { timeout: number } } & CmdBase & CmdSelector & CmdJson
export type CmdLoop = { Cmd: CmdTypes.Loop } & CmdBase & CmdKey & CmdJson
export type CmdRandom = { Cmd: CmdTypes.Random, Options: { min: string, max: string } } & CmdBase & CmdKey
export type CmdElementCount = { Cmd: CmdTypes.ElementCount } & CmdBase & CmdSelector & CmdKey
export type CmdCondition = { Cmd: CmdTypes.Condition, Conditions: ICondition[] } & CmdBase
export type CmdSub = { Cmd: CmdTypes.Sub } & CmdBase & CmdValue & CmdJson
export type CmdCall = { Cmd: CmdTypes.Call } & CmdBase & CmdValue
export type CmdIf = { Cmd: CmdTypes.If } & CmdBase & CmdSyncEval & CmdJson
export type CmdFinally = { Cmd: CmdTypes.Finally } & CmdBase & CmdJson

export type ICmd = CmdBootPuppeteer | CmdCreateMultilogin | CmdBootMultilogin | CmdRemoveMultilogin
   | CmdNavigation | CmdNewPage | CmdAlwaysPage | CmdReloadPage
   | CmdClosePage | CmdShutdown | CmdSetHeader | CmdSetTimeout
   | CmdScreenshot | CmdScreenshotBase64 | CmdCheckZoom | CmdGetURL
   | CmdHover | CmdClick | CmdDBClick | CmdThreeClick
   | CmdType | CmdSelect | CmdPageEval
   | CmdFilterRequest | CmdWaitForNavigation | CmdWait | CmdWaitForKey
   | CmdTextContent | CmdOuterHTML | CmdHttpGet | CmdVar | CmdLog
   | CmdJs | CmdThrow | CmdContinue | CmdBreak | CmdShowMouse
   | CmdWaitForSelector | CmdExistsSelector | CmdNotExistsSelector
   | CmdLoop | CmdRandom | CmdElementCount | CmdCondition
   | CmdSub | CmdCall | CmdIf | CmdFinally
