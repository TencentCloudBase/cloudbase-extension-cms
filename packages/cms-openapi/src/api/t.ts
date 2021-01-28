// 数据概览
// const metricResolvers = {
//   // 概览数据
//   overviewCount: async () => {
//     // 号码总量 phoneNumberCount
//     const $ = this.cloudbaseService.db.command

//     // @ts-ignore
//     const res = await this.apiService.getStatistics({
//       activityId,
//     })

//     const {
//       data: [ret],
//     } = await this.collection(Collection.MessageTasks)
//       .aggregate()
//       .match({
//         activityId,
//       })
//       .group({
//         _id: null,
//         count: $.aggregate.sum('$total'),
//       })
//       .end()

//     // TODO: 添加数据
//     return {
//       phoneNumberCount: ret?.count || 0,
//       webPageViewCount: 0,
//       miniappViewCount: 0,
//     }
//   },
//   // h5 访问用户渠道
//   webPageViewSource: async () => {
//     return [
//       { value: 20000, label: '短信' },
//       { value: 300, label: '知乎' },
//       { value: 1000, label: '腾讯视频' },
//     ]
//   },
//   // 小程序访问渠道
//   miniappViewSource: async () => {
//     return [
//       { value: 2000, label: '短信' },
//       { value: 3000, label: '知乎' },
//       { value: 1000, label: '腾讯视频' },
//     ]
//   },
//   // 短信转化率
//   messageConversion: async () => {
//     return [
//       { number: 10, stage: '短信下发' },
//       { number: 8, stage: 'H5 打开用户数' },
//       { number: 5, stage: '小程序打开用户数' },
//     ]
//   },
//   // 实时访问数据
//   realtimeView: async () => {
//     const webPageViewUsers = [
//       {
//         time: '2019-03',
//         value: 350,
//         type: 'webPageView',
//       },
//       {
//         time: '2019-04',
//         value: 900,
//         type: 'webPageView',
//       },
//       {
//         time: '2019-05',
//         value: 300,
//         type: 'webPageView',
//       },
//       {
//         time: '2019-06',
//         value: 450,
//         type: 'webPageView',
//       },
//       {
//         time: '2019-07',
//         value: 470,
//         type: 'webPageView',
//       },
//     ]

//     const miniappViewUsers = [
//       {
//         time: '2019-03',
//         value: 800,
//         type: 'miniappView',
//       },
//       {
//         time: '2019-04',
//         value: 600,
//         type: 'miniappView',
//       },
//       {
//         time: '2019-05',
//         value: 400,
//         type: 'miniappView',
//       },
//       {
//         time: '2019-06',
//         value: 380,
//         type: 'miniappView',
//       },
//       {
//         time: '2019-07',
//         value: 220,
//         type: 'miniappView',
//       },
//     ]

//     const conversionRate = [
//       {
//         time: '2019-03',
//         percent: 0.2,
//       },
//       {
//         time: '2019-04',
//         percent: 0.3,
//       },
//       {
//         time: '2019-05',
//         percent: 0.4,
//       },
//       {
//         time: '2019-06',
//         percent: 0.1,
//       },
//       {
//         time: '2019-07',
//         percent: 0.3,
//       },
//     ]

//     return {
//       webPageViewUsers,
//       miniappViewUsers,
//       conversionRate,
//     }
//   },
// }
