// Third-party imports
// React
import React, { Fragment, useMemo, useEffect, useState } from 'react';
// Everything else
import { DndProvider/*, DragDropContext*/ } from 'react-dnd';
import { Meteor } from 'meteor/meteor';
import { Redirect } from 'react-router-dom';
import classNames from 'classnames';
import HTML5Backend from 'react-dnd-html5-backend';
// import HTML5toTouch from 'react-dnd-multi-backend/lib/HTML5toTouch';
// import MultiBackend from 'react-dnd-multi-backend';
import qs from 'qs';
// import TouchBackend from 'react-dnd-touch-backend'

// Local imports
// ../
import Button, { LinkButton } from '../Button';
import Controls from '../Controls';
import Media from '../Media';
import WithThemeCssModule from '../WithThemeCssModule';

// ./
import Candidate from './Candidate';
import styles from './BallotForm.module.css';

// const DraggableBallotForm = DragDropContext(MultiBackend(HTML5toTouch))(BallotForm);

console.log({ DndProvider });

const DraggableBallotForm = (props) => (
  <DndProvider backend={HTML5Backend}><BallotForm {...props} /></DndProvider>
);

const BallotForm = ({
  className,
  currentUser,
  location,
  pollsReady,
  poll,
}) => {
  // When the ballot is cast, this controls the Redirect component
  const [goHome, setGoHome] = useState(false);
  const [max, setMax] = useState(1);
  const min = 1;

  const [ballotVoucherUuid, setBallotVoucherUuid] = useState('');
  const [candidateIdRanks, setCandidateIdRanks] = useState([]);
  const [voterName, setVoterName] = useState('');
  const anonymous = useMemo(() => !!(poll && poll.anonymous), [poll]);
  const candidates = useMemo(() => (poll && poll.candidates) || [], [poll]);

  // Shuffle candidates for fairer voting
  const shuffledCandidateIds = useMemo(() => {
    if (!pollsReady) {
      return;
    }

    const shuffledCandidates = candidates ? [...candidates] : [];
    shuffledCandidates.sort(() => Math.random() > 0.5 ? 1 : -1);
    return shuffledCandidates.map(candidate => candidate.id);
  }, [candidates, pollsReady]);

  useEffect(() => {
    setBallotVoucherUuid(qs.parse(location.search, { ignoreQueryPrefix: true }).voucher);
  }, [location.search]);

  useEffect(() => {
    if (poll && shuffledCandidateIds) {
      setCandidateIdRanks(shuffledCandidateIds);
      setMax(shuffledCandidateIds.length);
    }
  }, [poll, shuffledCandidateIds]);

  useEffect(() => {
    if (currentUser && anonymous && !ballotVoucherUuid) {
      setVoterName(currentUser.username);
    }
  }, [currentUser, anonymous, ballotVoucherUuid])

  if (!poll) {
    return (
      <div>Loading...</div>
    );
  }

  const handleVoterChangeNameInput = event => {
    const nextVoterName = event.target.value || voterName;
    setVoterName(nextVoterName);
  }

  const changeCandidateIdRank = ({ candidateId, nextRank }) => {
    if (nextRank || nextRank === 0) {
      const prevCandidateIdRanks = candidateIdRanks;
      const nextCandidateIdRanks = [...prevCandidateIdRanks];
      nextCandidateIdRanks.splice(prevCandidateIdRanks.indexOf(candidateId), 1);
      nextCandidateIdRanks.splice(nextRank, 0, candidateId);
      setCandidateIdRanks(nextCandidateIdRanks);
    }
  }

  const onChangeCandidateRankInput = candidateId => nextValue => {
    changeCandidateIdRank({ candidateId, nextRank: nextValue - 1 }); // Candidate form uses 1-indexed rankings
  }

  const onMoveCandidate = (dragIndex, dropIndex) => {
    const candidateId = candidateIdRanks[dragIndex];
    const nextRank = dropIndex;
    changeCandidateIdRank({ candidateId, nextRank });
  };

  const handleSubmitBallot = async (event) => {
    event.preventDefault();

    await Meteor.call('ballots.insert', {
      ballotVoucherUuid: ballotVoucherUuid || '',
      candidateIdRanks,
      voterName,
      pollId: poll._id,
      submitted: true,
    });

    setGoHome(true);
  };

  const handleClickSave = async (event) => {
    event.preventDefault();

    await Meteor.call('ballots.insert', {
      candidateIdRanks,
      pollId: poll._id,
      voterName,
      submitted: false,
    });

    setGoHome(true);
  }

  const votingEnabled = currentUser || (poll.anonymous && ballotVoucherUuid);

  // Default to the can't vote state
  let message = (
    <Fragment>
      <h2 className={styles.h2} >Sorry, you can't vote in this poll</h2>
      <LinkButton to="/polls">Browse other polls</LinkButton>
    </Fragment>
  );

  if (votingEnabled) {
    if (ballotVoucherUuid) {
      if (currentUser) {
        // User has a choice of how to vote
        message = (
          <Fragment>
            <h2 className={styles.h2} >You're logged in, but using an anonymous ballot.</h2>
            <p>If you type a name on your ballot, it will still be visible.</p>
            <p>Would you like to discard your anonymous ballot and vote as yourself instead? (Recommended only if you want your vote to be completely public.)</p>
            <LinkButton to={`/polls/${poll._id}/vote`}>Vote publicly</LinkButton>
          </Fragment>
        );
      } else {
        // Anonymous user, can only vote because they have a ballotVoucherUuid
        message = <Fragment>
          <h2 className={styles.h2} >You're voting anonymously.</h2>
          <p>If you type a name on the ballot, it will still be visible.</p>
        </Fragment>;
      }
    } else {
      // Logged-in voter
      message = <Fragment>
        <h2 className={styles.h2} >You're voting publicly.</h2>
        <p>Your username and vote will be linked and visible with the results.</p>
      </Fragment>;
    }
  }

  return (
    <div className={classNames(className, styles.BallotForm)}>
      {goHome && <Redirect to='/polls' />}
      <section className={styles.header}>
        <h1 className={styles.title}>{poll.name}</h1>
      </section>
      <section className={styles.body} >
        <form className={styles.form} onSubmit={handleSubmitBallot}>
          <section className={classNames(styles.formControl, styles.textControl)}>
            <Controls.Text
              fill
              inputProps={{
                disabled: currentUser && poll.anonymous && !ballotVoucherUuid ? true : undefined,
                onChange: handleVoterChangeNameInput,
                value: voterName,
              }}
              label="Your name"
            />
          </section>
          <section className={classNames(styles.formControl, styles.rankControl)}>
            <div className={styles.rankLabel}>
              <label>Candidate ranks</label>
              <div className={styles.instructions}>
                {message}
              </div>
            </div>
            <ul className={styles.rankInput}>
              {candidateIdRanks.map((candidateId, index) => {
                const candidate = candidates.find(candidate => candidate.id === candidateId);

                if (!candidate) {
                  return null;
                }

                return (
                  <Candidate
                    candidate={candidate}
                    index={index}
                    key={candidate.id}
                    max={max}
                    min={min}
                    onChangeCandidateRankInput={onChangeCandidateRankInput(candidate.id)}
                    onMoveCandidate={onMoveCandidate}
                    value={index + 1}
                  />
                );
              })}
            </ul>
          </section>
          <Media className={styles.actions}>
            <Media.Item className={styles.action}><Button onClick={handleClickSave}>Save for later</Button></Media.Item>
            <Media.Item className={styles.action}><Button type="submit">Submit</Button></Media.Item>
            <Media.Body></Media.Body>
          </Media>
        </form>
      </section>
    </div>
  );
};

export default WithThemeCssModule(DraggableBallotForm, styles);
