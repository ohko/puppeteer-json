#!/usr/bin/env ts-node

import * as runtime from "./runtime/runtime";
import * as sample from "./runtime/sample";

(async _ => {

   await (async _ => {
      const run = new runtime.Runtime()
      await run.AsyncStart(sample.Sample)
      console.log("RESULT:", run.SyncGetResult())
   })();

   process.exit()
})();
