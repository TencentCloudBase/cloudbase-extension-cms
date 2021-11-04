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
  // 部署小程序模型
  async deploySchema(context) {
    const { isMpEnv } = context
    // 仅微信环境下创建活动 schema
    if (!isMpEnv) {
      return
    }

    // 添加 schema
    await addSchema(ActivitySchema, context)
    await addSchema(TaskSchema, context)

    // 保存 AppID
    await saveMiniAppID(context)
  },
  // 部署更新 sms 跳转页面
  async deploySmsPage(context) {
    const { isMpEnv } = context

    // 仅微信环境下部署 sms 页面
    if (!isMpEnv) {
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
    const activityPath = process.env.TCB_CMS ? 'tcb-cms-activities' : 'cms-activities'
    await deployHostingFile(manager, '/tmp/sms-dist', `/${activityPath}`)

    console.log('====> 部署 SMS 跳转页面 <=====')
  },
  // 更新安全规则配置
  async updateSecurityRules(context) {
    const { isMpEnv } = context

    // 仅微信环境下部署 sms 页面
    if (!isMpEnv) {
      return
    }

    // 更新安全规则
    const { manager, config } = context
    const { envId } = config

    try {
      // 查询安全规则
      let { Rule } = await manager.commonService().call({
        Action: 'DescribeSecurityRule',
        Param: {
          EnvId: envId,
          OnlyTag: false,
          ResourceName: envId,
          ResourceType: 'FUNCTION',
        },
      })

      console.log(Rule)

      // rule 为 json5 字符串
      Rule = JSON.parse(Rule)

      // 设置 sms 函数为免登录调用
      Rule[`${process.env.CMS_RESOURCE_PREFIX || 'tcb-ext-cms'}-openapi`] = {
        invoke: true,
      }

      // 修改安全规则
      await manager.commonService().call({
        Action: 'ModifySecurityRule',
        Param: {
          EnvId: envId,
          AclTag: 'CUSTOM',
          ResourceName: envId,
          ResourceType: 'FUNCTION',
          Rule: JSON.stringify(Rule),
        },
      })
    } catch (error) {
      console.log('更新安全规则', error)
    }
  },
}

// 添加营销工具 schema
async function addSchema(schema, context) {
  // 添加 schema
  const { manager, db } = context
  const resourcePrefix = process.env.CMS_RESOURCE_PREFIX || 'tcb-ext-cms'

  const schemaCollectionName = `${resourcePrefix}-schemas`

  await manager.database.createCollectionIfNotExists(schemaCollectionName)
  const {
    data: [record],
  } = await db
    .collection(schemaCollectionName)
    .where({
      collectionName: schema.collectionName,
    })
    .get()

  if (record) {
    // 删除 schema 的
    delete schema._id
    // 记录存在，更新
    await db.collection(schemaCollectionName).doc(record._id).update(schema)
  } else {
    // 记录不存在，添加
    await db.collection(schemaCollectionName).add(schema)
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
  let { config, accessDomain = '', mpAppID, isMpEnv } = context
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
    envId: '${envId}',
    `

  // 微信小程序，拼接更多信息
  console.log('微信 AppID', mpAppID, process.env.WX_MP)
  if (process.env.WX_MP) {
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

    configFileContent += `cloudAccessPath: '${accessDomain || DefaultDomain}/wx-ext-cms-service',
    containerAccessPath: '${accessDomain || DefaultDomain}/wx-ext-cms-service-container',
    cmsTitle: '内容管理（CMS）',
    cmsLogo: './icon-wx.svg',
    cmsDocLink: '${docLink}',
    cmsHelpLink: '${helpLink}',
    officialSiteLink: '${officialSiteLink}',
    appName: '微信小程序云开发',`
  } else {
    configFileContent += `cloudAccessPath: '${accessDomain || DefaultDomain}/tcb-ext-cms-service',
    containerAccessPath: '${accessDomain || DefaultDomain}/tcb-ext-cms-service-container',`
  }

  // 是否为小程序的环境
  if (isMpEnv) {
    configFileContent += `mpAppID: '${mpAppID || ''}',
    isMpEnv: true,`
  }

  // 低码配置
  if (process.env.FROM_LOWCODE) {
    configFileContent += `fromLowCode: true,
    groups: [
      {
        key: 'default',
        title: '我的应用',
      },
      {
        key: 'datasource',
        title: '我的数据源',
      },
    ]`
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
    retryCount: 5
  })
}
