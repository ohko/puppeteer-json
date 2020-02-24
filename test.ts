#!/usr/bin/env ts-node

import * as runtime from "./runtime/runtime";
import * as sample from "./runtime/sample";
import * as base from "./runtime/base";

(async _ => {

   let no: Number = 0, data: any = "SUCCESS", result: base.IResult;
   const run = new runtime.Runtime()
   try {
      await run.AsyncStart(sample.Sample)
   } catch (e) {
      no = 1, data = e.message
   } finally {
      result = run.SyncGetResult()
      if (result.Screenshot != "") result.Screenshot = result.Screenshot.substr(0, 50)
      for (let i in result.DB) {
         if (typeof result.DB[i] === "string" && result.DB[i].indexOf("data:image/") == 0) {
            result.DB[i] = result.DB[i].substr(0, 50)
         }
      }
      console.log("RESULT:", { No: no, Data: data, DB: result.DB, Logs: result.Logs, Screenshot: result.Screenshot, Origin: JSON.stringify(sample.Sample) })
   }

   process.exit()
})();
