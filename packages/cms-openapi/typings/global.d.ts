import { Request, Response } from 'express'

declare global {
  export interface IResponse extends Response {
    locals: {
      currentSchema: Schema
      project: Project
    }
  }

  interface IRequest extends Request {
    handleService: string

    cmsUser: RequestUser
  }
}
