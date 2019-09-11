// Third-party imports
// React
import React from 'react';

// Everything else
import { Link } from 'react-router-dom';
import classNames from 'classnames';

// Local imports
// ../
import WithThemeCssModule from '../WithThemeCssModule';
// ./
import styles from './Button.module.css';

const Button = (props) => (
  <button
    type="button"
    {...props}
    className={classNames(styles.Button, props.className)}
  />
);

export const LinkButton = WithThemeCssModule((props) => (
  <Link
    {...props}
    className={classNames(styles.Button, styles.Link, props.className)}
  />
), styles);

export default WithThemeCssModule(Button, styles);
