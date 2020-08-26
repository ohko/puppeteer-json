/*
* 命令工厂函数，将所有命令简化为 方法的形式出现。使编辑脚本更方便。
* 使用方法在脚本编写和公共模块提取上会更灵活。
*
* @date 2020年8月26日15点08分
* @author fanxuejiao
**/
import * as base from "./base";

export const _log = (comment: string, synceval: string): base.ICmd => ({ Cmd: base.CmdTypes.Log, Comment: comment, SyncEval: synceval});
export const _click = (comment: string, selector: string, index: number, waitNav: boolean = false): base.ICmd => ({ Cmd: base.CmdTypes.Click, Comment: comment, Selector: selector, Index:JSON.stringify(index), WaitNav:waitNav });
export const _clickText = (comment: string, selector: string, key: string):base.ICmd => ({Cmd: base.CmdTypes.ClickText, Comment: comment, Selector: selector, Key: key});
export const _navigation = (comment: string, key: string, option?:object):base.ICmd => ({Cmd:base.CmdTypes.Navation, Comment:comment, Key: key, Options: option});
export const _js = (comment: string, asyncEval: string):base.ICmd => ({Cmd: base.CmdTypes.Js, Comment: comment, AsyncEval: asyncEval});
export const _pageEval = (comment: string, value: string):base.ICmd => ({Cmd: base.CmdTypes.PageEval, Comment: comment, Value: value});
export const _type = (Comment: string, Selector:string, Key: string, Index?: number) : base.ICmd => ({Cmd: base.CmdTypes.Type, Comment, Selector, Key, Index: JSON.stringify(Index)});
export const _var = (Comment: string, Key: string, SyncEval: string): base.ICmd => ({Cmd:base.CmdTypes.Var, Comment, Key, SyncEval});
export const _random = (Key: string, min: number, max: number): base.ICmd => ({Cmd: base.CmdTypes.Random, Key, Comment: `产生${min}到${max}的随机数。`, Options: {min:JSON.stringify(min), max:JSON.stringify(max)}});
export const _reloadPage = ():base.ICmd => ({Cmd: base.CmdTypes.ReloadPage, Comment: "刷新界面。"});
export const _return = (Comment: string, SyncEval: string) :base.ICmd => ({Cmd:base.CmdTypes.Return, Comment, SyncEval});



