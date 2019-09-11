// Third-party imports
// React
import React from 'react';
// Everything else
import { Route, Switch } from 'react-router-dom';
import classNames from 'classnames';

// Local imports
// ../
import { LinkButton } from '../Button';
import { themeKeys } from '../ThemeContext';
import AccountsUIWrapper from '../AccountsUIWrapper.js';
import BackLink from '../BackLink';
import WithThemeCssModule from '../WithThemeCssModule';
// ./
import styles from './PageHeader.module.css';

const PageHeader = ({
  className,
  hideNotMine,
  location,
  myPollsCount,
  setHideNotMine,
  setThemeKey,
  themeKey,
}) => (
  <header className={classNames(className, styles.PageHeader)}>
    <div className={styles.header}>
      <h1 className={styles.title}>
        <Switch>
          <Route path="/polls" exact />
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
        <AccountsUIWrapper />
      </div>
      <div className={classNames(styles.action, styles.filter)}>
        <label
          className={styles.filterLabel}
          htmlForm="labelFilter"
        >
          <input
            className={styles.filterCheck}
            checked={hideNotMine}
            id="labelFilter"
            onClick={() => setHideNotMine(!hideNotMine)}
            readOnly
            type="checkbox"
          />
          Show only my polls
        </label>
      </div>
      <div className={classNames(styles.action, styles.create)}>
        <LinkButton
          className={styles.createButton}
          to="/polls/create"
        >
          Create a poll
        </LinkButton>
      </div>
      <div className={classNames(styles.action, styles.theme)}>
        <label
          className={styles.themeLabel}
          htmlFor="selectTheme"
        >
          Choose a theme
        </label>
        <select
          className={styles.themeSelect}
          id="selectTheme"
          onChange={(event) => setThemeKey(event.target.value)}
        >
          {themeKeys.map(key => <option key={key}>{key}</option>)}
        </select>
      </div>
    </div>
  </header>
);

export default WithThemeCssModule(PageHeader, styles);
