import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common'
import { PermissionGuard } from '@/guards'
import { CloudBaseService } from '@/services'
import { Collection, SYSTEM_ROLE_IDS } from '@/constants'
import { IsNotEmpty } from 'class-validator'
import { CmsException } from '@/common'
import { getCloudBaseManager } from '@/utils'
import { SettingService } from './setting.service'

interface CustomMenuItem {
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
  children: CustomMenuItem[]
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
  customMenus: CustomMenuItem[]
}

/**
 * 微应用配置
 */
class MicroApp {
  /**
   * 微应用 id 全局唯一，英文字母
   */
  @IsNotEmpty()
  id: string

  /**
   * 名称
   */
  @IsNotEmpty()
  title: string

  @IsNotEmpty()
  fileID: string
}

@Controller('setting')
export class SettingController {
  constructor(
    private readonly cloudbaseService: CloudBaseService,
    private readonly settingService: SettingService
  ) {}

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

  /**
   * 创建微应用
   */
  @UseGuards(PermissionGuard('setting', [SYSTEM_ROLE_IDS.ADMIN]))
  @Post('createMicroApp')
  async createMicroApp(@Body() app: MicroApp) {
    let {
      data: [setting],
    } = await this.cloudbaseService.collection(Collection.Settings).where({}).get()

    // 解压，上传文件
    await this.settingService.unzipAndUploadFiles(app.id, app.fileID)

    // 创建微应用
    if (setting.microApps?.length) {
      await this.collection(Collection.Settings)
        .where({})
        .update({
          microApps: this.cloudbaseService.db.command.push(app),
        })
    } else {
      await this.collection(Collection.Settings)
        .where({})
        .update({
          microApps: [app],
        })
    }
  }

  /**
   * 更新微应用信息
   */
  @UseGuards(PermissionGuard('setting', [SYSTEM_ROLE_IDS.ADMIN]))
  @Post('updateMicroApp')
  async updateMicroApp(@Body() app: MicroApp) {
    let {
      data: [setting],
    } = await this.collection(Collection.Settings).where({}).get()

    const appIndex = setting.microApps.findIndex((_) => _.id === app.id)

    if (appIndex === -1) {
      throw new CmsException('NOT_FOUND', '微应用更新失败，应用不存在')
    }

    await this.collection(Collection.Settings)
      .where({})
      .update({
        [`microApps.${appIndex}`]: this.cloudbaseService.db.command.set(app),
      })
  }

  /**
   * 删除微应用
   */
  @UseGuards(PermissionGuard('setting', [SYSTEM_ROLE_IDS.ADMIN]))
  @Post('deleteMicroApp')
  async deleteMicroApp(@Body() app: MicroApp) {
    const $ = this.cloudbaseService.db.command

    // 删除应用记录
    await this.collection(Collection.Settings)
      .where({})
      .update({
        microApps: $.pull({
          id: $.eq(app.id),
        }),
      })

    // 并删除文件
    const manager = await getCloudBaseManager()
    await manager.hosting.deleteFiles({
      isDir: true,
      cloudPath: `cloudbase-cms/apps/${app.id}`,
    })
  }

  private collection(coll: string) {
    return this.cloudbaseService.collection(coll)
  }
}
