import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
import shortid from 'shortid';

import { Polls } from './polls.js';

export const BallotVouchers = new Mongo.Collection('ballotVouchers');

export const creatableBallotVoucherType = {
  dateCreated: Match.Maybe(Number),
  dateUpdated: Match.Maybe(Number),
  pollId: String,
};

export const ballotVoucherType = {
  ...creatableBallotVoucherType,
  _id: String,
  ownerId: String,
};

export const defaults = {
  ballotVoucherUuid: '',
  dateCreated: new Date(0).valueOf(),
  dateUpdated: new Date(0).valueOf(),
  ownerId: '',
  pollId: '',
};

export const generateBallotVoucher = (ballotVoucher) => ({
  ...defaults,
  ballotVoucherUuid: shortid.generate(),
  dateCreated: new Date().valueOf(),
  dateUpdated: new Date().valueOf(),
  ...ballotVoucher,
});

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish ballotVouchers that are public or belong to the current user
  Meteor.publish('ballotVouchers', function ballotVouchersPublication(voucherId) {
    check(voucherId, String);

    return BallotVouchers.find({
      $or: [
        { _id: voucherId },
        { ownerId: this.userId },
      ],
    });
  });
}

Meteor.methods({
  'ballotVouchers.insert'(ballotVoucher) {
    check(ballotVoucher, creatableBallotVoucherType);

    // Make sure the user is logged in before inserting a ballotVoucher
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const prevBallotVoucher = (ballotVoucher._id && BallotVouchers.findOne(ballotVoucher._id)) || null;

    // Make sure the ballotVoucher doesn't already exist
    if (prevBallotVoucher) {
      throw new Meteor.Error('invalid-request');
    }

    // Make sure the ballotVoucher is assigned to an enabled poll
    const poll = Polls.findOne(ballotVoucher.pollId);

    if (!poll || !poll.enabled) {
      throw new Meteor.Error('invalid-request');
    }

    BallotVouchers.insert({
      ...generateBallotVoucher(ballotVoucher),
      ownerId: this.userId || null,
    });
  },
  'ballotVouchers.remove'(ballotVoucherId) {
    check(ballotVoucherId, String);

    const ballotVoucher = BallotVouchers.findOne(ballotVoucherId);

    // Make sure only the owner can delete it
    if (ballotVoucher.ownerId !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    // Make sure it can't be deleted if the poll is closed
    const poll = Polls.findOne(ballotVoucher.pollId);

    if (poll && poll.disabled) {
      throw new Meteor.Error('invalid-request');
    }

    BallotVouchers.remove(ballotVoucherId);
  },
});
