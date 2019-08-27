/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert, expect } from 'chai';

import { Polls } from './polls.js';
import { Ballots } from './ballots.js';

if (Meteor.isServer) {
  describe('Ballots', () => {
    describe('methods', () => {
      const userId = Random.id();
      let ballotId;
      let pollId;
      let beforeBallotCount;

      beforeEach(() => {
        Polls.remove({});
        Ballots.remove({});

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

        ballotId = Ballots.insert({
          ballotVoucherUuid: '',
          candidateIdRanks: [],
          dateCreated: 8,
          dateUpdated: 42,
          pollId,
          submitted: true,
          ownerId: Random.id(),
          voterName: '',
        });

        ballotId = Ballots.insert({
          ballotVoucherUuid: 'biff',
          candidateIdRanks: [],
          dateCreated: 3,
          dateUpdated: 7,
          pollId,
          submitted: true,
          ownerId: '',
          voterName: '',
        });

        beforeBallotCount = Ballots.find().count();
      });

      afterEach(() => {
        Polls.remove({});
        Ballots.remove({});
      });

      describe('Ballots.insert', () => {
        const insertBallot = Meteor.server.method_handlers['ballots.insert'];

        const creatableBallot = {
          candidateIdRanks: [],
          submitted: true,
          voterName: '',
        };

        it('works', () => {
          const invocation = { userId };
          insertBallot.apply(invocation, [{ ...creatableBallot, pollId }]);

          assert.equal(Ballots.find().count(), beforeBallotCount + 1);
        });

        it('fails with no user and no ballotVoucherUuid', () => {
          const invocation = { userId: null };

          assert.throws(() => insertBallot.apply(invocation, [{ ...creatableBallot, pollId }]));
          assert.equal(Ballots.find().count(), beforeBallotCount);
        });

        describe('with a ballotVoucherUuid', () => {
          it('works with no user', () => {
            const invocation = { userId: null };
            insertBallot.apply(invocation, [{ ...creatableBallot, pollId, ballotVoucherUuid: 'foo' }])

            assert.equal(Ballots.find().count(), beforeBallotCount + 1);
          });

          describe('and the ballotVoucherUuid has already been used', () => {
            it('fails without multivote', () => {
              const invocation = { userId: null };
              insertBallot.apply(invocation, [{ ...creatableBallot, pollId, ballotVoucherUuid: 'foo' }]);
              assert.equal(Ballots.find().count(), beforeBallotCount + 1);

              assert.throws(() => insertBallot.apply(invocation, [{ ...creatableBallot, pollId, ballotVoucherUuid: 'foo' }]));

              assert.equal(Ballots.find().count(), beforeBallotCount + 1);
            });

            it('passes with multivote (FOR DEV ONLY)', () => {
              const multivotePollId = Polls.insert({
                multivote: true,
                anonymous: true,
                candidates: [],
                dateCreated: 8,
                dateUpdated: 42,
                enabled: true,
                name: 'Poll Foo',
                ownerId: userId,
              });

              const invocation = { userId: null };
              insertBallot.apply(invocation, [{ ...creatableBallot, pollId: multivotePollId, ballotVoucherUuid: 'foo' }]);
              insertBallot.apply(invocation, [{ ...creatableBallot, pollId: multivotePollId, ballotVoucherUuid: 'foo' }])

              assert.equal(Ballots.find().count(), beforeBallotCount + 2);
            });
          });
        });

        describe('with a user', () => {
          it('works with no ballotVoucherUuid', () => {
            const invocation = { userId };
            insertBallot.apply(invocation, [{ ...creatableBallot, pollId }])

            assert.equal(Ballots.find().count(), beforeBallotCount + 1);
          });

          describe('and the user has already voted', () => {
            it('fails without multivote', () => {
              const invocation = { userId };
              insertBallot.apply(invocation, [{ ...creatableBallot, pollId }]);

              assert.equal(Ballots.find().count(), beforeBallotCount + 1);

              assert.throws(() => insertBallot.apply(invocation, [{ ...creatableBallot, pollId }]));

              assert.equal(Ballots.find().count(), beforeBallotCount + 1);
            });

            it('passes with multivote (FOR DEV ONLY)', () => {
              const multivotePollId = Polls.insert({
                multivote: true,
                anonymous: true,
                candidates: [],
                dateCreated: 8,
                dateUpdated: 42,
                enabled: true,
                name: 'Poll Foo',
                ownerId: userId,
              });

              const invocation = { userId };
              insertBallot.apply(invocation, [{ ...creatableBallot, pollId: multivotePollId }]);
              insertBallot.apply(invocation, [{ ...creatableBallot, pollId: multivotePollId }])

              assert.equal(Ballots.find().count(), beforeBallotCount + 2)
            });
          });
        });

        it('fails with no pollId', () => {
          const invocation = { userId };

          assert.throws(() => insertBallot.apply(invocation, [{ ...creatableBallot, pollId: undefined }]));
          assert.equal(Ballots.find().count(), beforeBallotCount);
        });

        it('fails with a disabled pollId', () => {
          const invocation = { userId };

          const disabledPollId = Polls.insert({
            candidates: [],
            dateCreated: 8,
            dateUpdated: 42,
            enabled: false,
            name: 'Disabled Poll',
            ownerId: userId,
          });

          assert.throws(() => insertBallot.apply(invocation, [{ ...creatableBallot, pollId: disabledPollId }]));
          assert.equal(Ballots.find().count(), beforeBallotCount);

          Polls.remove(disabledPollId);
        });

        it('fails when you try to insert a ballot that already exists', () => {
          const invocation = { userId };

          assert.throws(() => insertBallot.apply(invocation, [{
            ...creatableBallot,
            _id: pollId,
          }]));

          assert.equal(Ballots.find().count(), beforeBallotCount);
        });

        // it('fails if the user has already voted in the poll', () => {
        //   const invocation = { userId };
        //
        //   assert.throws(() => insertBallot.apply(invocation, [{
        //     ...creatableBallot,
        //     _id: pollId,
        //   }]));
        //
        //   assert.equal(Ballots.find().count(), beforeBallotCount);
        // });

        it('fails if the ballotVoucherUuid was already used in the poll', () => {
          const invocation = { userId: null };
          assert.throws(() => insertBallot.apply(invocation, [{ ...creatableBallot, pollId: disabledPollId }]));
          assert.equal(Ballots.find().count(), beforeBallotCount);
        });
      });
    });
  });
}
