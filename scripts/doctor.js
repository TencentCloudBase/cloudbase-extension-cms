const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

async function run() {
  // 检查是否安装 CLI
  const tcbInstall = spawnSync('tcb', ['--version'])

  if (tcbInstall.error) {
    throw '你还没安装 CloudBase CLI 工具，请执行 npm i -g @cloudbase/cli 安装 CLI 工具'
  }

  // 检查是否登录
  const tcbLogin = spawnSync('tcb', ['env:list'])
  if (tcbLogin.error) {
    throw '你的 CloudBase CLI 工具还没有登录腾讯云账号，请执行 tcb login 登录'
  }

  // 检查配置文件
  const configExits = fs.existsSync(path.join(__dirname, '../.env.local'))
  if (!configExits) {
    throw '配置文件 .env.local 不存在，请参考 .env.example 配置 .env.local 文件'
  }

  console.log('检查通过')
}

run().catch((e) => console.error(e))
