// Third-party imports
// React
import React, { Fragment, useState } from 'react';

// Everything else
import { Meteor } from 'meteor/meteor';
import classNames from 'classnames';

// Local imports
// ../
import { LinkButton } from '../Button';
import buttonStyle from '../Button/Button.module.css';
import Media from '../Media';
import PollForm from '../PollForm';
import WithThemeCssModule from '../WithThemeCssModule';
// ./
import styles from './Summary.module.css';

const Summary = ({
  className,
  currentUser,
  ballotsCount,
  poll,
  ownedByCurrentUser,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const dateCreated = new Date(poll.dateCreated).toLocaleString(window.navigator.language, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <li className={classNames(className, styles.Summary, {
      [styles.editable]: ownedByCurrentUser,
      [styles.enabled]: !poll.enabled,
      [styles.public]: poll.enabled,
      [styles.private]: !poll.enabled,
      [styles.disabled]: !poll.enabled,
    })}>
      {!isEditing && (
        <Fragment>
          <div className={styles.content}>
            <Media className={styles.header}>
              <Media.Body>
                <span className={styles.title}>{poll.name}</span>
                {!poll.enabled && <span className={classNames(styles.badge, styles.disabled)}>Disabled</span>}
                {!poll.public && <span className={classNames(styles.badge, styles.private)}>Private</span>}
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
            <div className={styles.meta}>
              <p className={styles.byline}>By {poll.ownerId} on {dateCreated}</p>
              {poll.candidates && poll.candidates.length && (
                <p className={styles.candidates}>Candidates: {poll.candidates.map(c => c.name).join(', ')}</p>
              )}
            </div>
          </div>
          <div className={styles.actions}>
            <Media className={styles.actions__media}>
              {poll.enabled && (
                <Media.Item className={styles.action}>
                  <LinkButton to={`/polls/${poll._id}/vote`} >
                    Vote!
                  </LinkButton>
                </Media.Item>
              )}
              {ownedByCurrentUser && (
                <Media.Item className={styles.action}>
                  <LinkButton to={`/polls/${poll._id}/results`}>
                    View results
                  </LinkButton>
                </Media.Item>
              )}
              <Media.Body className={styles.voteCount}>
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

export default WithThemeCssModule(Summary, styles);
