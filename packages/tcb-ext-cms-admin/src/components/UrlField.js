import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LaunchIcon from '@material-ui/icons/Launch'

const useStyles = makeStyles({
  link: {
    textDecoration: 'none',
    display: 'block',
    wordBreak: 'break-all'
  },
  icon: {
    width: '0.5em',
    paddingLeft: 2
  }
})

const UrlField = ({ record = {}, source }) => {
  const classes = useStyles()
  const link = record[source]
  return link ? (
    <a href={link} className={classes.link} target="_blank" rel="noopener noreferrer">
      {link}
      <LaunchIcon className={classes.icon} />
    </a>
  ) : null
}

export default UrlField
