/* eslint-disable */
module.exports = {
    // 创建运营者账号
    async createOperator(context) {
        const { operatorName, operatorPassword, config, db, manager } = context

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
        })
    },
}

// 保存用户
async function saveUser({ createTime, username, password, roles, db, config, manager }) {
    await manager.database.createCollectionIfNotExists(config.usersCollectionName)

    const collection = db.collection(config.usersCollectionName)
    const dbRecords = await collection.where({ username }).get()

    const data = {
        username,
        createTime,
        roles,
    }

    // 注册用户
    const { User } = await manager.user.createEndUser({
        username,
        password,
    })

    // 添加 UUId 信息
    data.uuid = User.UUId

    console.log('注册用户失败', e)

    // 如果用户已经存在，则进行 update（有可能账号密码修改））
    if (dbRecords.data.length) {
        return collection.where({ username }).update(data)
    }

    return collection.add(data)
}
