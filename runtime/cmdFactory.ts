/*
* 命令工厂函数，将所有命令简化为 方法的形式出现。使编辑脚本更方便。
* 使用方法在脚本编写和公共模块提取上会更灵活。
*
* @date 2020年8月26日15点08分
* @author fanxuejiao
**/
import * as base from "./base";
import * as puppeteer from "puppeteer";

export const _log = (comment: string, synceval: string): base.ICmd => ({ Cmd: base.CmdTypes.Log, Comment: comment, SyncEval: synceval});
export const _click = (comment: string, selector: string, index?: number|string, waitNav: boolean = false): base.ICmd => ({ Cmd: base.CmdTypes.Click, Comment: comment, Selector: selector, Index:JSON.stringify(index), WaitNav:waitNav });
export const _frameClick = (comment: string, FrameName:string, PopupSelect:string, selector: string,  index?: number|string, waitNav: boolean = false, Options?:Object): base.ICmd => ({ Cmd: base.CmdTypes.FrameClick, PopupSelect, FrameName, Options, Comment: comment, Selector: selector, Index:JSON.stringify(index), WaitNav:waitNav });
export const _tap = (comment: string, selector: string, index?: number|string): base.ICmd => ({ Cmd: base.CmdTypes.Tap, Comment: comment, Selector: selector, Index:JSON.stringify(index)});
export const _clickText = (comment: string, selector: string, key: string):base.ICmd => ({Cmd: base.CmdTypes.ClickText, Comment: comment, Selector: selector, Key: key});
export const _navigation = (comment: string, key: string, option?:object):base.ICmd => ({Cmd:base.CmdTypes.Navation, Comment:comment, Key: key, Options: option});
export const _js = (comment: string, asyncEval: string):base.ICmd => ({Cmd: base.CmdTypes.Js, Comment: comment, AsyncEval: asyncEval});
export const _pageEval = (comment: string, value: string):base.ICmd => ({Cmd: base.CmdTypes.PageEval, Comment: comment, Value: value});
export const _type = (Comment: string, Selector:string, Key: string, Index?: number|string) : base.ICmd => ({Cmd: base.CmdTypes.Type, Comment, Selector, Key, Index: JSON.stringify(Index)});
export const _var = (Comment: string, Key: string, SyncEval: string): base.ICmd => ({Cmd:base.CmdTypes.Var, Comment, Key, SyncEval});
export const _random = (Key: string, min: number, max: number): base.ICmd => ({Cmd: base.CmdTypes.Random, Key, Comment: `产生一个${min}到${max}的随机数。`, Options: {min:JSON.stringify(min), max:JSON.stringify(max)}});
export const _reloadPage = ():base.ICmd => ({Cmd: base.CmdTypes.ReloadPage, Comment: "刷新界面。"});
export const _return = (Comment: string, SyncEval: string) :base.ICmd => ({Cmd:base.CmdTypes.Return, Comment, SyncEval});
export const _finally = (Comment: string, cmds: base.ICmd[]):base.ICmd => ({Cmd:base.CmdTypes.Finally, Comment, Json: cmds});
export const _closePage = ():base.ICmd => ({Cmd: base.CmdTypes.ClosePage, Comment: "关闭当前页面。"});
export const _alwaysPage = (Comment: string):base.ICmd => ({Cmd: base.CmdTypes.AlwaysPage, Comment});
export const _bootMultilogin = (Key:string):base.ICmd => ({Cmd: base.CmdTypes.BootMultilogin, Comment: "启动Multilogin", Key});
export const _bootPuppeteer = (Options:puppeteer.LaunchOptions):base.ICmd => ({Cmd: base.CmdTypes.BootPuppeteer, Comment: "启动Puppeteer", Options});
export const _break = (Comment:string, SyncEval:string):base.ICmd => ({Cmd: base.CmdTypes.Break, Comment, SyncEval});
export const _call = (Comment:string, Value: string):base.ICmd => ({Cmd: base.CmdTypes.Call, Comment, Value});
export const _checkZoom = ():base.ICmd => ({Cmd: base.CmdTypes.CheckZoom, Comment: "检查页面是否被缩放。"});
export const _condition = (Comment: string, Conditions: base.ICondition[]):base.ICmd => ({Cmd: base.CmdTypes.Condition, Comment, Conditions});
export const _conditionItem = (Comment: string, Condition:string, cmds:base.ICmd[]):base.ICondition => ({Comment, Condition, Json: cmds});
export const _continue = (Comment: string, SyncEval:string):base.ICmd => ({Cmd: base.CmdTypes.Continue, Comment, SyncEval});
export const _createMultilogin = (Comment: string, Key:string):base.ICmd => ({Cmd: base.CmdTypes.CreateMultilogin, Comment, Key});
export const _dbClick = (Comment: string, Selector: string, Index?:number|string, WaitNav?:boolean):base.ICmd => ({Cmd:base.CmdTypes.DBClick, Comment, Selector, Index: JSON.stringify(Index), WaitNav});
export const _elementCount = (Comment: string, Key: string, Selector: string):base.ICmd => ({Cmd: base.CmdTypes.ElementCount, Selector, Key, Comment});
export const _existsSelector = (Comment: string, Selector: string, cmds:base.ICmd[]) :base.ICmd => ({Cmd:base.CmdTypes.ExistsSelector, Comment, Selector, Json: cmds});
export const _filterRequest = (Comment: string, SyncEval: string):base.ICmd => ({Cmd:base.CmdTypes.FilterRequest, Comment, SyncEval});
export const _getURL = (Comment:string, Key:string):base.ICmd => ({Cmd: base.CmdTypes.GetURL, Comment, Key});
export const _hover = (Comment: string, Selector:string, Index?:number|string):base.ICmd => ({Cmd: base.CmdTypes.Hover, Comment, Selector, Index: JSON.stringify(Index)});
export const _popupHover = (Comment: string, Selector:string, PopupSelect: string, Index?:number|string):base.ICmd => ({Cmd: base.CmdTypes.PopupHover, Comment, PopupSelect, Selector, Index: JSON.stringify(Index)});
export const _httpGet = (Comment: string, Key: string, Value: string):base.ICmd => ({Cmd: base.CmdTypes.HttpGet, Comment, Key, Value});
export const _if = (Comment: string, SyncEval: string, cmds:base.ICmd[]):base.ICmd => ({Cmd: base.CmdTypes.If, Comment, SyncEval, Json: cmds});
export const _jumpOut = (Comment: string, SyncEval: string):base.ICmd => ({Cmd: base.CmdTypes.JumpOut, Comment, SyncEval});
export const _loop = (Comment: string, Key:string, cmds:base.ICmd[]):base.ICmd => ({Cmd: base.CmdTypes.Loop, Comment, Key, Json: cmds});
export const _newPage = (Comment: string):base.ICmd => ({Cmd: base.CmdTypes.NewPage, Comment});
export const _notExistsSelector = (Comment: string, Selector: string, cmds: base.ICmd[]):base.ICmd => ({Cmd: base.CmdTypes.NotExistsSelector, Comment, Selector, Json: cmds});
export const _outerHTML = (Comment: string, Selector: string, Key: string, Index?:number|string):base.ICmd => ({Cmd: base.CmdTypes.OuterHTML, Comment, Selector, Key, Index: JSON.stringify(Index)});
export const _screenshot = (Comment: string, Value: string, Selector:string, Option?: puppeteer.Base64ScreenShotOptions, Index?:number|string):base.ICmd => ({Cmd: base.CmdTypes.Screenshot, Comment, Selector, Value, Index: JSON.stringify(Index)});
export const _screenshotBase64 = (Comment: string, Value: string, Selector:string, Option?: puppeteer.Base64ScreenShotOptions, Index?:number|string):base.ICmd => ({Cmd: base.CmdTypes.ScreenshotBase64, Comment, Selector, Value, Index: JSON.stringify(Index)});
export const _select = (Comment: string, Selector: string, Key: string, Index?:number|string):base.ICmd => ({Cmd: base.CmdTypes.Select, Selector, Key, Comment, Index:JSON.stringify(Index)});
export const _setHeader = (Comment: string, Options: puppeteer.Headers):base.ICmd => ({Cmd: base.CmdTypes.SetHeader, Comment, Options});
export const _setTimeout = (Comment: string, Key: string) :base.ICmd => ({Cmd: base.CmdTypes.SetTimeout, Comment, Key});
export const _shareMultilogin = (Comment: string, Key: string, Value: string) :base.ICmd => ({Cmd: base.CmdTypes.ShareMultilogin, Comment, Key, Value});
export const _showMouse = () :base.ICmd => ({Cmd: base.CmdTypes.ShowMouse, Comment: "显示鼠标。"});
export const _shutdown = () :base.ICmd => ({Cmd: base.CmdTypes.Shutdown, Comment: "关闭程序。"});
export const _sub = (Comment: string, Value: string, cmds:base.ICmd[]) :base.ICmd => ({Cmd: base.CmdTypes.Sub, Comment, Value, Json: cmds});
export const _textContent = (Comment: string, Key: string, Selector:string, Index?:number|string) :base.ICmd => ({Cmd: base.CmdTypes.TextContent, Comment, Key, Selector, Index:JSON.stringify(Index)});
export const _threeClick = (Comment: string, Selector:string, Index?:number|string, WaitNav?:boolean) :base.ICmd => ({Cmd: base.CmdTypes.ThreeClick, Comment, Selector, Index:JSON.stringify(Index), WaitNav});
export const _throw = (Comment: string, SyncEval: string) :base.ICmd => ({Cmd: base.CmdTypes.Throw, Comment,SyncEval});
export const _wait = (Comment: string, Value: string) :base.ICmd => ({Cmd: base.CmdTypes.Wait, Comment,Value});
export const _waitwaitForNavigation = (Comment: string) :base.ICmd => ({Cmd: base.CmdTypes.WaitForNavigation, Comment});
export const _waitForSelector = (Comment: string, Selector: string, Options?: puppeteer.WaitForSelectorOptions) :base.ICmd => ({Cmd: base.CmdTypes.WaitForSelector, Comment, Selector, Options});
export const _waitKey = (Comment: string, Key: string) :base.ICmd => ({Cmd: base.CmdTypes.WaitForKey, Comment, Key});
export const _pressKeyBoard = (Comment: string, Key: string): base.ICmd => ({Cmd: base.CmdTypes.Keyboard, Key, Comment});
export const _pdf = (Comment: string, Name: string, Options?:puppeteer.PDFOptions): base.ICmd => ({Cmd: base.CmdTypes.Pdf, Comment, Name, Options});
export const _frameHover = (Comment: string, FrameName: string, Selector:string, Index?:number|string): base.ICmd => ({Cmd: base.CmdTypes.FrameHover, FrameName, Comment, Index:JSON.stringify(Index), Selector});
export const _framePopupHover = (Comment: string, FrameName: string, Selector:string, PopupSelect: string, Index?:number|string): base.ICmd => ({Cmd: base.CmdTypes.FramePopupHover, FrameName, PopupSelect, Comment, Index:JSON.stringify(Index), Selector});
export const _try = (Comment: string, Key: string, cmds:base.ICmd[]):base.ICmd => ({Cmd:base.CmdTypes.Try, Comment, Key, Json: cmds});


/**
 * _switch("看起来很像switch，不是吗。", "num", [<br>
 * &nbsp;&nbsp;&nbsp;&nbsp;_case("如果num是1", "num===1", [_log("打印", "num")]),<br>
 * &nbsp;&nbsp;&nbsp;&nbsp;_case("如果num是2", "num==2", [_log("正确", "num")]),<br>
 * &nbsp;&nbsp;&nbsp;&nbsp;_case("如果num是-1", "num==-1", [_log("错误", "num")])<br>
 * ]);<br>
 *<br>
 * @param Key
 * @param Cases
 * @author fanxuejiao
 * @date 2020年8月27日10点30分
 */
export const _switch = (Comment: string, Key:string, Cases: base.ICondition[]):base.ICmd => {return _condition(Comment, [...Cases]);}
/**
 * 同 _conditionItem
 * @param Comment
 * @param Condition
 * @param cmds
 * @author fanxuejiao
 * @date 2020年8月27日10点30分
 */
export const _case = (Comment: string, Condition:string, cmds:base.ICmd[]):base.ICondition => ({Comment, Condition, Json: cmds});



