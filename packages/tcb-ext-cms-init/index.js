const tcb = require('tcb-admin-node')
const CloudBase = require('@cloudbase/manager-node')

const userJobs = require('./scripts/users')
const deployJobs = require('./scripts/deploy')

module.exports.main = async (event, context) => {
  const envId = context.namespace || process.env.SCF_NAMESPACE
  const app = tcb.init({
    env: envId
  })

  const {
    // 管理员账号
    CMS_ADMIN_USER_NAME: administratorName,
    // 管理员密码
    CMS_ADMIN_PASS_WORD: administratorPassword,
    // 运营者账号
    CMS_OPERATOR_USER_NAME: operatorName,
    // 运营者密码
    CMS_OPERATOR_PASS_WORD: operatorPassword,
    // 部署路径
    CMS_DEPLOY_PATH: deployPath
  } = process.env

  const jobs = {
    // 创建管理员和运营者
    ...userJobs,
    // 部署静态网站
    ...deployJobs
  }

  // 注入全局的上下文
  const ctx = {
    app,
    db: tcb.database({
      env: envId
    }),
    manager: new CloudBase({
      secretId: process.env.TENCENTCLOUD_SECRETID,
      secretKey: process.env.TENCENTCLOUD_SECRETKEY,
      token: process.env.TENCENTCLOUD_SESSIONTOKEN,
      envId
    }),
    config: {
      envId,
      contentsCollectionName: 'tcb-ext-cms-contents',
      usersCollectionName: 'tcb-ext-cms-users'
    },
    operatorName,
    operatorPassword,
    administratorName,
    administratorPassword,
    deployPath
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
