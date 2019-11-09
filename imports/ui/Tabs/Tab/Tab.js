import React from 'react';

import WithClassName from '../../WithClassName';
import WithThemeCssModule from '../../WithThemeCssModule';
import styles from './Tab.module.css';

const Tab = ({
  themeKey,
  ...passedProps
}) => <div {...passedProps} />;

export default WithClassName(WithThemeCssModule(Tab, styles), styles.Tab);
