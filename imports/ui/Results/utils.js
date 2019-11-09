export const getRoundVotes = ({ ballotsArray, round = 0 }) => {
  return ballotsArray.reduce((result, ballot) => {
    const { candidateIdRanks } = ballot;

    if (candidateIdRanks.length > round) {
      const chosenCandidateId = candidateIdRanks[round];
      result[chosenCandidateId] = (result[chosenCandidateId] || 0) + 1;
    }

    return result;
  }, {});
}

export default {
  getRoundVotes,
};
