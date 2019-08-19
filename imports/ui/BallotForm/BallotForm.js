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

  onChangeCandidateRankInput = candidateId => event => {
    const { candidateIdRanks: prevCandidateIdRanks } = ballotForm;
    const nextRank = event.target.value;

    if (nextRank) {
      const nextCandidateIdRanks = [...prevCandidateIdRanks];
      nextCandidateIdRanks.splice(prevCandidateIdRanks.indexOf(candidateId), 1);
      nextCandidateIdRanks.splice(nextRank, 0, candidateId);
      setBallotForm({
        ...ballotForm,
        candidateIdRanks: nextCandidateIdRanks,
      });
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
              {ballotForm.candidateIdRanks.map((candidateId, i) => {
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
                      min="0"
                      max={candidates.length - 1}
                      step="1"
                      type="number"
                      value={i}
                      onChange={onChangeCandidateRankInput(candidate.id)}
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
