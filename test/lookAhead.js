/* global describe, it */
var assert = require('assert')
var core = require('..')
var comb = require('@mona/combinators')
var parse = require('@mona/parse').parse
var strings = require('@mona/strings')

describe('lookAhead()', function () {
  it('returns a parser\'s value without consuming input', function () {
    assert.equal(parse(comb.followedBy(core.lookAhead(core.token()),
                                       core.token()),
                       'a'),
                 'a')
  })
  it('passes on a failure', function () {
    assert.throws(function () {
      parse(core.lookAhead(core.fail()), 'a', {allowTrailing: true})
    })
  })
  it('rejects input without consuming input', function () {
    assert.equal(parse(comb.or(core.lookAhead(strings.oneOf('a')),
                               core.token()),
                       'b'),
                 'b')
  })
})
