// 数据提供程序方法必须为具有data属性的对象返回Promise 。
// getList	{ data: {Record[]}, total: {int} }
// getOne	{ data: {Record} }
// getMany	{ data: {Record[]} }
// getManyReference	{ data: {Record[]}, total: {int} }
// create	{ data: {Record} }
// update	{ data: {Record} }
// updateMany	{ data: {mixed[]} } 已更新的ID
// delete	{ data: {Record|null} } 已删除的记录（可选）
// deleteMany	{ data: {mixed[]} } 删除记录的ID（可选）
// A {Record}是具有至少一个id属性的对象文字，例如{ id: 123, title: "hello, world" }。
import { getApp } from './tcbProvider'

export default (hook = () => {}) => {
  const callApi = callWithHook(hook)

  return {
    getList: fileIdDecorator(callApi('getList')),
    getOne: fileIdDecorator(callApi('getOne')),
    getMany: fileIdDecorator(callApi('getMany')),
    getManyReference: fileIdDecorator(callApi('getManyReference')),
    create: fileIdDecorator(uploadDecorator(callApi('create'))),
    update: fileIdDecorator(uploadDecorator(callApi('update'))),
    updateMany: fileIdDecorator(uploadDecorator(callApi('updateMany'))),
    delete: callApi('delete'),
    deleteMany: callApi('deleteMany')
  }
}

const errorMap = {
  NO_AUTH: '没有内容操作权限'
}

const callWithHook = (hook) => (operate) => {
  return async function (resource, params) {
    params = await transformLocalCloudId(params)
    const app = await getApp()
    const res = await app.callFunction({
      name: 'tcb-ext-cms-service',
      data: {
        path: '/model',
        httpMethod: 'POST',
        body: {
          operate,
          resource,
          params
        }
      }
    })

    let body
    try {
      body = JSON.parse(res.result.body)
    } catch (error) {
      body = {}
    }

    if (body.code) {
      return Promise.reject(new Error(body.message || errorMap[body.code] || body.code))
    } else {
      hook(operate, resource, body)
      return body
    }
  }
}

/**
 * cloudId => { cloudId, tempUrl, cmsDataType: 'local' }
 */
function fileIdDecorator(fn) {
  return async function (resource, params) {
    const res = await fn(resource, params)
    const parser = deepForEach(
      (param, params) =>
        typeof param === 'string' && /^cloud:\/\/\S+/.exec(param) && params.cmsDataType !== 'local',
      async (param) => {
        return {
          tempUrl: await getTempFileURL(param),
          cloudId: param,
          cmsDataType: 'local'
        }
      }
    )
    return parser({ ...res })
  }
}

/**
 *  { cloudId, tempUrl, cmsDataType: 'local' } => cloudId
 */
function transformLocalCloudId(data) {
  return deepForEach(
    (param) => isType('Object')(param) && param.cmsDataType === 'local',
    async (param) => {
      return param.cloudId
    }
  )(data)
}

/**
 *
 * {rawFile} => { cloudId, cmsDataType: 'local' }
 */
function uploadDecorator(fn) {
  return async function (resource, params) {
    const parser = deepForEach(
      (param) => param && param.rawFile instanceof File,
      async (param) => {
        return {
          cloudId: await upload(param.rawFile),
          cmsDataType: 'local'
        }
      }
    )
    const parsedParams = await parser({ ...params })
    return fn(resource, parsedParams)
  }
}

function deepForEach(matchFunction, action) {
  return async function parseParams(params) {
    await Promise.all(
      Object.entries(params).map(async ([key, param]) => {
        if (matchFunction(param, params)) {
          const url = await action(param)
          params[key] = url
        } else if (Array.isArray(param) || isType('Object')(param)) {
          return parseParams(param)
        }
      })
    )
    return params
  }
}

async function upload(file) {
  const app = await getApp()
  const result = await app.uploadFile({
    cloudPath: `uploads/${Date.now()}.${file.name.split('.').slice(-1)[0]}`,
    filePath: file
  })

  return result.fileID
}

async function getTempFileURL(cloudID) {
  const app = await getApp()
  const result = await app.getTempFileURL({
    fileList: [cloudID]
  })
  return result.fileList[0].tempFileURL
}

function isType(type) {
  return function (obj) {
    return Object.prototype.toString.call(obj) === '[object ' + type + ']'
  }
}
