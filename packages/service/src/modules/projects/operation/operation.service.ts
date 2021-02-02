import fs from 'fs'
import path from 'path'
import util from 'util'
import { Injectable } from '@nestjs/common'
import { getCloudBaseManager, getEnvIdString } from '@/utils'
import { CloudBaseService } from '@/services'
import { CmsException } from '@/common'
import { exec } from 'child_process'
import { RESOURCE_PREFIX } from '@/constants'

@Injectable()
export class OperationService {
  constructor(public readonly cloudbaseService: CloudBaseService) {}

  /**
   * 开启未登录
   * 未登录配置可能已经存在，但是未开启，此时需要更新为开启状态
   * 未登录配置可能不存在，此时需要创建未登录配置
   */
  async enableNonLogin() {
    const envId = getEnvIdString()
    const manager = await getCloudBaseManager()

    // 开启未登录
    const { ConfigList } = await manager.env.getLoginConfigList()
    // 存在登录配置
    if (ConfigList?.length) {
      // 未登录配置是否存在
      const nonLogin = ConfigList.find((item) => item.Platform === 'NONLOGIN')
      if (nonLogin) {
        // 更新为开启状态
        const res = await manager.env.updateLoginConfig(nonLogin.Id, 'ENABLE')
        console.log('开启未登录', res)
        return
      }
    }

    // 创建未登录
    const res = await manager.commonService().call({
      Action: 'CreateLoginConfig',
      Param: {
        EnvId: envId,
        Platform: 'NONLOGIN',
        PlatformId: 'NONLOGIN',
        Status: 'ENABLE',
      },
    })
    console.log('创建未登录', res)
  }

  /**
   * 更新安全规则
   */
  async updateSecurityRules() {
    const envId = getEnvIdString()
    const manager = await getCloudBaseManager()

    // 查询安全规则
    let { Rule } = await manager.commonService().call({
      Action: 'DescribeSecurityRule',
      Param: {
        EnvId: envId,
        OnlyTag: false,
        ResourceName: envId,
        ResourceType: 'FUNCTION',
      },
    })

    console.log(Rule)

    // rule 为 json5 字符串
    Rule = JSON.parse(Rule)

    // 设置 sms 函数为免登录调用
    Rule[`${RESOURCE_PREFIX}-sms`] = {
      invoke: true,
    }

    // 修改安全规则
    await manager.commonService().call({
      Action: 'ModifySecurityRule',
      Param: {
        EnvId: envId,
        AclTag: 'CUSTOM',
        ResourceName: envId,
        ResourceType: 'FUNCTION',
        Rule: JSON.stringify(Rule),
      },
    })
  }

  /**
   * 生成小程序跳转模板
   * 参考 https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/staticstorage/jump-miniprogram.html
   */
  async generateTemplate(options: {
    miniappName: string
    miniappID: string
    miniappOriginalID: string
  }) {
    const envId = getEnvIdString()
    const manager = await getCloudBaseManager()

    const { miniappName, miniappID, miniappOriginalID } = options

    if (!miniappName || !miniappID || !miniappOriginalID) {
      throw new CmsException('APP_CONFIG_MISS', '小程序应用配置信息不完善')
    }

    const execAsync = util.promisify(exec)

    // 复现模板内容到 tmp 文件夹
    try {
      await execAsync('cp -r template /tmp', {
        cwd: __dirname,
      })
    } catch (e) {
      console.log('复制错误', e)
    }

    // 替换内容
    let template = fs.readFileSync(path.join(__dirname, './template/index.html')).toString()

    template = template
      .replace(/\{\{APPID\}\}/g, miniappID)
      .replace(/\{\{ENVID\}\}/g, envId)
      .replace(/\{\{APPNAME\}\}/g, miniappName)
      .replace(/\{\{APPORIGINALID\}\}/g, miniappOriginalID)

    // 替换 index.html
    const writeFile = util.promisify(fs.writeFile)
    await writeFile(`/tmp/template/index.html`, template)

    // 上传模板文件
    await manager.hosting.uploadFiles({
      localPath: '/tmp/template',
      cloudPath: process.env.TCB_CMS ? '/tcb-cms-activities' : '/cms-activities',
    })
  }
}
