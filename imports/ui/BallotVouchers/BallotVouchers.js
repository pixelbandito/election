// Third-party imports
// React
import React, { useMemo, useState } from 'react';
// Everything else
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import classNames from 'classnames';

// Local imports
// ../../
import { BallotVouchers as BallotVouchersApi } from '../../api/ballotVouchers';
import WithThemeCssModule from '../WithThemeCssModule';

// ../
import Button, { LinkButton } from '../Button';
import Controls from '../Controls';
// import Input from '../Input';
import Media from '../Media';
// ./
import styles from './BallotVouchers.module.css';

const min = 1;
const max = 100;

const BallotVouchers = ({
  className,
  ballots,
  ballotVouchers,
  ballotVouchersReady,
  currentUser,
  poll,
}) => {
  const [quantity, setQuantity] = useState(1);

  const handleChangeQuantity = event => {
    const nextQuantity = parseInt(event.target.value, 10)
    if (nextQuantity >= min && nextQuantity <= max) {
      setQuantity(parseInt(event.target.value, 10));
    }
  }

  const handleSubmitCreateBallotVouchers = event => {
    event.preventDefault();
    for (let i = 0, n = quantity; i < n; i++) {
      Meteor.call('ballotVouchers.insert', { pollId: poll._id });
    }
  }

  const usedBallotVoucherUuids = useMemo(() => (
    ballotVouchers
      .filter(ballotVoucher => ballots.filter(ballot => ballot.ballotVoucherUuid === ballotVoucher.ballotVoucherUuid).length)
      .map(ballotVoucher => ballotVoucher.ballotVoucherUuid)
  ), [ballotVouchers, ballots]);

  if (!ballotVouchersReady) {
    return 'Loading...';
  }

  return (
    <div className={classNames(className, styles.BallotVouchers)}>
      <section className={styles.head}>
        <LinkButton className={styles.backLink} to={`/polls/${poll._id}`}>←</LinkButton>
        <h1 className={styles.title}>{poll.name}</h1>
        <p className={styles.description}>Invite people to vote on your poll anonymously by sending them ballot vouchers.</p>
      </section>
      <div className={styles.vouchersSection}>
        <div className={styles.sectionLabel}>
          <div className={styles.sectionTitle}>Ballot Vouchers</div>
          {!ballotVouchers.length && (
            <div className={styles.sectionSubTitle}>
              Create some ballot vouchers to get started
            </div>
          )}
          {!!ballotVouchers.length && (
            <div className={styles.sectionSubTitle}>
              Send these links to your friends.
            </div>
          )}
        </div>
        <ul className={styles.vouchers}>
          {ballotVouchers.map(ballotVoucher => (
            <li
              className={styles.voucher}
              key={ballotVoucher._id}
            >
              {usedBallotVoucherUuids && usedBallotVoucherUuids.indexOf(ballotVoucher.ballotVoucherUuid) >= 0 && (
                <strong>Used{' '}</strong>
              )}
              <a
                href={`/polls/${poll._id}/vote?voucher=${ballotVoucher.ballotVoucherUuid}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                Voucher {ballotVoucher.ballotVoucherUuid}
              </a>
            </li>
          ))}
          <li className={classNames(styles.voucher, styles.creator)}>
            <form onSubmit={handleSubmitCreateBallotVouchers}>
              <Media>
                <Media.Body>
                  <Controls.Text
                    childrenProps={{ style: { padding: '5px' } }}
                    fill
                    label="How many ballot vouchers do you want to add?"
                    labelProps={{ className: styles.label }}
                    modifiers={['horizontal']}
                    inputProps={{
                      onChange: handleChangeQuantity,
                      placeholder: 'Candidate name',
                      className: styles.input,
                      id: "BallotVoucherQuantityInput",
                      max: max,
                      min: min,
                      step: "1",
                      type: "number",
                      value: quantity,
                    }}
                  />
                </Media.Body>
                <Media.Item className={styles.filled}>
                  <Button type="submit">
                    Create vouchers
                  </Button>
                </Media.Item>
              </Media>
            </form>
          </li>
        </ul>
      </div>
      <div className={styles.foot}>
        <LinkButton to="/polls">Done</LinkButton>
      </div>
    </div>
  );
}

/*
ballots={ballots.filter(ballot => ballot.pollId === routeProps.match.params.pollId)}
currentUser={currentUser}
poll={polls.find(poll => poll._id === routeProps.match.params.pollId)}
*/

export default withTracker(({ poll }) => {
  const ballotVouchersHandler = Meteor.subscribe('ballotVouchers', (poll && poll._id) || 'foo');
  const currentUser = Meteor.user();

  return {
    ballotVouchersHandler,
    ballotVouchers: BallotVouchersApi.find({ ownerId: (currentUser && currentUser._id) || 'foo', pollId: (poll && poll._id) || 'bar' }, { sort: { dateUpdated: -1 } }).fetch(),
    ballotVouchersReady: ballotVouchersHandler.ready(),
    currentUser,
  };
})(WithThemeCssModule(BallotVouchers, styles));
