/* eslint-disable */
const fs = require('fs')
const util = require('util')
const path = require('path')
const writeFile = util.promisify(fs.writeFile)
const exec = util.promisify(require('child_process').exec)
const { ActivitySchema, TaskSchema } = require('./_schema')
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
  // 部署小程序
  async deploySchema(context) {
    // 仅微信环境下创建活动 schema
    if (!process.env.WX_MP) {
      return
    }

    // 添加 schema
    await addSchema(ActivitySchema, context)
    await addSchema(TaskSchema, context)

    // 添加活动
    await addDefaultActivity(context)

    // 保存 AppID
    await saveMiniAppID(context)
  },
  // 部署更新 sms 跳转页面
  async deploySmsPage(context) {
    // 仅微信环境下部署 sms 页面
    if (!process.env.WX_MP) {
      return
    }

    const { manager, db, config } = context

    const {
      data: [setting],
    } = await db.collection(config.settingCollectionName).where({}).get()

    // 未开通营销工具
    if (!setting || !setting.miniappName) return

    const { miniappName, miniappID, miniappOriginalID } = setting

    try {
      await exec('cp -r sms-dist /tmp')
    } catch (e) {
      // ignore error
    }

    // 替换内容
    let template = fs.readFileSync(path.join(__dirname, '../sms-dist/index.html')).toString()

    template = template
      .replace(/\{\{APPID\}\}/g, miniappID)
      .replace(/\{\{ENVID\}\}/g, config.envId)
      .replace(/\{\{APPNAME\}\}/g, miniappName)
      .replace(/\{\{APPORIGINALID\}\}/g, miniappOriginalID)

    // 写临时文件
    const writeFile = util.promisify(fs.writeFile)
    await writeFile(`/tmp/sms-dist/index.html`, template)

    // 部署 SMS 跳转页面
    console.log('====> 部署 SMS 跳转页面 <====')
    await deployHostingFile(manager, '/tmp/sms-dist', '/cms-activities')

    console.log('====> 部署 SMS 跳转页面 <=====')
  },
}

// 添加营销工具 schema
async function addSchema(schema, context) {
  // 添加 schema
  const { manager, db } = context

  await manager.database.createCollectionIfNotExists('wx-ext-cms-schemas')
  const {
    data: [record],
  } = await db
    .collection('wx-ext-cms-schemas')
    .where({
      collectionName: schema.collectionName,
    })
    .get()

  if (record) {
    // 删除 schema 的
    delete schema._id
    // 记录存在，更新
    await db.collection('wx-ext-cms-schemas').doc(record._id).update(schema)
  } else {
    // 记录不存在，添加
    await db.collection('wx-ext-cms-schemas').add(schema)
  }
}

// 添加默认活动
async function addDefaultActivity(context) {
  // 添加 schema
  const activityCollection = 'wx-ext-cms-sms-activities'
  const { manager, db } = context

  await manager.database.createCollectionIfNotExists(activityCollection)
  const {
    data: [record],
  } = await db.collection(activityCollection).where({}).get()

  // 添加默认活动
  if (!record) {
    const now = Date.now()
    await db.collection(activityCollection).add({
      activityName: '营销demo',
      endTime: 1893456000000,
      isActivityOpen: true,
      startTime: 1610353674000,
      _createTime: now,
      _updateTime: now,
    })
  }
}

// 保存 AppID
async function saveMiniAppID(context) {
  const { db, config, mpAppID } = context
  if (!mpAppID) return

  const {
    data: [setting],
  } = await db.collection(config.settingCollectionName).where({}).get()

  if (!setting) {
    await db.collection(config.settingCollectionName).add({
      miniappID: mpAppID,
    })
  } else {
    await db.collection(config.settingCollectionName).where({}).update({
      miniappID: mpAppID,
    })
  }
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
      EnableRegion: true,
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
