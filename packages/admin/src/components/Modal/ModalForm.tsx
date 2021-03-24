import React, { MutableRefObject, useEffect, useRef, useState } from 'react'
import { FormInstance, ModalForm, ModalFormProps } from '@ant-design/pro-form'

export type ModalRefType =
  | {
      show?: () => void
      hide?: () => void
    }
  | undefined

/**
 * 使用 ref 操控的 modal form 组件
 */
export const RefModalForm: React.FC<
  {
    modalRef: MutableRefObject<ModalRefType>
  } & ModalFormProps
> = (props) => {
  const formRef = useRef<FormInstance>()
  const { modalRef, ...modalProps } = props
  const [visible, setVisible] = useState(false)

  // 设置 ref 属性
  useEffect(() => {
    const show = () => setVisible(true)
    const hide = () => setVisible(false)

    if (modalRef.current) {
      modalRef.current.show = show
      modalRef.current.hide = hide
    } else {
      modalRef.current = {
        show,
        hide,
      }
    }
  }, [])

  // 重置表单数据
  useEffect(() => {
    formRef.current?.resetFields()
  }, [visible])

  return (
    <ModalForm formRef={formRef} visible={visible} onVisibleChange={setVisible} {...modalProps}>
      {props.children}
    </ModalForm>
  )
}
