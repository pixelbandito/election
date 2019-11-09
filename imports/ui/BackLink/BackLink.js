// Third-party imports
// React
import React from 'react';
// Everything else
import classNames from 'classnames';

// Local imports
// ../
import { LinkButton } from '../Button';
import buttonStyle from '../Button/Button.module.css';

const BackLink = ({
  className,
  to,
  ...passedProps
}) => (
  <LinkButton
    {...passedProps}
    className={classNames(className, buttonStyle.clear)}
    to={to || '/polls'}>
    ⌂
  </LinkButton>
);

export default BackLink;
