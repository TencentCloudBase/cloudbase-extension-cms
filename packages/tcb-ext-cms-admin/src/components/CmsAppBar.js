import React from 'react'
import { AppBar } from 'react-admin'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'

// import Logo from './Logo';

const useStyles = makeStyles({
  title: {
    flex: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },
  spacer: {
    flex: 1
  }
})

const MyAppBar = (props) => {
  const classes = useStyles()
  return (
    <AppBar {...props}>
      <img
        className="tcb-cms-app-logo"
        alt="云开发"
        src={require('../assets/images/tcb-logo.svg')}
      />
      <Typography variant="subtitle1" color="inherit" className={classes.title} id="tcbCmsAppTitle">
        CMS 内容管理系统
      </Typography>
    </AppBar>
  )
}

export default MyAppBar
