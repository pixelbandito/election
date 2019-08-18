import React, { Component, Fragment } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import { Polls } from '../api/polls.js';
import { Ballots } from '../api/ballots.js';

import BallotForm from './BallotForm';
import PollForm from './PollForm';
import Results from './Results';

import { Summary } from './Poll';
import AccountsUIWrapper from './AccountsUIWrapper.js';

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hideNotMine: false,
      votingPollId: null,
      viewingResultsPollId: null,
    };
  }

  toggleHideNotMine = () => {
    this.setState({
      hideNotMine: !this.state.hideNotMine,
    });
  }

  setVotingPollId = (votingPollId) => {
    console.log({ votingPollId });
    this.setState({ votingPollId });
  }

  setViewingResultsPollId = (viewingResultsPollId) => {
    console.log({ viewingResultsPollId });
    this.setState({ viewingResultsPollId });
  }

  renderPolls = () => {
    const currentUserId = this.props.currentUser && this.props.currentUser._id;
    let filteredPolls = this.props.polls;
    let ballotCountsByPollId = this.props.ballots && this.props.ballots.reduce((result, ballot) => {
      result[ballot.pollId] = result[ballot.pollId] || 0;
      result[ballot.pollId]++;
      return result;
    }, {});

    console.log({
      ballotCountsByPollId,
    });

    if (this.state.hideNotMine) {
      filteredPolls = filteredPolls.filter(poll => !poll.ownerId === currentUserId);
    }

    filteredPolls = filteredPolls.filter(poll => poll.public || poll.ownerId === currentUserId);

    return filteredPolls.map((poll) => (
      <Summary
        ballotsCount={ballotCountsByPollId[poll._id] || 0}
        key={poll._id}
        poll={poll}
        ownedByCurrentUser={poll.ownerId === currentUserId}
        setVotingPollId={this.setVotingPollId}
        setViewingResultsPollId={this.setViewingResultsPollId}
      />
    ));
  }

  render() {
    return (
      <div className="container">
        {this.state.votingPollId && (
          <BallotForm
            poll={this.props.polls.find(poll => poll._id === this.state.votingPollId)}
            onBack={() => this.setVotingPollId(null)}
          />
        )}
        {this.state.viewingResultsPollId && (
          <Results
            ballots={this.props.ballots.filter(ballot => ballot.pollId === this.state.viewingResultsPollId)}
            poll={this.props.polls.find(poll => poll._id === this.state.viewingResultsPollId)}
            onBack={() => this.setViewingResultsPollId(null)}
          />
        )}
        {!this.state.votingPollId && !this.state.viewingResultsPollId && (
          <Fragment>
            <header>
              <h1>Polls ({this.props.myPollsCount})</h1>

              <label className="hide-not-mine">
                <input
                  type="checkbox"
                  readOnly
                  checked={this.state.hideNotMine}
                  onClick={this.toggleHideNotMine}
                />
                Show only my polls
              </label>

              <AccountsUIWrapper />

              { this.props.currentUser ?
                <PollForm onSubmit={(pollForm) => Meteor.call('polls.insert', pollForm)}/> : ''
              }
            </header>

            <ul>
              {this.renderPolls()}
            </ul>
          </Fragment>
        )
        }
      </div>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe('ballots');
  Meteor.subscribe('polls');

  const currentUser = Meteor.user();
  return {
    ballots: Ballots.find({}, { sort: { createdAt: -1 } }).fetch(),
    polls: Polls.find({}, { sort: { createdAt: -1 } }).fetch(),
    myPollsCount: Polls.find({ ownerId: currentUser && currentUser._id },).count(),
    currentUser,
  };
})(App);
