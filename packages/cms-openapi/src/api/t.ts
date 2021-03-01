// 数据概览
const metricResolvers = {
  // 实时访问数据
  realtimeView: async () => {
    const webPageViewUsers = [
      {
        time: '2019-03',
        value: 350,
        type: 'webPageView',
      },
      {
        time: '2019-04',
        value: 900,
        type: 'webPageView',
      },
      {
        time: '2019-05',
        value: 300,
        type: 'webPageView',
      },
      {
        time: '2019-06',
        value: 450,
        type: 'webPageView',
      },
      {
        time: '2019-07',
        value: 470,
        type: 'webPageView',
      },
    ]

    const miniappViewUsers = [
      {
        time: '2019-03',
        value: 800,
        type: 'miniappView',
      },
      {
        time: '2019-04',
        value: 600,
        type: 'miniappView',
      },
      {
        time: '2019-05',
        value: 400,
        type: 'miniappView',
      },
      {
        time: '2019-06',
        value: 380,
        type: 'miniappView',
      },
      {
        time: '2019-07',
        value: 220,
        type: 'miniappView',
      },
    ]

    const conversionRate = [
      {
        time: '2019-03',
        percent: 0.2,
      },
      {
        time: '2019-04',
        percent: 0.3,
      },
      {
        time: '2019-05',
        percent: 0.4,
      },
      {
        time: '2019-06',
        percent: 0.1,
      },
      {
        time: '2019-07',
        percent: 0.3,
      },
    ]

    return {
      webPageViewUsers,
      miniappViewUsers,
      conversionRate,
    }
  },
}
