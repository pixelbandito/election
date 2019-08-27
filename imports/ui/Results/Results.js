import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const candidatesEliminatedErrorMessage = 'All candidates have been eliminated.';
const candidatesMissingErrorMessage = 'Coulnd\'t find any candidates.';

const getRoundVotes = ({ ballotsArray, round = 0 }) => {
  return ballotsArray.reduce((result, ballot) => {
    const { candidateIdRanks } = ballot;

    if (candidateIdRanks.length > round) {
      const chosenCandidateId = candidateIdRanks[round];
      result[chosenCandidateId] = (result[chosenCandidateId] || 0) + 1;
    }

    return result;
  }, {});
}

const calculateResults = ({
  ballotsArray,
  candidates,
  roundIndex = 1,
  winningThreshold,
}) => {
  const votes = getRoundVotes({ ballotsArray });
  const candidateIds = candidates.map(c => c.id);

  if (!candidateIds.length && roundIndex === 1) {
    throw new Error(candidatesMissingErrorMessage);
  } else if (!candidateIds.length) {
    throw new Error(candidatesEliminatedErrorMessage);
  }

  const winnerIds = candidateIds.filter(cId => votes[cId] && votes[cId] > winningThreshold);

  if (winnerIds.length) {
    return { winnerIds };
  } else {
    let leastVotesReceived = candidateIds.reduce((result, cId) => {
      const candidateVotes = votes[cId] || 0;
      result = typeof result === 'number' ? result : candidateVotes;
      result = result <= candidateVotes ? result : candidateVotes;
      return result;
    }, null);

    // TODO: It would be nice to know which candidates actually got votes in the previous round.
    let loserIds = candidates.map(c => c.id).filter(cId => (votes[cId] || 0) === leastVotesReceived);

    let nextBallotsArray = [...ballotsArray];

    // TODO: Need a tie-breaking strategy
    if (loserIds.length) {
      // Remove losers and go again.
      const nextCandidates = candidates.filter(candidate => loserIds.indexOf(candidate.id) < 0);
      nextBallotsArray = nextBallotsArray.map(prevBallot => ({
        ...prevBallot,
        candidateIdRanks: prevBallot.candidateIdRanks.filter(cId => loserIds.indexOf(cId) < 0),
      }));

      try {
        return calculateResults({
          ballotsArray: nextBallotsArray,
          candidates: nextCandidates,
          roundIndex: roundIndex + 1,
          winningThreshold,
        });
      } catch (e) {
        if (e.message === candidatesEliminatedErrorMessage) {
          return { winnerIds: candidateIds };
        }

        throw e;
      }

    } else {
      throw new Error('Couldn\'t determine losers to remove for next round');
    }
  }
}

const Results = ({
  ballots,
  match,
  poll,
}) => {
  const [winnerIds, setWinnerIds] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!poll) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  const { candidates } = poll;
  const ballotsArray = ballots.sort((ballot, ballot2) => ballot.dateCreated > ballot2.dateCreated ? -1 : 1);

  handleClickCalculateWinners = () => {
    const ballotsArray = ballots.sort((ballot, ballot2) => ballot.dateCreated > ballot2.dateCreated ? -1 : 1);
    const plurality = ballotsArray.length / 2;
    const candidates = [...poll.candidates];

    setWinnerIds([]);
    setErrorMessage(null);

    try {
      const { winnerIds } = calculateResults({
        ballotsArray,
        candidates,
        winningThreshold: plurality,
      });

      setWinnerIds(winnerIds);
    } catch (e) {
      setErrorMessage(e.message);
    }
  }

  return (
    <div>
      <section>
        <Link to="/polls">←</Link>
      </section>
      <section>
        <h1>{poll.name}</h1>
        <h2>Results</h2>
      </section>
      <section>
        {ballotsArray && ballotsArray.length && (
          <ul>
            {ballots.map(ballot => (
              <li key={ballot._id}>
                {JSON.stringify(ballot)}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <button onClick={handleClickCalculateWinners}>Calculate winners!</button>
        {!!winnerIds.length && (
          <ul>
            {winnerIds.map(winnerId => {
              const winner = poll.candidates.find(candidate => candidate.id === winnerId);
              if (winner && winner.name) {
                return (
                  <li key={winnerId}>
                    {winner.name}
                  </li>
                );
              } else {
                return null;
              }
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Results;
