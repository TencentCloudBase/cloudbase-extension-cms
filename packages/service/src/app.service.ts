import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    return 'Hello World! Powered by Nest & CloudBase!'
  }
}
