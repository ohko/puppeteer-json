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
   WaitRand = "waitRand",
}

type CmdBase = {
   Cmd: CmdType, Comment: string,
   ScreenshotBefore?: boolean; // 指令前截屏
   ScreenshotBehind?: boolean; // 指令后截屏
   ScreenshotFull?: boolean; // 全屏截图，默认只截图Selector 
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

export type CmdBootPuppeteer = CmdBase & { Cmd: CmdTypes.BootPuppeteer, Options?: puppeteer.ConnectOptions }
export type CmdCreateMultilogin = CmdBase & { Cmd: CmdTypes.CreateMultilogin, Key: string }
export type CmdBootMultilogin = CmdBase & { Cmd: CmdTypes.BootMultilogin }
   & ({ Key: string } | { Value: string } | { SyncEval: string } | { AsyncEval: string })
export type CmdRemoveMultilogin = CmdBase & { Cmd: CmdTypes.RemoveMultilogin }
   & ({ Key: string } | { Value: string } | { SyncEval: string } | { AsyncEval: string })
export type CmdNavigation = CmdBase & { Cmd: CmdTypes.Navation, Key: string, Options?: Object }
export type CmdNewPage = CmdBase & { Cmd: CmdTypes.NewPage }
export type CmdAlwaysPage = CmdBase & { Cmd: CmdTypes.AlwaysPage }
export type CmdReloadPage = CmdBase & { Cmd: CmdTypes.ReloadPage, Options?: puppeteer.DirectNavigationOptions }
export type CmdClosePage = CmdBase & { Cmd: CmdTypes.ClosePage }
export type CmdShutdown = CmdBase & { Cmd: CmdTypes.Shutdown }
export type CmdSetHeader = CmdBase & { Cmd: CmdTypes.SetHeader, Options?: Object }
export type CmdSetTimeout = CmdBase & { Cmd: CmdTypes.SetTimeout, Selector: string }
   & ({ Key: string } | { Value: string } | { SyncEval: string } | { AsyncEval: string })
export type CmdScreenshot = CmdBase & { Cmd: CmdTypes.Screenshot, Options?: Object }
   & ({ Key: string } | { Value: string } | { SyncEval: string } | { AsyncEval: string })
export type CmdCheckZoom = CmdBase & { Cmd: CmdTypes.CheckZoom }
export type CmdGetURL = CmdBase & { Cmd: CmdTypes.GetURL, Key: string }

export type CmdHover = CmdBase & { Cmd: CmdTypes.Hover, Selector: string, Index?: string }
export type CmdClick = CmdBase & { Cmd: CmdTypes.Click, Selector: string, Index?: string, Options?: Object, WaitNav?: boolean }
export type CmdDBClick = CmdBase & { Cmd: CmdTypes.DBClick, Selector: string, Index?: string, WaitNav?: boolean }
export type CmdThreeClick = CmdBase & { Cmd: CmdTypes.ThreeClick, Selector: string, Index?: string, WaitNav?: boolean }
export type CmdType = CmdBase & { Cmd: CmdTypes.Type, Selector: string, Index?: string }
   & ({ Key: string } | { Value: string } | { SyncEval: string } | { AsyncEval: string })
export type CmdSelect = CmdBase & { Cmd: CmdTypes.Select, Selector: string }
   & ({ Key: string } | { Value: string } | { SyncEval: string } | { AsyncEval: string })
export type CmdPageEval = CmdBase & { Cmd: CmdTypes.PageEval, Value: string }

export type CmdFilterRequest = CmdBase & { Cmd: CmdTypes.FilterRequest, Value: string }
export type CmdWaitForNavigation = CmdBase & { Cmd: CmdTypes.WaitForNavigation, Options?: puppeteer.DirectNavigationOptions }
export type CmdWait = CmdBase & { Cmd: CmdTypes.Wait }
   & ({ Key: string } | { Value: string } | { SyncEval: string } | { AsyncEval: string })
export type CmdWaitRand = CmdBase & { Cmd: CmdTypes.WaitRand, Options: { min: number, max: number } }
export type CmdTextContent = CmdBase & { Cmd: CmdTypes.TextContent, Key: string, Selector: string, Index?: string }
export type CmdOuterHTML = CmdBase & { Cmd: CmdTypes.OuterHTML, Key: string, Selector: string, Index?: string }
export type CmdHttpGet = CmdBase & { Cmd: CmdTypes.HttpGet, Key: string, Value: string }
export type CmdVar = CmdBase & { Cmd: CmdTypes.Var, Key: string, Value: string }
export type CmdLog = CmdBase & { Cmd: CmdTypes.Log }
   & ({ Key: string } | { Value: string } | { SyncEval: string } | { AsyncEval: string })
export type CmdJs = CmdBase & { Cmd: CmdTypes.Js }
   & ({ Key: string } | { Value: string } | { SyncEval: string } | { AsyncEval: string })
export type CmdThrow = CmdBase & { Cmd: CmdTypes.Throw }
   & ({ Key: string } | { Value: string } | { SyncEval: string } | { AsyncEval: string })
export type CmdContinue = CmdBase & { Cmd: CmdTypes.Continue }
   & ({ Key: string } | { SyncEval: string } | { AsyncEval: string })
export type CmdBreak = CmdBase & { Cmd: CmdTypes.Break }
   & ({ Key: string } | { SyncEval: string } | { AsyncEval: string })
export type CmdShowMouse = CmdBase & { Cmd: CmdTypes.ShowMouse }
export type CmdWaitForSelector = CmdBase & { Cmd: CmdTypes.WaitForSelector, Selector: string, Options?: puppeteer.WaitForSelectorOptions }
export type CmdExistsSelector = CmdBase & { Cmd: CmdTypes.ExistsSelector, Key: string, Selector: string, Options?: { timeout: number }, Json?: ICmd[] }
export type CmdNotExistsSelector = CmdBase & { Cmd: CmdTypes.NotExistsSelector, Key: string, Selector: string, Options?: { timeout: number }, Json?: ICmd[] }
export type CmdLoop = CmdBase & { Cmd: CmdTypes.Loop, Json: ICmd[] }
   & ({ Key: string } | { Value: string } | { SyncEval: string } | { AsyncEval: string })
export type CmdRandom = CmdBase & { Cmd: CmdTypes.Random, Key: string, Options: { min: string, max: string } }
export type CmdElementCount = CmdBase & { Cmd: CmdTypes.ElementCount, Key: string, Selector: string }
export type CmdCondition = CmdBase & { Cmd: CmdTypes.Condition, Conditions: ICondition[] }
export type CmdSub = CmdBase & { Cmd: CmdTypes.Sub, Json: ICmd[] }
   & ({ Key: string } | { Value: string } | { SyncEval: string } | { AsyncEval: string })
export type CmdCall = CmdBase & { Cmd: CmdTypes.Call }
   & (({ Key: string } | { Value: string } | { SyncEval: string } | { AsyncEval: string })
      | { Json: ICmd[] })
export type CmdIf = CmdBase & { Cmd: CmdTypes.If, Json: ICmd[] }
   & ({ SyncEval: string } | { AsyncEval: string })
export type CmdFinally = CmdBase & { Cmd: CmdTypes.Finally, Json: ICmd[] }

export type CmdALL = { Cmd: CmdTypes, Selector?: string, Index?: string, Key?: string, Value?: string, SyncEval?: string, AsyncEval?: string, Json?: ICmd[] }

export type ICmd = CmdBootPuppeteer | CmdCreateMultilogin | CmdBootMultilogin | CmdRemoveMultilogin
   | CmdNavigation | CmdNewPage | CmdAlwaysPage | CmdReloadPage
   | CmdClosePage | CmdShutdown | CmdSetHeader | CmdSetTimeout
   | CmdScreenshot | CmdCheckZoom | CmdGetURL
   | CmdHover | CmdClick | CmdDBClick | CmdThreeClick
   | CmdType | CmdSelect | CmdPageEval
   | CmdFilterRequest | CmdWaitForNavigation | CmdWait | CmdWaitRand
   | CmdTextContent | CmdOuterHTML | CmdHttpGet | CmdVar | CmdLog
   | CmdJs | CmdThrow | CmdContinue | CmdBreak | CmdShowMouse
   | CmdWaitForSelector | CmdExistsSelector | CmdNotExistsSelector
   | CmdLoop | CmdRandom | CmdElementCount | CmdCondition
   | CmdSub | CmdCall | CmdIf | CmdFinally
