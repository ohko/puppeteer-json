#!/usr/bin/env ts-node

import * as runtime from "./runtime/runtime";
import * as sample from "./runtime/sample";
import * as base from "./runtime/base";

(async _ => {
   process.env.DEBUG = "1";
   let no: Number = 0, data: any = "SUCCESS", result: base.IResult;
   const run = new runtime.Runtime()
   try {
      await run.AsyncStart(sample.Sample)
   } catch (e) {
      no = 1, data = e.message
   } finally {
      result = run.SyncGetResult()
      for (let i in result.Screenshots) {
         result.Screenshots[i] = result.Screenshots[i].substr(0, 50);
      }
      console.log("RESULT:", {
         No: no,
         Data: (typeof data == "string" ? data : JSON.stringify([data])),
         DB: result.DB,
         // Logs: result.Logs,
         // Screenshot: result.Screenshots, Origin: JSON.stringify(sample.Sample)
      });
   }

   process.exit()
})();
