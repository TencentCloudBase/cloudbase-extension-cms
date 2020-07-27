const {
  envId,
  customLoginJson,
  administratorName,
  administratorPassword,
  operatorName,
  operatorPassword,
  deployPath
} = require('./config/config.json')

module.exports = {
  envId,
  framework: {
    plugins: {
      // 部署静态网站
      admin: {
        use: '@cloudbase/framework-plugin-website',
        inputs: {
          outputPath: './packages/tcb-ext-cms-admin/build',
          cloudPath: '/tcb-cms'
        }
      },
      init: {
        use: '@cloudbase/framework-plugin-function',
        inputs: {
          functionRootPath: './packages',
          functions: [
            {
              name: 'tcb-ext-cms-init',
              config: {
                // 超时时间
                timeout: 60,
                // 环境变量
                envVariables: {
                  // 管理员账号
                  CMS_ADMIN_USER_NAME: administratorName,
                  // 管理员密码
                  CMS_ADMIN_PASS_WORD: administratorPassword,
                  // 运营者账号
                  CMS_OPERATOR_USER_NAME: operatorName,
                  // 运营者密码
                  CMS_OPERATOR_PASS_WORD: operatorPassword,
                  // 部署路径
                  CMS_DEPLOY_PATH: deployPath
                },
                installDependency: true
              },
              handler: 'index.main'
            }
          ]
        }
      },
      // 部署 Service 云函数
      service: {
        use: '@cloudbase/framework-plugin-node',
        inputs: {
          name: 'tcb-ext-cms-service',
          entry: 'app.js',
          projectPath: './packages/tcb-ext-cms-service',
          path: '/tcb-ext-cms-service',
          functionOptions: {
            timeout: 5,
            envVariables: {
              NODE_ENV: 'production',
              CMS_CUSTOM_LOGIN_JSON: JSON.stringify(customLoginJson)
            }
          }
        }
      },
      // 创建数据库集合
      db: {
        use: '@cloudbase/framework-plugin-database',
        inputs: {
          collections: [
            {
              collectionName: 'tcb-ext-cms-contents',
              description:
                'CMS 系统内容配置数据，CMS 所有的系统内容类型配置、字段配置等信息都存储在该集合内（请不要手动修改',
              aclTag: 'ADMINONLY'
            },
            {
              collectionName: 'tcb-ext-cms-users',
              description:
                ' CMS 系统用户数据，存储 CMS 的用户信息，包括管理员和运营者的账号信息，包括角色信息，用户，加密存储的密码等（请不要手动修改）',
              aclTag: 'ADMINONLY'
            },
            {
              collectionName: 'tcb-ext-cms-webhooks',
              description:
                'CMS 系统 webhook 集合，存储 CMS 系统的回调接口配置，CMS 系统数据的变更可以通过回调来进行同步 （请不要手动修改）',
              aclTag: 'ADMINONLY'
            }
          ]
        }
      }
    }
  }
}
