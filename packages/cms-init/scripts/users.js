/* eslint-disable */
module.exports = {
  async enablePasswordLogin(context) {
    const { manager } = context
    const { ConfigList } = await manager.env.getLoginConfigList()
    if (ConfigList && ConfigList.length) {
      const usernameLogin = ConfigList.find((item) => item.Platform === 'USERNAME')
      // 用户名免密登录配置已存在
      if (usernameLogin) {
        const res = await manager.env.updateLoginConfig(usernameLogin.Id, 'ENABLE')
        console.log('开启密码登录', res)
        return
      }
    }
    const res = await manager.env.createLoginConfig('USERNAME', 'username')
    console.log('创建密码登录', res)
  },
  // 创建管理员账号
  async createAdministrator(context) {
    const { administratorName, administratorPassword, config, db, manager } = context

    return saveUser({
      manager,
      createTime: Date.now(),
      username: administratorName,
      password: administratorPassword,
      roles: ['administrator'],
      config,
      db,
      root: true,
    })
  },
  // 创建运营人员账号
  async createOperator(context) {
    const { operatorName, operatorPassword, config, db, manager } = context

    if (!operatorName || !operatorPassword) return

    return saveUser({
      manager,
      createTime: Date.now(),
      username: operatorName,
      password: operatorPassword,
      roles: ['content:administrator'],
      config,
      db,
    })
  },
}

// 保存用户
async function saveUser({ createTime, username, password, roles, db, config, manager, root }) {
  await manager.database.createCollectionIfNotExists(config.usersCollectionName)

  const collection = db.collection(config.usersCollectionName)
  const {
    data: [dbRecord],
  } = await collection.where({ username }).get()

  console.log(dbRecord)

  // 用户已存在，更新账号密码
  if (dbRecord && dbRecord.uuid) {
    try {
      await manager.user.modifyEndUser({
        uuid: dbRecord.uuid,
        password,
      })
    } catch (error) {
      console.log('更新用户异常', error)
    }
    return
  }

  const data = {
    username,
    createTime,
    roles,
    root,
  }

  // 注册用户
  const { User } = await manager.user.createEndUser({
    username,
    password,
  })

  // 添加 UUId 信息
  data.uuid = User.UUId

  // 如果用户已经存在，则进行 update（有可能账号密码修改））
  if (dbRecord) {
    return collection.where({ username }).update(data)
  }

  return collection.add(data)
}
