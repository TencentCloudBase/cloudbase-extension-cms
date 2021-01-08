/* eslint-disable */
const fs = require('fs')
const util = require('util')
const path = require('path')
const writeFile = util.promisify(fs.writeFile)
const exec = util.promisify(require('child_process').exec)
const pkg = require('../package.json')

module.exports = {
  // 部署静态资源
  async deployStatic(context) {
    const { deployPath = '/tcb-cms/', manager } = context
    const filterDeployPath = deployPath.replace(/^\//, '')

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
    await writeConfigJS(manager, filterDeployPath, context)

    console.log('====> 部署静态网站成功 <=====')
  },
}

// 写入配置信息
async function writeConfigJS(manager, dir, context) {
  let { config, accessDomain = '', mpAppID } = context
  const { envId } = config

  // 获取默认的自定义域名
  const { DefaultDomain } = await manager.commonService('tcb').call({
    Action: 'DescribeCloudBaseGWService',
    Param: {
      ServiceId: envId,
      EnableUnion: true,
    },
  })

  console.log('默认域名', DefaultDomain)

  accessDomain = accessDomain.replace('https://', '').replace('http://', '').replace(/\/$/, '')

  let configFileContent = `window.TcbCmsConfig = {
    version: '${pkg.version}',
    region: '${process.env.TENCENTCLOUD_REGION || 'ap-shanghai'}',
    history: 'hash',
    // 环境 Id
    envId: '${envId}',
    // 云接入默认域名/自定义域名，不带 https 协议符
    // https://console.cloud.tencent.com/tcb/env/access
    cloudAccessPath: '${accessDomain || DefaultDomain}/tcb-ext-cms-service',
    containerAccessPath: '${accessDomain || DefaultDomain}/tcb-ext-cms-service-container',`

  // 微信小程序，拼接更多信息
  console.log('微信 AppID', mpAppID, process.env.WX_MP)
  if (mpAppID || process.env.WX_MP) {
    // 文档链接
    const docLink =
      process.env.CMS_DOC_LINK ||
      'https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/extensions/cms/introduction.html'
    // 反馈链接
    const helpLink =
      process.env.CMS_HELP_LINK ||
      'https://developers.weixin.qq.com/community/minihome/mixflow/1286298401038155776'

    const officialSiteLink =
      process.env.CMS_OFFICIALSITE_LINK || 'https://mp.weixin.qq.com/cgi-bin/wx'

    configFileContent += `mpAppID: '${mpAppID}',
    cmsTitle: '内容管理（CMS）',
    cmsLogo: './icon-wx.svg',
    cmsDocLink: '${docLink}',
    cmsHelpLink: '${helpLink}',
    officialSiteLink: '${officialSiteLink}',
    appName: '微信小程序云开发',`
  }

  configFileContent += `}`

  await writeFile('/tmp/config.js', configFileContent)

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
