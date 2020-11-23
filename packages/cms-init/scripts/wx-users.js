/**
 * 微信 CMS 创建用户
 */
module.exports = {
  async createUsers(context) {
    // 创建用户
    await createAdministrator(context)

    console.log(Date.now(), '创建管理员成功')
  },
}

// 创建管理员账号
async function createAdministrator(context) {
  return saveUser({
    context,
    root: true,
    createTime: Date.now(),
    roles: ['administrator'],
  })
}

// 保存用户
async function saveUser({ context, createTime, roles, root }) {
  const { adminOpenID: openID, config, db, manager } = context

  await manager.database.createCollectionIfNotExists(config.usersCollectionName)

  const collection = db.collection(config.usersCollectionName)
  const {
    data: [dbRecord],
  } = await collection.where({ openID }).get()

  // 用户已存在，更新账号密码
  if (dbRecord) {
    console.log('用户已存在', dbRecord)
    return
  }

  const data = {
    openID,
    createTime,
    roles,
    root,
  }

  if (dbRecord) {
    return collection.where({ openID }).update(data)
  }

  return collection.add(data)
}
