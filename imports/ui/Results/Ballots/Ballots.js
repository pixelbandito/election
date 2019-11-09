import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import { BallotVouchers as BallotVouchersApi } from '../../../api/ballotVouchers';
import WithClassName from '../../WithClassName';
import WithThemeCssModule from '../../WithThemeCssModule';
import { getRoundVotes } from '../utils';
import styles from './Ballots.module.css';

export const Ballots = ({
  ballots,
  ballotsArray: passedBallotsArray,
  ballotVouchers: passedBallotVouchers,
  ballotVouchersHandler,
  ballotVouchersReady,
  currentUser,
  poll,
  themeKey,
  ...passedProps
}) => {
  const ballotsArray = useMemo(() => passedBallotsArray || [], [passedBallotsArray]);
  const firstRoundResults = useMemo(() => getRoundVotes({ ballotsArray }), [ballotsArray]);
  const candidates = [...poll.candidates];
  const ownedByCurrentUser = poll.ownerId === (currentUser || {})._id;

  const ballotVouchers = useMemo(() => {
    console.log({ passedBallotVouchers });
    return passedBallotVouchers;
  }, [passedBallotVouchers]);

  const usedBallotVoucherUuids = useMemo(() => (
    ballotVouchers
      .filter(ballotVoucher => ballots.filter(ballot => ballot.ballotVoucherUuid === ballotVoucher.ballotVoucherUuid).length)
      .map(ballotVoucher => ballotVoucher.ballotVoucherUuid)
  ), [ballotVouchers, ballots]);

  return (
    <div {...passedProps} >
      <section>
        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span className={styles.label}>
              Ballots submitted{' '}
            </span>
            <span className={styles.value}>
              {ballotsArray.length}
            </span>
          </div>
          <div className={styles.metric}>
            <span className={styles.label}>
              Ballot vouchers issued{' '}
            </span>
            <span className={styles.value}>
              {ballotVouchers.length}
            </span>
          </div>
          <div className={styles.metric}>
            <span className={styles.label}>
              Ballot vouchers used{' '}
            </span>
            <span className={styles.value}>
              {usedBallotVoucherUuids.length}
            </span>
          </div>
        </div>
      </section>
      <section className={styles.earlyResults}>
        <h2 className={styles.label}>
          Early first-round results{' '}
        </h2>
        <ul className={styles.candidates}>
          {candidates.map(candidate => (
            <li
              key={candidate.id}
              className={styles.candidate}
            >
              <span className={styles.name}>{candidate.name}</span>
              <span className={styles.votes}>{firstRoundResults[candidate.id] || 0}</span>
              <strong className={styles.percentOfVotes}>
                {(((firstRoundResults[candidate.id] || 0) * 100) / ballotsArray.length).toFixed()}
                %
              </strong>
            </li>
          ))}
        </ul>
      </section>
      {poll._id && poll.anonymous && ownedByCurrentUser && (
        <section className={styles.invite}>
          <div>
            <Link to={`/polls/${poll._id}/ballot-vouchers`}>Invite people to take your poll anonymously!</Link>
          </div>
        </section>
      )}
    </div>
  );
}

const ThemedBallots = WithClassName(WithThemeCssModule(Ballots, styles), styles.Ballots);

export default withTracker(({ poll }) => {
  const ballotVouchersHandler = Meteor.subscribe('ballotVouchers', (poll && poll._id) || 'foo');

  return {
    ballotVouchersHandler,
    ballotVouchers: BallotVouchersApi.find({ pollId: (poll && poll._id) || 'bar' }, { sort: { dateUpdated: -1 } }).fetch(),
    ballotVouchersReady: ballotVouchersHandler.ready(),
  };
})(ThemedBallots);
