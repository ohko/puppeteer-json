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