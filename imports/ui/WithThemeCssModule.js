import React from 'react';
import classNames from 'classnames';

import ThemeContext from './ThemeContext';

const WithThemeCssModule = (BaseComponent, styles) => React.forwardRef((props, ref) => (
  <ThemeContext.Consumer>
    {themeKey => (
      <BaseComponent
        {...props}
        ref={ref}
        className={classNames(
          props.className,
          styles[themeKey],
          props.modifiers && props.modifiers.length ? props.modifiers.map(m => styles[m]) : [],
        )}
      />
    )}
  </ThemeContext.Consumer>
));

export default WithThemeCssModule;
