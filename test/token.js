/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = require('@mona/parse')
var comb = require('@mona/combinators')

describe('token()', function () {
  it('consumes one character from the input and returns it', function () {
    assert.equal(parse(core.token(), 'a'), 'a')
    assert.equal(parse(comb.and(core.token(), core.token()), 'ab'), 'b')
  })
  it('optionally accepts a count of items to consume', function () {
    assert.equal(parse(core.token(5), 'abcde'), 'abcde')
  })
  it('fails if there is no more input', function () {
    assert.throws(function () {
      parse(core.token(), '')
    }, /(line 1, column 1)/)
    assert.throws(function () {
      parse(comb.and(core.token(), core.token()), 'a')
    }, /(line 1, column 2)/)
    assert.throws(function () {
      parse(comb.and(core.token(5)), 'abcd')
    }, /(line 1, column 5)/)
  })
  it('reports the error as "unexpected eof" if it fails', function () {
    assert.throws(function () {
      parse(core.token(), '')
    }, /unexpected eof/)
  })
  it('reports the error type as "eof"', function () {
    assert.throws(function () {
      parse(core.token(), '')
    }, function (err) {
      return err.type === 'eof'
    })
  })
})
