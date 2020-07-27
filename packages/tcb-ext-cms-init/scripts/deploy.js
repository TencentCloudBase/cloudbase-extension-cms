const fs = require('fs')
const util = require('util')
const path = require('path')
const writeFile = util.promisify(fs.writeFile)
const exec = util.promisify(require('child_process').exec)

module.exports = {
  // 部署静态资源
  async deployStatic(context) {
    const { config, deployPath, manager } = context
    const filterDeployPath = deployPath.replace(/^\//, '')
    const { envId } = config
    try {
      await exec('cp -r build /tmp')
    } catch (e) {}

    // 写入静态网站配置
    await writeConfigJSON(manager, envId, filterDeployPath)
    // 同步静态网站
    return deployHostingFile(manager, '/tmp/build', filterDeployPath)
  }
}

// 写入配置信息
async function writeConfigJSON(manager, envId, dir) {
  await writeFile(
    '/tmp/config.json',
    JSON.stringify({
      envId
    })
  )

  return deployHostingFile(manager, '/tmp/config.json', path.join(dir, 'config.json'))
}

// 部署 Hosting 文件
async function deployHostingFile(manager, srcPath, cloudPath) {
  return manager.hosting.uploadFiles({
    localPath: srcPath,
    cloudPath: cloudPath,
    ignore: ['.DS_Store']
  })
}
