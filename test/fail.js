/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = require('@mona/parse')

describe('fail()', function () {
  it('fails the parse with the given message', function () {
    assert.throws(function () {
      parse(core.fail('hi'), 'abc')
    }, /hi/)
  })
  it('uses "parser error" as the message if none is given', function () {
    assert.throws(function () {
      parse(core.fail(), '')
    }, /parser error/)
  })
  it('accepts a type argument used by the ParserError object', function () {
    assert.throws(function () {
      parse(core.fail('hi', 'criticalExplosion'), 'abc')
    }, function (err) {
      return err.type === 'criticalExplosion'
    })
  })
  it('uses "failure" as the default error type', function () {
    assert.throws(function () {
      parse(core.fail(), '')
    }, function (err) {
      return err.type === 'failure'
    })
  })
})
