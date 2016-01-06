/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = core.parse

describe('lookAhead()', function () {
  it('returns a parser\'s value without consuming input', function () {
    return parse(core.bind(core.lookAhead(core.token()), function (x) {
      assert.equal(x, 'a')
      return core.token()
    }), 'a').then(function (res) {
      assert.equal(res, 'a')
    })
  })
  it('passes on a failure', function () {
    return parse(core.lookAhead(core.fail('oops')), 'a', {
      allowTrailing: true
    }, 'a').then(Promise.reject.bind(Promise), function (e) {
      assert.ok(/oops/.test(e.message))
    })
  })
  it('rejects input without consuming input', function () {
    return parse(core.bind(core.lookAhead(core.token()), function (tok1) {
      return core.bind(core.token(), function (tok2) {
        return core.value(tok1 + tok2)
      })
    }), 'a').then(function (res) {
      assert.equal(res, 'aa')
    })
  })
})
