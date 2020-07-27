import React from 'react'
import Typography from '@material-ui/core/Typography'

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
        <small>预览链接</small>
      </p>
      <a href={src} title={title} target="_blank" rel="noopener noreferrer">
        {src}
      </a>
    </>
  )
}

function isType(type) {
  return function (obj) {
    return Object.prototype.toString.call(obj) === '[object ' + type + ']'
  }
}
