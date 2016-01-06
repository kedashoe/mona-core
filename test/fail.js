/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = require('@mona/parse').parse

describe('fail()', function () {
  it('fails the parse with the given message', function (d) {
    parse(core.fail('hi'), 'abc').then(d, function (e) {
      assert.equal(e.message, '(line 1, column 0) hi')
      d()
    })
  })
  it('uses "parser error" as the message if none is given', function (d) {
    parse(core.fail(), '').then(d, function (e) {
      assert.equal(e.message, '(line 1, column 0) parser error')
      d()
    })
  })
  it('accepts a type argument used by the ParserError object', function (d) {
    parse(core.fail('hi', 'criticalExplosion'), 'abc').then(d, function (e) {
      assert.equal(e.type, 'criticalExplosion')
      d()
    })
  })
  it('uses "failure" as the default error type', function (d) {
    parse(core.fail(), '').then(d, function (e) {
      assert.equal(e.type, 'failure')
      d()
    })
  })
})
