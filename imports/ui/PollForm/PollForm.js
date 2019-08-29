import React, { createRef, Fragment, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Link, Redirect } from 'react-router-dom';

import AccountsUIWrapper from '../AccountsUIWrapper.js';
import CandidateForm from '../CandidateForm';

const PollForm = ({
  currentUser,
  initPollForm,
  onBack,
  onSubmit,
}) => {
  // When editing is complere, this controls the Redirect component
  const [goHome, setGoHome] = useState(false);

  const [pollForm, setPollForm] = useState(initPollForm || {
    multivote: false,
    anonymous: false,
    candidates: [],
    enabled: false,
    public: false,
    name: '',
  });

  /*
    When polls are loaded after the component, e.g. when the user goes straight
    to this page via URL, update the ballot form.
  */
  useEffect(() => {
    if (initPollForm) {
      setPollForm(initPollForm || {
        multivote: false,
        anonymous: false,
        candidates: [],
        enabled: false,
        public: false,
        name: '',
      });
    }
  }, [initPollForm]);

  const [resetDate, setResetDate] = useState(new Date().toISOString());

  /*
    WARN: Is we start rendering this component before currentUser is available,
    you could get false positives here
  */
  const ownedByCurrentUser = pollForm.ownerId === (currentUser || {})._id;

  const multivoteInputRef = createRef();
  const anonymousInputRef = createRef();
  const enabledInputRef = createRef();
  const nameInputRef = createRef();
  const publicInputRef = createRef();

  useEffect(() => {
    multivoteInputRef.checked = pollForm.multivote;
  }, [multivoteInputRef.current]);

  useEffect(() => {
    anonymousInputRef.checked = pollForm.anonymous;
  }, [anonymousInputRef.current]);

  useEffect(() => {
    enabledInputRef.checked = pollForm.enabled;
  }, [enabledInputRef.current]);

  useEffect(() => {
    nameInputRef.value = pollForm.name;
  }, [nameInputRef.current]);

  useEffect(() => {
    publicInputRef.checked = pollForm.public;
  }, [publicInputRef.current]);

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

  const handleChangeMultivote = (event) => {
    const multivote = event.target.checked;

    setPollForm({
      ...pollForm,
      multivote,
    });
  };

  const handleChangeAnonymous = (event) => {
    const anonymous = event.target.checked;

    setPollForm({
      ...pollForm,
      anonymous,
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

    const multivoteInput = multivoteInputRef.current;
    const anonymousInput = anonymousInputRef.current;
    const nameInput = nameInputRef.current;
    const enabledInput = enabledInputRef.current;
    const publicInput = publicInputRef.current;

    if (!pollForm.name || !nameInput || !enabledInput || !publicInput || !anonymousInput || !multivoteInput) {
      return;
    }

    onSubmit(pollForm);

    // Clear form
    setPollForm({
      multivote: false,
      anonymous: false,
      name: '',
      enabled: false,
      public: false,
      candidates: [],
    });

    setResetDate(new Date().toISOString());


    if (onBack) {
      onBack();
    } else {
      setGoHome(true);
    }
  };

  const handleClickDelete = (event) => {
    const confirmed = confirm('Are you sure you want to delete this poll?');

    if (confirmed) {
      Meteor.call('polls.remove', poll._id);
    }
  };

  return (
    <form onSubmit={handleSubmitPoll}>
      {(goHome || (pollForm && pollForm._id && !ownedByCurrentUser)) && <Redirect to='/polls' />}
      <section>
        {onBack && <button type="button" onClick={onBack}>x</button>}
        {!onBack && <Link to="/polls">←</Link>}
      </section>
      {!currentUser && (
        <div>
          <div>Log in or create an account to make your own poll</div>
          <AccountsUIWrapper />
        </div>
      )}
      {currentUser && (
        <Fragment>
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
            <label htmlFor={`${pollForm._id || ''}-createPoll__anonymous`}>
              <input
                id={`${pollForm._id || ''}-createPoll__anonymous`}
                onChange={handleChangeAnonymous}
                ref={anonymousInputRef}
                type="checkbox"
                checked={pollForm.anonymous}
              />
              Anonymous
            </label>
          </section>
          <section>
            <label htmlFor={`${pollForm._id || ''}-createPoll__multivote`}>
              <input
                id={`${pollForm._id || ''}-createPoll__multivote`}
                onChange={handleChangeMultivote}
                ref={multivoteInputRef}
                type="checkbox"
                checked={pollForm.multivote}
              />
              Multivote
            </label>
          </section>
          <section>
            {pollForm._id && ownedByCurrentUser && (
              <div style={{ float: 'right' }}>
                <button
                  onClick={handleClickDelete}
                  style={{ color: 'red' }}
                  type="button"
                >
                  🗑 Delete
                </button>
              </div>
            )}
            <button type="submit">Submit</button>
          </section>
        </Fragment>
      )}
      {pollForm._id && pollForm.anonymous && ownedByCurrentUser && (
        <div>
          <Link to={`/polls/${pollForm._id}/ballot-vouchers`}>Invite people to take your poll anonymously!</Link>
        </div>
      )}
    </form>
  );
}

export default PollForm;
