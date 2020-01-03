
// Third-party imports
// React
import React from 'react'
// Everything else
import classNames from 'classnames'

// Local imports
// ../
import styles from './Menu.module.css'

const Menu = ({
  className,
  ...passedProps
}) => (
  <div
    {...passedProps}
    className={classNames(className, styles.Menu)}
  />
)

export default Menu
