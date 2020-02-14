import * as puppeteer from "puppeteer";

const width = 1920, height = 1080;

export interface ICmd {
   Cmd: string; // 操作指令
   Data?: string; // 操作值，前面添加$符号表示从data数据中读写
   Selector?: string; // 页面selector选择器
   Options?: Object; // 指令参数
   Comment?: string; // 指令说明
   WaitNav?: boolean; // 是否是会产生跳转，这个会产生一个等待页面加载完成的操作
   Conditions?: ICondition[]; // 分支
}

export interface IData {
   Comment?: string; // 说明
   Json: ICmd[]; // 指令配置
   DB: Object; // 数据
}

export interface ICondition {
   Condition: string; // 条件
   Json: ICmd[]; // 指令配置
}

export class Base {
   protected browser: puppeteer.Browser;
   protected page: puppeteer.Page;
   protected db: {};
   protected logs = [];

   constructor() { }

   protected async log(...data: any[]) {
      console.log(data.join(" "))
      this.logs.push("[" + (new Date()).toISOString() + "]" + data.join(" "))
   }
}