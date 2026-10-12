#!/bin/sh
# Copies the game in and builds dist/BronzeAndBlood-portable.exe
set -e;cd "$(dirname "$0")";mkdir -p app;cp ../index.html app/;npm install --no-audit --no-fund;npx electron-builder --win portable --x64
