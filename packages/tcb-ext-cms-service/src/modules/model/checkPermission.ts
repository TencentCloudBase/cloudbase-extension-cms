import config from '@/config'

export default async function (modelParams, context) {
  const { resource, operate } = modelParams
  const { db, dbUser } = context

  // 系统配置默认可读
  if (resource === config.collection.contents && operate === 'getList') {
    return true
  }

  // 检查是否有权限，默认拥有查询权限
  const allowAction = dbUser.actions?.find((action) => operate.includes(action))
  if (dbUser.role === 'other' && !allowAction) {
    return false
  }

  // 配置信息
  const dbConfigs = await db.collection(config.collection.contents).get()

  // collection 白名单
  const resourceWhiteList = dbConfigs.data.map((config) => config.collectionName)

  // 管理员默认拥有的操作权限
  const adminWhiteList = [
    config.collection.contents,
    config.collection.webhooks,
    config.collection.users
  ]

  // 管理员读写包含内容集合和配置集合
  if (
    dbUser.role === 'administrator' &&
    [...adminWhiteList, ...resourceWhiteList].includes(resource)
  ) {
    return true
  }

  // 运营权限
  if (dbUser.role === 'operator' && resourceWhiteList.includes(resource)) {
    return true
  }

  // 其他人员权限
  if (dbUser?.collections?.includes(resource)) {
    return true
  }

  return false
}
