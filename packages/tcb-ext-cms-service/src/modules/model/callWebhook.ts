import axios from 'axios'
import defaultConfig from '@/config'
import DataProvider from './dataProvider'

export default async function (modelParams, context, payload) {
  const { resource, operate } = modelParams
  const { config } = context
  const dataProvider = DataProvider(context.db)
  console.log('call Webhook')

  try {
    const webhooks = await dataProvider.getList(defaultConfig.collection.webhooks, {
      filter: {},
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'order', order: 'DESC' }
    })

    if (!webhooks.total) return

    const collectionsMap = (
      await dataProvider.getList(defaultConfig.collection.contents, {
        filter: {},
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'order', order: 'DESC' }
      })
    ).data.reduce((prev, cur) => {
      prev[cur.id] = cur.collectionName
      return prev
    }, {})

    console.log('webhooks', webhooks)

    Promise.all(
      webhooks.data
        .filter((webhook) => webhook.triggerType === 'all' || webhook.event.includes(operate))
        .filter((webhook) =>
          webhook?.collections
            .map((collectionId) => collectionsMap[collectionId])
            .includes(resource)
        )
        .map((webhook) => {
          console.log('call webhook', webhook)
          const { name, method, url, headers = [] } = webhook
          return axios({
            method,
            url,
            headers: headers?.reduce((prev, cur) => {
              const { key, value } = cur
              if (key in prev) {
                const oldValue = prev[key]
                if (Array.isArray(oldValue)) {
                  prev[key].push(value)
                } else {
                  prev[key] = [oldValue, value]
                }
              } else {
                prev[key] = value
              }
              return prev
            }, {}),
            data: {
              name,
              operate,
              resource,
              payload
            }
          })
            .then(console.log)
            .catch(console.log)
        })
    )
  } catch (e) {
    console.log(e)
  }
}
