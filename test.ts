#!/usr/bin/env ts-node

import * as runtime from "./runtime/runtime";
import * as sample from "./runtime/sample";

(async _ => {

   try {
      const run = new runtime.Runtime()
      await run.AsyncStart(sample.Sample)
      const result = run.SyncGetResult()
      console.log("RESULT:", { no: 0, data: result, origin: JSON.stringify(sample.Sample) })
   } catch (e) {
      console.log("RESULT:", { no: 1, data: e.message, origin: JSON.stringify(sample.Sample) })
   }

   process.exit()
})();
