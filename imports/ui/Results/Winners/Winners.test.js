import { Meteor } from 'meteor/meteor';
import { assert, expect } from 'chai';
import { mount } from 'enzyme';

import Winners from './Winners';

if (Meteor.isClient) {
  describe('Winners', () => {
    it('1 equals 2', () => {
      assert.equals(1, 2);
    });
  });
}
