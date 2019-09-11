// Third-party imports
// React
import React from 'react';
// Everything else
import classNames from 'classnames';

// Local imports
// ../
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
