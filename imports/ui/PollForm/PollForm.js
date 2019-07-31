import React, { createRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import CandidateForm from '../CandidateForm';

{/*
  candidates: [],
  dateCreated: new Date(0).valueOf(),
  dateUpdated: new Date(0).valueOf(),
  enabled: false,
  name: '',
  ownerId: '',
*/}

const PollForm = ({ initPollForm, onSubmit }) => {
  const [pollForm, setPollForm] = useState(initPollForm || {
    candidates: [],
    enabled: false,
    name: '',
  });

  const [resetDate, setResetDate] = useState(new Date().toISOString())

  const nameInputRef = createRef();
  const enabledInputRef = createRef();

  useEffect(() => {
    nameInputRef.value = pollForm.name;
    enabledInputRef.checked = pollForm.enabled;
  }, [nameInputRef.current, enabledInputRef.current]);

  const handleSetCandidates = (nextCandidates) => {
    setPollForm({
      ...pollForm,
      candidates: nextCandidates,
    });
  }

  const handleChangeName = (event) => {
    const nextName = event.target.value || pollForm.name;

    setPollForm({
      ...pollForm,
      name: nextName,
    });
  };

  const handleChangeEnabled = (event) => {
    const enabled = event.target.checked;

    setPollForm({
      ...pollForm,
      enabled,
    });
  };

  const handleSubmitPoll = (event) => {
    event.preventDefault();

    const nameInput = nameInputRef.current;
    const enabledInput = enabledInputRef.current;

    if (!pollForm.name || !nameInput || !enabledInput) {
      return;
    }

    onSubmit(pollForm);

    // Clear form
    nameInput.value = '';
    enabledInput.checked = false;
    handleSetCandidates([]);
    setResetDate(new Date().toISOString())
  };

  return (
    <form onSubmit={handleSubmitPoll}>
      <section>
        <label htmlFor={`${pollForm._id || ''}-createPoll__name`}>Name</label>
        <input
          id={`${pollForm._id || ''}-createPoll__name`}
          value={pollForm.name}
          type="text"
          onChange={handleChangeName}
          ref={nameInputRef}
          placeholder="Type to add poll name"
        />
      </section>
      <section>
        <label>Candidates</label>
        <CandidateForm
          key={resetDate}
          onSetCandidates={handleSetCandidates}
          candidates={pollForm.candidates}
          poll={pollForm}
        />
      </section>
      <section>
        <label htmlFor={`${pollForm._id || ''}-createPoll__enable`}>
          <input
            id={`${pollForm._id || ''}-createPoll__enable`}
            onChange={handleChangeEnabled}
            ref={enabledInputRef}
            type="checkbox"
            checked={pollForm.enabled}
          />
          Enabled
        </label>
      </section>
      <section>
        <button type="submit">Submit</button>
      </section>
    </form>
  );
}

export default PollForm;
