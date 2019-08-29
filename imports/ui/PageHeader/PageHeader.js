import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import AccountsUIWrapper from '../AccountsUIWrapper.js';
import ThemeContext, { themeKeys } from '../ThemeContext';
import WithThemeKey from '../WithThemeKey';

import style from './PageHeader.module.css';

const PageHeader = ({
  myPollsCount,
  hideNotMine,
  setHideNotMine,
  setThemeKey,
  themeKey,
}) => (
  <header className={classNames(style.MyPageHeader, style[themeKey])}>
    <h1 className={style.title}>Polls ({myPollsCount})</h1>

    <label className="hide-not-mine">
      <input
        type="checkbox"
        readOnly
        checked={hideNotMine}
        onClick={() => setHideNotMine(!hideNotMine)}
      />
      Show only my polls
    </label>

    <Link to="/polls/create">Create a poll</Link>

    <AccountsUIWrapper />

    <select onChange={(event) => setThemeKey(event.target.value)}>
      {themeKeys.map(key => <option key={key}>{key}</option>)}
    </select>
  </header>
);

export default WithThemeKey(PageHeader);
