import React, { useState, useEffect } from 'react'
import { BellOutlined } from '@ant-design/icons'
import { Button, message, Badge, Drawer, Switch, Timeline } from 'antd'

import { getCmsNotices } from '@/services/notice'
import { getFullDate } from '@/utils'
import './index.less'

const IconStyle: React.CSSProperties = {
  fontSize: '1.8em',
  fontWeight: 'bold',
  color: '#fff',
}

const START_TIME_KEY = 'noticeStartTime'

const NoticeRender: React.FC = () => {
  const [noticeVisible, setNoticeVisible] = useState(false)
  const [notices, setNotices] = useState<any>([])
  const [unReadNoticeCount, setUnreadNoticeCount] = useState(0)

  // 设置全部已读
  const readAllNotices = () => {
    // 全部已读后，不可回退
    if (unReadNoticeCount === 0) {
      return
    }
    // 更新未读消息数量
    setUnreadNoticeCount(0)
    // 使用最新消息的时间作为开始时间戳
    localStorage.setItem(START_TIME_KEY, new Date(notices[0]?.noticeTime).getTime().toString())
  }

  // 获取未读消息
  const getNotices = async () => {
    let startTime = parseInt(localStorage.getItem(START_TIME_KEY) || '0', 10)
    if (isNaN(startTime)) {
      // 默认拉取过去2个月的未读消息
      startTime = Date.now() - 1000 * 60 * 60 * 24 * 60
    }

    const { notices } = await getCmsNotices(startTime)
    setNotices(notices)
    setUnreadNoticeCount(notices.length)
  }

  useEffect(() => {
    getNotices()
  }, [])

  return (
    <>
      <Button
        style={{
          marginRight: '10px',
        }}
        type="text"
        onClick={() => {
          if (notices.length) {
            setNoticeVisible(true)
          } else {
            message.info('没有新消息')
          }
        }}
      >
        <Badge count={unReadNoticeCount} overflowCount={10}>
          <BellOutlined style={IconStyle} />
        </Badge>
      </Button>
      <Drawer
        width={550}
        title={
          <Switch
            checkedChildren="全部已读"
            unCheckedChildren="标记为已读"
            checked={unReadNoticeCount === 0}
            onChange={readAllNotices}
          />
        }
        placement="right"
        closable={true}
        onClose={() => setNoticeVisible(false)}
        visible={noticeVisible}
      >
        <Timeline mode="left">
          {notices.map((notice: any) => (
            <Timeline.Item key={notice._id} color="blue">
              <h3>{getFullDate(notice.noticeTime)}</h3>
              <h3>{notice.noticeTitle}</h3>
              <p>{notice.noticeContent}</p>
            </Timeline.Item>
          ))}
        </Timeline>
      </Drawer>
    </>
  )
}

export default NoticeRender
