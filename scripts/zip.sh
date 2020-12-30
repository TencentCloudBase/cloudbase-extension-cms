#!/bin/bash

# 根路径
__ABS_PATH__="$(pwd)"

# 将静态托管网站 Build 的代码拷贝到 cms-init 函数中
# 使用 cms-init 函数上传
cd "$__ABS_PATH__/packages/cms-init"
rm -rf build
mkdir build

cd -

cp -R ./packages/admin/dist/* ./packages/cms-init/build

cd $__ABS_PATH__

# 打包函数代码
zipFunction() {
  echo "zip $1"
  cd "packages/$1"
  DEST_FILE="$__ABS_PATH__/build/$1.zip"

  rm -rf $DEST_FILE
  zip -r $DEST_FILE . -x 'node_modules/*' -x '.DS_Store' -x 'src/*' -x yarn.lock -x .env.local
  cd -
}

zipFunction service
zipFunction cms-init
zipFunction cms-api

cd $__ABS_PATH__
rm -rf packages/cms-init/build
