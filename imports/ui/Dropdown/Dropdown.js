
// Third-party imports
// React
import React from 'react'
// Everything else
import classNames from 'classnames'

// Local imports
// ../
import styles from './Dropdown.module.css'

const Dropdown = ({
  className,
  ...passedProps
}) => (
  <div
    {...passedProps}
    className={classNames(className, styles.Dropdown)}
  />
)

export default Dropdown
