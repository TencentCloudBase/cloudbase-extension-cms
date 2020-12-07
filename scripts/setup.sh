#!/bin/bash

echo $JOB_ID
echo "您当前正在使用云托管模式部署 CMS"
echo "如果你想继续使用云函数部署 CMS，请将 cloudbaserc-fx.json 文件重命名为 cloudbaserc.json 并替换现有的 cloudbaserc.json 文件，再运行 npm run deploy 命令"
echo ""

# 云端构建
if [ $JOB_ID ]; then
  # 安装依赖
  echo "云端构建，安装开发依赖"
  yarn
  echo "安装开发依赖完成"
  echo "安装项目依赖"
  npm run setup
  echo "安装项目依赖完成"
else
  echo "本地，跳过安装依赖"
fi

echo ""
