import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
import shortid from 'shortid';

import { Polls } from './polls.js';

export const Ballots = new Mongo.Collection('ballots');

// Type from initial prototype
/*
import shortid from 'shortid';

export const defaultBallot = {
  candidateRanks: [],
  dateSubmitted: new Date(0).valueOf(),
  id: '',
  pollId: '',
  submitted: false,
  voterName: ''
};

export const generateBallot = (ballot) => ({
  ...defaultBallot,
  dateSubmitted: new Date().valueOf(),
  id: shortid.generate(),
  pollId: shortid.generate(),
  ...ballot,
});

export default {
  defaultBallot,
  generateBallot,
};

*/

export const creatableBallotType = {
  ballotVoucherUuid: Match.Maybe(String),
  candidateIdRanks: [String],
  dateCreated: Match.Maybe(Number),
  dateUpdated: Match.Maybe(Number),
  pollId: String,
  submitted: Boolean,
  voterName: String,
};

export const ballotType = {
  ...creatableBallotType,
  _id: String,
  ownerId: String,
};

export const defaults = {
  ballotVoucherUuid: '',
  candidateIdRanks: [],
  dateCreated: new Date(0).valueOf(),
  dateUpdated: new Date(0).valueOf(),
  ownerId: '',
  pollId: '',
  submitted: false,
};

export const generateBallot = (ballot) => ({
  ...defaults,
  dateCreated: new Date().valueOf(),
  dateUpdated: new Date().valueOf(),
  ...ballot,
});

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish ballots that are public or belong to the current user
  Meteor.publish('ballots', function ballotsPublication() {
    return Ballots.find({
      $or: [
        { private: { $ne: true } },
        { ownerId: this.userId },
        { submitted: { $eq: true } },
      ],
    });
  });
}

Meteor.methods({
  'ballots.insert'(ballot) {
    check(ballot, creatableBallotType);

    // Make sure the user is logged in before inserting a ballot
    if (!this.userId && !ballot.ballotVoucherUuid) {
      throw new Meteor.Error('not-authorized');
    }

    const prevBallot = (ballot._id && Ballots.findOne(ballot._id)) || null;

    // Make sure the ballot doesn't already exist
    if (prevBallot) {
      throw new Meteor.Error('invalid-request');
    }

    // Make sure the ballot is assigned to an enabled poll
    const poll = Polls.findOne(ballot.pollId);

    if (!poll || !poll.enabled) {
      throw new Meteor.Error('invalid-request');
    }

    Ballots.insert({
      ...generateBallot(ballot),
      ownerId: (!ballot.ballotVoucherUuid && this.userId) || null,
    });
  },
  'ballots.set'(ballot) {
    check(ballot, ballotType);

    // Make sure the user is logged in before inserting a ballot
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const prevBallot = Ballots.findOne(ballot._id);

    // Make sure the ballot exists
    if (!prevBallot) {
      throw new Meteor.Error('invalid-request');
    }

    // Make sure the user owns the ballots
    if (prevBallot.ownerId !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    // Make sure the ballot is assigned to an enabled poll
    const poll = Polls.findOne(ballot.pollId);

    if (!poll || !poll.enabled) {
      throw new Meteor.Error('invalid-request');
    }

    Ballots.update(ballot._id, {
      ...prevBallot,
      ...ballot,
      dateUpdated: new Date().valueOf(),
    });
  },
  'ballots.remove'(ballotId) {
    check(ballotId, String);

    const ballot = Ballots.findOne(ballotId);

    // Make sure only the owner can delete it
    if (ballot.ownerId !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    // Make sure it can't be deleted if the poll is closed
    const poll = Polls.findOne(ballot.pollId);

    if (poll && poll.disabled) {
      throw new Meteor.Error('invalid-request');
    }

    Ballots.remove(ballotId);
  },
});
