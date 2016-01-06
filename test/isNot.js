/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = core.parse

describe('isNot()', function () {
  it('parses a token failing a predicate', function () {
    var parser = core.isNot(function (t) {
      return t === 'a'
    })
    return parse(parser, 'b').then(function (x) {
      assert.equal(x, 'b')
    })
  })
  it('fails if the predicate matches', function () {
    var parser = core.isNot(function (t) {
      return t === 'a'
    })
    return parse(parser, 'a').then(Promise.reject.bind(Promise), function (e) {
      assert.ok(/predicate check failed/.test(e.message))
    })
  })
  it('runs the predicate on the result of an arbitrary parser', function () {
    var parser = core.isNot(function (x) {
      return x === 'a'
    }, core.value('b'))
    return parse(parser, '').then(function (res) {
      assert.equal(res, 'b')
    })
  })
})
