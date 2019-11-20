import React, { useCallback, useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import classNames from 'classnames';

import { Polls as PollsApi } from '../api/polls.js';
import { Ballots as BallotsApi } from '../api/ballots.js';

import BallotForm from './BallotForm';
import BallotVouchers from './BallotVouchers';
import PageHeader from './PageHeader';
import PollForm from './PollForm';
import Polls from './Polls';
import Results from './Results';
import ThemeContext from './ThemeContext';
import { LazyComponent, LazyLink, LazyRoute, Provider as LazyProvider } from './Lazy';

import styles from './App.module.css';

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
  const [themeKey, setThemeKey] = useState('irs');

  return (
    <LazyProvider>
      <ThemeContext.Provider value={themeKey} >
        <Router>
          <div className={classNames(styles.App, styles[themeKey])}>
            <PageHeader
              myPollsCount={myPollsCount}
              hideNotMine={hideNotMine}
              setHideNotMine={setHideNotMine}
              setThemeKey={setThemeKey}
            />
            <div style={{ display: 'none' }}>
              <LazyLink
                loadOn={['hover']}
                to="/lazy"
              >
                Getting ready to load something!
              </LazyLink>
              <LazyRoute
                path="/lazy"
                fetchData={LazyComponent.fetchData}
              >
                <LazyComponent />
              </LazyRoute>
            </div>
            <Switch>
              <Route path="/polls/:pollId/vote" exact render={(routeProps) => (
                <BallotForm
                  {...routeProps}
                  currentUser={currentUser}
                  poll={polls.find(poll => poll._id === routeProps.match.params.pollId)}
                  pollsReady={pollsReady}
                />
              )} />
              <Route path="/polls/:pollId/results" render={(routeProps) => (
                <Results
                  {...routeProps}
                  ballots={ballots.filter(ballot => ballot.pollId === routeProps.match.params.pollId)}
                  currentUser={currentUser}
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
                <ul className={styles.pollsList}>
                  <Polls
                    ballots={ballots}
                    currentUser={currentUser}
                    hideNotMine={hideNotMine}
                    polls={polls}
                  />
                </ul>
              )} />
              <Route>
                <Redirect to="/polls" />
              </Route>
            </Switch>
          </div>
        </Router>
      </ThemeContext.Provider>
    </LazyProvider>
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
    myPollsCount: PollsApi.find({ ownerId: currentUser && currentUser._id }).count(),
    currentUser,
  };
})(App);
