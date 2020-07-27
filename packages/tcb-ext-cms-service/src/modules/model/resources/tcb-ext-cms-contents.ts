import CloudBase from '@cloudbase/manager-node'
import { getEnvIdString } from '@/utils'

module.exports = {
  async afterCreate(modelParams, payload) {
    const envId = getEnvIdString()

    const manager = CloudBase.init({
      envId
    })
    const { collectionName } = payload.data
    await manager.database.createCollectionIfNotExists(collectionName)
  },

  async afterUpdate(modelParams, payload) {
    const envId = getEnvIdString()

    const manager = CloudBase.init({
      envId
    })
    const { collectionName } = payload.data
    await manager.database.createCollectionIfNotExists(collectionName)
  }
}
