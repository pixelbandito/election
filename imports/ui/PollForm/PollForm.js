import React, { createRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import CandidateForm from '../CandidateForm';

{/*
  candidates: [],
  dateCreated: new Date(0).valueOf(),
  dateUpdated: new Date(0).valueOf(),
  enabled: false,
  public: false,
  name: '',
  ownerId: '',
*/}

const PollForm = ({
  initPollForm,
  onBack,
  onSubmit,
}) => {
  const [pollForm, setPollForm] = useState(initPollForm || {
    candidates: [],
    enabled: false,
    public: false,
    name: '',
  });

  const [resetDate, setResetDate] = useState(new Date().toISOString())

  const nameInputRef = createRef();
  const enabledInputRef = createRef();
  const publicInputRef = createRef();

  useEffect(() => {
    nameInputRef.value = pollForm.name;
    enabledInputRef.checked = pollForm.enabled;
    publicInputRef.checked = pollForm.public;
  }, [nameInputRef.current, enabledInputRef.current, publicInputRef.current]);

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

  const handleChangePublic = (event) => {
    const public = event.target.checked;

    setPollForm({
      ...pollForm,
      public,
    });
  };

  const handleSubmitPoll = (event) => {
    event.preventDefault();

    const nameInput = nameInputRef.current;
    const enabledInput = enabledInputRef.current;
    const publicInput = publicInputRef.current;

    if (!pollForm.name || !nameInput || !enabledInput || !publicInput) {
      return;
    }

    onSubmit(pollForm);

    // Clear form
    setPollForm({
      name: '',
      enabled: false,
      public: false,
      candidates: [],
    });

    setResetDate(new Date().toISOString())
  };

  return (
    <form onSubmit={handleSubmitPoll}>
      <section>
        <button type="button" onClick={onBack}>x</button>
      </section>
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
        <label htmlFor={`${pollForm._id || ''}-createPoll__public`}>
          <input
            id={`${pollForm._id || ''}-createPoll__public`}
            onChange={handleChangePublic}
            ref={publicInputRef}
            type="checkbox"
            checked={pollForm.public}
          />
          Public
        </label>
      </section>
      <section>
        <button type="submit">Submit</button>
      </section>
    </form>
  );
}

export default PollForm;
