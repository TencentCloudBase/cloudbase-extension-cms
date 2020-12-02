#!/bin/bash

echo $JOB_ID;

# 云端构建
if [ $JOB_ID ]; then
  # 安装依赖
  echo "云端构建，安装依赖"
  # yarn
  # npm run setup
else
  echo "本地，跳过安装依赖"
fi
