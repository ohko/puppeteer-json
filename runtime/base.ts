import * as puppeteer from "puppeteer";

const width = 1920, height = 1080;

export interface ICmd {
   Cmd?: string;
   Val?: string;
   Selector?: string;
   Options?: Object;
   Comment?: string;
}

export interface IData {
   Comment?: string;
   Json: ICmd[];
   DB: Object;
}

export class Base {
   protected browser: puppeteer.Browser;
   protected page: puppeteer.Page;
   protected db: {};
   protected logs = [];

   constructor() { }

   protected async log(...data: any[]) {
      this.logs.push("[" + (new Date()).toISOString() + "]" + data.join(" "))
   }
}