# docker build -t ohko/puppeteer-chrome-linux .
# docker run --rm -it -p 8080:8080 ohko/puppeteer-chrome-linux
FROM node:12-slim

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
# RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
#   && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
#   && apt-get update \
#   && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont xvfb \
#   --no-install-recommends \
#   && rm -rf /var/lib/apt/lists/*
RUN apt-get update \
  && apt-get install --no-install-recommends -y xvfb \
  libxcomposite1 libxcursor1 libxi6 libxtst6 libglib2.0-0 libnss3 libnspr4 libcups2 libdbus-1-3 libxss1 libxrandr2 libasound2 libatk1.0-0 libatk-bridge2.0-0 libpangocairo-1.0-0 libpango-1.0-0 libgtk-3-0 \
  && rm -rf /var/lib/apt/lists/*

# If running Docker >= 1.13.0 use docker run's --init arg to reap zombie processes, otherwise
# uncomment the following lines to have `dumb-init` as PID 1
# ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
# RUN chmod +x /usr/local/bin/dumb-init
# ENTRYPOINT ["dumb-init", "--"]

# Uncomment to skip the chromium download when installing puppeteer. If you do,
# you'll need to launch puppeteer with:
#     browser.launch({executablePath: 'google-chrome-unstable'})
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install puppeteer so it's available in the container.
# RUN npm i puppeteer \
#     # Add user so we don't need --no-sandbox.
#     # same layer as npm install to keep re-chowned files from using up several hundred MBs more space
#     && groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
#     && mkdir -p /home/pptruser/Downloads \
#     && chown -R pptruser:pptruser /home/pptruser \
#     && chown -R pptruser:pptruser /node_modules

# Run everything after as non-privileged user.
# USER pptruser

# CMD ["google-chrome-unstable"]

RUN npm install -g typescript
RUN npm install -g ts-node

ENV DISPLAY :99
ENV PORT=8080
ENV TIMEOUT=120000
EXPOSE 8080

WORKDIR /app
COPY . /app
RUN npm install

# Start script on Xvfb
# CMD Xvfb :99 -screen 0 1920x1080x24 -dpi 96 -ac +extension RANDR & node server.js
CMD [ "/app/start.sh" ]