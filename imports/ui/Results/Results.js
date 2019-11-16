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
      <Ballots
        ballots={ballots}
        ballotsArray={ballotsArray}
        currentUser={currentUser}
        poll={poll}
      />
      <Winners
        ballots={ballots}
        poll={poll}
      />
    </div>
  );
};

export default WithClassName(WithThemeCssModule(Results, styles), styles.Results);
