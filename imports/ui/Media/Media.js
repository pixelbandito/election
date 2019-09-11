// Third-party imports
// React
import React from 'react';
import classNames from 'classnames';
// Everything else

// Local imports
// ./
import styles from './Media.module.css';

const Media = props => (
  <div
    {...props}
    className={classNames(styles.Media, props.className)}
  />
);

const MediaItem = props => (
  <div
    {...props}
    className={classNames(styles.Item, props.className)}
  />
);

const MediaBody = props => (
  <div
    {...props}
    className={classNames(styles.Body, props.className)}
  />
);

Media.Item = MediaItem;
Media.Body = MediaBody;

export default Media;
