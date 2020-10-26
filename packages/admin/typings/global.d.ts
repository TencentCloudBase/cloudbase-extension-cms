interface Project {
  _id: string

  name: string

  customId: string

  description: string

  // 项目封面图
  cover?: string

  // 是否开启 Api 访问
  enableApiAccess: boolean

  // Api 访问路径
  apiAccessPath: string
}
