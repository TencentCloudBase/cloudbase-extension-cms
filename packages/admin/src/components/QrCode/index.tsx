import React, { MutableRefObject, useEffect } from 'react'
import { Space, Modal, Image, Typography, Alert } from 'antd'
import { useSetState } from 'react-use'
import { generateQRCode } from '@/utils'
import { useConcent } from 'concent'
import { GlobalCtx } from 'typings/store'
import ChannelSelector from '@/components/ChannelSelector'

const { Paragraph } = Typography

export default (props: {
  activityId: string
  actionRef: MutableRefObject<{
    show: Function
  }>
}) => {
  const { activityId, actionRef } = props
  const ctx = useConcent<{}, GlobalCtx>('global')
  const { setting } = ctx.state

  const { activityChannels = [] } = setting

  const [{ dataUri, isModalVisible, channel }, setState] = useSetState({
    channel: '',
    dataUri: '',
    isModalVisible: false,
  })

  // 渠道来源
  const source = channel || activityChannels?.[0]?.value || ''
  let smsPageUrl = activityId
    ? `https://${location.host}/cms-activities/index.html?activityId=${activityId}&source=${source}`
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
  }, [activityId, channel])

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
  }, [])

  return (
    <Modal
      centered
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

      <div className="my-4">
        <ChannelSelector onSelect={(v) => setState({ channel: v })} />
      </div>

      <Space size="large">
        <Image src={dataUri} height="200" />
        <div>
          <p>体验地址</p>
          <Paragraph copyable style={{ maxWidth: '280px' }} ellipsis={{ rows: 4, symbol: '展开' }}>
            {smsPageUrl}
          </Paragraph>
        </div>
      </Space>
    </Modal>
  )
}
