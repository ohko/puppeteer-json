#!/usr/bin/env ts-node

import * as express from "express";
import * as bodyParser from 'body-parser';
import * as runtime from "./runtime/runtime";
import * as sample from "./runtime/sample";

const app = express();
const port = process.env.PORT || 8080;
let RequestTimeout = parseInt(process.env.TIMEOUT) || 120000;

app.use(function (req, res, next) {
  res.setTimeout(RequestTimeout, function () {
    console.log('Request has timed out.');
    res.send(408);
  });
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", express.static("./public"))

app.get("/demo.json", async (req, res) => {
  res.send(JSON.stringify(sample.Sample))
});

app.post("/run", async (req, res) => {
  const json = req.body;
  if (json.Timeout) res.setTimeout(json.Timeout)
  const run = new runtime.Runtime()
  try {
    await run.AsyncStart(JSON.parse(json.Task))
    const result = run.SyncGetResult()
    return res.json({ No: 0, Data: result, Origin: json });
  } catch (e) {
    return res.json({ No: 1, Data: e.message, Origin: json });
  }
});

app.get("/timeout", async (req, res) => {
  const timeout = parseInt(req.query.timeout);
  if (timeout) RequestTimeout = timeout
  return res.send(String(RequestTimeout));
});

app.listen(port, () => {
  console.log("DEBUG:", process.env.DEBUG ? true : false)
  console.log("Request Timeout:", RequestTimeout)
  console.log(`Example app listening on port ${port}!`)
});

