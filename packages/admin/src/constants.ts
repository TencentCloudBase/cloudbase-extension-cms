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
