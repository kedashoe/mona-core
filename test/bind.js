/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = require('@mona/parse').parse

describe('bind()', function () {
  it('calls a function with the result of a parser', function () {
    parse(core.bind(core.value('test'), function (val) {
      assert.equal(val, 'test')
      return core.value(val)
    }), '')
  })
  it('uses a parser returned by its fun as the next parser', function () {
    assert.equal(parse(core.bind(core.value('foo'), function (val) {
      return core.value(val + 'bar')
    }), ''), 'foobar')
  })
  it('does not call the function if the parser fails', function () {
    assert.throws(function () {
      parse(core.bind(core.fail(), function () {
        throw new Error('This can\'t be happening...')
      }), '')
    }, /parser error/)
  })
  it('throws an error if a parser returns the wrong thing', function () {
    assert.throws(function () {
      parse(core.bind(function () { return 'nope' }), '')
    })
  })
  it('access to a userState from function context', function () {
    assert.equal(parse(core.bind(core.value('foo'), function (val) {
      return core.value(val + this.suffix)
    }), '', { userState: { suffix: 'bar' } }), 'foobar')
  })
})
