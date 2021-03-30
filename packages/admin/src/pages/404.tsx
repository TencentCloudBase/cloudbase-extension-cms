import { Button, Result } from 'antd'
import React, { useEffect, useState } from 'react'
import { history } from 'umi'

const NoFoundPage: React.FC<{}> = () => {
  const [count, setCount] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((count) => count - 1)
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (count <= 0) {
      history.push('/home')
    }
  }, [count])

  return (
    <Result
      status="404"
      title="404"
      subTitle={`你访问的页面不存在，${count} 秒后自动返回首页`}
      extra={
        <Button type="primary" onClick={() => history.push('/home')}>
          回到首页
        </Button>
      }
    />
  )
}

export default NoFoundPage
