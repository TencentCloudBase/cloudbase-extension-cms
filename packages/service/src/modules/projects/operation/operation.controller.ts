import _ from 'lodash'
import {
  Post,
  Body,
  Param,
  UseGuards,
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common'
import { PermissionGuard } from '@/guards'
import { CloudBaseService } from '@/services'
import { IsNotEmpty, MaxLength } from 'class-validator'
import { getEnvIdString, getCloudBaseManager, dateToUnixTimestampInMs, randomId } from '@/utils'
import { Collection, SYSTEM_ROLE_IDS } from '@/constants'

class MessageTaskBody {
  @IsNotEmpty()
  content: string

  @IsNotEmpty()
  @MaxLength(1000, {
    each: true,
  })
  phoneNumberList: string[]
}

interface MigrateJobDto {
  // 项目 Id
  projectId: string

  // 任务 Id
  jobId: number

  // 导入文件路径
  filePath: string

  // 导入冲突处理模式
  conflictMode: 'upsert' | 'insert'

  createTime: number

  collectionName: string

  // 任务状态
  // waiting：等待中，reading：读，writing：写，migrating：转移中，success：成功，fail：失败
  status?: string
}

@UseGuards(PermissionGuard('content', [SYSTEM_ROLE_IDS.ADMIN]))
@UseInterceptors(ClassSerializerInterceptor)
@Controller('projects/:projectId/operation')
export class OperationController {
  constructor(public cloudbaseService: CloudBaseService) {}

  @Post('enableOperation')
  async enableOperation(@Param('projectId') projectId, @Body() body) {
    const manager = getCloudBaseManager()

    // 开启未登录
    const action = {
      serviceType: 'tcb',
      action: 'ModifySecurityRule',
      regionId: 4,
      data: {
        Version: '2018-06-08',
        EnvId: 'minishop',
        ResourceType: 'FUNCTION',
        ResourceName: 'minishop',
        AclTag: 'CUSTOM',
        Rule:
          '{\n    "*": {\n        "invoke": "auth != null"\n    },\n    "app": {\n        "invoke": true\n    }\n}',
      },
      id: 'e3t2th',
      status: 'pending',
    }
  }

  /**
   * 创建群发短信的任务
   */
  @Post('createBatchTask')
  async createBatchTask(@Param('projectId') projectId, @Body() body: MessageTaskBody) {
    const envId = getEnvIdString()
    const { content, phoneNumberList } = body

    // 写入 task 记录
    const taskRes = await this.collection(Collection.MessageTasks).add({
      content,
      // 已创建
      status: 'created',
      phoneNumberList,
      total: phoneNumberList.length,
      createTime: dateToUnixTimestampInMs(),
    })

    const taskId = taskRes.id

    const token = randomId(128)

    // 生成一个 token，用于下发短信任务的鉴权
    await this.collection(Collection.MessageAuthToken).add({
      // 环境 id，此 token 仅能触发此环境的任务
      envId,
      // 验证 token
      token,
      // 任务 Id
      taskId,
      // 创建时间
      createTime: Date.now(),
    })

    return {
      taskId,
      token,
    }
  }

  collection(collection = Collection.DataMigrateTasks) {
    return this.cloudbaseService.collection(collection)
  }
}
