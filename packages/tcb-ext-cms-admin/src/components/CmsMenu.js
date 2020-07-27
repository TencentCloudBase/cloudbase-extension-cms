import React, { createElement } from 'react'
import { useSelector } from 'react-redux'
import { useMediaQuery } from '@material-ui/core'
import { MenuItemLink, getResources } from 'react-admin'
import { withRouter } from 'react-router-dom'

import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles({
  desc: {
    padding: '15px 20px',
    color: '#111'
  }
})

const Menu = ({ onMenuClick, logout }) => {
  const classes = useStyles()
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down('xs'))
  const open = useSelector((state) => state.admin.ui.sidebarOpen)
  const resources = useSelector(getResources)
  const subtitleRecord = {}
  return (
    <div>
      {resources.map((resource) => {
        const group = resource.options?.group
        const showSubtitle = group && !(group in subtitleRecord)
        if (showSubtitle) {
          subtitleRecord[group] = true
        }
        return (
          <React.Fragment key={resource.name}>
            {showSubtitle && (
              <>
                <Typography variant="body2" color="inherit" key={group} className={classes.desc}>
                  {group}
                </Typography>
              </>
            )}
            <MenuItemLink
              key={resource.name}
              to={`/${resource.name}`}
              primaryText={resource.options?.label || resource.name}
              leftIcon={createElement(resource.icon)}
              onClick={onMenuClick}
              sidebarIsOpen={open}
            />
          </React.Fragment>
        )
      })}
      {isXSmall && logout}
    </div>
  )
}

export default withRouter(Menu)
