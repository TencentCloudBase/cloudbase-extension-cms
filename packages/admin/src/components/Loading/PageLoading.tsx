import React from 'react'
import { Spin } from 'antd'
import styled from 'styled-components'

const LoadingBox = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100vh;
`

export default () => (
  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Spin size="large" />
  </div>
)

// export default () => {
//   return (
//     <LoadingBox id="loading">
//       <div className="boxes">
//         <div className="box">
//           <div />
//           <div />
//           <div />
//           <div />
//         </div>
//         <div className="box">
//           <div />
//           <div />
//           <div />
//           <div />
//         </div>
//         <div className="box">
//           <div />
//           <div />
//           <div />
//           <div />
//         </div>
//         <div className="box">
//           <div />
//           <div />
//           <div />
//           <div />
//         </div>
//       </div>
//     </LoadingBox>
//   )
// }
