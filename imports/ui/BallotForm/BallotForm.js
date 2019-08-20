import React, { useMemo, useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { Link, Redirect } from 'react-router-dom';
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

// TODO: Candidates disappear on refresh!
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

  // Shuffle candidates for fairer voting
  const shuffledCandidateIds = useMemo(() => {
    const shuffledCandidates = poll ? [...poll.candidates] : [];
    shuffledCandidates.sort(() => Math.random() > 0.5 ? 1 : -1);
    return shuffledCandidates.map(candidate => candidate.id);
  }, [poll && poll.candidates, pollsReady]);

  const [ballotForm, setBallotForm] = useState({
    candidateIdRanks: shuffledCandidateIds || [],
    pollId: poll && poll._id,
    submitted: false,
    voterName: '',
  });

  /*
    When polls are loaded after the component, e.g. when the user goes straight
    to this page via URL, update the ballot form.
  */
  useEffect(() => {
    if (poll && shuffledCandidateIds) {
      setBallotForm({
        ...ballotForm,
        candidateIdRanks: shuffledCandidateIds || [],
        pollId: poll && poll._id,
        submitted: false,
        voterName: '',
      });

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

  handleVoterChangeNameInput = event => {
    const nextVoterName = event.target.value || ballotForm.name;

    setBallotForm({
      ...ballotForm,
      voterName: nextVoterName,
    });
  }

  changeCandidateIdRank = ({ candidateId, nextRank }) => {
    if (nextRank) {
      const { candidateIdRanks: prevCandidateIdRanks } = ballotForm;
      const nextCandidateIdRanks = [...prevCandidateIdRanks];
      nextCandidateIdRanks.splice(prevCandidateIdRanks.indexOf(candidateId), 1);
      nextCandidateIdRanks.splice(nextRank, 0, candidateId);
      setBallotForm({
        ...ballotForm,
        candidateIdRanks: nextCandidateIdRanks,
      });
    }
  }

  onChangeCandidateRankInput = candidateId => event => {
    const { candidateIdRanks: prevCandidateIdRanks } = ballotForm;
    const nextRank = event.target.value;

    if (!arrowingUp && !arrowingDown) {
      changeCandidateIdRank({ candidateId, nextRank });
    }
  }

  const onKeyDownCandidateRank = event => {
    switch(event.key) {
      case 'ArrowUp':
        setArrowingUp(true);
      case 'ArrowDown':
        setArrowingDown(true);
      default:
        break;
    }
  }

  const onKeyUpCandidateRank = (candidateId, index) => event => {
    const { candidateIdRanks } = ballotForm;
    const prevRank = index;
    let nextRank;

    if (event.key === 'ArrowUp') {
      setArrowingUp(false);

      if (prevRank > 0) {
        nextRank = `${Math.max(prevRank - 1, 0)}`;
      } else {
        nextRank = `${prevRank}`;
      }
    }

    if (event.key === 'ArrowDown') {
      setArrowingDown(false);

      if (prevRank < candidateIdRanks.length - 1) {
        nextRank = `${Math.min(prevRank + 1, candidateIdRanks.length - 1)}`;
      } else {
        nextRank = `${prevRank}`;
      }
    }


    if (nextRank) {
      changeCandidateIdRank({ candidateId, nextRank })
    }
  }

  handleSubmitBallot = async (event) => {
    event.preventDefault();

    const result = await Meteor.call('ballots.insert', {
      ...ballotForm,
      submitted: true,
    });

    setGoHome(true);
  };

  handleClickSave = async (event) => {
    event.preventDefault();

    const result = await Meteor.call('ballots.insert', {
      ...ballotForm,
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
              value={ballotForm.voterName}
            />
          </section>
        <section>
          <div style={{ wordWrap: 'break-word', maxWidth: '100%', whiteSpace: 'normal' }}>{JSON.stringify(ballotForm)}</div>
        </section>
        <section>
            <ul>
              {ballotForm.candidateIdRanks.map((candidateId, index) => {
                const candidate = candidates.find(candidate => candidate.id === candidateId);

                if (!candidate) {
                  return null;
                }

                return (
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

export default BallotForm;
