import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
import { useSetState } from 'react-use'
import React, { useCallback, useEffect, useMemo } from 'react'
import { Button, message, Modal, Spin, Tooltip } from 'antd'
import { CloseCircleOutlined, PlayCircleTwoTone } from '@ant-design/icons'
import { batchGetTempFileURL, hashCode, isFileId } from '@/utils'

const AudioPlayer: React.FC<{ onClose: () => void; src: string; id: string }> = ({
  onClose,
  src,
  id,
}) => {
  return (
    <div className="w-full flex">
      <div className="flex-auto">
        <audio id={id} controls>
          <source src={src} />
        </audio>
      </div>
      <div className="flex items-center pr-5">
        <Tooltip title="关闭">
          <CloseCircleOutlined className="text-xl" onClick={onClose} />
        </Tooltip>
      </div>
    </div>
  )
}

const VideoPlayer: React.FC<{ onClose: () => void; src: string; id: string }> = ({
  onClose,
  src,
  id,
}) => {
  return (
    <div className="p-5">
      <video id={id} controls style={{ width: '680px' }}>
        <source src={src} />
      </video>
      <div className="text-right mt-2">
        <Button type="primary" onClick={onClose}>
          关闭
        </Button>
      </div>
    </div>
  )
}

export const IMedia: React.FC<{ field: SchemaField; uri: string }> = ({ field, uri }) => {
  const { mediaType } = field
  const [{ visible, player, source, loading }, setState] = useSetState<{
    player: any
    source: string
    loading: boolean
    visible: boolean
  }>({
    source: '',
    player: null,
    loading: true,
    visible: false,
  })

  // 关闭媒体，弹窗
  const onClose = useCallback(() => {
    player?.stop()
    setState({ visible: false })
  }, [player])

  // 计算资源的 id
  const select = useMemo(() => {
    const code = hashCode(source)
    return mediaType === 'video' ? `v-${code}` : `a-${code}`
  }, [source])

  // 渲染媒体组件样式
  useEffect(() => {
    if (visible && !player) {
      const player = new Plyr(`#${select}`)
      setState({
        player,
      })
    }
  }, [visible, select, source])

  // 加载临时链接
  useEffect(() => {
    if (!uri?.length) {
      setState({ loading: false })
      return
    }

    if (!isFileId(uri)) {
      setState({ source: uri })
    }

    // 获取临时访问链接
    batchGetTempFileURL([uri])
      .then((results) => {
        setState({
          source: results[0].tempFileURL,
        })
      })
      .catch((e) => {
        console.log(e)
        message.error(`获取资源链接失败 ${e.message}`)
      })
      .finally(() => {
        setState({
          loading: false,
        })
      })
  }, [])

  if (loading) {
    return <Spin />
  }

  if (!uri) {
    return <span>-</span>
  }

  return (
    <div className="relative">
      <Tooltip title="播放">
        <PlayCircleTwoTone className="text-3xl" onClick={() => setState({ visible: true })} />
      </Tooltip>
      <Modal
        footer={null}
        width={720}
        closable={false}
        visible={visible}
        bodyStyle={{
          padding: 0,
        }}
        onCancel={onClose}
      >
        {mediaType === 'video' ? (
          <VideoPlayer onClose={onClose} src={source} id={select} />
        ) : (
          <AudioPlayer onClose={onClose} src={source} id={select} />
        )}
      </Modal>
    </div>
  )
}
