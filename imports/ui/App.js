import React, { Component, Fragment, useState } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import { Polls as PollsApi } from '../api/polls.js';
import { Ballots as BallotsApi } from '../api/ballots.js';

import Polls from './Polls';
import BallotForm from './BallotForm';
import PollForm from './PollForm';
import Results from './Results';

import AccountsUIWrapper from './AccountsUIWrapper.js';

// App component - represents the whole app
const App = ({
  ballots,
  ballotsHandler,
  ballotsReady,
  currentUser,
  myPollsCount,
  polls,
  pollsReady,
}) => {
  const [hideNotMine, setHideNotMine] = useState(false);
  const [votingPollId, setVotingPollId] = useState(null);
  const [viewingResultsPollId, setViewingResultsPollId] = useState(null);

  console.log({ ballots, ballotsHandler, ballotsReady, polls, pollsReady });

  return (
    <Router>
      <div className="container">
        <Switch>
          <Route path="/polls/:pollId/vote" exact render={(routeProps) => (
            <BallotForm
              {...routeProps}
              poll={polls.find(poll => poll._id === routeProps.match.params.pollId)}
              pollsReady={pollsReady}
              onBack={() => setVotingPollId(null)}
            />
          )} />
          <Route path="/polls/:pollId/results" exact render={(routeProps) => (
            <Results
              {...routeProps}
              ballots={ballots.filter(ballot => ballot.pollId === routeProps.match.params.pollId)}
              poll={polls.find(poll => poll._id === routeProps.match.params.pollId)}
              onBack={() => setViewingResultsPollId(null)}
            />
          )} />
          <Route path="/polls" exact render={(routeProps) => (
            <Fragment>
              <header>
                <h1>Polls ({myPollsCount})</h1>

                <label className="hide-not-mine">
                  <input
                    type="checkbox"
                    readOnly
                    checked={hideNotMine}
                    onClick={() => setHideNotMine(!hideNotMine)}
                  />
                  Show only my polls
                </label>

                <AccountsUIWrapper />

                { currentUser ?
                  <PollForm onSubmit={(pollForm) => Meteor.call('polls.insert', pollForm)}/> : ''
                }
              </header>

              <ul>
                <Polls
                  ballots={ballots}
                  currentUser={currentUser}
                  hideNotMine={hideNotMine}
                  polls={polls}
                  setViewingResultsPollId={setViewingResultsPollId}
                  setVotingPollId={setVotingPollId}
                />
              </ul>
            </Fragment>
          )} />
        <Route path="/">
            {votingPollId && (
              <BallotForm
                poll={polls.find(poll => poll._id === votingPollId)}
                onBack={() => setVotingPollId(null)}
              />
            )}

            {viewingResultsPollId && (
              <Results
                ballots={ballots.filter(ballot => ballot.pollId === viewingResultsPollId)}
                poll={polls.find(poll => poll._id === viewingResultsPollId)}
                onBack={() => setViewingResultsPollId(null)}
              />
            )}

            {!votingPollId && !viewingResultsPollId && (
              <Fragment>
                <header>
                  <h1>Polls ({myPollsCount})</h1>

                  <label className="hide-not-mine">
                    <input
                      type="checkbox"
                      readOnly
                      checked={hideNotMine}
                      onClick={() => setHideNotMine(!hideNotMine)}
                    />
                    Show only my polls
                  </label>

                  <AccountsUIWrapper />

                  { currentUser ?
                    <PollForm onSubmit={(pollForm) => Meteor.call('polls.insert', pollForm)}/> : ''
                  }
                </header>

                <ul>
                  <Polls
                    ballots={ballots}
                    currentUser={currentUser}
                    hideNotMine={hideNotMine}
                    polls={polls}
                    setViewingResultsPollId={setViewingResultsPollId}
                    setVotingPollId={setVotingPollId}
                  />
                </ul>
              </Fragment>
            )}
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default withTracker(() => {
  const ballotsHandler = Meteor.subscribe('ballots');
  const pollsHandler = Meteor.subscribe('polls');

  const currentUser = Meteor.user();
  return {
    ballotsHandler,
    ballots: BallotsApi.find({}, { sort: { createdAt: -1 } }).fetch(),
    ballotsReady: ballotsHandler.ready(),
    polls: PollsApi.find({}, { sort: { createdAt: -1 } }).fetch(),
    pollsReady: pollsHandler.ready(),
    myPollsCount: PollsApi.find({ ownerId: currentUser && currentUser._id },).count(),
    currentUser,
  };
})(App);
