/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert, expect } from 'chai';

import { Polls } from './polls.js';
import { BallotVouchers } from './ballotVouchers.js';

if (Meteor.isServer) {
  describe('BallotVouchers', () => {
    describe('methods', () => {
      const userId = Random.id();
      let ballotVoucherId;
      let ballotVoucherUuid;
      let pollId;

      beforeEach(() => {
        Polls.remove({});
        BallotVouchers.remove({});

        pollId = Polls.insert({
          multivote: false,
          anonymous: true,
          candidates: [],
          dateCreated: 8,
          dateUpdated: 42,
          enabled: true,
          name: 'Poll Foo',
          ownerId: userId,
        });

        ballotVoucherId = BallotVouchers.insert({
          dateCreated: 8,
          dateUpdated: 42,
          ownerId: userId,
          pollId,
        });

        ballotVoucherUuid = BallotVouchers.findOne(ballotVoucherId).ballotVoucherUuid;
      });

      afterEach(() => {
        Polls.remove({});
        BallotVouchers.remove({});
        ballotVoucherUuid = undefined;
      });

      describe('BallotVouchers.insert', () => {
        const insertBallotVoucher = Meteor.server.method_handlers['ballotVouchers.insert'];

        it('works', () => {
          const invocation = { userId };
          insertBallotVoucher.apply(invocation, [{ pollId }]);

          assert.equal(BallotVouchers.find().count(), 2);
        });

        it('fails with no user', () => {
          const invocation = { userId: null };

          assert.throws(() => insertBallotVoucher.apply(invocation, [{ pollId }]));

          assert.equal(BallotVouchers.find().count(), 1);
        });

        it('fails with no pollId', () => {
          const invocation = { userId };

          assert.throws(() => insertBallotVoucher.apply(invocation, [{}]));
          assert.equal(BallotVouchers.find().count(), 1);
        });

        it('fails when you try to insert a ballotVoucher that already exists', () => {
          const invocation = { userId };

          assert.throws(() => insertBallotVoucher.apply([{ pollId, _id: ballotVoucherId }]));

          assert.equal(BallotVouchers.find().count(), 1);
        });
      });
    });
  });
}
