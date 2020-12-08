import { dateToUnixTimestampInMs, randomId } from '@/utils'
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common'

@Injectable()
export class SchemaTransfromPipe implements PipeTransform {
  constructor(private readonly action: 'create' | 'update') {}

  transform(value: any, metadata: ArgumentMetadata) {
    const _createTime = dateToUnixTimestampInMs()
    const _updateTime = _createTime

    // 为 field 添加 id
    if (this.action === 'create') {
      value.fields =
        value?.fields?.map((v) => {
          const id = v.id || randomId()
          return {
            ...v,
            id,
          }
        }) || []

      return {
        ...value,
        _createTime,
        _updateTime,
      }
    }

    if (this.action === 'update') {
      if (value.fields?.length) {
        // 为 field 添加 id
        value.fields = value?.fields?.map((v) => {
          const id = v.id || randomId()
          return {
            ...v,
            id,
          }
        })
      }

      return {
        ...value,
        _updateTime,
      }
    }

    return value
  }
}
