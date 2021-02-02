/* eslint-disable */
module.exports = {
  async createUsers(context) {
    // 不能并发执行
    // 创建密码
    await enablePasswordLogin(context)
    console.log(Date.now(), '开启用户名登录成功')
    await sleep()
    // 创建用户
    await createOperator(context)
    console.log(Date.now(), '创建运营人员成功')
    await sleep()
    // 创建用户
    await createAdministrator(context)
    console.log(Date.now(), '创建管理员成功')
  },
}

async function enablePasswordLogin(context) {
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
}

// 创建管理员账号
async function createAdministrator(context) {
  const { adminUsername, adminPassword, config, db, manager } = context

  return saveUser({
    db,
    config,
    manager,
    root: true,
    createTime: Date.now(),
    username: adminUsername,
    password: adminPassword,
    roles: ['administrator'],
  })
}

// 创建运营人员账号
async function createOperator(context) {
  const { operatorUsername, operatorPassword, config, db, manager } = context

  if (!operatorUsername || !operatorPassword) return

  return saveUser({
    db,
    config,
    manager,
    createTime: Date.now(),
    username: operatorUsername,
    password: operatorPassword,
    // 低码平台使用 operator 权限
    roles: process.env.FROM_LOWCODE ? ['operator'] : ['content:administrator'],
  })
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
    console.log('用户存在，更新用户', dbRecord.uuid)
    try {
      await manager.user.modifyEndUser({
        password,
        uuid: dbRecord.uuid,
      })
    } catch (error) {
      console.log('更新用户异常', error)
    }

    // 低码升级，更新用户的角色
    if (process.env.FROM_LOWCODE) {
      await db
        .collection(config.usersCollectionName)
        .where({
          username,
        })
        .update({
          roles,
        })
    }

    return
  }

  const data = {
    username,
    createTime,
    roles,
    root,
  }

  let UUId

  try {
    // 注册用户
    const { User } = await manager.user.createEndUser({
      username,
      password,
    })
    UUId = User.UUId
  } catch (e) {
    console.log('创建用户出现错误', e.message)
    // 用户名存在
    if (e && e.message.indexOf('username exist')) {
      console.log('查询存在的用户信息')
      const { Users } = await manager.user.getEndUserList({
        offset: 0,
        limit: 100,
      })

      // 抛出错误
      if (!Users || !Users.length) {
        throw e
      }

      // 获取同名用户的 UUId
      const existUser = Users.find((user) => user.UserName === username)
      console.log('已存在用户', existUser)
      // 修改用户信息
      if (existUser) {
        UUId = existUser.UUId
        // 修改密码
        await manager.user.modifyEndUser({
          uuid: UUId,
          password,
        })
      }
    }
  }

  // 添加 UUId 信息
  data.uuid = UUId

  // 如果用户已经存在，则进行 update（有可能账号密码修改））
  if (dbRecord) {
    return collection.where({ username }).update(data)
  }

  return collection.add(data)
}

// 等待 5s
async function sleep() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 5000)
  })
}
