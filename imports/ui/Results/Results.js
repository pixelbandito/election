// Third-party imports
// React
import React from 'react';

// Everything else
import { Route, Switch, Redirect } from 'react-router-dom';

// Local imports
// ../
import { NavLinkButton } from '../Button';
import Tabs, { Tab } from '../Tabs';
import WithClassName from '../WithClassName';
import WithThemeCssModule from '../WithThemeCssModule';
// ./
import Ballots from './Ballots';
import styles from './Results.module.css';
import Winners from './Winners';

const Results = ({
  ballots,
  currentUser,
  match,
  poll,
  staticContext,
  ...passedProps
}) => {
  if (!poll) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  const ballotsArray = ballots.sort((ballot, ballot2) => ballot.dateCreated > ballot2.dateCreated ? -1 : 1);

  return (
    <div {...passedProps}>
      <section className={styles.header}>
        <h1>&ldquo;{poll.name}&rdquo; Results</h1>
      </section>
      <Tabs>
        <Tab>
          <NavLinkButton to={`/polls/${poll._id}/results/winners`} >
            View winners
          </NavLinkButton>
        </Tab>
        <Tab>
          <NavLinkButton to={`/polls/${poll._id}/results/ballots`} >
            View ballots
          </NavLinkButton>
        </Tab>
      </Tabs>
      <Switch>
        <Route path="/polls/:pollId/results/winners" exact>
          <Winners
            ballots={ballots}
            poll={poll}
          />
        </Route>
        <Route path="/polls/:pollId/results/ballots" exact>
          <Ballots
            ballots={ballots}
            ballotsArray={ballotsArray}
            currentUser={currentUser}
            poll={poll}
          />
        </Route>
        <Route>
          <Redirect to={`/polls/${poll._id}/results/winners`} />
        </Route>
      </Switch>
    </div>
  );
};

export default WithClassName(WithThemeCssModule(Results, styles), styles.Results);
