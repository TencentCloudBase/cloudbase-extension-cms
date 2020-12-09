import { Request, Response } from 'express'

declare global {
  export interface IRequest extends Request {
    handleService: string

    cmsUser: RequestUser
  }
}
