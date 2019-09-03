import React from 'react';
import classNames from 'classnames';

import AccountsUIWrapper from '../AccountsUIWrapper.js';
import { themeKeys } from '../ThemeContext';
import WithThemeKey from '../WithThemeKey';
import { LinkButton } from '../Button';

import styles from './PageHeader.module.css';

const PageHeader = ({
  myPollsCount,
  hideNotMine,
  setHideNotMine,
  setThemeKey,
  themeKey,
}) => (
  <header className={classNames(styles.PageHeader, styles[themeKey])}>
    <div className={styles.header}>
      <h1 className={styles.title}>Polls <span className={styles.pollCount}>({myPollsCount})</span></h1>
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
          class={styles.themeLabel}
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

export default WithThemeKey(PageHeader);
