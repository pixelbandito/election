import React, { useState } from 'react';
import shortid from 'shortid';

import Button from '../Button';

/*
  {
    id: String,
    name: String,
  }
*/

const CandidateForm = ({
  onSetCandidates,
  candidates,
  poll,
}) => {
  const [newCandidateName, setNewCandidateName] = useState('');

  const getCandidateByName = ({ candidateName, candidates }) => candidates.find(candidate => candidate.name === candidateName);

  const getAddCandidateDisabled = () => {
    return !newCandidateName || getCandidateByName({
      candidateName: newCandidateName,
      candidates,
    });
  };

  const handleChangeCandidateNameInput = (prevCandidate) => (event) => {
    event.stopPropagation();
    const nextCandidateName = event.target.value;

    if (!nextCandidateName || getCandidateByName({
      candidates,
      candidateName: nextCandidateName,
    })) {
      return;
    }

    const nextCandidates = [...candidates];

    nextCandidates.splice(candidates.indexOf(prevCandidate), 1, {
      ...prevCandidate,
      name: nextCandidateName,
    });

    onSetCandidates(nextCandidates);
  }

  const currentCandidates = candidates && candidates.map(candidate => (
    <li key={candidate.id}>
      <label htmlFor={candidate.id}>
        Candidate
      </label>
      <input
        id={candidate.id}
        onChange={handleChangeCandidateNameInput(candidate)}
        placeholder="Candidate name"
        type="text"
        value={candidate.name}
      />
    </li>
  ));

  const submitAddCandidateForm = (event) => {
    event.stopPropagation();
    event.preventDefault();
    return addCandidate();
  }

  const handleKeyUpNewCandidateName = event => {
    console.log(event.key);
    if (event.key === 'Enter') {
      submitAddCandidateForm(event);
    }
  }

  const addCandidate = () => {
    if (getAddCandidateDisabled()) {
      return;
    }

    setNewCandidateName('');

    onSetCandidates([
      ...poll.candidates,
      {
        name: newCandidateName,
        id: shortid.generate(),
      },
    ]);
  }

  return (
    <ul>
      {currentCandidates}
      <li key="newCandidate">
          <label htmlFor="newCandidate">
            New candidate
          </label>
          <input
            id="newCandidate"
            placeholder="Candidate name"
            type="text"
            value={newCandidateName}
            onChange={event => setNewCandidateName(event.target.value)}
            onKeyUp={handleKeyUpNewCandidateName}
          />
        <Button
            disabled={getAddCandidateDisabled()}
            onClick={submitAddCandidateForm}
          >
            Add candidate
          </Button>
      </li>
    </ul>
  );
};

export default CandidateForm;
