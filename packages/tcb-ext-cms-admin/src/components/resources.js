import React, { Suspense } from 'react'
import {
  List,
  Datagrid,
  TextField,
  ReferenceField,
  EditButton,
  Edit,
  TextInput,
  SimpleForm,
  ReferenceInput,
  SelectInput,
  SelectArrayInput,
  Create,
  Filter,
  Show,
  SimpleShowLayout,
  RichTextField,
  DateField,
  ArrayField,
  BooleanField,
  NumberField,
  SelectField,
  ReferenceArrayField,
  EmailField,
  ArrayInput,
  AutocompleteInput,
  AutocompleteArrayInput,
  BooleanInput,
  DateInput,
  DateTimeInput,
  ImageInput,
  FileInput,
  NumberInput,
  PasswordInput,
  ReferenceArrayInput,
  SingleFieldList,
  ChipField,
  SimpleFormIterator,
  FormDataConsumer,
  SimpleList,
  required,
  minLength,
  maxLength,
  regex,
  email,
  number
} from 'react-admin'
import { useMediaQuery, Chip, LinearProgress } from '@material-ui/core'
import IconInput from './IconInput'
import IconField from './IconField'
import UrlField from './UrlField'
import ImageField from './ImageField'
import FileField from './FileField'
import MarkdownField from './MarkdownField'
import TextArrayField from './TextArrayField'
import Typography from '@material-ui/core/Typography'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

/**
 * 生成一组资源操作组件
 */
export const ResourceComponentsFactory = (collectionConfig) => {
  const { fields, label, description } = collectionConfig
  const ResourceTitle = ({ record }) => {
    return (
      <span>
        {label} / {record ? `#${record.id}` : ''}
      </span>
    )
  }
  const canFilterFieldsType = [
    'String',
    'Number',
    'DateTime',
    'Date',
    'Boolean',
    'Email',
    'Tel',
    'Url',
    'Connect'
  ]
  const filterFields = fields.filter((field) => canFilterFieldsType.includes(field.fieldType))
  const ResourceFilter = (props) => (
    <Filter {...props}>
      {filterFields.map((fieldConfig) => {
        return getFilterFieldEditComponent(fieldConfig)
      })}
    </Filter>
  )
  const expandFieldsFilter = (field) =>
    ['RichText', 'Markdown'].includes(field.fieldType) || field.childFields
  const expandFields = fields.filter(expandFieldsFilter)
  const rowFields = fields
    .filter((field) => !expandFieldsFilter(field))
    .filter((field) => {
      return 'hidden' in field ? !field.hidden : true
    })
  const textField = fields.find((field) => field.fieldType === 'String')
  const dateField = fields.find((field) => ['Date', 'DateTime'].includes(field.fieldType))

  const ExpandShow = (props) => (
    <Show
      {...props}
      /* disable the app title change when shown */
      title=" "
      className="tcb-cms-expand"
    >
      <SimpleShowLayout>
        {expandFields.map((fieldConfig) => {
          return getFieldShowComponent(fieldConfig)
        })}
      </SimpleShowLayout>
    </Show>
  )

  return {
    ListComponent: (props) => {
      const isSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'))
      return (
        <>
          {description && (
            <Typography variant="body1" color="inherit" className="tcb-cms-desc">
              {description}
            </Typography>
          )}
          <List
            filters={<ResourceFilter />}
            {...props}
            sort={{ field: 'order', order: 'DESC' }}
            title={label}
          >
            {isSmall ? (
              <SimpleList
                primaryText={(record) => record[textField?.fieldName || 'id']}
                secondaryText={(record) => {
                  return record[dateField?.fieldName]
                    ? format(new Date(record[dateField?.fieldName]), 'PPpp', {
                        locale: zhCN
                      })
                    : ''
                }}
                tertiaryText={() => '...'}
                linkType="show"
              />
            ) : (
              <Datagrid {...(expandFields.length ? { expand: ExpandShow } : {})}>
                {rowFields.map((fieldConfig) => {
                  return getFieldShowComponent(fieldConfig)
                })}
                <EditButton />
              </Datagrid>
            )}
          </List>
        </>
      )
    },
    ShowComponent: React.memo((props) => {
      return (
        <Show {...props} title={<ResourceTitle />}>
          <SimpleShowLayout>
            {fields.map((fieldConfig) => {
              return getFieldShowComponent(fieldConfig)
            })}
          </SimpleShowLayout>
        </Show>
      )
    }),
    CreateComponent: React.memo((props) => {
      return (
        <Create {...props} title={`${label} / 新建`} undoable={false}>
          <SimpleForm className="tcb-cms-form">
            {fields.map((fieldConfig) => {
              return getFieldEditComponent(fieldConfig)
            })}
          </SimpleForm>
        </Create>
      )
    }),
    EditComponent: React.memo((props) => {
      return (
        <Edit title={<ResourceTitle />} {...props} undoable={false}>
          <SimpleForm className="tcb-cms-form">
            <TextInput disabled source="id" />
            {fields.map((fieldConfig) => {
              return getFieldEditComponent(fieldConfig)
            })}
          </SimpleForm>
        </Edit>
      )
    })
  }
}

/**
 * 渲染单个字段展示
 */
function getFieldShowComponent(fieldConfig) {
  const { fieldName, fieldType, fieldLabel, hidden = false } = fieldConfig
  if (hidden) return <TextField key={fieldName} />
  if (fieldType === 'Connect') {
    return getShowConnectComponent(fieldConfig)
  }

  if (fieldType === 'Array') {
    return getShowArrayComponent(fieldConfig)
  }

  const FieldComponent = getShowComponentByType(fieldType, fieldConfig)

  return <FieldComponent label={fieldLabel} key={fieldName} source={fieldName} />
}

/**
 * 渲染单个字段编辑
 */
function getFieldEditComponent(fieldConfig) {
  let {
    fieldName,
    fieldType,
    fieldLabel,
    defaultValue,
    helpText,
    expectField,
    expectValue
  } = fieldConfig
  if (fieldName === 'id') return null

  if (fieldType === 'Array') {
    return getEditArrayComponent(fieldConfig)
  }

  const FieldComponent = getInputComponentByType(fieldType, fieldConfig)

  return (
    <FormDataConsumer key={fieldName}>
      {({ formData, scopedFormData, getSource, ...props }) => {
        function getFormValue(formData, scopedFormData, expectField) {
          if (scopedFormData) {
            return scopedFormData[expectField]
          } else {
            return formData[expectField]
          }
        }

        if (expectField && getFormValue(formData, scopedFormData, expectField) !== expectValue) {
          return null
        }

        if (fieldName === 'defaultValue') {
          fieldType = getFormValue(formData, scopedFormData, 'fieldType')

          if (!['String'].includes(fieldType)) {
            return null
          }
        }

        if (fieldName === 'isRequired') {
          fieldType = getFormValue(formData, scopedFormData, 'fieldType')

          if (['Connect'].includes(fieldType)) {
            return null
          }
        }

        if (fieldName === 'connectField') {
          let connectResource = getFormValue(formData, scopedFormData, 'connectResource')

          if (connectResource) {
            let options = getConnectFieldsOption(connectResource)

            return (
              <SelectInput
                {...props}
                label={fieldLabel}
                key={fieldName}
                source={getSource ? getSource(fieldName) : fieldName}
                initialValue={defaultValue}
                helperText={helpText}
                choices={options}
              />
            )
          }
        }

        if (fieldType === 'Connect') {
          return getEditConnectComponent({
            ...fieldConfig,
            fieldName: getSource ? getSource(fieldName) : fieldName
          })
        }

        const validate = getValidate(fieldType, fieldConfig)

        return (
          <FieldComponent
            {...props}
            label={fieldLabel}
            key={fieldName}
            source={getSource ? getSource(fieldName) : fieldName}
            validate={validate}
            initialValue={defaultValue}
            helperText={helpText}
          />
        )
      }}
    </FormDataConsumer>
  )
}

/**
 * 渲染单个字段编辑
 */
function getFilterFieldEditComponent(fieldConfig) {
  const { fieldName, fieldType, fieldLabel } = fieldConfig
  if (fieldName === 'id') return null
  if (fieldType === 'Connect') {
    return getEditConnectComponent(fieldConfig)
  } else if (fieldType === 'Array') {
    return getEditArrayComponent(fieldConfig)
  }

  const FieldComponent = getInputComponentByType(fieldType, fieldConfig)
  const validate = getValidate(fieldType, fieldConfig)
  return (
    <FieldComponent label={fieldLabel} key={fieldName} source={fieldName} validate={validate} />
  )
}

/**
 * 根据类型获取展示字段组件
 */
function getShowComponentByType(type, fieldConfig) {
  let Component
  switch (type) {
    case 'String':
      Component = TextField
      break
    case 'Markdown':
      Component = MarkdownField
      break
    case 'RichText':
      Component = RichTextField
      break
    case 'Url':
      Component = UrlField
      break
    case 'Email':
      Component = EmailField
      break
    case 'Date':
      Component = DateField
      break
    case 'DateTime':
      Component = (props) => <DateField {...props} showTime />
      break
    case 'Array':
      Component = ArrayField
      break
    case 'Boolean':
      Component = BooleanField
      break
    case 'Image':
      Component = ImageField
      break
    case 'File':
      Component = FileField
      break
    case 'Number':
      Component = NumberField
      break
    case 'Select':
      Component = (props) => <SelectField {...props} choices={fieldConfig.options}></SelectField>
      break
    case 'SelectArray':
      Component = ({ record, source }) => {
        if (record.role !== 'other') {
          return <span>全部</span>
        }

        return (
          <>
            {record[source] ? (
              record[source].map((item) => <Chip style={{ margin: 2 }} label={item} key={item} />)
            ) : (
              <span>无</span>
            )}
          </>
        )
      }
      break
    case 'Password':
      Component = TextField
      break
    case 'Icon':
      Component = IconField
      break
    default:
      Component = TextField
      break
  }
  return Component
}

/**
 * 根据类型获取输入字段组件
 */
function getInputComponentByType(type, fieldConfig) {
  let Component
  switch (type) {
    case 'String':
      Component = TextInput
      break
    case 'Email':
      Component = (props) => <TextInput {...props} type="email" />
      break
    case 'Url':
      Component = (props) => <TextInput {...props} type="url" />
      break
    case 'RichText':
      Component = LazyloadComponet(React.lazy(() => import('ra-input-rich-text')))
      break
    case 'Markdown':
      Component = LazyloadComponet(React.lazy(() => import('./MarkdownInput')))
      break
    case 'Date':
      Component = DateInput
      break
    case 'DateTime':
      Component = DateTimeInput
      break
    case 'Array':
      Component = ArrayInput
      break
    case 'Boolean':
      Component = BooleanInput
      break
    case 'Image':
      Component = (props) => (
        <ImageInput {...props} accept="image/*">
          <ImageField source={props.source} />
        </ImageInput>
      )
      break
    case 'File':
      Component = (props) => (
        <FileInput {...props}>
          <FileField source={props.source} title="title" />
        </FileInput>
      )
      break
    case 'Number':
      Component = NumberInput
      break
    case 'Select':
      Component = (props) => <SelectInput {...props} choices={fieldConfig.options} />
      break
    case 'SelectArray':
      Component = (props) => <SelectArrayInput {...props} choices={fieldConfig.options} />
      break
    case 'Password':
      Component = PasswordInput
      break
    case 'Icon':
      Component = IconInput
      break
    default:
      Component = TextInput
      break
  }
  return Component
}

/**
 * 根据类型获取验证函数
 */
function getValidate(type, fieldConfig) {
  const { isRequired, stringMaxLength, stringMinLength } = fieldConfig

  let validate = []

  if (isRequired) {
    validate.push(required())
  }

  switch (type) {
    case 'String':
      if (stringMinLength) {
        validate.push(minLength(stringMinLength))
      }

      if (stringMaxLength) {
        validate.push(maxLength(stringMaxLength))
      }
      break
    case 'Url':
      validate.push(regex(/^https?:\/\/[^\s$.?#].[^\s]*$/, '请输入正确的网址'))
      break
    case 'Email':
      validate.push(email())
      break
    case 'Number':
      validate.push(number())
      break
    case 'Tel':
      validate.push(regex(/^((\d{11})|(\d{7,8})|(\d{4}|\d{3})-(\d{7,8}))$/, '请输入正确的电话号码'))
      break
    default:
      break
  }
  return validate
}

/**
 * 获取关联编辑组件
 */
function getEditConnectComponent(fieldConfig) {
  const { fieldName, fieldLabel, connectResource, connectField, connectMany } = fieldConfig

  if (connectMany) {
    return (
      <ReferenceArrayInput
        label={fieldLabel}
        source={fieldName}
        reference={getConnectResourceCollectionName(connectResource)}
        key={fieldName}
        perPage={1000}
      >
        <AutocompleteArrayInput optionText={connectField} allowEmpty />
      </ReferenceArrayInput>
    )
  } else {
    return (
      <ReferenceInput
        label={fieldLabel}
        source={fieldName}
        reference={getConnectResourceCollectionName(connectResource)}
        key={fieldName}
        perPage={1000}
        allowEmpty
      >
        <AutocompleteInput optionText={connectField} allowEmpty />
      </ReferenceInput>
    )
  }
}

/**
 * 获取关联展示组件
 */
function getShowConnectComponent(fieldConfig) {
  const { fieldName, fieldLabel, connectResource, connectField, connectMany } = fieldConfig
  if (connectMany) {
    return (
      <ReferenceArrayField
        label={fieldLabel}
        source={fieldName}
        reference={getConnectResourceCollectionName(connectResource)}
        key={fieldName}
      >
        <SingleFieldList linkType="show">
          <ChipField source={connectField} />
        </SingleFieldList>
      </ReferenceArrayField>
    )
  } else {
    return (
      <ReferenceField
        label={fieldLabel}
        source={fieldName}
        reference={getConnectResourceCollectionName(connectResource)}
        allowEmpty
        key={fieldName}
      >
        <TextField source={connectField} />
      </ReferenceField>
    )
  }
}

/**
 * 渲染数组字段
 */
function getShowArrayComponent(fieldConfig) {
  const { fieldName, fieldLabel, childFields } = fieldConfig
  const isChildFieldsTypeArray = Array.isArray(childFields)
  return childFields ? (
    <ArrayField source={fieldName} key={fieldName} label={fieldLabel}>
      {isChildFieldsTypeArray && (
        <Datagrid>
          {childFields.map((childFieldConfig) => {
            return getFieldShowComponent(childFieldConfig)
          })}
        </Datagrid>
      )}
    </ArrayField>
  ) : (
    <TextArrayField source={fieldName} key={fieldName} label={fieldLabel} />
  )
}

/**
 * 渲染数组字段编辑
 */
function getEditArrayComponent(fieldConfig) {
  const { fieldName, fieldLabel, childFields, defaultValue } = fieldConfig
  const isChildFieldsTypeArray = Array.isArray(childFields)

  return (
    <ArrayInput source={fieldName} key={fieldName} label={fieldLabel} initialValue={defaultValue}>
      <SimpleFormIterator className="tcb-cms-array-input">
        {isChildFieldsTypeArray ? (
          childFields.map((childFieldConfig) => {
            return getFieldEditComponent(childFieldConfig)
          })
        ) : (
          <TextInput label={fieldLabel} />
        )}
      </SimpleFormIterator>
    </ArrayInput>
  )
}

function LazyloadComponet(LazyComponent) {
  return (props) => (
    <Suspense fallback={<LinearProgress />}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

function getConnectResourceCollectionName(connectResource) {
  return window.cmsConfig.resourceIndexById[connectResource]?.collectionName || connectResource
}

function getConnectFieldsOption(connectResource) {
  const resourceCollectionName = getConnectResourceCollectionName(connectResource)

  return window.cmsConfig.resourceIndexByCollectionName[resourceCollectionName].fields
    .filter((fieldConfig) => fieldConfig.fieldType !== 'Connect')
    .map((fieldConfig) => {
      return {
        id: fieldConfig.fieldName,
        name: fieldConfig.fieldLabel
      }
    })
}
