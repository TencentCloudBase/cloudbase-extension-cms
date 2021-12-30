#!/bin/bash

# 根路径
__ABS_PATH__="$(pwd)"

# 将静态托管网站 Build 的代码拷贝到 cms-init 函数中
# 使用 cms-init 函数上传
cd "$__ABS_PATH__/packages/cms-init"
rm -rf build
rm -rf sms-dist
mkdir build
mkdir sms-dist

cd -

# 拷贝管理端代码
cp -R ./packages/admin/dist/* ./packages/cms-init/build
# 拷贝 sms 跳转页代码
cp -R ./packages/cms-sms-page/dist/* ./packages/cms-init/sms-dist
# 添加到 service 服务
cp -R ./packages/cms-sms-page/dist/* ./packages/service/dist/modules/projects/operation/template

cd $__ABS_PATH__

# 打包函数代码
zipFunction() {
  echo "zip $1"
  cd "packages/$1"
  DEST_FILE="$__ABS_PATH__/build/$1.zip"

  rm -rf $DEST_FILE
  zip -r $DEST_FILE . -x 'node_modules/*' -x '.DS_Store' -x 'src/*' -x yarn.lock -x .env.local -x .env.wx.local
  cd -
}

zipFunction service
zipFunction cms-init
zipFunction cms-api
zipFunction cms-sms
zipFunction cms-openapi
zipFunction cms-fx-openapi

cd $__ABS_PATH__
rm -rf packages/cms-init/build
rm -rf packages/cms-init/sms-dist
