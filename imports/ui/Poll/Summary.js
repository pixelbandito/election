import { Meteor } from 'meteor/meteor';
import React, { Fragment, useState } from 'react';
import classNames from 'classnames';

// Local imports, by proximity
import { LinkButton } from '../Button';
import buttonStyle from '../Button/Button.module.css';
import Media from '../Media';
import PollForm from '../PollForm';
import WithThemeKey from '../WithThemeKey';
import style from './Summary.module.css';

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
  currentUser,
  ballotsCount,
  poll,
  ownedByCurrentUser,
  themeKey,
}) => {
  console.log({ themeKey });
  const [isEditing, setIsEditing] = useState(false);

  const dateCreated = new Date(poll.dateCreated).toLocaleString(window.navigator.language, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <li className={classNames(style.Summary, style[themeKey], {
      [style.editable]: ownedByCurrentUser,
      [style.enabled]: !poll.enabled,
      [style.public]: poll.enabled,
      [style.private]: !poll.enabled,
      [style.disabled]: !poll.enabled,
    })}>
      {!isEditing && (
        <Fragment>
          <div className={style.content}>
            <Media className={style.header}>
              <Media.Body>
                <span className={style.title}>{poll.name}</span>
                {!poll.enabled && <span className={classNames(style.badge, style.disabled)}>Disabled</span>}
                {!poll.public && <span className={classNames(style.badge, style.private)}>Private</span>}
              </Media.Body>
              {ownedByCurrentUser ? (
                <Media.Item>
                  <LinkButton
                    aria-label="Edit poll"
                    className={buttonStyle.clear}
                    to={`/polls/${poll._id}/edit`}
                  >
                    ✎
                  </LinkButton>
                </Media.Item>
              ) : ''}
            </Media>
            <div className={style.meta}>
              <p className={style.byline}>By {currentUser.username} on {dateCreated}</p>
              {poll.candidates && poll.candidates.length && (
                <p className={style.candidates}>Candidates: {poll.candidates.map(c => c.name).join(', ')}</p>
              )}
            </div>
          </div>
          <div className={style.actions}>
            <Media className={style.actions__media}>
              {poll.enabled && (
                <Media.Item className={style.action}>
                  <LinkButton to={`/polls/${poll._id}/vote`} >
                    Vote!
                  </LinkButton>
                </Media.Item>
              )}
              {ownedByCurrentUser && (
                <Media.Item className={style.action}>
                  <LinkButton to={`/polls/${poll._id}/results`}>
                    View results
                  </LinkButton>
                </Media.Item>
              )}
              <Media.Body className={style.voteCount}>
                <span>
                  <strong>{ballotsCount}</strong> vote{ballotsCount !== 1 && 's'} so far
                </span>
              </Media.Body>
            </Media>
          </div>
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

export default WithThemeKey(Summary);
