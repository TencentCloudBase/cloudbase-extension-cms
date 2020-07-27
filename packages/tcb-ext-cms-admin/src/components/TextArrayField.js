import Chip from '@material-ui/core/Chip'
import React from 'react'

const TextArrayField = ({ record, source }) => (
  <>
    {record[source] &&
      Array.isArray(record[source]) &&
      record[source].map((item) => <Chip style={{ margin: 2 }} label={item} key={item} />)}
  </>
)
TextArrayField.defaultProps = { addLabel: true }

export default TextArrayField
