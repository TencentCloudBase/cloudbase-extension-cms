#!/bin/bash

# 根路径
__ABS_PATH__="$(pwd)"

# 拷贝静态托管网站
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
  zip -r $DEST_FILE . -x 'node_modules/*' -x '.DS_Store' -x src
  cd -
}

zipFunction service
zipFunction cms-init
