import React from 'react';
import ThemeContext from './ThemeContext';

const WithThemeKey = BaseComponent => React.forwardRef((props, ref) => (
  <ThemeContext.Consumer>
    {themeKey => (
      <BaseComponent
        {...props}
        ref={ref}
        themeKey={themeKey || ''}
      />
    )}
  </ThemeContext.Consumer>
));

export default WithThemeKey;
