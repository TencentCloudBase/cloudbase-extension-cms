import React from 'react'
import { useRequest } from 'umi'
import { Skeleton, Typography, Switch, Row, Col } from 'antd'

const { Title, Text } = Typography

export default (): React.ReactElement => {
  // const [reload, setReload] = useState(0)
  // const [selectedUser, setSelectedUser] = useState()
  // const [userAction, setUserAction] = useState<'create' | 'edit'>('create')
  // const [modalVisible, setModalVisible] = useState(false)

  // const { data, loading } = useRequest(() => getUsers(), {
  //   refreshDeps: [reload],
  // })

  // const { data: roles = [], loading: roleLoading } = useRequest(() => getUserRoles(), {
  //   refreshDeps: [reload],
  // })

  // if (loading || roleLoading) {
  //   return <Skeleton active />
  // }

  return (
    <>
      <Title level={4}>API 访问</Title>
      <Text type="secondary">开启 RESTful API 访问内容集合</Text>
      <Row gutter={[24, 24]} style={{ marginTop: 0 }}>
        <Col flex="0 0 80px">API 访问</Col>
        <Col>
          <Switch checkedChildren="开启" unCheckedChildren="关闭" defaultChecked />
        </Col>
      </Row>
    </>
  )
}
