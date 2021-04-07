import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
import { useSetState } from 'react-use'
import React, { useEffect } from 'react'
import { message, Modal, Spin, Tooltip, Typography } from 'antd'
import { CloseCircleFilled, CloseCircleOutlined, PlayCircleTwoTone } from '@ant-design/icons'
import { batchGetTempFileURL, getFileNameFromUrl, hashCode, isFileId } from '@/utils'
import styled from 'styled-components'

const { Text, Title } = Typography

const PlaylistContent = styled.div`
  max-height: 300px;
  overflow: auto;
  padding-right: 10px;
`

const PlayerCloseIcon = styled.div`
  display: flex;
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  color: #fff;
`

export const IMedia: React.FC<{ field: SchemaField; uri: string }> = ({ field, uri }) => {
  const { mediaType } = field

  const [{ loading, playlist }, setState] = useSetState<{
    loading: boolean
    playlist: string[]
  }>({
    loading: true,
    playlist: [],
  })

  // 获取临时链接
  useEffect(() => {
    // uri 为空
    if (!uri?.length) {
      setState({ loading: false })
      return
    }

    // 资源数组
    const uris = Array.isArray(uri) ? uri : [uri]

    if (!isFileId(uris[0])) {
      setState({ playlist: uris, loading: false })
      return
    }

    // 获取临时访问链接
    batchGetTempFileURL(uris)
      .then((results) => {
        setState({
          playlist: results.map((_) => _.tempFileURL),
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
      <MediaPlayer playlist={playlist} mediaType={mediaType} />
    </div>
  )
}

/**
 * 应用播放器，支持多个
 */
const MediaPlayer: React.FC<{
  playlist: string[]
  mediaType?: string
}> = ({ playlist, mediaType = 'video' }) => {
  // 多个资源
  const isMultiple = playlist?.length > 1

  const [{ currentUrl, player, visible }, setState] = useSetState<any>({
    player: null,
    visible: false,
    currentUrl: playlist[0],
  })

  // 关闭弹窗
  const closeModal = () => {
    player?.stop()
    setState({ visible: false })
  }

  // 切换视频/音频
  const togglePlay = (url: string) => {
    setState({ currentUrl: url })
  }

  // 不能直接复用一个元素，会出现样式丢失的问题
  const id = hashCode(currentUrl)

  // 渲染媒体组件样式
  useEffect(() => {
    if (!visible) return
    // player 不存在，初始化一个 player
    if (!player) {
      // 不能直接复用一个元素，会出现样式丢失的问题
      const target = mediaType === 'video' ? `#v-${id}` : `#a-${id}`
      const player = new Plyr(target)

      setState({
        player,
      })
    } else {
      // player 存在时，直接切换播放源
      player.source = {
        type: mediaType === 'video' ? 'video' : 'audio',
        sources: [
          {
            src: currentUrl,
          },
        ],
      }
      // 自动播放
      player.on('ready', () => {
        player?.play()
      })
    }
  }, [visible, currentUrl])

  // 视频播放
  return (
    <>
      <Tooltip title="播放">
        <PlayCircleTwoTone className="text-3xl" onClick={() => setState({ visible: true })} />
      </Tooltip>
      <Modal
        width={720}
        footer={null}
        closable={false}
        visible={visible}
        bodyStyle={{
          padding: 0,
        }}
        onCancel={closeModal}
      >
        {
          // 音乐播放
          mediaType === 'music' ? (
            <div>
              <div className="w-full flex">
                <div className="flex-auto">
                  <audio id={`a-${id}`} controls>
                    <source src={currentUrl} />
                  </audio>
                </div>
                <div className="flex items-center pr-5">
                  <Tooltip title="关闭">
                    <CloseCircleOutlined className="text-xl" onClick={closeModal} />
                  </Tooltip>
                </div>
              </div>
              {/* 播放列表 */}
              {isMultiple && (
                <Playlist playlist={playlist} current={currentUrl} onChange={togglePlay} />
              )}
            </div>
          ) : (
            // 视频播放
            <div className="relative">
              <video id={`v-${id}`} controls style={{ width: '680px' }}>
                <source src={currentUrl} />
              </video>

              {/* 播放列表 */}
              {isMultiple && (
                <Playlist playlist={playlist} current={currentUrl} onChange={togglePlay} />
              )}

              <PlayerCloseIcon>
                <Tooltip title="关闭">
                  <CloseCircleFilled className="text-3xl" onClick={closeModal} />
                </Tooltip>
              </PlayerCloseIcon>
            </div>
          )
        }
      </Modal>
    </>
  )
}

/**
 * 可选播放列表
 */
const Playlist: React.FC<{
  playlist: string[]
  current: string
  onChange: (url: string) => void
}> = ({ playlist, current, onChange }) => {
  return (
    <div className="p-5">
      <Title level={4}>播放列表</Title>
      <PlaylistContent>
        {playlist.map((_, i) => (
          <div className="flex justify-between my-2" key={i}>
            <Text
              ellipsis
              style={{
                maxWidth: '500px',
                color: current === _ ? '#0052d9' : '',
              }}
            >
              {getFileNameFromUrl(_)}
            </Text>
            <div>
              <Tooltip title="播放">
                <PlayCircleTwoTone className="text-2xl" onClick={() => onChange(_)} />
              </Tooltip>
            </div>
          </div>
        ))}
      </PlaylistContent>
    </div>
  )
}
