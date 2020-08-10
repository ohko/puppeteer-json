#!/usr/bin/env ts-node

import * as express from "express";
import * as bodyParser from 'body-parser';
import * as runtime from "./runtime/runtime";
import * as sample from "./runtime/sample";
import * as base from "./runtime/base";
import * as WebSocket from "ws";
import * as fs from "fs";
import * as path from "path";
const _package = require("./package.json");

const app = express();
const port = process.env.PORT || 8080;
const wssport = Number(process.env.WSSPORT || 8081);
let RequestTimeout = parseInt(process.env.TIMEOUT) || 120000;


console.log("WSS Listen:", wssport)
const wss = new WebSocket.Server({ port: wssport });
wss.on('connection', (ws) => {
  const run = new runtime.Runtime()
  ws.on('message', async (message) => {
    console.log('cmd: %s', message);
    const json = JSON.parse(<string>message)
    const result = await runCmds(run, json)
    ws.send(JSON.stringify(result))
  });

  ws.on('close', async (message) => {
    run.Close()
  });

  ws.send('hello');
});

app.use(function (req, res, next) {
  res.setTimeout(RequestTimeout, function () {
    console.log('Request has timed out.');
    res.sendStatus(408);
  });
  next();
});
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use("/", express.static("./public"))

app.get("/demo.json", async (req, res) => {
  res.send(JSON.stringify(sample.Sample))
});

app.post("/run", async (req, res) => {
  const json = req.body;
  if (json.Timeout) res.setTimeout(json.Timeout)

  const run = new runtime.Runtime()
  const result = await runCmds(run, json.Task)
  run.Close()
  if (res.writableEnded) return // 避免超时后还继续输出
  res.json(result)
});

app.get("/version", async (req, res) => {
  return res.send(_package.version);
});

app.get("/timeout", async (req, res) => {
  const timeout = parseInt(req.query.timeout);
  if (timeout) RequestTimeout = timeout
  return res.send(String(RequestTimeout));
});

app.get("/download", async (req, res) => {
  const prefix = './download/';
  const fileName =  req.query.fileName;
  const Path = prefix + fileName;

  let filepath = path.resolve(__dirname, Path);

  fs.readFile(filepath, (err, data) => {
    if (err) {
      console.log('err....', err);

      res.writeHead(404, {
        'content-type': 'text/html; charset=utf-8',
      });
      res.end('文件未找到');
      return;
    }
    res.writeHead(200, {
      'Content-Disposition': 'attachment; filename=' + fileName,
      'content-type': 'application/pdf',
    });
    fs.createReadStream(filepath).pipe(res);
  });
})

app.listen(port, () => {
  console.log("DEBUG:", process.env.DEBUG ? true : false)
  console.log("Request Timeout:", RequestTimeout)
  console.log(`Example app listening on port ${port}!`)
});

const runCmds = async (run: runtime.Runtime, cmds: any) => {
  let no: Number = 0, data: any = "SUCCESS", result: base.IResult;
  // const run = new runtime.Runtime()
  try {
    await run.AsyncStart(cmds)
  } catch (e) {
    no = 1, data = e.message
  } finally {
    result = run.SyncGetResult()
    return {
      No: no,
      Data: (typeof data == "string" ? data : JSON.stringify([data])),
      DB: result.DB,
      Logs: result.Logs,
      Screenshots: result.Screenshots,
      Origin: JSON.stringify(cmds)
    }
  }
}