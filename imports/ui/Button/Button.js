import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import style from './Button.module.css';

const Button = (props) => (
  <button
    type="button"
    {...props}
    className={classNames(style.Button, props.className)}
  />
);

export const LinkButton = (props) => (
  <Link
    {...props}
    className={classNames(style.Button, style.Link, props.className)}
  />
);

export default Button;
