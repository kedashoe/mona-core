/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = require('@mona/parse')
var comb = require('@mona/combinators')

describe('value()', function () {
  it('parses to the given value', function () {
    assert.equal(parse(core.value('foo'), ''), 'foo')
  })
  it('does not consume input', function () {
    assert.equal(
      parse(
        comb.followedBy(core.value('foo'), core.token()),
        'a'),
      'foo')
  })
})
