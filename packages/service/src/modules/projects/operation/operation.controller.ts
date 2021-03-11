import _ from 'lodash'
import {
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common'
import { PermissionGuard } from '@/guards'
import { CloudBaseService } from '@/services'
import { IsNotEmpty, MaxLength } from 'class-validator'
import {
  getEnvIdString,
  dateToUnixTimestampInMs,
  getCloudBaseManager,
  dayJS,
  getLowCodeAppInfo,
} from '@/utils'
import { Collection } from '@/constants'
import { OperationService } from './operation.service'

class MessageTaskBody {
  @IsNotEmpty()
  content: string

  @IsNotEmpty()
  @MaxLength(1000, {
    each: true,
  })
  phoneNumberList: string[]

  @IsNotEmpty()
  activityId: string

  createdUser: any
}

class EnableServiceBody {
  @IsNotEmpty()
  miniappName: string

  @IsNotEmpty()
  miniappID: string

  @IsNotEmpty()
  miniappOriginalID: string
}

@UseGuards(PermissionGuard('operation'))
@UseInterceptors(ClassSerializerInterceptor)
@Controller('projects/:projectId/operation')
export class OperationController {
  constructor(
    public readonly cloudbaseService: CloudBaseService,
    private readonly operationService: OperationService
  ) {}

  /**
   * 开启未登录
   */
  @Post('enableNonLogin')
  async createNonLogin() {
    // 开启未登录
    await this.operationService.enableNonLogin()
    // 修改安全规则
    await this.operationService.updateSecurityRules()
  }

  /**
   * 开启营销工具
   */
  @Post('enableOperationService')
  async createOperationService(@Param('projectId') projectId, @Body() payload: EnableServiceBody) {
    const { data: settings } = await this.collection(Collection.Settings).where({}).get()

    const appConfig = {
      ...payload,
      enableOperation: true,
    }

    // 生成活动模板
    await this.operationService.generateTemplate(appConfig)

    // setting 为空，直接添加数据
    if (!settings?.length) {
      await this.collection(Collection.Settings).add(appConfig)
    } else {
      // 存储小程序信息
      await this.collection(Collection.Settings).where({}).update(appConfig)
    }

    // 添加默认活动
    const {
      data: [record],
    } = await this.collection(Collection.MessageActivity).where({}).get()

    // 添加默认活动
    if (!record) {
      const now = Date.now()
      // 来自低码，添加页面活动、单图片活动
      if (process.env.FROM_LOWCODE) {
        const { data } = await getLowCodeAppInfo(projectId)
        const records: any[] = [
          // 图片示例
          {
            _createTime: now,
            _updateTime: now,
            activityName: '活动示例 - 图片',
            startTime: 1610353674000,
            endTime: 1893456000000,
            isActivityOpen: true,
            jumpImg: 'https://main.qcloudimg.com/raw/50240777c0b7596a598c5b432ec4f005.png',
          },
        ]

        // 存在已发布的页面
        if (data?.pages?.length) {
          records.push({
            _createTime: now,
            _updateTime: now,
            startTime: 1610353674000,
            endTime: 1893456000000,
            fromLowCode: true,
            isActivityOpen: true,
            jumpPageType: 'lowcode',
            activityName: '活动示例 - 低码页面',
            lowcodePage: data?.pages[0].url,
          })
        }

        await this.collection(Collection.MessageActivity).add(records)
      } else {
        await this.collection(Collection.MessageActivity).add({
          activityName: '营销活动示例',
          endTime: 1893456000000,
          isActivityOpen: true,
          startTime: 1610353674000,
          _createTime: now,
          _updateTime: now,
        })
      }
    }
  }

  /**
   * 创建发送短信的任务
   */
  @Post('createBatchTask')
  async createBatchTask(
    @Param('projectId') projectId,
    @Body() body: MessageTaskBody,
    @Request() req: IRequest
  ) {
    const { content, phoneNumberList, activityId } = body

    // 写入 task 记录
    const taskRes = await this.collection(Collection.MessageTasks).add({
      // 短信内容
      content,
      projectId,
      // 关联的活动 ID
      activityId,
      // 号码列表
      phoneNumberList,
      // 已创建
      status: 'created',
      total: phoneNumberList.length,
      // 创建用户
      createdUser: req.cmsUser,
      createTime: dateToUnixTimestampInMs(),
    })

    return {
      taskId: taskRes.id,
    }
  }

  /**
   * 查询短信任务发送结果
   */
  @Post('getSmsTaskResult')
  async getSmsTaskResult(@Body() body: { queryId: string; page: number; pageSize: number }) {
    const { queryId, page = 1, pageSize = 10 } = body

    const envId = getEnvIdString()
    const manager = await getCloudBaseManager()

    const nowDate = dayJS().format('YYYY-MM-DD')
    const twoMonthAgo = dayJS().subtract(60, 'day').format('YYYY-MM-DD')

    const { SmsRecords, TotalCount } = await manager.commonService().call({
      Action: 'DescribeSmsRecords',
      Param: {
        EnvId: envId,
        QueryId: queryId,
        PageNumber: page,
        PageSize: pageSize,
        StartDate: twoMonthAgo,
        EndDate: nowDate,
      },
    })

    return {
      total: TotalCount,
      data: SmsRecords,
    }
  }

  /**
   * 获取低码应用已发布页面列表
   */
  @Post('getLowCodeAppInfo')
  async getLowCodeAppInfo(@Param('projectId') projectId) {
    // 此处 projectId 即为 appId
    return getLowCodeAppInfo(projectId)
  }

  collection(collection = Collection.DataMigrateTasks) {
    return this.cloudbaseService.collection(collection)
  }
}
