import { Provider } from '@nestjs/common'
import { getCloudBaseApp } from '@/utils'

export const CloudBaseProvider: Provider = {
  provide: 'CloudBase',
  useFactory: () => {
    const app = getCloudBaseApp()
    return app
  }
}
