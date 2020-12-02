#!/bin/bash

echo $JOB_ID;

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
