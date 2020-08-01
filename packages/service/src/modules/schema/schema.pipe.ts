import { dateToNumber } from '@/utils'
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common'

@Injectable()
export class SchemaTransfromPipe implements PipeTransform {
    constructor(private readonly action: 'create' | 'update') {}

    transform(value: any, metadata: ArgumentMetadata) {
        console.log(this.action)
        console.log(value, metadata)

        const _createTime = dateToNumber()
        const _updateTime = _createTime

        if (this.action === 'create') {
            return {
                ...value,
                _createTime,
                _updateTime
            }
        }

        if (this.action === 'update') {
            return {
                ...value,
                _updateTime
            }
        }

        return value
    }
}
