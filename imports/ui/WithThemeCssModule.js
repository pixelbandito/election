import React from 'react';
import classNames from 'classnames';

import ThemeContext from './ThemeContext';

const WithThemeCssModule = (BaseComponent, styles) => React.forwardRef((props, ref) => (
  <ThemeContext.Consumer>
    {themeKey => (
      <BaseComponent
        {...props}
        ref={ref}
        themeKey={themeKey || ''}
        className={classNames(props.className, styles[themeKey])}
      />
    )}
  </ThemeContext.Consumer>
));

export default WithThemeCssModule;
