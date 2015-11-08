/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = require('@mona/parse')

describe('isNot()', function () {
  it('parses a token matching a predicate', function () {
    var parser = core.isNot(function (t) {
      return t !== '\n'
    })
    assert.equal(parse(parser, '\n'), '\n')
    assert.throws(function () {
      parse(parser, '\r')
    })
  })
  it('run the predicate on the result of an arbitrary paresr', function () {
    var parser = core.isNot(function (x) {
      return x === 'f'
    }, core.token())
    assert.equal(parse(parser, 'b'), 'b')
    assert.throws(function () {
      parse(parser, 'f')
    })
  })
})
