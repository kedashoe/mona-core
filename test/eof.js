/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = require('@mona/parse').parse

describe('eof()', function () {
  it('succeeds with true if we\'re out of input', function () {
    assert.equal(parse(core.eof(), ''), true)
  })
  it('fails with useful message if there is still input left', function () {
    assert.throws(function () {
      parse(core.eof(), 'a')
    }, /expected end of input/)
  })
})
