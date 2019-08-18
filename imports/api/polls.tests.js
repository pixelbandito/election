/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert, expect } from 'chai';
import shortid from 'shortid';

import { Polls } from './polls.js';

if (Meteor.isServer) {
  describe('Polls', () => {
    describe('methods', () => {
      const userId = Random.id();
      let pollId;
      let candidateId = shortid.generate();

      beforeEach(() => {
        Polls.remove({});

        pollId = Polls.insert({
          candidates: [],
          dateCreated: 8,
          dateUpdated: 42,
          enabled: true,
          public: true,
          name: 'Poll Foo',
          ownerId: userId,
        });
      });

      afterEach(() => {
        Polls.remove({});
      });

      describe('Polls.insert', () => {
        const insertPoll = Meteor.server.method_handlers['polls.insert'];

        const creatablePoll = {
          candidates: [],
          enabled: false,
          public: false,
          name: 'Poll Foo',
        };

        it('works with a user', () => {
          const invocation = { userId };
          insertPoll.apply(invocation, [{ ...creatablePoll }]);

          assert.equal(Polls.find().count(), 2);
        });

        it('fails with no user', () => {
          const invocation = { userId: null };

          assert.throws(() => insertPoll.apply(invocation, [{ ...creatablePoll }]));
          assert.equal(Polls.find().count(), 1);
        });

        it('fails when you try to insert a poll that already exists', () => {
          const invocation = { userId: null };

          assert.throws(() => insertPoll.apply(invocation, [{
            ...creatablePoll,
            _id: pollId,
          }]));
          assert.equal(Polls.find().count(), 1);
        });
      });

      describe('Polls.set', () => {
        const insertPoll = Meteor.server.method_handlers['polls.set'];

        it('works with a user', () => {
          const prevPoll = Polls.findOne(pollId);

          const invocation = { userId };

          insertPoll.apply(invocation, [{
            ...prevPoll,
            candidates: [{
              id: 'pat',
              name: 'Pat',
            }],
            enabled: false,
            public: false,
            name: 'Poll Bar',
          }]);

          const nextPoll = Polls.findOne(pollId);

          assert.equal(Polls.find().count(), 1);

          const matchingProps = {
            candidates: prevPoll.candidates,
            dateCreated: prevPoll.dateCreated,
            enabled: prevPoll.enabled,
            public: prevPoll.public,
            _id: prevPoll._id,
            name: prevPoll.name,
            ownerId: prevPoll.ownerId,
          };

          expect(nextPoll).to.deep.include({
            ...matchingProps,
            candidates: [{
              id: 'pat',
              name: 'Pat',
            }],
            enabled: false,
            public: false,
            name: 'Poll Bar',
          });

          expect(nextPoll.dateUpdated).to.be.above(prevPoll.dateUpdated);
        });

        it('fails with no user', () => {
          const invocation = { userId: null };

          assert.throws(() => insertPoll.apply(invocation, [{ ...creatablePoll }]));
          assert.equal(Polls.find().count(), 1);
        });

        it('fails when you try to insert a poll that already exists', () => {
          const invocation = { userId: null };

          assert.throws(() => insertPoll.apply(invocation, [{
            ...creatablePoll,
            _id: pollId,
          }]));

          assert.equal(Polls.find().count(), 1);
        });
      });

      describe('Polls.remove', () => {
        // Find the internal implementation of the task method so we can
        // test it in isolation
        const deletePoll = Meteor.server.method_handlers['polls.remove'];

        it('works for the owner', () => {
          const invocation = { userId };

          deletePoll.apply(invocation, [pollId]);

          assert.equal(Polls.find().count(), 0);
        });

        it('doesn\'t work if you\'re not logged in', () => {
          const invocation = { userId: null };

          assert.throws(() => deletePoll.apply(invocation, [pollId]));
          assert.equal(Polls.find().count(), 1);
        });

        it('doesn\'t work if you\'re not the owner', () => {
          const invocation = { userId: 'boom' };

          assert.throws(() => deletePoll.apply(invocation, [pollId]));
          assert.equal(Polls.find().count(), 1);
        });
      });
    });
  });
}
