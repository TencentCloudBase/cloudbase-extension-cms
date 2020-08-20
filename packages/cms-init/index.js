/* eslint-disable */
const CloudBase = require('@cloudbase/manager-node')
const cloudbase = require('@cloudbase/node-sdk')

const userJobs = require('./scripts/users')
const deployJobs = require('./scripts/deploy')
const migrateJobs = require('./scripts/migrate')

module.exports.main = async (event, context) => {
  const envId = context.namespace || process.env.SCF_NAMESPACE
  const app = cloudbase.init({
    env: envId,
  })

  const {
    // 管理员账号
    CMS_ADMIN_USER_NAME: administratorName,
    // 管理员密码
    CMS_ADMIN_PASS_WORD: administratorPassword,
    // 部署路径
    CMS_DEPLOY_PATH: deployPath,
    // 服务自定义域名
    ACCESS_DOMAIN: accessDomain,
  } = process.env

  const jobs = {
    // 创建管理员和运营者
    ...userJobs,
    // 部署静态网站
    ...deployJobs,
    // V1 迁移
    ...migrateJobs,
  }

  // 注入全局的上下文
  const ctx = {
    app,
    db: app.database(),
    manager: new CloudBase({
      secretId: process.env.TENCENTCLOUD_SECRETID,
      secretKey: process.env.TENCENTCLOUD_SECRETKEY,
      token: process.env.TENCENTCLOUD_SESSIONTOKEN,
      envId,
    }),
    config: {
      envId,
      contentsCollectionName: 'tcb-ext-cms-contents',
      usersCollectionName: 'tcb-ext-cms-users',
    },
    administratorName,
    administratorPassword,
    deployPath,
    accessDomain,
  }

  return runJobs(jobs, ctx)
}

// 并行执行所有子任务
async function runJobs(jobs, ctx) {
  return Promise.all(Object.entries(jobs).map(([, handler]) => runJob(handler, ctx)))
}

// 执行单个子任务
async function runJob(handler, ctx) {
  return handler(ctx)
}
