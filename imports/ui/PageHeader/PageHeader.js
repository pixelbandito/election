// Third-party imports
// React
import React, { useCallback, useState } from 'react'
// Everything else
import { Route, Switch } from 'react-router-dom'
import classNames from 'classnames'
import { Dropdown } from '@cision/rover-ui'

// Local imports
// ../
import Button, { LinkButton } from '../Button'
import buttonStyle from '../Button/Button.module.css'
import { themeKeys } from '../ThemeContext'
import AccountsUIWrapper from '../AccountsUIWrapper.js'
import BackLink from '../BackLink'
import WithThemeCssModule from '../WithThemeCssModule'
// ./
import styles from './PageHeader.module.css'

const PageHeader = ({
  className,
  currentUserProfile,
  hideNotMine,
  location,
  myPollsCount,
  setHideNotMine,
  setThemeKey,
  themeKey
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const handleToggle = useCallback(() => setIsOpen(!isOpen), [isOpen, setIsOpen])

  return (
    <header className={classNames(className, styles.PageHeader)}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Switch>
            <Route path='/polls' exact />
            <Route>
              <span className={styles.homeLink}>
                <BackLink />
              </span>
            </Route>
          </Switch>
          Polls
          <span className={styles.pollCount}>({myPollsCount})</span>
        </h1>
      </div>
      <div className={styles.actions}>
        <div className={classNames(styles.action, styles.account)}>
          {currentUserProfile ? (
            <Dropdown isOpen={isOpen} onToggle={handleToggle}>
              <Button onClick={handleToggle} className={buttonStyle.clear}>
                <span className={styles.dropdownLabel}>
                  {(currentUserProfile && currentUserProfile.userName) || 'Profile'}
                </span>
                <span className={styles.dropdownCaret}>▾</span>
              </Button>
              <Dropdown.Menu
                position='bottomLeft'
                style={{ background: 'white', width: '300px' }}
              >
                <Dropdown.Menu.Item>
                  <AccountsUIWrapper />
                </Dropdown.Menu.Item>
                <Dropdown.Menu.Item href='/profile'>
                  Edit profile
                </Dropdown.Menu.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <AccountsUIWrapper />
          )}
        </div>
        <div className={classNames(styles.action, styles.filter)}>
          <label
            className={styles.filterLabel}
            htmlFor='labelFilter'
          >
            <input
              className={styles.filterCheck}
              checked={hideNotMine}
              id='labelFilter'
              onClick={() => setHideNotMine(!hideNotMine)}
              readOnly
              type='checkbox'
            />
            Show only my polls
          </label>
        </div>
        <div className={classNames(styles.action, styles.create)}>
          <LinkButton
            className={styles.createButton}
            to='/polls/create'
            disabled={!currentUserProfile || undefined}
          >
            Create a poll
          </LinkButton>
        </div>
        <div className={classNames(styles.action, styles.theme)}>
          <label
            className={styles.themeLabel}
            htmlFor='selectTheme'
          >
            Choose a theme
          </label>
          <select
            className={styles.themeSelect}
            id='selectTheme'
            onChange={(event) => setThemeKey(event.target.value)}
          >
            {themeKeys.map(key => <option key={key}>{key}</option>)}
          </select>
        </div>
      </div>
    </header>
  )
}

export default WithThemeCssModule(PageHeader, styles)
