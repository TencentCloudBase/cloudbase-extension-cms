import { MicroApp, useParams } from 'umi'
import React, { useEffect } from 'react'
import { loadMicroApp, start } from 'qiankun'
import { PageContainer } from '@ant-design/pro-layout'

async function loadApp() {
  try {
    // registerMicroApps([
    //   {
    //     name: 'micro-app',
    //     entry: 'http://localhost:3002/',
    //     container: '#micro-app',
    //     // hash 路由
    //     activeRule: '/#/:projectId/app',
    //   },
    // ])

    loadMicroApp({
      name: 'micro-app',
      entry: 'http://localhost:3002/',
      container: '#micro-app',
    })

    start()
  } catch (error) {
    console.log(error)
  }
}

// const MicroApp = () => {
//   useEffect(() => {
//     loadApp()
//     // try {
//     //   registerMicroApps([
//     //     {
//     //       name: 'micro-app',
//     //       entry: 'http://localhost:3002/',
//     //       container: '#micro-app',
//     //       // hash 路由
//     //       activeRule: '/#/:projectId/app',
//     //     },
//     //   ])

//     //   start({
//     //     singular: false,
//     //   })
//     // } catch (error) {
//     //   console.log(error)
//     // }
//   }, [])

//   return <div id="micro-app" />
// }

/**
 * 挂载微应用
 */
const MicroContainer = () => {
  return (
    <PageContainer>
      Containers
      <MicroApp name="microApp" />
    </PageContainer>
  )
}

export default MicroContainer
