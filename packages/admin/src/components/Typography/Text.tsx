import React from 'react'
import { Typography } from 'antd'

const { Text } = Typography

export const BoldText: React.FC = ({ children }) => (
  <Text strong style={{ color: 'inherit' }}>
    {children}
  </Text>
)
