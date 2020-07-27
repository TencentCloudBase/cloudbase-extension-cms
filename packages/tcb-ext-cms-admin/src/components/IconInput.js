import React, { useState } from 'react'
import MaterialUiIconPicker from 'react-material-ui-icon-picker'
import { useInput } from 'react-admin'
import Icon from '@material-ui/core/Icon'
import Typography from '@material-ui/core/Typography'

export default (props) => {
  const {
    input: { onChange }
  } = useInput(props)

  const [icon, updateIcon] = useState(props.record[props.source])
  const { pickLabel = '选择图标', cancelLabel = '取消', modalTitle = '图标选择器' } = props

  return (
    <div className="tcb-cms-icon-input">
      <Typography
        variant="caption"
        paragraph
        style={{ margin: '20px 0 10px', color: 'rgba(0, 0, 0, 0.54)' }}
      >
        图标设置
      </Typography>
      <MaterialUiIconPicker
        label={pickLabel}
        pickLabel={pickLabel}
        cancelLabel={cancelLabel}
        modalTitle={modalTitle}
        onPick={(icon) => {
          updateIcon(icon.name)
          onChange(icon.name)
        }}
      ></MaterialUiIconPicker>
      <Icon>{icon ? icon : 'library_books'}</Icon>
    </div>
  )
}
