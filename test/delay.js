/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = require('@mona/parse').parse

describe('delay()', function () {
  it('delays calling a parser constructor until parse-time', function () {
    var parser = core.delay(function () {
      throw new Error('Parser explosion')
    })
    assert.throws(function () { parse(parser, '') })
  })
  it('returns a parser with the arguments applied', function () {
    var parser = core.delay(core.value, 'foo')
    assert.equal(parse(parser, ''), 'foo')
  })
})
