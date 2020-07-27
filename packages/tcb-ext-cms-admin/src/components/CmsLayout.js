import React from 'react'
import { Layout } from 'react-admin'
import CmsAppBar from './CmsAppBar'
import Typography from '@material-ui/core/Typography'

const CmsLayout = (props) => {
  return (
    <Layout
      {...props}
      appBar={CmsAppBar}
      // menu={MyMenu}
      // notification={MyNotification}
    >
      <Typography variant="h6" color="inherit" id="react-admin-title" />
      {props.children}
    </Layout>
  )
}

export default CmsLayout
