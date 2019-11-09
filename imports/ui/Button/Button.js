// Third-party imports
// React
import React from 'react';

// Everything else
import { Link, NavLink } from 'react-router-dom';

// Local imports
// ../
import WithClassName from '../WithClassName';
import WithThemeCssModule from '../WithThemeCssModule';
// ./
import styles from './Button.module.css';

const Button = (props) => (
  <button
    type="button"
    {...props}
  />
);

export const LinkButton = WithClassName(WithThemeCssModule(({
  themeKey,
  ...passedProps
}) => (
  <Link
    {...passedProps}
  />
), styles), styles.Button);

export const NavLinkButton = WithClassName(WithThemeCssModule(({
  themeKey,
  ...passedProps
}) => (
  <NavLink
    {...passedProps}
    activeClassName={styles.active}
  />
), styles), styles.Button);

export default WithClassName(WithThemeCssModule(Button, styles), styles.Button);
