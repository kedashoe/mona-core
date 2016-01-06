/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = core.parse
var reject = Promise.reject.bind(Promise)

describe('bind()', function () {
  it('calls a function with the result of a parser', function () {
    var val = {}
    return parse(core.bind(core.value(val), function (x) {
      assert.equal(x, val)
      return core.value(x)
    }), '')
  })
  it('uses a parser returned by its fun as the next parser', function () {
    return parse(core.bind(core.value('foo'), function (val) {
      return core.value(val + 'bar')
    }), '').then(function (res) {
      assert.equal(res, 'foobar')
    })
  })
  it('does not call the function if the parser fails', function () {
    return parse(core.bind(core.fail(), function () {
      throw new Error('This can\'t be happening...')
    })).then(reject, function (e) {
      assert.ok(/parser error/.test(e.message))
    })
  })
  it('throws an error if a parser returns the wrong thing', function () {
    return parse(core.bind(core.value(''), function () {
      return 'nope'
    }), '').then(reject, function (e) {
      assert.ok(/Parser needs to be a function/.test(e.message))
    })
  })
  it('access to a userState from function context', function () {
    var testState = {}
    return parse(core.bind(core.value(''), function (val) {
      return core.value(this.testState)
    }), '', {userState: {testState: testState}}).then(function (res) {
      assert.equal(res, testState)
    })
  })
})
