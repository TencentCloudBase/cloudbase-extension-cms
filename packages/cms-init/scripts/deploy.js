/* eslint-disable */
const fs = require('fs')
const util = require('util')
const path = require('path')
const writeFile = util.promisify(fs.writeFile)
const exec = util.promisify(require('child_process').exec)

module.exports = {
  // 部署静态资源
  async deployStatic(context) {
    const { config, deployPath = '/tcb-cms/', manager, accessDomain = '' } = context
    const filterDeployPath = deployPath.replace(/^\//, '')
    const { envId } = config

    try {
      await exec('cp -r build /tmp')
    } catch (e) {
      // ignore error
    }

    // 同步静态网站
    if (fs.existsSync('build')) {
      console.log('====> 部署网站文件 <====')
      await deployHostingFile(manager, '/tmp/build', filterDeployPath)
    }

    // 写入静态网站配置
    await writeConfigJS(manager, envId, accessDomain, filterDeployPath)
  },
}

// 写入配置信息
async function writeConfigJS(manager, envId, accessDomain, dir) {
  // 获取默认的自定义域名
  const { DefaultDomain } = await manager.access.getDomainList()

  accessDomain = accessDomain.replace('https://', '').replace('http://', '').replace(/\/$/, '')

  await writeFile(
    '/tmp/config.js',
    `window.TcbCmsConfig = {
    history: 'hash',
    // 环境 Id
    envId: '${envId}',
    // 云接入默认域名/自定义域名，不带 https 协议符
    // https://console.cloud.tencent.com/tcb/env/access
    cloudAccessPath: '${accessDomain || DefaultDomain}/tcb-ext-cms-service',
}`
  )

  return deployHostingFile(manager, '/tmp/config.js', path.join(dir, 'config.js'))
}

// 部署 Hosting 文件
async function deployHostingFile(manager, srcPath, cloudPath) {
  return manager.hosting.uploadFiles({
    localPath: srcPath,
    cloudPath: cloudPath,
    ignore: ['.DS_Store'],
  })
}
