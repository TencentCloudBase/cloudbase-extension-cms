import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(
  {
    list: {
      display: 'flex',
      listStyleType: 'none'
    },
    image: {
      margin: '0.5rem',
      maxHeight: '10rem'
    }
  },
  { name: 'RaImageField' }
)

export default (props) => {
  const { className, emptyText, record, source, title } = props
  let sourceValue
  let src

  if (isType('Object')(record) && source in record) {
    sourceValue = record[source]
  } else {
    sourceValue = record
  }

  if (typeof sourceValue === 'string') {
    src = sourceValue
  } else {
    src = sourceValue && sourceValue.tempUrl
  }

  const classes = useStyles(props)
  if (!src) {
    return emptyText ? (
      <Typography component="span" variant="body2" className={className}>
        {emptyText}
      </Typography>
    ) : (
      <div className={className} />
    )
  }

  return (
    <>
      <p>
        <small>预览图片</small>
      </p>
      <img className={classes.image} src={src} alt={title} />
    </>
  )
}

function isType(type) {
  return function (obj) {
    return Object.prototype.toString.call(obj) === '[object ' + type + ']'
  }
}
