import React from 'react';
import { Link } from 'react-router-dom';

const BackLink = (props) => (
  <Link {...props} to={props.to || '/polls'}>←</Link>
);
