/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = core.parse
var reject = require('bluebird').reject

describe('is()', function () {
  it('parses a token matching a predicate', function () {
    var parser = core.is(function (t) {
      return t === 'a'
    })
    return parse(parser, 'a').then(function (x) {
      assert.equal(x, 'a')
    })
  })
  it('fails if the predicate does not match', function () {
    var parser = core.is(function (t) {
      return t === 'a'
    })
    return parse(parser, 'b').then(reject, function (e) {
      assert.ok(/predicate check failed/.test(e.message))
    })
  })
  it('runs the predicate on the result of an arbitrary parser', function () {
    var parser = core.is(function (x) {
      return x === 'a'
    }, core.value('a'))
    return parse(parser, '').then(function (res) {
      assert.equal(res, 'a')
    })
  })
})
