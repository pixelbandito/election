import React from 'react';
import classNames from 'classnames';

import { LinkButton } from '../Button';
import buttonStyle from '../Button/Button.module.css';

const BackLink = (props) => (
  <LinkButton
    {...props} 
    className={classNames(props.className, buttonStyle.clear)}
    to={props.to || '/polls'}>
    ⌂
  </LinkButton>
);

export default BackLink;
