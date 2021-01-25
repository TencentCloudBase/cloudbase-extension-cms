import _ from 'lodash'
import { Injectable } from '@nestjs/common'
import { CloudBaseService } from '@/services'

interface IQuery {
  limit?: number
  skip?: number
  fields?: string
  sort?: string
  [key: string]: any
}

@Injectable()
export class ApiService {
  constructor(private readonly cloudbaseService: CloudBaseService) {}
}
