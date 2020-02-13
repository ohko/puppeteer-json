#!/bin/sh

Xvfb :99 -screen 0 1920x1080x24 -dpi 96 -ac +extension RANDR & ts-node server.ts