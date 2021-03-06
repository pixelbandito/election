import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';

import { Polls } from './polls.js';
import { BallotVouchers } from './ballotVouchers.js';

export const Ballots = new Mongo.Collection('ballots');

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

    // prevBallot, 1st definition: A pre-existing ballot with the same ID
    let prevBallot = (ballot._id && Ballots.findOne(ballot._id)) || null;

    // Make sure the ballot doesn't already exist
    if (prevBallot) {
      throw new Meteor.Error('invalid-request');
    }

    // Make sure the ballot is assigned to an enabled poll
    const poll = Polls.findOne(ballot.pollId);

    if (!poll || !poll.enabled) {
      throw new Meteor.Error('invalid-request');
    }

    // Make sure the ballot voucher is real and attached to the same poll as the ballot
    if (ballot.ballotVoucherUuid) {
      const ballotVoucher = BallotVouchers.findOne({ ballotVoucherUuid: ballot.ballotVoucherUuid });

      if (!ballotVoucher || ballotVoucher.pollId !== poll._id) {
        throw new Meteor.Error('invalid-request');
      }
    }

    // Make sure this user or ballot voucher hasn't voted in this poll, unless multivote is on
    // prevBallot, 2nd definition: A pre-existing ballot on the same poll cast by the same person
    if (!poll.multivote) {
      prevBallot = undefined;

      if (ballot.ballotVoucherUuid) {
        prevBallot = Ballots.findOne({ pollId: poll._id, ballotVoucherUuid: ballot.ballotVoucherUuid });
      } else {
        prevBallot = Ballots.findOne({ pollId: poll._id, ownerId: this.userId });
      }

      if (prevBallot) {
        throw new Meteor.Error('this person already voted');
      }
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
