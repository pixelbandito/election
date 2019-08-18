import React, { useMemo, useState } from 'react';
import { Meteor } from 'meteor/meteor';
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

const BallotForm = ({ onBack, poll }) => {
  const shuffledCandidateIds = useMemo(() => {
    const shuffledCandidates = [...poll.candidates];
    shuffledCandidates.sort(() => Math.random() > 0.5 ? 1 : -1);
    return shuffledCandidates.map(candidate => candidate.id);
  }, [poll.candidates]);

  const [ballotForm, setBallotForm] = useState({
    candidateIdRanks: shuffledCandidateIds || [],
    pollId: poll._id,
    submitted: false,
    voterName: '',
  });

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
      setBallotForm({ candidateIdRanks: nextCandidateIdRanks });
    }
  }

  handleSubmitBallot = (event) => {
    event.preventDefault();
    console.log({ ballotForm });

    Meteor.call('ballots.insert', {
      ...ballotForm,
      submitted: true,
    });

    onBack();
  };

  handleClickSave = (event) => {
    event.preventDefault();
    console.log({ ballotForm });

    Meteor.call('ballots.insert', {
      ...ballotForm,
      submitted: false,
    });

    onBack();
  }

  const { candidates } = poll;

  return (
    <div>
      <section>
        <button type="button" onClick={onBack}>←</button>
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
          <pre style={{ wordWrap: 'break-word', maxWidth: '100%', whiteSpace: 'normal' }}>{JSON.stringify(poll)}</pre>
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
