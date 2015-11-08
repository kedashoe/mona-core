/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = require('@mona/parse')

describe('label()', function () {
  it('replaces any error messages with an expectation', function () {
    assert.throws(function () {
      parse(core.label(core.fail(), 'wee'), '')
    }, /\(line 1, column 0\) expected wee/)
  })
})
