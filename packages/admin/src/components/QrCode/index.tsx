import React, { MutableRefObject, useEffect } from 'react'
import { Space, Modal, Image, Typography, Alert, Button, message } from 'antd'
import { useSetState } from 'react-use'
import { callWxOpenAPI, copyToClipboard, generateQRCode } from '@/utils'
import ChannelSelector from '@/components/ChannelSelector'
import { DefaultChannels } from '@/common'
import useRequest from '@umijs/use-request'

const { Paragraph } = Typography

export default (props: {
  activityId: string
  actionRef: MutableRefObject<{
    show: Function
  }>
  // 不显示渠道选择器
  disableChannel?: boolean
}) => {
  const { activityId, actionRef, disableChannel } = props

  const [{ dataUri, isModalVisible, channel }, setState] = useSetState({
    channel: '',
    dataUri: '',
    isModalVisible: false,
  })

  // 渠道来源
  const source = channel || DefaultChannels[0].value
  const activityPage = WX_MP ? 'cms-activities' : 'tcb-cms-activities'

  let smsPageUrl = activityId
    ? `https://${location.host}/${activityPage}/index.html?activityId=${activityId}&source=${source}`
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

  // modal ref
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

  // 生成短链
  const { run: generateUrlLink, loading } = useRequest(
    async () => {
      const result = await callWxOpenAPI('generateUrlLink', {
        path: `/${activityPage}/index.html`,
        query: `activityId=${activityId}&source=${source}`,
      })

      copyToClipboard(result.urlLink)
      message.success('生成短链成功，已复制到剪切板')
    },
    {
      manual: true,
      onError: (e) => message.error(`生成短链失败：${e.message}`),
    }
  )

  return (
    <Modal
      centered
      title={disableChannel ? '跳转页面体验二维码' : '渠道投放'}
      footer={null}
      visible={isModalVisible}
      onCancel={() =>
        setState({
          isModalVisible: false,
        })
      }
    >
      {disableChannel ? (
        <Alert type="info" message="请使用手机扫码打开以下链接" className="mb-4" />
      ) : (
        <>
          <Alert
            type="info"
            message="每个渠道都会生成对应的H5中间页链接，请将该链接投放到对应的渠道，系统可区分渠道统计数据"
          />
          <div className="my-4">
            <ChannelSelector onSelect={(v) => setState({ channel: v })} />
          </div>
        </>
      )}

      <Space size="large">
        <Image src={dataUri} height="200" />
        <div>
          <p>体验地址</p>
          <Paragraph copyable style={{ maxWidth: '280px' }} ellipsis={{ rows: 4, symbol: '展开' }}>
            {smsPageUrl}
          </Paragraph>

          {!disableChannel && (
            <Button type="primary" size="small" loading={loading} onClick={() => generateUrlLink()}>
              短链生成
            </Button>
          )}
        </div>
      </Space>
    </Modal>
  )
}
