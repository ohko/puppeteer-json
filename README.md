# docker
```
docker pull ohko/scriptauto
docker rm -fv scriptauto
docker run -d --name=scriptauto --restart=always -p 127.0.0.1:5500:8080 ohko/scriptauto
```

# install
```
yarn install
```

# test cli
```
npm run test
# or
ts-node test.ts
```

# run server
```
npm run start
# or
ts-node server.js
```

# run chromium
```
./node_modules/puppeteer/.local-chromium/mac-674921/chrome-mac/Chromium.app/Contents/MacOS/Chromium --remote-debugging-port=9222 --proxy-server=socks5://127.0.0.1:1080 --user-data-dir=/tmp/user1
```

# run chrome
```
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/user-a
```

# 数据结构

## 提交数据
```json
{
   "Timeout": 600000, // HTTP请求最大超时时间
   "Task": {
      "Comment": "配置描述说明",
      "Json": [
         { "Cmd": "cmd1", "Comment": "说明", ...},
         { "Cmd": "cmd1", "Comment": "说明", ...},
         ...
      ],
      "DB": {
         "key1": "value",
         "key2": "value"
      }
   }
}
```

## 返回结果
```json
{
  "No": 0, // 0=无错 / 1=有错
  "Data": "SUCCESS", // SUCCESS / 错误信息
  "DB": { // 数据库
    "key1": "value",
    "key2": "value",
  },
  "Logs": [ // 日志
    "[2020-02-15T04:12:50.390Z]bootPuppeteer 启动Puppeteer",
    "[2020-02-15T04:12:50.399Z]ws ",
    "[2020-02-15T04:12:50.553Z]newPage 创建新页面",
  ],
  "Origin": {} // 原始提交数据
}
```