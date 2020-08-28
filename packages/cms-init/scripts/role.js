/* eslint-disable */
module.exports = {
  // 创建 public role
  async createPublicRole(context) {
    const { config, db, manager } = context

    await manager.database.createCollectionIfNotExists(config.rolesCollectionName)

    const collection = db.collection(config.rolesCollectionName)
    const {
      data: [dbRecord],
    } = await collection.doc('public').get()

    // 角色已存在
    if (dbRecord) {
      return
    }

    const data = {
      _id: 'public',
      roleName: '匿名用户',
      // 描述
      description: '未登录的用户允许访问的资源',
      // 默认为空
      permissions: [],
      // 不允许删除
      noDelete: true,
    }

    return collection.add(data)
  },
}
