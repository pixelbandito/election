import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { check, Match } from 'meteor/check'

export const UserProfiles = new Mongo.Collection('userProfiles')

export const creatableUserProfileType = {
  userName: Match.Maybe(String)
}

export const userProfileType = {
  ...creatableUserProfileType,
  ownerId: String,
  dateCreated: Match.Maybe(Number),
  dateUpdated: Match.Maybe(Number),
  _id: String
}

export const defaults = {
  userName: '',
  ownerId: ''
}

export const generateUserProfile = (userProfile) => ({
  ...defaults,
  dateCreated: new Date().valueOf(),
  dateUpdated: new Date().valueOf(),
  ...userProfile
})

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('userProfiles', function userProfilesPublication () {
    return UserProfiles.find({ })
  })
}

Meteor.methods({
  'userProfiles.insert' (userProfile) {
    check(userProfile, creatableUserProfileType)

    // Make sure the userProfile is logged in before inserting a userProfile
    if (!this.userId) {
      throw new Meteor.Error('not-authorized')
    }

    if (!userProfile.userName) {
      throw new Meteor.Error('invalid-name')
    }

    // prevUserProfile, 1st definition: A pre-existing userProfile with the same ID
    let prevUserProfileError = (userProfile._id && UserProfiles.findOne(userProfile._id)) ? 'User profile already exists.' : null

    // prevUserProfileError, 2nd definition: This is for inserts only, there should be no ownerId attached
    if (!prevUserProfileError) {
      prevUserProfileError = userProfile.ownerId ? 'This user already has a profile.' : null
    }

    // prevUserProfileError, 3rd definition: userNames must be unique
    if (!prevUserProfileError) {
      prevUserProfileError = UserProfiles.findOne({ userName: userProfile.userName }) ? 'This user name is taken' : null
    }

    // Make sure the userProfile doesn't already exist
    if (prevUserProfileError) {
      throw new Meteor.Error(`invalid-request: ${prevUserProfileError}`)
    }

    UserProfiles.insert({
      ...generateUserProfile(userProfile),
      ownerId: this.userId
    })
  },
  'userProfiles.set' (userProfile) {
    check(userProfile, userProfileType)

    // Make sure the userProfile is logged in before inserting a userProfile
    if (!this.userId) {
      throw new Meteor.Error('not-authorized')
    }

    const prevUserProfile = UserProfiles.findOne(userProfile._id)

    // Make sure the userProfile exists
    if (!prevUserProfile) {
      throw new Meteor.Error('invalid-request')
    }

    // Make sure the userProfile owns the userProfiles
    if (prevUserProfile.ownerId !== this.userId) {
      throw new Meteor.Error('not-authorized')
    }

    UserProfiles.update(userProfile._id, {
      ...prevUserProfile,
      ...userProfile,
      dateUpdated: new Date().valueOf()
    })
  },
  'userProfiles.remove' (userProfileId) {
    check(userProfileId, String)

    const userProfile = UserProfiles.findOne(userProfileId)

    // Make sure only the owner can delete it
    if (userProfile.ownerId !== this.userId) {
      throw new Meteor.Error('not-authorized')
    }

    UserProfiles.remove(userProfileId)
  }
})
