/* eslint-disable */
const { genPassword } = require('../utils/crypto')

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
async function saveUser({ createTime, username, password, role, db, config, manager }) {
    const salt = createTime + config.envId
    const genPasswordResult = await genPassword(password, salt)

    const collection = db.collection(config.usersCollectionName)

    const dbRecords = await collection.where({ username }).get()

    const data = {
        username,
        password: genPasswordResult,
        createTime,
        role,
    }

    if (dbRecords.code === 'DATABASE_COLLECTION_NOT_EXIST') {
        await manager.database.createCollectionIfNotExists(config.usersCollectionName)
        return saveUser({
            createTime,
            username,
            password,
            role,
            db,
            config,
            manager,
        })
    }

    // 如果用户已经存在，则进行 update（有可能账号密码修改））
    if (dbRecords.data.length) {
        return collection.where({ username }).update(data)
    }

    return collection.add(data)
}
