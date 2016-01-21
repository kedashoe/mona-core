/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = core.parse
var reject = require('bluebird').reject

describe('fail()', function () {
  it('fails the parse with the given message', function () {
    return parse(core.fail('hi'), 'abc').then(reject, function (e) {
      assert.equal(e.message, '(line 1, column 0) hi')
    })
  })
  it('uses "parser error" as the message if none is given', function () {
    return parse(core.fail(), '').then(reject, function (e) {
      assert.equal(e.message, '(line 1, column 0) parser error')
    })
  })
  it('accepts a type argument used by the ParserError object', function () {
    return parse(
      core.fail('hi', 'criticalExplosion'),
      'abc'
    ).then(reject, function (e) {
      assert.equal(e.type, 'criticalExplosion')
    })
  })
  it('uses "failure" as the default error type', function () {
    return parse(core.fail(), '').then(reject, function (e) {
      assert.equal(e.type, 'failure')
    })
  })
})
