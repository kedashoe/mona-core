/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = require('@mona/parse').parse

describe('is()', function () {
  it('parses a token matching a predicate', function () {
    var parser = core.is(function (t) {
      return t === '\n'
    })
    assert.equal(parse(parser, '\n'), '\n')
    assert.throws(function () {
      parse(parser, '\r')
    })
  })
  it('runs the predicate on the result of an arbitrary parser', function () {
    var parser = core.is(function (x) {
      return x === 'f'
    }, core.token())
    assert.equal(parse(parser, 'f'), 'f')
    assert.throws(function () {
      parse(parser, 'b')
    })
  })
})
