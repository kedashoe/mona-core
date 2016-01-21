/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = core.parse
var bluebird = require('bluebird')
var reject = bluebird.reject

describe('token()', function () {
  it('consumes one character from the input and returns it', function () {
    return parse(core.token(), 'a').then(function (tok) {
      assert.equal(tok, 'a')
    }).then(function () {
      return parse(core.bind(core.token(), function (a) {
        return core.token()
      }), 'ab')
    }).then(function (tok) {
      assert.equal(tok, 'b')
    })
  })
  it('optionally accepts a count of items to consume', function () {
    return parse(core.token(5), 'abcde').then(function (val) {
      assert.equal(val, 'abcde')
    })
  })
  it('fails if there is no more input', function () {
    var ps = []
    ps.push(parse(core.token(), '').then(reject, function (e) {
      assert.ok(/(line 1, column 1)/.test(e.message))
    }))
    ps.push(parse(core.bind(core.token(), function () {
      return core.token()
    }), 'a').then(reject, function (e) {
      assert.ok(/(line 1, column 2)/.test(e.message))
    }))
    ps.push(parse(core.token(5), 'abcd').then(reject, function (e) {
      assert.ok(/(line 1, column 5)/.test(e.message))
    }))
    return bluebird.all(ps)
  })
  it('reports the error as "unexpected eof" if it fails', function () {
    return parse(core.token(), '').then(reject, function (e) {
      assert.ok(/unexpected eof/.test(e.message))
    })
  })
  it('reports the error type as "eof"', function () {
    return parse(core.token(), '').then(reject, function (e) {
      assert.equal(e.type, 'eof')
    })
  })
})
