import * as puppeteer from "puppeteer";

export interface IData {
   Comment?: string; // 说明
   Json: ICmd[]; // 指令配置
   DB: Object; // 数据
}

export interface ICmd {
   Cmd: string; // 操作指令
   Key?: string; // 数据DB的Key, 从DB数据中读取
   Value?: string; // 操作值
   Selector?: string; // 页面selector选择器
   Index?: string; // selector选择器的索引
   Options?: Object; // 指令参数
   Comment?: string; // 指令说明
   WaitNav?: boolean; // 是否是会产生跳转，这个会产生一个等待页面加载完成的操作
   Conditions?: ICondition[]; // 分支
   Json?: ICmd[]; // loop循环子指令
}

export interface ICondition {
   Condition: string; // 条件
   Json: ICmd[]; // 指令配置
}
export interface IResult {
   DB: Object; // 数据
   Logs: any[]; // 日志
   Screenshot: string; // base64截图
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

   protected db: {}; // 数据对象
   protected logs = []; // 日志
   protected screenshot = ""; // base64截图数据

   // puppeteer / multilogin 判断
   protected isPuppeteer: boolean = false;
   protected isMultilogin: boolean = false;

   // 指令相关
   protected cmds: Object; // 子操作集
   protected finally: ICmd[][]; // 最后清理指令

   // 用户输入操作随机等待时间：hover/click/input/select...
   protected userInputWaitMin = 500
   protected userInputWaitMax = 1000;

   // multilogin默认配置
   protected multiloginProfileId = "profileId"

   constructor() { }

   // 记录日志
   protected async log(...data: any[]) {
      if (process.env.DEBUG) console.log(data.join(" "))
      this.logs.push("[" + (new Date()).toISOString() + "]" + data.join(" "))
   }
}
