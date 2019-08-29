import React from 'react';
import classNames from 'classnames';
import style from './Media.module.css';

const Media = props => (
  <div
    {...props}
    className={classNames(style.Media, props.className)}
  />
);

const MediaItem = props => (
  <div
    {...props}
    className={classNames(style.Item, props.className)}
  />
);

const MediaBody = props => (
  <div
    {...props}
    className={classNames(style.Body, props.className)}
  />
);

Media.Item = MediaItem;
Media.Body = MediaBody;

export default Media;
