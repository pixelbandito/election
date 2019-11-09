import React from 'react';
import classNames from 'classnames';

const WithClassName = (BaseComponent, className) => React.forwardRef((props, ref) => (
  <BaseComponent
    {...props}
    ref={ref}
    className={classNames(
      props.className,
      className,
    )}
  />
));

export default WithClassName;
