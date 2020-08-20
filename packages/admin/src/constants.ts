export const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '您还没有登录，或登录身份过期，请登录后再操作！',
  403: '您没有权限访问此资源或进行此操作！',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  405: '请求方法不被允许。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
}

// 系统角色
export const CmsRole = {
  // 系统管理员
  SystemAdmin: 'system-admin',

  // 系统内容管理员
  SystemContentAdmin: 'system-content-admin',

  SystemCustom: 'system-custom',

  // 项目管理员
  ProjectAdmin: 'project-admin',

  // 项目内容管理员
  ProjectContent: 'project-content-admin',

  // 自定义权限
  ProjectCustom: 'project-custom',
}

export const CmsRoleMap = {
  administrator: '管理员',
  operator: '内容管理员',
  other: '系统自定义',

  'system-admin': '系统管理员',
  'system-content-admin': '系统内容管理员',
  'system-custom': '系统自定义',

  'project-admin': '项目管理员',
  'project-content-admin': '项目内容管理员',
  'project-custom': '项目自定义',
}
