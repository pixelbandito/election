import React, { useMemo, useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { Link, Redirect } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

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

const DraggableBallotForm = (props) => (
  <DndProvider backend={HTML5Backend}><BallotForm {...props} /></DndProvider>
);

const BallotForm = ({
  pollsReady,
  poll,
}) => {
  // When the ballot is cast, this controls the Redirect component
  const [goHome, setGoHome] = useState(false);
  const [arrowingDown, setArrowingDown] = useState(false);
  const [arrowingUp, setArrowingUp] = useState(false);
  const [max, setMax] = useState(1);
  const min = 1;

  const [candidateIdRanks, setCandidateIdRanks] = useState([]);

  const [voterName, setVoterName] = useState('');

  // Shuffle candidates for fairer voting
  const shuffledCandidateIds = useMemo(() => {
    const shuffledCandidates = poll ? [...poll.candidates] : [];
    shuffledCandidates.sort(() => Math.random() > 0.5 ? 1 : -1);
    return shuffledCandidates.map(candidate => candidate.id);
  }, [poll && poll.candidates, pollsReady]);

  const setCandidateIdRanks2 = (ids) => {
    console.log('setCandidateIdRanks2', ids);
    setCandidateIdRanks(ids);
  }

  useEffect(() => {
    if (poll && shuffledCandidateIds) {
      setCandidateIdRanks2(shuffledCandidateIds);
      setMax(shuffledCandidateIds.length);
    }
  }, [poll, shuffledCandidateIds]);

  if (!poll) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  const handleVoterChangeNameInput = event => {
    const nextVoterName = event.target.value || voterName;

    setVoterName(nextVoterName);
  }

  const changeCandidateIdRank = ({ candidateId, nextRank }) => {
    console.log('changeCandidateIdRank', { name: poll.candidates.find(c => c.id === candidateId).name, nextRank });
    if (nextRank || nextRank === 0) {
      const prevCandidateIdRanks = candidateIdRanks;
      const nextCandidateIdRanks = [...prevCandidateIdRanks];
      nextCandidateIdRanks.splice(prevCandidateIdRanks.indexOf(candidateId), 1);
      nextCandidateIdRanks.splice(nextRank, 0, candidateId);
      setCandidateIdRanks2(nextCandidateIdRanks);
    }
  }

  const onChangeCandidateRankInput = candidateId => event => {
    const prevCandidateIdRanks = candidateIdRanks;
    const nextRank = parseInt(event.target.value, 10) - 1;

    if (!arrowingUp && !arrowingDown) {
      changeCandidateIdRank({ candidateId, nextRank });
    }
  }

  const onKeyDownCandidateRank = event => {
    switch(event.key) {
      case 'ArrowUp':
        setArrowingUp(true);
        break;
      case 'ArrowDown':
        setArrowingDown(true);
        break;
      default:
        break;
    }
  }

  const onKeyUpCandidateRank = (candidateId, index) => event => {
    const prevRank = index;
    let nextRank;

    switch(event.key) {
      case 'ArrowUp':
        setArrowingUp(false);
        nextRank = Math.max(prevRank - 1, 0);
        break;
      case 'ArrowDown':
        setArrowingDown(false);
        nextRank = Math.min(prevRank + 1, candidateIdRanks.length - 1);
        break;
      default:
        break;
    }

    if (nextRank || nextRank === 0) {
      changeCandidateIdRank({ candidateId, nextRank })
    }
  }

  const onMoveCandidate = (dragIndex, dropIndex) => {
    console.log('onMoveCandidate');
    const candidateId = candidateIdRanks[dragIndex];
    const nextRank = dropIndex;
    changeCandidateIdRank({ candidateId, nextRank });
  };

  const handleSubmitBallot = async (event) => {
    event.preventDefault();

    const result = await Meteor.call('ballots.insert', {
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

  return (
    <div>
      {goHome && <Redirect to='/polls' />}
      <section>
        <Link to="/polls">←</Link>
      </section>
      <section>
        <h1>{poll.name}</h1>
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
                    key={candidate.id}
                    candidate={candidate}
                    index={index}
                    max={max}
                    min={min}
                    onChangeCandidateRankInput={onChangeCandidateRankInput(candidate.id)}
                    onKeyDownCandidateRank={onKeyDownCandidateRank}
                    onKeyUpCandidateRank={onKeyUpCandidateRank(candidate.id, index)}
                    onMoveCandidate={onMoveCandidate}
                    value={index + 1}
                  />
                );
                /*
                <li key={candidate.id}>
                  <label htmlFor={`candidateRankInput--${candidate.id}`}>
                    Candidate rank
                    <br/>
                    <strong>
                      {candidate.name}
                    </strong>
                  </label>
                  <input
                    id={`candidateRankInput--${candidate.id}`}
                    min={min}
                    max={max}
                    step="1"
                    type="number"
                    value={index + 1}
                    onChange={onChangeCandidateRankInput(candidate.id)}
                    onKeyUp={onKeyUpCandidateRank(candidate.id, index)}
                    onKeyDown={onKeyDownCandidateRank}
                  />
                </li>
                */
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
