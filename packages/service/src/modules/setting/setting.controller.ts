import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common'
import { PermissionGuard } from '@/guards'
import { CloudBaseService } from '@/services'
import { Collection, SYSTEM_ROLE_IDS } from '@/constants'

/**
 * 微应用配置
 */
interface MicroApp {
  /**
   * 微应用名，全局唯一
   */
  name: string
}

interface MicroAppMenuItem {
  /**
   * 菜单标题
   */
  title: string

  /**
   * 菜单的 key
   */
  key: string

  /**
   * 微应用名
   */
  microAppName: string

  /**
   * 子菜单
   */
  children: MicroAppMenuItem[]
}

interface Setting {
  miniappID?: string
  miniappName?: string
  miniappOriginalID?: string
  enableOperation?: boolean
  activityChannels?: {
    value: string
    label: string
  }[]

  /**
   * 微应用列表
   */
  microApps: MicroApp[]

  /**
   * 微应用菜单信息
   */
  microAppMenus: MicroAppMenuItem[]
}

@Controller('setting')
export class SettingController {
  constructor(private readonly cloudbaseService: CloudBaseService) {}

  @Get()
  async getSystemSetting(): Promise<{
    requestId: string
    data: Setting
  }> {
    let {
      data: [setting],
      requestId,
    } = await this.cloudbaseService.collection(Collection.Settings).where({}).get()

    // 添加配置
    if (!setting) {
      await this.cloudbaseService.collection(Collection.Settings).add({})
    }

    return {
      requestId,
      data: setting || {},
    }
  }

  /**
   * 更新设置
   */
  @UseGuards(PermissionGuard('setting', [SYSTEM_ROLE_IDS.ADMIN]))
  @Patch()
  async updateSystemSetting(@Body() payload: any) {
    let {
      data: [setting],
    } = await this.cloudbaseService.collection(Collection.Settings).where({}).get()

    // 添加配置
    if (!setting) {
      return this.cloudbaseService.collection(Collection.Settings).add(payload)
    } else {
      return this.cloudbaseService.collection(Collection.Settings).where({}).update(payload)
    }
  }
}
