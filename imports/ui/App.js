import React, { Component, Fragment, useState } from 'react';
import { BrowserRouter as Router, Route, Link, Switch, Redirect } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import { Polls as PollsApi } from '../api/polls.js';
import { Ballots as BallotsApi } from '../api/ballots.js';

import Polls from './Polls';
import BallotForm from './BallotForm';
import PollForm from './PollForm';
import Results from './Results';
import BallotVouchers from './BallotVouchers';

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

  return (
    <Router>
      <div className="container">
        <Switch>
          <Route path="/polls/:pollId/vote" exact render={(routeProps) => (
            <BallotForm
              {...routeProps}
              currentUser={currentUser}
              poll={polls.find(poll => poll._id === routeProps.match.params.pollId)}
              pollsReady={pollsReady}
            />
          )} />
          <Route path="/polls/:pollId/results" exact render={(routeProps) => (
            <Results
              {...routeProps}
              ballots={ballots.filter(ballot => ballot.pollId === routeProps.match.params.pollId)}
              poll={polls.find(poll => poll._id === routeProps.match.params.pollId)}
            />
          )} />
          <Route path="/polls/:pollId/edit" exact render={(routeProps) => (
            <PollForm
              {...routeProps}
              currentUser={currentUser}
              initPollForm={polls.find(poll => poll._id === routeProps.match.params.pollId)}
              onSubmit={(pollForm) => Meteor.call('polls.set', pollForm)}
            />
          )} />
          <Route path="/polls/:pollId/ballot-vouchers" exact render={(routeProps) => (
            <BallotVouchers
              {...routeProps}
              ballots={ballots.filter(ballot => ballot.pollId === routeProps.match.params.pollId)}
              currentUser={currentUser}
              poll={polls.find(poll => poll._id === routeProps.match.params.pollId)}
            />
          )} />
          <Route path="/polls/create" exact render={(routeProps) => (
            <PollForm
              {...routeProps}
              currentUser={currentUser}
              onSubmit={(pollForm) => Meteor.call('polls.insert', pollForm)}
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

                <Link to="/polls/create">Create a poll</Link>

                <AccountsUIWrapper />
              </header>

              <ul>
                <Polls
                  ballots={ballots}
                  currentUser={currentUser}
                  hideNotMine={hideNotMine}
                  polls={polls}
                />
              </ul>
            </Fragment>
          )} />
          <Route>
            <Redirect to="/polls" />
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
    ballots: BallotsApi.find({}, { sort: { dateUpdated: -1 } }).fetch(),
    ballotsReady: ballotsHandler.ready(),
    polls: PollsApi.find({}, { sort: { dateUpdated: -1 } }).fetch(),
    pollsReady: pollsHandler.ready(),
    myPollsCount: PollsApi.find({ ownerId: currentUser && currentUser._id },).count(),
    currentUser,
  };
})(App);
