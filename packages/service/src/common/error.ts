import { HttpException } from '@nestjs/common'

export class CmsException extends HttpException {
    constructor(code: string, message: string) {
        super(
            {
                code,
                message
            },
            200
        )
    }
}

export class RecordExistException extends HttpException {
    constructor() {
        super(
            {
                code: 'RECORD_EXIST',
                message: '记录已存在'
            },
            200
        )
    }
}
