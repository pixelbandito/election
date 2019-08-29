import React from 'react';

import { Summary } from '../Poll';

const Polls = ({
  ballots,
  currentUser,
  hideNotMine,
  polls,
}) => {
  const currentUserId = currentUser && currentUser._id;
  let filteredPolls = polls;
  let ballotCountsByPollId = ballots && ballots.reduce((result, ballot) => {
    result[ballot.pollId] = result[ballot.pollId] || 0;
    result[ballot.pollId]++;
    return result;
  }, {});

  if (hideNotMine) {
    filteredPolls = filteredPolls.filter(poll => !poll.ownerId === currentUserId);
  }

  filteredPolls = filteredPolls.filter(poll => poll.public || poll.ownerId === currentUserId);

  return filteredPolls.map((poll) => (
    <Summary
      ballotsCount={ballotCountsByPollId[poll._id] || 0}
      currentUser={currentUser}
      key={poll._id}
      poll={poll}
      ownedByCurrentUser={poll.ownerId === currentUserId}
    />
  ));
};

export default Polls;
