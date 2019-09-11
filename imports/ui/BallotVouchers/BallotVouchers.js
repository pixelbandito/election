// Third-party imports
// React
import React, { useMemo, useState } from 'react';
// Everything else
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

// Local imports
// ../../
import { BallotVouchers as BallotVouchersApi } from '../../api/ballotVouchers';

// ../
import Button from '../Button';
import Input from '../Input';

const min = 1;
const max = 100;

const BallotVouchers = ({
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
    <div>
      <section>
        <Link to={`/polls/${poll._id}`}>←</Link>
      </section>
      <section>
        <p>Invite people to vote on your poll anonymously by sending them ballot vouchers.</p>
      </section>
      <form onSubmit={handleSubmitCreateBallotVouchers}>
        <section>
          <label htmlFor="BallotVoucherQuantityInput">
            How many ballot vouchers do you want?
          </label>
          <Input
            id="BallotVoucherQuantityInput"
            onChange={handleChangeQuantity}
            max={max}
            min={min}
            step="1"
            type="number"
            value={quantity}
          />
        </section>
        <section>
          <Button type="submit">Create vouchers</Button>
        </section>
      </form>
      <pre>
        {JSON.stringify(ballotVouchers)}
      </pre>
      <div>
        {!ballotVouchers.length && (
          <div>Create some ballot vouchers to get started</div>
        )}
        {!!ballotVouchers.length && (
          <ul>
            {ballotVouchers.map(ballotVoucher => (
              <li key={ballotVoucher._id}>
                Send this link to a friend:{' '}
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
          </ul>
        )}
        <div>
          <Link to="/polls">Done</Link>
        </div>
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
})(BallotVouchers);
