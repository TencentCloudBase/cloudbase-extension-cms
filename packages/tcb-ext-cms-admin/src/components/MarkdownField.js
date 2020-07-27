import React from 'react'
import get from 'lodash/get'
import Typography from '@material-ui/core/Typography'

import * as Showdown from 'showdown'

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true
})

export default ({ className, emptyText, source, record = {}, stripTags, ...rest }) => {
  const value = get(record, source)

  return (
    <Typography className={className} variant="body2" component="span">
      <span dangerouslySetInnerHTML={{ __html: converter.makeHtml(value) }} />
    </Typography>
  )
}
