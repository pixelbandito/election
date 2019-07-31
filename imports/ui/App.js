import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import { Polls } from '../api/polls.js';

import PollForm from './PollForm';

import Poll from './Poll';
import AccountsUIWrapper from './AccountsUIWrapper.js';

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hideNotMine: false,
    };
  }

  toggleHideNotMine() {
    this.setState({
      hideNotMine: !this.state.hideNotMine,
    });
  }

  renderPolls() {
    const currentUserId = this.props.currentUser && this.props.currentUser._id;
    let filteredPolls = this.props.polls;

    if (this.state.hideNotMine) {
      filteredPolls = filteredPolls.filter(poll => !poll.ownerId === currentUserId);
    }

    return filteredPolls.map((poll) => (
      <Poll
        key={poll._id}
        poll={poll}
        ownedByCurrentUser={poll.ownerId === currentUserId}
      />
    ));
  }

  render() {
    return (
      <div className="container">
        <header>
          <h1>Polls ({this.props.myPollsCount})</h1>

          <label className="hide-not-mine">
            <input
              type="checkbox"
              readOnly
              checked={this.state.hideNotMine}
              onClick={this.toggleHideNotMine.bind(this)}
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
      </div>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe('polls');

  const currentUser = Meteor.user();
  return {
    polls: Polls.find({}, { sort: { createdAt: -1 } }).fetch(),
    myPollsCount: Polls.find({ ownerId: currentUser && currentUser._id },).count(),
    currentUser,
  };
})(App);
