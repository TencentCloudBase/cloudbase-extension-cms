import React from 'react'
import { Access, history, IRoute, useAccess } from 'umi'
import { Result, Button } from 'antd'

const PageAccess: React.FC<{
  route: IRoute
}> = (props) => {
  const access = useAccess()
  const { children, route } = props

  const accessible = Boolean(access[route.access])

  return (
    <Access
      accessible={accessible}
      fallback={
        <Result
          status="403"
          title="403"
          subTitle="抱歉，您没有权限访问此页面~"
          extra={
            <Button
              type="primary"
              onClick={() => {
                history.push('/home')
              }}
            >
              回到首页
            </Button>
          }
        />
      }
    >
      {children}
    </Access>
  )
}

export default PageAccess
