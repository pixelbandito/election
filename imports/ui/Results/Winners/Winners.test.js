/* eslint-env mocha */

import { Meteor } from 'meteor/meteor'
import { assert } from 'chai'
// import { mount } from 'enzyme'

if (Meteor.isClient) {
  describe('Winners', () => {
    it('1 equals 2', () => {
      assert.equals(1, 2)
    })
  })
}
