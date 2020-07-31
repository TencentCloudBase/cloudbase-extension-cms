/**
 * 参考
 * https://cloud.tencent.com/document/product/213/30435
 */
export enum ErrorCode {
    // 服务错误
    ServerError = 'ServerError',
    // 参数错误
    UnknownParameter = 'UnknownParameter',
    MissingParameter = 'MissingParameter',
    InvalidParameter = 'InvalidParameter',
    InvalidParameterValue = 'InvalidParameterValue',
    // 请求超限
    RequestLimitExceeded = 'RequestLimitExceeded',
    // 资源
    ResourceNotFound = 'ResourceNotFound',
    UnsupportedOperation = 'UnsupportedOperation',
    UnauthorizedOperation = 'UnauthorizedOperation'
}

// V1 集合名
export const CollectionV1 = {
    Schemas: 'tcb-ext-cms-contents',
    Users: 'tcb-ext-cms-users',
    Webhooks: 'tcb-ext-cms-webhooks'
}

// V2 集合名
export const CollectionV2 = {
    Projects: 'tcb_cms_projects',
    Schemas: 'tcb_cms_schemas',
    Users: 'tcb_cms_users',
    Webhooks: 'tcb_cms_webhooks'
}
