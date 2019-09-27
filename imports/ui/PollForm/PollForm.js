// Third-party imports
// React
import React, { createRef, Fragment, useEffect, useState } from 'react';
// Everything else
import { Link, Redirect } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import classNames from 'classnames';

// Local imports
// ../
import AccountsUIWrapper from '../AccountsUIWrapper.js';
import Button from '../Button';
import CandidateForm from '../CandidateForm';
import Controls from '../Controls';
import Input from '../Input';
import WithThemeCssModule from '../WithThemeCssModule';
// ./
import styles from './PollForm.module.css';

const PollForm = ({
  className,
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
  }, [multivoteInputRef.checked, pollForm.multivote]);

  useEffect(() => {
    anonymousInputRef.checked = pollForm.anonymous;
  }, [anonymousInputRef.checked, pollForm.anonymous]);

  useEffect(() => {
    enabledInputRef.checked = pollForm.enabled;
  }, [enabledInputRef.checked, pollForm.enabled]);

  useEffect(() => {
    nameInputRef.value = pollForm.name;
  }, [nameInputRef.value, pollForm.name]);

  useEffect(() => {
    publicInputRef.checked = pollForm.public;
  }, [publicInputRef.checked, pollForm.public]);

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
    const isPublic = event.target.checked;

    setPollForm({
      ...pollForm,
      public: isPublic,
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
    const confirmed = window.confirm('Are you sure you want to delete this poll?');

    if (confirmed) {
      Meteor.call('polls.remove', pollForm._id);
    }
  };

  return (
    <form
      className={classNames(className, styles.PollForm)}
      onSubmit={handleSubmitPoll}
    >
      {(goHome || (pollForm && pollForm._id && !ownedByCurrentUser)) && <Redirect to='/polls' />}
      {!currentUser && (
        <div>
          <div>Log in or create an account to make your own poll</div>
          <AccountsUIWrapper />
        </div>
      )}
      {currentUser && (
        <Fragment>
          <section>
            <Controls.Text
              fill
              inputProps={{
                'data-lpignore': 'true',
                autofill: 'false',
                value: pollForm.name,
                onChange: handleChangeName,
                ref: nameInputRef,
                placeholder: 'Type to add poll name',
              }}
              label="Poll name"
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
          <section className={classNames(styles.formControl, styles.checkboxControl)}>
            <Controls.Checkbox
              inputProps={{
                onChange: handleChangeEnabled,
                ref: enabledInputRef,
                checked: pollForm.enabled,
              }}
              label="Enabled"
              modifiers={['horizontal']}
            />
          </section>
          <section className={classNames(styles.formControl, styles.checkboxControl)}>
            <Controls.Checkbox
              inputProps={{
                onChange: handleChangePublic,
                ref: publicInputRef,
                checked: pollForm.public,
              }}
              label="Public"
              modifiers={['horizontal']}
            />
          </section>
          <section className={classNames(styles.formControl, styles.checkboxControl)}>
            <Controls.Checkbox
              inputProps={{
                onChange: handleChangeAnonymous,
                ref: anonymousInputRef,
                checked: pollForm.anonymous,
              }}
              label="Anonymous"
              modifiers={['horizontal']}
            />
          </section>
          <section className={classNames(styles.formControl, styles.checkboxControl)}>
            <Controls.Checkbox
              inputProps={{
                onChange: handleChangeMultivote,
                ref: multivoteInputRef,
                checked: pollForm.multivote,
              }}
              label="Multivote"
              modifiers={['horizontal']}
            />
          </section>
          <section className={styles.actions}>
            {pollForm._id && ownedByCurrentUser && (
              <div style={{ float: 'right' }}>
                <Button
                  className={styles.action}
                  onClick={handleClickDelete}
                  style={{ color: 'red' }}
                >
                  🗑 Delete
                </Button>
              </div>
            )}
            <Button
              className={styles.action}
              type="submit"
            >
              Submit
            </Button>
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

export default WithThemeCssModule(PollForm, styles);
