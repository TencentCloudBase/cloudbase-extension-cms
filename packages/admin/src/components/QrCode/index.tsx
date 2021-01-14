import React, { MutableRefObject, useEffect } from 'react'
import { Space, Modal, Image, Typography, Alert } from 'antd'
import { useSetState } from 'react-use'
import { generateQRCode } from '@/utils'

const { Paragraph } = Typography

export default (props: {
  activityId: string
  actionRef: MutableRefObject<{
    show: Function
  }>
}) => {
  const { activityId, actionRef } = props
  const [{ dataUri, isModalVisible }, setState] = useSetState({
    dataUri: '',
    isModalVisible: false,
  })

  let smsPageUrl = activityId
    ? `https://${location.host}/cms-activities/index.html?activityId=${activityId}`
    : ''

  // 生成二维码
  useEffect(() => {
    if (activityId) {
      generateQRCode(smsPageUrl).then((dataUri) => {
        setState({
          dataUri,
        })
      })
    }

    return () => {}
  }, [activityId])

  useEffect(() => {
    const show = () =>
      setState({
        isModalVisible: true,
      })
    if (actionRef.current) {
      actionRef.current.show = show
    } else {
      actionRef.current = {
        show,
      }
    }
  })

  return (
    <Modal
      title="跳转页面体验二维码"
      footer={null}
      visible={isModalVisible}
      onCancel={() =>
        setState({
          isModalVisible: false,
        })
      }
    >
      <Alert type="info" message="请使用手机扫码打开以下链接" />
      <Space>
        <Image src={dataUri} height="200" />
        <div>
          <p>体验地址</p>
          <Paragraph copyable style={{ maxWidth: '200px' }} ellipsis={{ rows: 4, symbol: '展开' }}>
            {smsPageUrl}
          </Paragraph>
        </div>
      </Space>
    </Modal>
  )
}
