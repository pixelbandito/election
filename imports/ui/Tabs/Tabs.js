import React from 'react';

import WithClassName from '../WithClassName';
import WithThemeCssModule from '../WithThemeCssModule';
import styles from './Tabs.module.css';

const Tabs = ({
  themeKey,
  ...passedProps
}) => <div {...passedProps} />;

export default WithClassName(WithThemeCssModule(Tabs, styles), styles.Tabs);
