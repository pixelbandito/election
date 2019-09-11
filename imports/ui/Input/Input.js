// Third-party imports
// React
import React from 'react';
// Everything else
import classNames from 'classnames';

// Local imports
// ../
import WithThemeCssModule from '../WithThemeCssModule';
// ./
import styles from './Input.module.css';

const Input = React.forwardRef(({
  className,
  ...passedProps
}, ref) => <input
  {...passedProps}
  className={classNames(styles.Input, className)}
  ref={ref}
/>);

export default WithThemeCssModule(Input, styles);
