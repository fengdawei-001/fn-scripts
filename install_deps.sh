#!/bin/bash
# 在脚本所在目录安装 Node 依赖
cd "$(dirname "$0")"
rm -f package-lock.json
npm install --registry=https://registry.npmmirror.com --no-audit --no-fund --legacy-peer-deps
echo "=== install done ==="
