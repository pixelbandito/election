import React, { Fragment, useMemo, useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { Link, Redirect, withRouter } from 'react-router-dom';
import { DndProvider, DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
// import TouchBackend from 'react-dnd-touch-backend'
// import MultiBackend from 'react-dnd-multi-backend';
// import HTML5toTouch from 'react-dnd-multi-backend/lib/HTML5toTouch';
import qs from 'qs';

import Candidate from './Candidate';

/*
export const defaultBallot = {
  candidateIdRanks: [],
  dateSubmitted: new Date(0).valueOf(),
  id: '',
  pollId: '',
  submitted: false,
  voterName: ''
};
*/

// const DraggableBallotForm = DragDropContext(MultiBackend(HTML5toTouch))(BallotForm);

const DraggableBallotForm = (props) => (
  <DndProvider backend={HTML5Backend}><BallotForm {...props} /></DndProvider>
);

const BallotForm = ({
  currentUser,
  location,
  pollsReady,
  poll,
}) => {
  // When the ballot is cast, this controls the Redirect component
  const [goHome, setGoHome] = useState(false);
  const [max, setMax] = useState(1);
  const min = 1;

  const [ballotVoucherUuid, setBallotVoucherUuid] = useState('');
  const [candidateIdRanks, setCandidateIdRanks] = useState([]);
  const [voterName, setVoterName] = useState('');

  // Shuffle candidates for fairer voting
  const shuffledCandidateIds = useMemo(() => {
    const shuffledCandidates = poll ? [...poll.candidates] : [];
    shuffledCandidates.sort(() => Math.random() > 0.5 ? 1 : -1);
    return shuffledCandidates.map(candidate => candidate.id);
  }, [poll && poll.candidates, pollsReady]);

  useEffect(() => {
    setBallotVoucherUuid(qs.parse(location.search, { ignoreQueryPrefix: true }).voucher);
  }, []);

  useEffect(() => {
    if (poll && shuffledCandidateIds) {
      setCandidateIdRanks(shuffledCandidateIds);
      setMax(shuffledCandidateIds.length);
    }
  }, [poll, shuffledCandidateIds]);

  useEffect(() => {
    if (currentUser && poll && poll.anonymous && !ballotVoucherUuid) {
      setVoterName(currentUser.username);
    }
  }, [currentUser, poll && poll.anonymous, ballotVoucherUuid])

  if (!poll) {
    return (
      <div>Loading...</div>
    );
  }

  const handleVoterChangeNameInput = event => {
    const nextVoterName = event.target.value || voterName;

    setVoterName(nextVoterName);
  }

  const changeCandidateIdRank = ({ candidateId, nextRank }) => {
    if (nextRank || nextRank === 0) {
      const prevCandidateIdRanks = candidateIdRanks;
      const nextCandidateIdRanks = [...prevCandidateIdRanks];
      nextCandidateIdRanks.splice(prevCandidateIdRanks.indexOf(candidateId), 1);
      nextCandidateIdRanks.splice(nextRank, 0, candidateId);
      setCandidateIdRanks(nextCandidateIdRanks);
    }
  }

  const onChangeCandidateRankInput = candidateId => nextValue => {
    const prevCandidateIdRanks = candidateIdRanks;
    changeCandidateIdRank({ candidateId, nextRank: nextValue - 1 }); // Candidate form uses 1-indexed rankings
  }

  const onMoveCandidate = (dragIndex, dropIndex) => {
    const candidateId = candidateIdRanks[dragIndex];
    const nextRank = dropIndex;
    changeCandidateIdRank({ candidateId, nextRank });
  };

  const handleSubmitBallot = async (event) => {
    event.preventDefault();

    const result = await Meteor.call('ballots.insert', {
      ballotVoucherUuid,
      candidateIdRanks,
      voterName,
      pollId: poll._id,
      submitted: true,
    });

    setGoHome(true);
  };

  const handleClickSave = async (event) => {
    event.preventDefault();

    const result = await Meteor.call('ballots.insert', {
      candidateIdRanks,
      pollId: poll._id,
      voterName,
      submitted: false,
    });

    setGoHome(true);
  }

  const { candidates } = poll;
  const votingEnabled = currentUser || (poll.anonymous && ballotVoucherUuid);

  // Default to the can't vote state
  let message = (
    <Fragment>
      <p>Sorry, you can't vote in this poll</p>
      <Link to="/polls">Browse other polls</Link>
    </Fragment>
  );

  if (votingEnabled) {
    if (ballotVoucherUuid) {
      if (currentUser) {
        // User has a choice of how to vote
        message = (
          <Fragment>
            <p>You're logged in, but using an anonymous ballot. If you type a name on your ballot, it will still be visible.</p>
            <p>Would you like to discard your anonymous ballot and vote as yourself instead? (Recommended only if you want your vote to be completely public.)</p>
            <a href={`/polls/${poll._id}/vote`}>Vote publicly</a>
          </Fragment>
        );
      } else {
        // Anonymous user, can only vote because they have a ballotVoucherUuid
        message = <p>You're voting anonymously. If you type a name on the ballot, it will still be visible.</p>;
      }
    } else {
      // Logged-in voter
      message = <p>You're voting publicly. Your username and vote will be linked and visible with the results.</p>;
    }
  }

  return (
    <div>
      {goHome && <Redirect to='/polls' />}
      <section>
        <Link to="/polls">←</Link>
      </section>
      <section>
        <h1>{poll.name}</h1>
        <div>
          {message}
        </div>
      </section>
      <form onSubmit={handleSubmitBallot}>
        <section>
          <label htmlFor="voterName">
            Your name
          </label>
          <input
            id="voterName"
            type="text"
            onChange={handleVoterChangeNameInput}
            value={voterName}
            disabled={currentUser && poll.anonymous && !ballotVoucherUuid ? true : undefined}
          />
        </section>
        <section>
            <ul>
              {candidateIdRanks.map((candidateId, index) => {
                const candidate = candidates.find(candidate => candidate.id === candidateId);

                if (!candidate) {
                  return null;
                }

                return (
                  <Candidate
                    candidate={candidate}
                    index={index}
                    key={candidate.id}
                    max={max}
                    min={min}
                    onChangeCandidateRankInput={onChangeCandidateRankInput(candidate.id)}
                    onMoveCandidate={onMoveCandidate}
                    value={index + 1}
                  />
                );
              })}
            </ul>
          </section>
        <section>
          <button onClick={handleClickSave}>Save for later</button>
          <button type="submit">Submit</button>
        </section>
      </form>
    </div>
  );
};

export default DraggableBallotForm;
