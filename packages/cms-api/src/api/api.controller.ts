import { Post, Body, Get, Query, Delete, Param, Controller } from '@nestjs/common'
import _ from 'lodash'
import { Collection } from '@/constants'
import { CloudBaseService } from '@/services'
import { RecordExistException, RecordNotExistException, UnauthorizedOperation } from '@/common'
import { UserService } from './api.service'

@Controller('/api/v1.0')
export class ApiController {
  constructor(private readonly cloudbaseService: CloudBaseService) {}

  @Get(':collectionName')
  async getDocuments(@Param('collectionName') collectionName: string) {}

  private collection(name = Collection.Users) {
    return this.cloudbaseService.collection(name)
  }
}
