import React, { Component, Fragment, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import classNames from 'classnames';

import PollForm from '../PollForm';
import { Polls } from '../../api/polls.js';

/*
candidates: [],
dateCreated: new Date(0).valueOf(),
dateUpdated: new Date(0).valueOf(),
enabled: false,
name: '',
ownerId: '',
*/

// Poll component - represents a single todo item
const Poll = ({
  poll,
  ownedByCurrentUser,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Give polls a different className when they are checked off,
  // so that we can style them nicely in CSS
  const pollClassName = classNames({
    editable: ownedByCurrentUser,
    enabled: !poll.enabled,
    disabled: !poll.enabled,
  });

  return (
    <li className={pollClassName}>
      {!isEditing ? (
        <Fragment>
          <span className="text">
            {JSON.stringify(poll)}
            {ownedByCurrentUser}
          </span>

          {ownedByCurrentUser ? (
            <Fragment>
              <button type="button" onClick={() => setIsEditing(true)}>
                Edit
              </button>
              <button type="button" onClick={() => Meteor.call('polls.remove', poll._id)}>
                &times;
              </button>
            </Fragment>
          ) : ''}
        </Fragment>
      ) : (
        <PollForm
          initPollForm={poll}
          onSubmit={(pollForm) => {
            Meteor.call('polls.set', pollForm);
            setIsEditing(false);
          }}
        />
      )}
    </li>
  );
}

export default Poll;
