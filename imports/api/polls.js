import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';

export const Polls = new Mongo.Collection('polls');

export const embeddableCandidateType = {
  id: String,
  name: String,
};

export const creatablePollType = {
  multivote: Boolean, // Allows one use to vote multiple times. Recommended only for development
  anonymous: Boolean,
  candidates: [Match.ObjectIncluding({ ...embeddableCandidateType })],
  dateCreated: Match.Maybe(Number),
  dateUpdated: Match.Maybe(Number),
  enabled: Boolean,
  public: Boolean,
  name: String,
};

export const pollType = {
  ...creatablePollType,
  _id: String,
  ownerId: String,
};

export const defaults = {
  multivote: false,
  anonymous: false,
  candidates: [],
  dateCreated: new Date(0).valueOf(),
  dateUpdated: new Date(0).valueOf(),
  enabled: false,
  public: false,
  name: '',
  ownerId: '',
};

export const generatePoll = (poll) => ({
  ...defaults,
  dateCreated: new Date().valueOf(),
  dateUpdated: new Date().valueOf(),
  ...poll,
});

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish polls that are public or belong to the current user
  Meteor.publish('polls', function pollsPublication() {
    return Polls.find({
      $or: [
        { ownerId: this.userId },
        { public: { $eq: true } },
      ],
    });
  });
}

Meteor.methods({
  'polls.insert'(poll) {
    check(poll, creatablePollType);

    // Make sure the user is logged in before inserting a poll
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const prevPoll = (poll._id && Polls.findOne(poll._id)) || null;

    // Make sure the poll doesn't already exist
    if (prevPoll) {
      throw new Meteor.Error('invalid-request');
    }

    Polls.insert({
      ...generatePoll(poll),
      ownerId: this.userId,
    });
  },
  'polls.set'(poll) {
    check(poll, pollType);

    // Make sure the user is logged in before inserting a poll
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const prevPoll = Polls.findOne(poll._id);

    // Make sure the poll exists
    if (!prevPoll) {
      throw new Meteor.Error('invalid-request');
    }

    // Make sure the user owns the polls
    if (prevPoll.ownerId !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Polls.update(poll._id, {
      ...prevPoll,
      ...poll,
      dateUpdated: new Date().valueOf(),
    });
  },
  'polls.remove'(pollId) {
    check(pollId, String);

    const poll = Polls.findOne(pollId);

    if (poll.ownerId !== this.userId) {
      // Make sure only the owner can delete it
      throw new Meteor.Error('not-authorized');
    }

    Polls.remove(pollId);
  },
  // 'polls.setEnabled'(pollId, enabled) {
  //   check(pollId, String);
  //   check(enabled, Boolean);
  //
  //   const poll = Polls.findOne(pollId);
  //   if (poll.ownerId !== this.userId) {
  //     // If the poll is private, make sure only the owner can check it off
  //     throw new Meteor.Error('not-authorized');
  //   }
  //
  //   Polls.update(pollId, { $set: { checked: enabled } });
  // },
  // 'polls.postPollCandidate'(pollId, candidate) {
  //   check(pollId, String);
  //   check(candidate, Match.Any);
  //
  //   const poll = Polls.findOne(pollId);
  //
  //   // Make sure only the poll owner can make a poll private
  //   if (poll.owner !== this.userId) {
  //     throw new Meteor.Error('not-authorized');
  //   }
  //
  //   const candidates = [...poll.candidates, candidate];
  //
  //   Polls.update(pollId, { $set: { candidates } });
  // },
  // 'polls.deletePollCandidate'(pollId, candidateId) {
  //   check(pollId, String);
  //   check(candidateId, String);
  //
  //   const poll = Polls.findOne(pollId);
  //
  //   // Make sure only the poll owner can make a poll private
  //   if (poll.ownerId !== this.userId) {
  //     throw new Meteor.Error('not-authorized');
  //   }
  //
  //   // Make sure you're removing a valid candidate
  //   const candidateToRemove = poll.candidates.find(candidate => candidate.id === candidateId);
  //
  //   if (!candidateToRemove) {
  //     throw new Meteor.Error('invalid-request');
  //   }
  //
  //   const candidates = [...poll.candidates];
  //   candidates.splice(poll.candidates.indexOf(candidateToRemove, 1));
  //
  //   Polls.update(pollId, { $set: { candidates } });
  // }
});
