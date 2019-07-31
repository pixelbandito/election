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

      beforeEach(() => {
        Polls.remove({});
        Ballots.remove({});

        pollId = Polls.insert({
          candidates: [],
          dateCreated: 8,
          dateUpdated: 42,
          enabled: true,
          name: 'Poll Foo',
          ownerId: userId,
        });

        ballotId = Ballots.insert({
          candidateIdRanks: [],
          dateCreated: 8,
          dateUpdated: 42,
          pollId,
          submitted: true,
          ownerId: userId,
        });
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
        };

        it('works', () => {
          const invocation = { userId };
          insertBallot.apply(invocation, [{ ...creatableBallot, pollId }]);

          assert.equal(Ballots.find().count(), 2);
        });

        it('fails with no user', () => {
          const invocation = { userId: null };

          assert.throws(() => insertBallot.apply(invocation, [{ ...creatableBallot, pollId }]));

          assert.equal(Ballots.find().count(), 1);
        });

        it('fails with no pollId', () => {
          const invocation = { userId };

          assert.throws(() => insertBallot.apply(invocation, [{ ...creatableBallot, pollId: undefined }]));
          assert.equal(Ballots.find().count(), 1);
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
          assert.equal(Ballots.find().count(), 1);

          Polls.remove(disabledPollId);
        });

        it('fails when you try to insert a ballot that already exists', () => {
          const invocation = { userId };

          assert.throws(() => insertBallot.apply(invocation, [{
            ...creatableBallot,
            _id: pollId,
          }]));

          assert.equal(Ballots.find().count(), 1);
        });
      });
    });
  });
}
