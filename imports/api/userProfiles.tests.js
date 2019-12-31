/* eslint-env mocha */

import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { assert } from 'chai'

import { UserProfiles } from './userProfiles.js'

if (Meteor.isServer) {
  describe('UserProfiles', () => {
    describe('methods', () => {
      const userId = Random.id()
      let beforeUserProfileCount
      let userDataId

      beforeEach(() => {
        UserProfiles.remove({})

        userDataId = UserProfiles.insert({
          userName: 'Sam',
          dateCreated: 0,
          dateUpdated: 42,
          ownerId: userId
        })

        beforeUserProfileCount = UserProfiles.find().count()
      })

      afterEach(() => {
        UserProfiles.remove({})
      })

      describe('UserProfiles.insert', () => {
        const insertUserProfile = Meteor.server.method_handlers['userProfiles.insert']

        const creatableUserProfile = {
          userName: 'Pat'
        }

        describe('errors', () => {
          it('fails with no user', () => {
            const invocation = { userId: null }

            assert.throws(() => insertUserProfile.apply(invocation, [{ ...creatableUserProfile }]), 'not-authorized')
            assert.equal(UserProfiles.find().count(), beforeUserProfileCount)
          })

          it('fails to insert a new userProfile for a user who has one', () => {
            const invocation = { userId }
            // Throws an error from a third party package, so not tested here
            assert.throws(() => insertUserProfile.apply(invocation, [{ ...creatableUserProfile, ownerId: userId }]))
            assert.equal(UserProfiles.find().count(), beforeUserProfileCount)
          })

          it('fails to insert a userProfile that already exists', () => {
            const invocation = { userId }

            // Throws an error from a third party package, so not tested here
            assert.throws(() => insertUserProfile.apply(invocation, [{ ...creatableUserProfile, _id: userDataId }]))
            assert.equal(UserProfiles.find().count(), beforeUserProfileCount)
          })
        })

        describe('works', () => {
          it('doesn\'t error', () => {
            const invocation = { userId }
            insertUserProfile.apply(invocation, [{ ...creatableUserProfile }])
            assert.equal(UserProfiles.find().count(), beforeUserProfileCount + 1)
          })

          it('returns expected values', () => {
            const samsUserId = 'sams-id'
            const invocation = { userId: samsUserId }
            const now = new Date()

            insertUserProfile.apply(invocation, [{
              userName: 'Sam'
            }])

            const userData = UserProfiles.find({ ownerId: samsUserId }).fetch()[0]
            assert.equal(userData.userName, 'Sam')
            assert.equal(userData.dateCreated, userData.dateUpdated)
            assert.equal(Math.abs(userData.dateCreated - now.valueOf()) < 100, true)
            assert.equal(UserProfiles.find().count(), beforeUserProfileCount + 1)
          })
        })
      })
    })
  })
}
