
// Third-party imports
// React
import React, { useEffect } from 'react'
// Everything else
import classNames from 'classnames'

// Local imports
// ../
import MenuMoon from './Menu'
import styles from './Dropdown.module.css'

export const isOpenContext = React.createContext(false)

const Dropdown = ({
  children,
  className,
  disabled,
  isOpen,
  onToggle,
  ...passedProps
}) => {
  const dropdown = React.createRef()

  const handleDocumentClick = React.useCallback(
    event => {
      const dropdownEl = dropdown && dropdown.current

      // If the click was inside the dropdown, don't close it
      if (
        !dropdownEl ||
        (dropdownEl.contains(event.target) && dropdownEl !== event.target)
      ) {
        return
      }

      onToggle(event)
    },
    [dropdown, onToggle]
  )

  const handleKeyUp = React.useCallback(
    event => {
      // Escape key closes the dropdown
      if (event.key === 'Escape') {
        onToggle(event)
      }
    },
    [onToggle]
  )

  useEffect(() => {
    if (isOpen && !disabled) {
      document.addEventListener('click', handleDocumentClick, true)
      document.addEventListener('keyup', handleKeyUp)
    }

    if (!isOpen || disabled) {
      document.removeEventListener('click', handleDocumentClick, true)
      document.removeEventListener('keyup', handleKeyUp)
    }

    return () => {
      document.removeEventListener('click', handleDocumentClick, true)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [disabled, handleDocumentClick, handleKeyUp, isOpen, onToggle])

  return (
    <div
      {...passedProps}
      className={classNames(styles.Dropdown, className, {
        [styles.isOpen]: isOpen
      })}
      ref={dropdown}
    >
      <isOpenContext.Provider value={isOpen && !disabled}>
        {children}
      </isOpenContext.Provider>
    </div>
  )
}

export const Menu = MenuMoon
Dropdown.Menu = Menu

export default Dropdown
