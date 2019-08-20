import React, { Component, Fragment, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import PollForm from '../PollForm';
import { Polls } from '../../api/polls.js';

/*
candidates: [],
dateCreated: new Date(0).valueOf(),
dateUpdated: new Date(0).valueOf(),
enabled: false,
public: false,
name: '',
ownerId: '',
*/

// Poll component - represents a single todo item
const Summary = ({
  ballotsCount,
  poll,
  ownedByCurrentUser,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Give polls a different className when they are checked off,
  // so that we can style them nicely in CSS
  const pollClassName = classNames({
    editable: ownedByCurrentUser,
    enabled: !poll.enabled,
    public: poll.enabled,
    private: !poll.enabled,
    disabled: !poll.enabled,
  });

  const handleClickDelete = (event) => {
    const confirmed = confirm('Are you sure you want to delete this poll?');

    if (confirmed) {
      Meteor.call('polls.remove', poll._id);
    }
  };

  return (
    <li className={pollClassName}>
      {!isEditing && (
        <Fragment>
          <span className="text">
            {poll.name && <h4>{poll.name}</h4>}
            <p><em>Created {Date(poll.dateCreated).toLocaleString()}</em></p>
            {poll.candidates && poll.candidates.length && <p>Candidates: {poll.candidates.map(c => c.name).join(', ')}</p>}
            <p>{poll.enabled ? 'Enabled' : 'Disabled'}, {poll.public ? 'public' : 'private'}</p>
            <p>Votes: {ballotsCount}</p>
            {ownedByCurrentUser}
          </span>
          {poll.enabled &&
            <Link to={`/polls/${poll._id}/vote`} >
              Vote!
            </Link>
          }
          {ownedByCurrentUser &&
            <Link to={`/polls/${poll._id}/results`}>
              See results
            </Link>
          }
          {ownedByCurrentUser ? (
            <Fragment>
              <Link to={`/polls/${poll._id}/edit`}>
                Edit
              </Link>
              <button type="button" onClick={handleClickDelete}>
                &times;
              </button>
            </Fragment>
          ) : ''}
        </Fragment>
      )}
      {isEditing && (
        <PollForm
          initPollForm={poll}
          onBack={() => setIsEditing(false)}
          onSubmit={(pollForm) => {
            Meteor.call('polls.set', pollForm);
            setIsEditing(false);
          }}
        />
      )}
    </li>
  );
}

export default Summary;
